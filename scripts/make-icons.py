"""Generates the app icons as PNGs: a 2x2 grid of number tiles showing + - x / in the app's colors.

Run from the repo root: python3 scripts/make-icons.py
No dependencies: shapes are drawn as anti-aliased signed-distance fields and written with zlib.

Outputs (in assets/):
  icon.png                     1024x1024, opaque. iOS and the default app icon.
  android-icon-foreground.png  1024x1024, transparent. Adaptive icon foreground, kept inside the
                               mask safe zone (the launcher may crop to a circle).
  android-icon-background.png  1024x1024, solid background color.
  android-icon-monochrome.png  1024x1024, white silhouette for Android 13+ themed icons.
  splash-icon.png              1024x1024, transparent tiles.
  favicon.png                  48x48, for web.
"""
import math
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "assets"

# Colors from src/theme.ts (dark palette).
BG = "#0F1226"
TILE = "#262C59"
ACCENT = "#FFB547"
ACCENT_TEXT = "#2A1A00"
OP = "#5B6CFF"
TEXT = "#F4F5FF"
WHITE = "#FFFFFF"


def rgb(hex_color):
    h = hex_color.lstrip("#")
    return tuple(int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))


# --- Signed distance functions (negative inside), in pixels -------------------------------------


def sd_round_box(px, py, cx, cy, half, r):
    qx = abs(px - cx) - (half - r)
    qy = abs(py - cy) - (half - r)
    outside = math.hypot(max(qx, 0.0), max(qy, 0.0))
    return outside + min(max(qx, qy), 0.0) - r


def sd_capsule(px, py, ax, ay, bx, by, r):
    pax, pay = px - ax, py - ay
    bax, bay = bx - ax, by - ay
    h = max(0.0, min(1.0, (pax * bax + pay * bay) / (bax * bax + bay * bay)))
    return math.hypot(pax - bax * h, pay - bay * h) - r


def sd_circle(px, py, cx, cy, r):
    return math.hypot(px - cx, py - cy) - r


# --- Shapes: (sdf function, bounding box) ---------------------------------------------------------


def round_box(cx, cy, half, r):
    return (lambda x, y: sd_round_box(x, y, cx, cy, half, r), (cx - half, cy - half, cx + half, cy + half))


def capsule(ax, ay, bx, by, r):
    box = (min(ax, bx) - r, min(ay, by) - r, max(ax, bx) + r, max(ay, by) + r)
    return (lambda x, y: sd_capsule(x, y, ax, ay, bx, by, r), box)


def circle(cx, cy, r):
    return (lambda x, y: sd_circle(x, y, cx, cy, r), (cx - r, cy - r, cx + r, cy + r))


def glyph(op, cx, cy, size):
    """Operator symbol centered at (cx, cy); size is the tile's side length."""
    arm = size * 0.25  # half the length of a bar
    t = size * 0.065  # bar radius (half thickness)
    if op == "+":
        return [capsule(cx - arm, cy, cx + arm, cy, t), capsule(cx, cy - arm, cx, cy + arm, t)]
    if op == "-":
        return [capsule(cx - arm, cy, cx + arm, cy, t)]
    if op == "x":
        d = arm * 0.78
        return [capsule(cx - d, cy - d, cx + d, cy + d, t), capsule(cx - d, cy + d, cx + d, cy - d, t)]
    if op == "/":
        gap = size * 0.21
        dot = t * 1.25
        return [capsule(cx - arm, cy, cx + arm, cy, t), circle(cx, cy - gap, dot), circle(cx, cy + gap, dot)]
    raise ValueError(op)


# Each tile: (operator, tile color, glyph color), in reading order.
TILES = [("+", ACCENT, ACCENT_TEXT), ("-", TILE, TEXT), ("x", TILE, TEXT), ("/", OP, WHITE)]


def tile_layout(size, extent):
    """Centers and side length for a 2x2 grid spanning `extent` pixels, centered in a size x size canvas."""
    gap = extent * 0.074
    side = (extent - gap) / 2
    start = (size - extent) / 2 + side / 2
    centers = [(start + c * (side + gap), start + r * (side + gap)) for r in range(2) for c in range(2)]
    return centers, side


# --- Canvas ---------------------------------------------------------------------------------------


class Canvas:
    def __init__(self, size, background=None):
        self.size = size
        self.px = [0.0] * (size * size * 4)
        if background:
            r, g, b = rgb(background)
            for i in range(size * size):
                self.px[i * 4 : i * 4 + 4] = [r, g, b, 1.0]

    def _cover(self, shape):
        """Yields (pixel index, coverage 0..1) for pixels the shape touches."""
        sdf, (x0, y0, x1, y1) = shape
        n = self.size
        for y in range(max(0, int(y0) - 2), min(n, int(math.ceil(y1)) + 2)):
            for x in range(max(0, int(x0) - 2), min(n, int(math.ceil(x1)) + 2)):
                c = 0.5 - sdf(x + 0.5, y + 0.5)
                if c > 0:
                    yield (y * n + x) * 4, min(1.0, c)

    def fill(self, shape, color):
        r, g, b = rgb(color)
        p = self.px
        for i, a in self._cover(shape):
            # "Over" compositing with straight alpha.
            da = p[i + 3]
            oa = a + da * (1 - a)
            if oa <= 0:
                continue
            for k, s in enumerate((r, g, b)):
                p[i + k] = (s * a + p[i + k] * da * (1 - a)) / oa
            p[i + 3] = oa

    def erase(self, shape):
        p = self.px
        for i, a in self._cover(shape):
            p[i + 3] *= 1 - a

    def save(self, path, opaque=False):
        n = self.size
        channels = 3 if opaque else 4
        raw = bytearray()
        for y in range(n):
            raw.append(0)  # PNG filter type: none
            row = self.px[y * n * 4 : (y + 1) * n * 4]
            for x in range(n):
                vals = row[x * 4 : x * 4 + channels]
                raw.extend(max(0, min(255, round(v * 255))) for v in vals)

        def chunk(kind, data):
            body = kind + data
            return struct.pack(">I", len(data)) + body + struct.pack(">I", zlib.crc32(body) & 0xFFFFFFFF)

        color_type = 2 if opaque else 6
        png = b"\x89PNG\r\n\x1a\n"
        png += chunk(b"IHDR", struct.pack(">IIBBBBB", n, n, 8, color_type, 0, 0, 0))
        png += chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        png += chunk(b"IEND", b"")
        path.write_bytes(png)
        print(f"wrote {path.relative_to(OUT.parent)} ({n}x{n})")


def draw_tiles(canvas, extent, monochrome=False):
    centers, side = tile_layout(canvas.size, extent)
    radius = side * 0.22
    for (cx, cy), (op, tile_color, glyph_color) in zip(centers, TILES):
        canvas.fill(round_box(cx, cy, side / 2, radius), WHITE if monochrome else tile_color)
        for part in glyph(op, cx, cy, side):
            if monochrome:
                canvas.erase(part)
            else:
                canvas.fill(part, glyph_color)


def main():
    size = 1024

    # Full-bleed icon: the tiles fill most of the square (iOS rounds the corners itself).
    icon = Canvas(size, BG)
    draw_tiles(icon, size * 0.64)
    icon.save(OUT / "icon.png", opaque=True)

    # Adaptive icon: launchers mask to as little as a circle 61% of the canvas wide, so the grid
    # stays within about 44% of the width to keep its corners visible.
    fg = Canvas(size)
    draw_tiles(fg, size * 0.44)
    fg.save(OUT / "android-icon-foreground.png")

    Canvas(size, BG).save(OUT / "android-icon-background.png", opaque=True)

    mono = Canvas(size)
    draw_tiles(mono, size * 0.44, monochrome=True)
    mono.save(OUT / "android-icon-monochrome.png")

    splash = Canvas(size)
    draw_tiles(splash, size * 0.6)
    splash.save(OUT / "splash-icon.png")

    # Favicon: draw at 4x and box-downsample for smooth edges at 48px.
    big, scale = 192, 4
    fav = Canvas(big, BG)
    draw_tiles(fav, big * 0.8)
    small = Canvas(big // scale)
    n = big // scale
    for y in range(n):
        for x in range(n):
            acc = [0.0] * 4
            for dy in range(scale):
                for dx in range(scale):
                    i = ((y * scale + dy) * big + x * scale + dx) * 4
                    for k in range(4):
                        acc[k] += fav.px[i + k]
            small.px[(y * n + x) * 4 : (y * n + x) * 4 + 4] = [v / scale**2 for v in acc]
    small.save(OUT / "favicon.png")


if __name__ == "__main__":
    main()

"""Generates the game's sound effects as small 16-bit mono WAV files.

Run from the repo root: python3 scripts/make-sounds.py
"""
import math
import struct
import wave
from pathlib import Path

RATE = 22050
OUT = Path(__file__).resolve().parent.parent / "assets" / "sounds"


def tone(freq, dur, vol=0.5, attack=0.004, decay=None, harmonics=(1.0, 0.25, 0.08)):
    """A soft, bell-like tone with a quick attack and exponential decay."""
    n = int(RATE * dur)
    decay = decay or dur / 4
    out = []
    for i in range(n):
        t = i / RATE
        env = min(1.0, t / attack) * math.exp(-t / decay)
        s = sum(a * math.sin(2 * math.pi * freq * (k + 1) * t) for k, a in enumerate(harmonics))
        out.append(vol * env * s / sum(harmonics))
    return out


def silence(dur):
    return [0.0] * int(RATE * dur)


def mix(*parts):
    """Concatenates parts; a part given as (offset_seconds, samples) is overlaid."""
    length = 0
    placed = []
    pos = 0
    for p in parts:
        if isinstance(p, tuple):
            off, s = p
            start = int(off * RATE)
        else:
            start, s = pos, p
            pos += len(s)
        placed.append((start, s))
        length = max(length, start + len(s))
    buf = [0.0] * length
    for start, s in placed:
        for i, v in enumerate(s):
            buf[start + i] += v
    return buf


def write(name, samples):
    OUT.mkdir(parents=True, exist_ok=True)
    peak = max(1e-9, max(abs(s) for s in samples))
    scale = min(1.0, 0.9 / peak)
    with wave.open(str(OUT / f"{name}.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(b"".join(struct.pack("<h", int(s * scale * 32767)) for s in samples))


# Tile picked: short high tick.
write("tap", tone(1320, 0.06, vol=0.35, decay=0.015))
# Operator picked: slightly lower, rounder tick.
write("op", tone(880, 0.07, vol=0.35, decay=0.02, harmonics=(1.0, 0.1)))
# Two tiles merged: quick rising pair.
write("combine", mix(tone(660, 0.09, vol=0.4, decay=0.03), (0.05, tone(990, 0.14, vol=0.4, decay=0.045))))
# Invalid move: low, dull double buzz.
write("error", mix(tone(196, 0.09, vol=0.5, decay=0.04, harmonics=(1.0, 0.5, 0.3)),
                   silence(0.03), tone(175, 0.12, vol=0.5, decay=0.05, harmonics=(1.0, 0.5, 0.3))))
# Undo / reset: falling soft blip.
write("undo", mix(tone(740, 0.07, vol=0.3, decay=0.02), (0.04, tone(554, 0.09, vol=0.3, decay=0.03))))
# Target hit: rising major arpeggio with a held top note.
notes = [523.25, 659.25, 783.99, 1046.5]
write("win", mix(*[(i * 0.085, tone(f, 0.5 if i == 3 else 0.18, vol=0.4,
                                    decay=0.18 if i == 3 else 0.06)) for i, f in enumerate(notes)]))

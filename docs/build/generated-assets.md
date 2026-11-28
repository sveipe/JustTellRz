---
type: Playbook
title: Generated assets
description: App icons and sound effects are produced by dependency-free Python scripts; edit the scripts and regenerate instead of editing the files.
tags: [build, assets, icons, sounds]
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Icons

`python scripts/make-icons.py` writes, in `assets/`:

| File | Size | Use |
| --- | --- | --- |
| `icon.png` | 1024, opaque | iOS and main app icon |
| `android-icon-foreground.png` | 1024, transparent | Adaptive icon foreground, kept inside the circular mask |
| `android-icon-background.png` | 1024, solid `#0F1226` | Adaptive icon background |
| `android-icon-monochrome.png` | 1024, transparent | Android 13+ themed icon (operators cut out) |
| `splash-icon.png` | 1024, transparent | Not yet referenced by the config |
| `favicon.png` | 48 | Web |

The design is a 2×2 grid of tiles showing + − × ÷ in the dark palette's colors. The script uses no libraries and takes about 6 s. Run `npx expo prebuild` afterwards to regenerate the native icon resources.

# Sounds

`python scripts/make-sounds.py` writes the six WAVs in `assets/sounds/` (`tap`, `op`, `combine`, `error`, `undo`, `win`). See [Sound and haptics](/architecture/feedback.md).

---
type: Reference
title: Frequency capping
description: An interstitial can show only after at least 3 completed practice levels and 2 minutes since the previous ad.
tags: [ads, frequency, ux]
resource: https://github.com/justtell-co/numberwright/blob/main/src/ads/adFrequency.ts
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Rule

An ad is due when **both** are true (`isAdDue()`):

* `levelsSinceLastAd >= LEVELS_BETWEEN_ADS` (3)
* `now − lastAdAt >= MIN_TIME_BETWEEN_ADS_MS` (2 minutes)

Each "Next puzzle" tap after a solve counts as one completed level (`recordLevelCompleted()`). When an ad actually opens (`OPENED`), both counters reset (`recordAdShown()`). If an ad is due but none is loaded, no ad shows and the count carries over to the next level.

State is saved under `numberwright.adFrequency.v1`, so closing and reopening the app doesn't reset the cap.

# What never shows an ad

* The daily puzzle (its result screen only has "Back to menu")
* Skip, which isn't a completed level
* Web, Expo Go, offline, or no consent: `showAdOrProceed` moves on straight away

# Tuning

Change the two constants in `src/ads/adFrequency.ts`, and update this page and the store text if the cadence is described there.

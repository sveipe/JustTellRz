This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
npm run docs:check          # validate the docs/ bundle
```

Run lint, typecheck and `npm run docs:check` before declaring any task done.

## Documentation (OKF)

`docs/` is an [Open Knowledge Format](https://github.com/open-knowledge-format/open-knowledge-format) v0.3 bundle: plain Markdown with YAML frontmatter. Start at `docs/index.md`. `npm run docs:check` (`scripts/check-docs.js`) enforces the rules below.

**Pages.** Every `.md` except `index.md` and `log.md` is a concept page and starts with frontmatter:

```yaml
---
type: Reference            # required. Reference = how things are; Playbook = steps to follow
title: Frequency capping
description: One sentence; it is reused as the page's index entry.
tags: [ads, frequency]
resource: https://github.com/justtell-co/numberwright/blob/main/src/ads/adFrequency.ts   # code it describes, if any
generated:
  by: claude-code/<model-id>   # or human:<name>
  at: "2026-11-28"             # quoted date; don't change it for trivial edits
---
```

- Optional review fields: `status: draft` (unreviewed or uncertain) and `stale_after: "YYYY-MM-DD"` (re-check by then). Keep them unless you did that review.
- Quote dates and version-like values. Use only `#` / `##` headings and GFM tables in bodies. No `[[wikilinks]]`.

**Links.** Between pages use bundle-relative paths starting with `/`, where `/` is `docs/` (e.g. `[Consent](/ads/consent.md)`). Code lives outside the bundle, so link it with full GitHub URLs.

**Indexes.** Each folder has an `index.md` with no frontmatter, listing every page as `* [Title](/folder/page.md) - description`. A new folder goes in the root `docs/index.md` as `* [Name](/folder/) - description`. Only the root `index.md` has frontmatter (`okf_version: "0.3"`, `title`, `description`).

**Log.** For every docs change, add bullets under a `## YYYY-MM-DD` heading in `docs/log.md`, newest date first, e.g. `* **Update:** Frequency capping: cap changed to 4 levels.`

**Keep docs in sync with code.** When you change these, update the listed pages in the same change:

| Code | Pages |
| --- | --- |
| `src/game/engine.ts` | `game/rules-and-scoring.md`, `game/daily-puzzle.md` (and `src/screens/HelpScreen.tsx`) |
| `src/game/stats.ts`, any AsyncStorage key | `architecture/persistence.md` |
| `App.tsx`, `src/screens/*` | `architecture/app-structure.md` |
| `src/theme.ts` | `architecture/theming.md` |
| `src/feedback.ts`, `scripts/make-sounds.py` | `architecture/feedback.md` |
| `src/ads/*` | `ads/*`, and if data collection changes: `store/google-play-declarations.md`, `store/app-store-privacy.md`, `store/privacy-policy.md` |
| `app.config.ts`, `plugins/*`, permissions | `build/app-config.md` (permissions also: `store/google-play-declarations.md`) |
| `eas.json` | `build/eas-build.md` |
| `scripts/make-icons.py`, `assets/` | `build/generated-assets.md` |
| New SDK that collects data | the three `store/` privacy pages, and tell the user the live privacy policy needs updating |

## Project layout

- `App.tsx` — root; switches between the home, game, settings and help screens, owns persisted stats, theme and feedback settings, and starts ads.
- `src/game/engine.ts` — pure game logic (puzzle generation, operations, scoring). Keep it free of React/RN imports.
- `src/game/stats.ts` — AsyncStorage persistence.
- `src/feedback.ts` — sound effects (expo-audio) and haptics (expo-haptics); call `feedback(event)` from UI code.
- `assets/sounds/` — generated WAVs; edit `scripts/make-sounds.py` and re-run it rather than editing the files.
- `src/screens/`, `src/components/` — UI. Colors live in `src/theme.ts`: style with `makeStyles` / `useColors`, never import a palette directly (light and dark themes).
- `src/ads/` — AdMob. Never import `react-native-google-mobile-ads` directly (it crashes Expo Go and web at import); use `getGoogleMobileAds()`.
- The app currently uses simple state-based screen switching. If real navigation is needed, adopt **Expo Router** (routes in `src/app/`).

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.config.ts` and config plugins (local ones in `plugins/`).
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

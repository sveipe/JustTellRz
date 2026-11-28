---
type: Reference
title: Theming
description: The app follows the device's light/dark mode by default, with a System/Light/Dark override in Settings; styles come from makeStyles.
tags: [architecture, theme, dark-mode, styles]
resource: https://github.com/justtell-co/numberwright/blob/main/src/theme.ts
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# How it works

* `src/theme.ts` defines two `Palette` objects, `darkColors` and `lightColors`. In light mode the accent and success colors used as text (`accentInk`, `successInk`) are darker, so they stay readable.
* `App.tsx` reads the device scheme with `useColorScheme()`, applies the saved preference with `paletteFor(pref, deviceScheme)`, and provides the result through `ThemeProvider`.
* `App.tsx` also sets the status bar style and the native root background (`expo-system-ui`) to match.
* `app.config.ts` sets `userInterfaceStyle: 'automatic'`. Android needs `expo-system-ui` installed for that to take effect.

# Writing styles

Never import a color directly. Define styles with `makeStyles` and read them with the hook it returns:

```tsx
const useStyles = makeStyles((colors) => ({
  title: { color: colors.accentInk, fontSize: 20 },
}));

function Title() {
  const styles = useStyles();
  return <Text style={styles.title}>Hi</Text>;
}
```

For colors needed outside a stylesheet, such as an icon's `color` prop or a `Switch`'s `trackColor`, use `useColors()`. Each palette's stylesheet is built once and cached.

# Adding a color

Add the key to the `Palette` interface and give it a value in **both** palettes. TypeScript fails until both have it.

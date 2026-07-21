import React, { createContext, useContext } from 'react';

/**
 * The theme MECHANISM (Ring 1) — deliberately holds no token values.
 *
 * Per the framework's hybrid theming model: motion tokens are static (pure
 * animations import them directly), while the VISUAL theme (colours, type,
 * spacing, radii, shadows) is injected at runtime so multiple brands can coexist
 * in one Studio bundle. A project wraps its composition in <ThemeProvider
 * theme={brandTheme}>; components read tokens with useTheme().
 *
 * Keeping the values out of the framework (they live in `design/`) is what lets
 * `framework/` stay import-independent of any brand — the dependency flows the
 * other way, via context, at runtime.
 */

const ThemeContext = createContext(null);

export const ThemeProvider = ({ theme, children }) => {
  if (!theme) {
    throw new Error(
      'ThemeProvider requires a `theme` prop. Pass a brand theme from ' +
        '`design/brands/<brand>` (or the default theme from `design/theme`).',
    );
  }
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

/**
 * Read the active visual theme. Throws a helpful error rather than returning a
 * silent `null` if a component is rendered outside a <ThemeProvider>, since a
 * missing theme is always a wiring bug, not a valid state.
 */
export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error(
      'useTheme() was called outside a <ThemeProvider>. Every composition must ' +
        'be wrapped in a ThemeProvider (registerProject does this for you).',
    );
  }
  return theme;
};

export { ThemeContext };

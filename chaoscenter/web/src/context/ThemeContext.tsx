import React, { createContext } from 'react';

/** The user's persisted theme preference — includes the 'system' sentinel. */
export type ThemeMode = 'light' | 'dark' | 'system';

/** The resolved, applied theme written to data-theme — never 'system'. */
export type Theme = 'light' | 'dark';

interface ThemeContextProps {
  /** The user's persisted preference (may be 'system'). */
  themeMode: ThemeMode;
  /** The resolved theme actually applied to the DOM (never 'system'). */
  theme: Theme;
  setThemeMode(mode: ThemeMode): void;
}

/** localStorage key used to persist the user's theme preference. */
const THEME_STORAGE_KEY = 'litmus-theme';

const VALID_MODES: ThemeMode[] = ['light', 'dark', 'system'];

const getInitialMode = (): ThemeMode => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && VALID_MODES.includes(stored as ThemeMode)) {
      return stored as ThemeMode;
    }
  } catch {
    // localStorage unavailable — fall through to default
  }
  return 'system';
};

const resolveTheme = (mode: ThemeMode): Theme => {
  if (mode !== 'system') return mode;
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = React.useState<ThemeMode>(getInitialMode);
  const [theme, setTheme] = React.useState<Theme>(() => resolveTheme(getInitialMode()));

  // Persist the mode and apply the resolved theme to the DOM.
  React.useEffect(() => {
    document.getElementById('react-root')?.setAttribute('data-theme', theme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch {
      // Ignore unavailable localStorage and retain the in-memory preference.
    }
  }, [themeMode, theme]);

  // When the user picks 'system', subscribe to OS preference changes.
  React.useEffect(() => {
    // Always resolve the current OS preference immediately when mode changes.
    setTheme(resolveTheme(themeMode));

    if (themeMode !== 'system') return;

    let mql: MediaQueryList | undefined;
    try {
      mql = window.matchMedia('(prefers-color-scheme: dark)');
    } catch {
      return;
    }

    const handleChange = (e: MediaQueryListEvent): void => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mql.addEventListener('change', handleChange);
    return () => {
      mql?.removeEventListener('change', handleChange);
    };
  }, [themeMode]);

  const setThemeMode = React.useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  const value = React.useMemo(() => ({ themeMode, theme, setThemeMode }), [themeMode, theme, setThemeMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextProps {
  const themeContext = React.useContext(ThemeContext);

  if (!themeContext) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return themeContext;
}

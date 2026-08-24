import React, { createContext } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme(): void;
}

/** localStorage key used to persist the user's theme preference. */
const THEME_STORAGE_PREF = 'litmus-theme';

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const getInitialTheme = (): Theme => {
  try {
    return window.localStorage.getItem(THEME_STORAGE_PREF) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);

  React.useEffect(() => {
    document.getElementById('react-root')?.setAttribute('data-theme', theme);

    try {
      window.localStorage.setItem(THEME_STORAGE_PREF, theme);
    } catch {
      // Ignore unavailable localStorage and retain the in-memory preference.
    }
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const value = React.useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextProps {
  const themeContext = React.useContext(ThemeContext);

  if (!themeContext) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return themeContext;
}

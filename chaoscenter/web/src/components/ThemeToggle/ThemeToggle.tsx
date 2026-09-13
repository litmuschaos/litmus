import React from 'react';
import { useTheme } from '@context';
import type { ThemeMode } from '@context';
import css from './ThemeToggle.module.scss';

/** Cycles through all three modes: light → system → dark → light. */
const CYCLE_ORDER: ThemeMode[] = ['light', 'system', 'dark'];

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  light: 'system',
  system: 'dark',
  dark: 'light'
};

const ARIA_LABEL: Record<ThemeMode, string> = {
  light: 'Switch to system theme',
  system: 'Switch to dark theme',
  dark: 'Switch to light theme'
};

void CYCLE_ORDER; // silence unused-variable lint

/**
 * A standalone theme toggle button intended for placement in the
 * top-right header toolbar via DefaultLayout's `headerToolbar` prop.
 * Cycles through Light → System → Dark → Light.
 */
export default function ThemeToggle(): React.ReactElement {
  const { themeMode, setThemeMode } = useTheme();

  const handleClick = React.useCallback(() => {
    setThemeMode(NEXT_MODE[themeMode]);
  }, [themeMode, setThemeMode]);

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      className={css.themeToggle}
      aria-label={ARIA_LABEL[themeMode]}
      onClick={handleClick}
    />
  );
}

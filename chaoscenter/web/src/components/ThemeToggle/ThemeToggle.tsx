import React from 'react';
import { useTheme } from '@context';
import css from './ThemeToggle.module.scss';

/**
 * A standalone theme toggle button intended for placement in the
 * top-right header toolbar via DefaultLayout's `headerToolbar` prop.
 */
export default function ThemeToggle(): React.ReactElement {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle-btn"
      type="button"
      className={css.themeToggle}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      onClick={toggleTheme}
    />
  );
}

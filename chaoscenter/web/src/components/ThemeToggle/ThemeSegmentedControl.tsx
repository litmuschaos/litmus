import React from 'react';
import cx from 'classnames';
import { useTheme, type ThemeMode } from '@context';
import { useStrings } from '@strings';
import css from './ThemeSegmentedControl.module.scss';

interface Segment {
  mode: ThemeMode;
  /** Unicode icon rendered before the label. */
  icon: string;
  /** i18n string key for the label. */
  labelKey: 'lightMode' | 'systemMode' | 'darkModeLabel';
}

const SEGMENTS: Segment[] = [
  { mode: 'light', icon: '☀', labelKey: 'lightMode' },
  { mode: 'system', icon: '⊙', labelKey: 'systemMode' },
  { mode: 'dark', icon: '☾', labelKey: 'darkModeLabel' }
];

/**
 * Three-segment pill control for selecting the app's colour theme.
 * Reads and writes to ThemeContext; persists to localStorage via the context.
 *
 * Accessibility:
 *   - Container has role="group" with an aria-label.
 *   - Each button has aria-pressed reflecting selection state.
 *   - Full keyboard navigation: Tab to move focus, Enter/Space to select.
 */
export const ThemeSegmentedControl = (): React.ReactElement => {
  const { themeMode, setThemeMode } = useTheme();
  const { getString } = useStrings();

  return (
    <div role="group" aria-label={getString('appearance')} className={css.segmentedControl}>
      {SEGMENTS.map(({ mode, icon, labelKey }) => (
        <button
          key={mode}
          id={`theme-segment-${mode}`}
          type="button"
          role="button"
          aria-pressed={themeMode === mode}
          className={cx(css.segment, { [css.active]: themeMode === mode })}
          onClick={() => setThemeMode(mode)}
        >
          <span className={css.segmentIcon} aria-hidden="true">
            {icon}
          </span>
          {getString(labelKey)}
        </button>
      ))}
    </div>
  );
};

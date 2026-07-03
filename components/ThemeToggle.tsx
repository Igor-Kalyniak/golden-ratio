'use client';

import { useState } from 'react';

import { useI18n } from '../lib/i18n-context';

type Theme = 'light' | 'dark';

/**
 * Header `☾ / ☀` toggle over `html[data-theme]` (DESIGN §4). Exercises the shipped dark
 * tokens. In-memory only (no persistence — BC-PRIVACY-01), so the theme always starts at the
 * server-rendered `light` default; the toggle mutates the attribute on click.
 */
export function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>('light');

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
  }

  const toDark = theme !== 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      aria-label={toDark ? t('themeDark') : t('themeLight')}
      className="grid h-[30px] w-[34px] place-items-center rounded-md border border-line bg-panel2 text-fg2 hover:text-fg"
    >
      <span aria-hidden="true">{toDark ? '☾' : '☀'}</span>
    </button>
  );
}

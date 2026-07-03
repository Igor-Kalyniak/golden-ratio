'use client';

import { LOCALES, type Locale } from '../lib/i18n';
import { useI18n } from '../lib/i18n-context';

const LABELS: Record<Locale, string> = { en: 'EN', ua: 'UA' };

/**
 * `EN | UA` pill that switches every UI string live (FR-I18N-01). Placement in the header
 * is FR-SHELL-03 (owned by app-shell). Keyboard-operable; the active locale is marked with
 * `aria-pressed`.
 */
export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t('language')}
      className="inline-flex items-center gap-0.5 rounded-full border border-line bg-panel2 p-0.5 text-sm font-medium"
    >
      {LOCALES.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            aria-pressed={active}
            onClick={() => setLocale(loc)}
            className={
              active
                ? 'rounded-full bg-accent px-2.5 py-1 text-accent-fg'
                : 'rounded-full px-2.5 py-1 text-muted hover:text-fg'
            }
          >
            {LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}

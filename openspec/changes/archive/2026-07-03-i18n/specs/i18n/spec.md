## ADDED Requirements

### Requirement: Language context with locale and translator

The app SHALL provide a `LanguageProvider` that holds the active `locale` (`'en' | 'ua'`, default
`'en'`) and exposes `useI18n()` returning `{ locale, setLocale, t }`, where `t(key)` looks the key
up in the active locale's dictionary. Changing the locale via `setLocale` SHALL re-render
consumers live with no page reload. The translation layer SHALL be a React context plus JSON
dictionaries — no heavy i18n library. (`FR-I18N-01`, `TC-I18N-01`)

#### Scenario: Live locale switch

- **WHEN** `setLocale('ua')` is called while the app is showing English
- **THEN** every consumer of `useI18n()` re-renders with the Ukrainian strings, without a reload

#### Scenario: Translator resolves by active locale

- **WHEN** `t('addRoom')` is called with `locale = 'en'` then `locale = 'ua'`
- **THEN** it returns `"Add room"` then `"Додати кімнату"`

### Requirement: All strings resolve through t() over flat JSON dictionaries

Every user-facing string — except the fixed calculation labels carved out below (`CALC_LABELS`,
"Calculation labels are never translated") — SHALL be addressable through `t(key)`, backed by two
flat JSON dictionaries at `locales/en.json` and `locales/ua.json` (`Record<string, string>`). The two
dictionaries SHALL have the identical key set — no key present in one but missing from the other.
The dictionary content SHALL be ported verbatim from the canonical export `STR` object / DESIGN
§11. (`FR-I18N-02`)

#### Scenario: Dictionaries are flat and key-complete

- **WHEN** the key sets of `locales/en.json` and `locales/ua.json` are compared
- **THEN** they are identical (no missing or extra keys on either side) and every value is a string

#### Scenario: Unknown key falls back visibly

- **WHEN** `t('doesNotExist')` is called
- **THEN** it returns the key `"doesNotExist"` (a visible fallback, never `undefined`)

### Requirement: Calculation labels are never translated

Calculation labels — `¼M`, `½M`, `M`, `1.5M`, `2M`, `3M`, `4M` — SHALL be locale-independent and
identical in both languages. They SHALL NOT be dictionary keys subject to translation; the module
exposes them as a constant (`CALC_LABELS`) used directly by the UI. (`FR-I18N-03`)

#### Scenario: Module labels stay constant across locales

- **WHEN** the module ruler renders `¼M … 4M` in Ukrainian
- **THEN** the labels are byte-identical to the English rendering

#### Scenario: Labels are not translated keys

- **WHEN** the EN/UA dictionaries are inspected
- **THEN** none of `¼M`, `½M`, `M`, `1.5M`, `2M`, `3M`, `4M` appears as a translated value keyed by
  locale; they come from `CALC_LABELS`

### Requirement: Live language toggle

A `LanguageToggle` component SHALL present an `EN | UA` control that calls `setLocale` and switches
all UI strings live. It SHALL indicate the active locale and be operable by keyboard. (Its
placement in the header is `FR-SHELL-03`, owned by `app-shell`.) (`FR-I18N-01`)

#### Scenario: Toggle flips the locale

- **WHEN** the user activates the inactive language in the toggle
- **THEN** `setLocale` is called with that locale and the UI updates live with a clear active-state
  indication

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  CALC_LABELS,
  createTranslator,
  DEFAULT_LOCALE,
  LOCALES,
  missingKeys,
  type Dictionary,
} from './i18n.ts';

/** Read a locale JSON via fs (avoids ESM json-import attributes in the test). */
function loadDict(name: string): Dictionary {
  const url = new URL(`../locales/${name}.json`, import.meta.url);
  return JSON.parse(readFileSync(fileURLToPath(url), 'utf8')) as Dictionary;
}

const en = loadDict('en');
const ua = loadDict('ua');

// --- Dictionary parity (FR-I18N-02) ----------------------------------------

test('EN and UA dictionaries have the identical key set', () => {
  assert.deepEqual(missingKeys(en, ua), [], 'keys in EN missing from UA');
  assert.deepEqual(missingKeys(ua, en), [], 'keys in UA missing from EN');
});

test('every dictionary value is a non-empty string', () => {
  for (const [name, dict] of [['en', en], ['ua', ua]] as const) {
    for (const [key, val] of Object.entries(dict)) {
      assert.equal(typeof val, 'string', `${name}.${key} must be a string`);
      assert.ok(val.length > 0, `${name}.${key} must be non-empty`);
    }
  }
});

test('UA values differ from EN for translated prose (not a copy-paste stub)', () => {
  // A sample of prose keys that must genuinely differ between locales.
  for (const key of ['title', 'addRoom', 'errCeiling', 'comfortable']) {
    assert.notEqual(en[key], ua[key], `${key} should be translated, not identical`);
  }
});

// --- Translator (FR-I18N-01) -----------------------------------------------

test('createTranslator resolves known keys in the active locale', () => {
  const tEn = createTranslator(en);
  const tUa = createTranslator(ua);
  assert.equal(tEn('addRoom'), 'Add room');
  assert.equal(tUa('addRoom'), 'Додати кімнату');
  assert.equal(tEn('title'), 'Apartment Module & Golden Ratio');
});

test('createTranslator falls back to the key on miss, never undefined', () => {
  const t = createTranslator(en);
  assert.equal(t('doesNotExist'), 'doesNotExist');
  assert.equal(typeof t('anythingUnknown'), 'string');
});

// --- Never-translate calculation labels (FR-I18N-03) -----------------------

test('CALC_LABELS are the fixed module labels', () => {
  assert.deepEqual([...CALC_LABELS], ['¼M', '½M', 'M', '1.5M', '2M', '3M', '4M']);
});

test('calculation labels are NOT dictionary keys or translated values', () => {
  for (const label of CALC_LABELS) {
    for (const [name, dict] of [['en', en], ['ua', ua]] as const) {
      assert.ok(!(label in dict), `${name} must not key the calc label ${label}`);
      assert.ok(
        !Object.values(dict).includes(label),
        `${name} must not contain the calc label ${label} as a value`,
      );
    }
  }
});

// --- Config sanity ----------------------------------------------------------

test('locale config is coherent', () => {
  assert.deepEqual([...LOCALES], ['en', 'ua']);
  assert.ok(LOCALES.includes(DEFAULT_LOCALE));
});

// --- Purity (no framework imports in lib/i18n.ts) --------------------------

test('lib/i18n.ts imports no framework code', () => {
  const src = readFileSync(fileURLToPath(new URL('./i18n.ts', import.meta.url)), 'utf8');
  assert.ok(!/from\s+['"]react/.test(src), 'must not import react');
  assert.ok(!/from\s+['"]next/.test(src), 'must not import next/*');
  assert.ok(!/\bdocument\b|\bwindow\b/.test(src), 'must not reference DOM globals');
});

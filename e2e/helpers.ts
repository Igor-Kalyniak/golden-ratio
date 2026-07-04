import { type Page } from '@playwright/test';

/** Deliberate pause so recorded interactions are readable on video (demo spec only). */
export async function pace(page: Page, ms = 1200): Promise<void> {
  await page.waitForTimeout(ms);
}

/** Switch the UI language via the header `EN | UA` pill. */
export async function setLanguage(page: Page, lang: 'EN' | 'UA'): Promise<void> {
  await page.getByRole('button', { name: lang, exact: true }).click();
}

/** Switch calculation mode via the segmented `3D | 2D` toggle. */
export async function setMode(page: Page, mode: '2D' | '3D'): Promise<void> {
  await page.getByRole('button', { name: mode, exact: true }).click();
}

/** Replace the value of a numeric/text input located by its element id. */
export async function fill(page: Page, id: string, value: number | string): Promise<void> {
  await page.locator(`#${id}`).fill(String(value));
}

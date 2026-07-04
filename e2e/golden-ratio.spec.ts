import { test, expect } from '@playwright/test';
import { setLanguage, setMode, fill } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('language pill switches every UI string live', async ({ page }) => {
  // Loads in EN by default.
  await expect(
    page.getByRole('heading', { name: 'Apartment Module & Golden Ratio' }),
  ).toBeVisible();

  await setLanguage(page, 'UA');
  await expect(
    page.getByRole('heading', { name: 'Модуль квартири та золотий перетин' }),
  ).toBeVisible();

  await setLanguage(page, 'EN');
  await expect(
    page.getByRole('heading', { name: 'Apartment Module & Golden Ratio' }),
  ).toBeVisible();
});

test('worked-example inputs render the canonical derived numbers (UA)', async ({ page }) => {
  await setLanguage(page, 'UA');
  // Default mode is 3D; heights are visible and default to 2800 / 2100 → module 700.
  await fill(page, 'apt-ceiling', 2800);
  await fill(page, 'apt-opening', 2100);
  // Living-room worked example.
  await fill(page, 'room-1-length', 4200);
  await fill(page, 'room-1-width', 3500);

  // Module summary hero.
  await expect(page.getByText('M = 700')).toBeVisible();
  // Golden split (exact / snapped / offset).
  await expect(page.getByText('2595.6 / 1604.4')).toBeVisible();
  await expect(page.getByText('2450 / 1750')).toBeVisible();
  await expect(page.getByText('145.6 mm')).toBeVisible();
  // Grid fit + quality badge (the badge renders "✓точно"; a separate `точно` <dt> label
  // exists in the golden-split section above, so match the badge text exactly to avoid
  // a strict-mode ambiguity between the two).
  await expect(page.getByText('6 × 5')).toBeVisible();
  await expect(page.getByText('✓точно')).toBeVisible();
});

test('mode toggle hides height fields in 2D (FR-MODE-02)', async ({ page }) => {
  await setLanguage(page, 'UA');
  // 3D default: ceiling field present.
  await expect(page.locator('#apt-ceiling')).toBeVisible();

  await setMode(page, '2D');
  await expect(page.locator('#apt-ceiling')).toHaveCount(0);

  await setMode(page, '3D');
  await expect(page.locator('#apt-ceiling')).toBeVisible();
});

test('adding and removing a room adds/removes its inputs', async ({ page }) => {
  await setLanguage(page, 'UA');
  await expect(page.locator('#room-2-length')).toHaveCount(0);

  await page.getByRole('button', { name: /Додати кімнату/ }).click();
  await expect(page.locator('#room-2-length')).toBeVisible();

  // Remove the second room via its labelled remove button (the last one in DOM order).
  await page.getByRole('button', { name: 'Видалити кімнату' }).last().click();
  await expect(page.locator('#room-2-length')).toHaveCount(0);
});

test('out-of-range ceiling shows the validation error (UA)', async ({ page }) => {
  await setLanguage(page, 'UA');
  await fill(page, 'apt-ceiling', 100);
  await expect(page.getByText('Ціле число від 2000 до 5000 мм.')).toBeVisible();
});

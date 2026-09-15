import { test, expect } from '@playwright/test';

test('production home page loads with the app title', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Apartment Module & Golden Ratio' }),
  ).toBeVisible();
});

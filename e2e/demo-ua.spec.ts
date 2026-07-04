import { test, expect } from '@playwright/test';
import { pace, setLanguage, setMode, fill } from './helpers';

/**
 * Paced Ukrainian walkthrough. Its purpose is the recorded video (config `video: 'on'`,
 * 1920×1080), so steps are deliberately slowed and results are scrolled into view. Assertions
 * are minimal — just enough to fail loudly if the live page is broken.
 */
test('Ukrainian walkthrough demo', async ({ page }) => {
  test.slow(); // triple the timeout — this test is intentionally unhurried.

  // 1. Load the live site (loads EN, 3D by default).
  await page.goto('/');
  await pace(page);

  // 2. Switch to Ukrainian — every string re-labels live.
  await setLanguage(page, 'UA');
  await expect(
    page.getByRole('heading', { name: 'Модуль квартири та золотий перетин' }),
  ).toBeVisible();
  await pace(page);

  // 3. Fill apartment heights (3D mode shows ceiling + opening).
  await fill(page, 'apt-ceiling', 2800);
  await pace(page, 600);
  await fill(page, 'apt-opening', 2100);
  await pace(page);

  // 4. Enter the first room (the worked-example living room).
  await fill(page, 'room-1-length', 4200);
  await pace(page, 600);
  await fill(page, 'room-1-width', 3500);
  await pace(page);

  // 5. Add and fill a second room.
  await page.getByRole('button', { name: /Додати кімнату/ }).click();
  await expect(page.locator('#room-2-length')).toBeVisible();
  await fill(page, 'room-2-length', 3800);
  await fill(page, 'room-2-width', 2500);
  await pace(page);

  // 6. Slow-scroll through the derived results, pausing on each.
  for (const name of [
    'Зведення модуля', // module summary
    'Діаграма вертикальних смуг', // band diagram (3D)
    'Результати по кімнатах', // per-room results
  ]) {
    await page.getByText(name, { exact: false }).first().scrollIntoViewIfNeeded();
    await pace(page);
  }

  // 7. Switch to 2D mode — heights hide, the 2D SVG visualizer shows.
  await setMode(page, '2D');
  await expect(page.locator('#apt-ceiling')).toHaveCount(0);
  await page.getByText('Візуалізатор модуля').first().scrollIntoViewIfNeeded();
  await pace(page);

  // 8. Back to 3D — let the lazy 3D canvas render.
  await setMode(page, '3D');
  await page.getByText('Візуалізатор модуля').first().scrollIntoViewIfNeeded();
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  await pace(page);

  // 9. Toggle to the dark theme for a final flourish.
  await page.getByRole('button', { name: 'Перемкнути на темну тему' }).click();
  await pace(page);

  // 10. Rest on the finished view.
  await pace(page, 2000);
});

import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pace, setLanguage, setMode, fill, caption } from './helpers';

/**
 * Paced Ukrainian product demo (~2 min). Its purpose is the recorded video (config records at full
 * 1920×1080), so steps are deliberately slowed and each beat carries a burned-in Ukrainian caption
 * (title + explanatory subtitle). The narrative follows five parts:
 *   1. Концепт — the general idea of the site.
 *   2. Унікальність і потреба — why proportion matters in design (the "expensive yet 'off' flat"
 *      hook; harmony via golden ratio / module / number, rooted in nature).
 *   3. Принцип роботи — how it works, by principle (not detailed data).
 *   4. Приклад — the step-by-step live data entry and derived results.
 *   5. Висновок — faster work that lands on comfort through precise numbers and the golden ratio.
 * Content is drawn from the user's script and docs/PRODUCT-BRIEF.md.
 *
 * Playwright cannot record audio, so the demo emits a NARRATION TIMELINE (the wall-clock ms at
 * which each captioned beat appears) to `test-results/demo-ua-narration.json`. The companion
 * `scripts/build-demo-voiceover.mjs` reads that timeline, synthesises a Ukrainian voice-over
 * (macOS `say -v Lesya`) per beat, fits each clip inside its caption window so lines never
 * overlap, and muxes the audio onto the video. Beat `key`s here MUST match that script's map.
 *
 * Assertions are minimal — just enough to fail loudly if the live page is broken.
 */
test('Ukrainian walkthrough demo', async ({ page }) => {
  test.slow(); // triple the timeout — this is an intentionally unhurried demo.

  const t0 = Date.now();
  const timeline: { key: string; ms: number }[] = [];

  /** Show a captioned beat and record when it appeared (for voice-over alignment). */
  const beat = async (key: string, title: string, subtitle = ''): Promise<void> => {
    timeline.push({ key, ms: Date.now() - t0 });
    await caption(page, title, subtitle);
  };

  await page.goto('/');
  await setLanguage(page, 'UA');
  await expect(
    page.getByRole('heading', { name: 'Модуль квартири та золотий перетин' }),
  ).toBeVisible();

  // --- Part 1: Концепт -----------------------------------------------------

  await beat(
    'concept',
    'Модуль квартири та золотий перетин',
    'Сайт, що допомагає архітектору спроєктувати квартиру по-справжньому гармонійно',
  );
  await pace(page, 7500);

  // --- Part 2: Унікальність і потреба (емоційний гачок) --------------------

  await beat(
    'feel',
    'Знайоме відчуття',
    'Кожен бував у квартирі з дорогим ремонтом, де все начебто на місці, але щось усе одно «не так»',
  );
  await pace(page, 11500);

  await beat(
    'harmony',
    'Гармонія — це пропорція',
    'Золотий переріз, модуль і число закладені в самій природі — у рослинах, тваринах і в людині',
  );
  await pace(page, 11500);

  // --- Part 3: Принцип роботи ----------------------------------------------

  await beat(
    'principle',
    'Як це працює',
    'З висоти стелі та прорізу виводиться єдиний модуль, а з нього — усі пропорції кімнат',
  );
  await pace(page, 7000);

  // --- Part 4: Приклад — вводимо дані --------------------------------------

  await beat(
    'heights',
    'Крок 1: Задаємо висоту стелі та прорізу',
    'Модуль пропонується як НСД висот, округлений до найближчого стандартного значення',
  );
  await fill(page, 'apt-ceiling', 2800);
  await pace(page, 900);
  await fill(page, 'apt-opening', 2100);
  await pace(page, 6500);

  await page.getByText('Зведення модуля').first().scrollIntoViewIfNeeded();
  await beat(
    'module',
    'Активний модуль M = 700 мм',
    'Це рекомендація, яку можна змінити — завжди видно, звідки взято число',
  );
  await pace(page, 8000);

  await beat('room', 'Крок 2: Вводимо розміри кімнати', 'Довжина та ширина — усі значення в мм');
  await fill(page, 'room-1-length', 4200);
  await pace(page, 900);
  await fill(page, 'room-1-width', 3500);
  await pace(page, 4000);

  await page.getByText('Поділ за золотим перетином').first().scrollIntoViewIfNeeded();
  await beat(
    'golden',
    'Золотий перетин',
    'Довша стіна ділиться у пропорції 0.618 / 0.382 зі скругленням до ½ модуля',
  );
  await pace(page, 6500);

  await page.getByText('Відповідність сітці').first().scrollIntoViewIfNeeded();
  await beat(
    'grid',
    'Відповідність сітці',
    'Скільки модулів вміщує кімната та наскільки чисто вона лягає на сітку',
  );
  await pace(page, 6500);

  await page.getByText('Прохід').first().scrollIntoViewIfNeeded();
  await beat(
    'walkway',
    'Прохід',
    'Просвіти повз меблі за фіксованими ергономічними порогами: ≥900 комфортно, ≥600 прийнятно',
  );
  await pace(page, 6500);

  await beat(
    'room2',
    'Крок 3: Додаємо другу кімнату',
    'Кімнат може бути скільки завгодно — усе оновлюється наживо',
  );
  await page.getByText('Кімнати').first().scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: /Додати кімнату/ }).click();
  await expect(page.locator('#room-2-length')).toBeVisible();
  await fill(page, 'room-2-length', 3800);
  await fill(page, 'room-2-width', 2500);
  await pace(page, 5800);

  await page.getByText('Діаграма вертикальних смуг').first().scrollIntoViewIfNeeded();
  await beat(
    'bands',
    'Вертикальні смуги',
    'Як модуль ділить висоту стелі та де проріз лягає відносно сітки',
  );
  await pace(page, 6000);

  await beat(
    'viz2d',
    'Крок 4: Перемикаємось у 2D-режим',
    'Візуалізатор малює кімнату в масштабі та підсвічує один модуль',
  );
  await setMode(page, '2D');
  await expect(page.locator('#apt-ceiling')).toHaveCount(0);
  await page.getByText('Візуалізатор модуля').first().scrollIntoViewIfNeeded();
  await pace(page, 6500);

  await beat('viz3d', 'Крок 5: 3D-візуалізація', 'Той самий модуль, побачений в об’ємі кімнати');
  await setMode(page, '3D');
  await page.getByText('Візуалізатор модуля').first().scrollIntoViewIfNeeded();
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 15_000 }).catch(() => {});
  await pace(page, 6000);

  await beat('theme', 'Крок 6: Темна тема', 'Data-dense інтерфейс, зручний і вдень, і вночі');
  await page.getByRole('button', { name: 'Перемкнути на темну тему' }).click();
  await pace(page, 5000);

  // --- Part 5: Висновок ----------------------------------------------------

  await beat(
    'conclusion',
    'Швидше — і точно в комфорт',
    'Точність чисел і золотий переріз пришвидшують роботу та влучають у комфорт і затишок',
  );
  await pace(page, 8500);

  await beat('thanks', 'Дякуємо за перегляд!');
  await pace(page, 3500);

  // Emit the narration timeline for the voice-over build step.
  mkdirSync('test-results', { recursive: true });
  writeFileSync(
    'test-results/demo-ua-narration.json',
    JSON.stringify({ durationMs: Date.now() - t0, beats: timeline }, null, 2),
  );
});

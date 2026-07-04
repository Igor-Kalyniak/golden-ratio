#!/usr/bin/env node
/**
 * Build a Ukrainian voice-over for the recorded demo and mux it onto the video.
 *
 * Playwright records no audio, so this post-processing step:
 *   1. reads the narration timeline emitted by e2e/demo-ua.spec.ts
 *      (test-results/demo-ua-narration.json — the ms at which each captioned beat appears),
 *   2. synthesises one Ukrainian clip per beat with macOS `say -v Lesya` (uk_UA),
 *   3. time-fits each clip inside its own caption window so lines never overlap,
 *   4. places every clip at its beat's timestamp and muxes the mixed track onto the 1080p video.
 *
 * Output: demo/demo-ua.mp4 (H.264 video + AAC Ukrainian voice-over).
 *
 * Prereqs: macOS `say` with the "Lesya" voice, and `ffmpeg`/`ffprobe` on PATH.
 * Run AFTER `npm run test:e2e:demo` (which produces the webm + narration.json).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const VIDEO = path.join(
  ROOT,
  'test-results/demo-ua-Ukrainian-walkthrough-demo-chromium/video.webm',
);
const TIMELINE = path.join(ROOT, 'test-results/demo-ua-narration.json');
const OUT = path.join(ROOT, 'demo/demo-ua.mp4');
const WORK = path.join(ROOT, 'test-results/voiceover');

const VOICE = 'Lesya'; // macOS uk_UA voice
const SAY_RATE = 186; // words/min
const GAP_S = 0.15; // min silence kept at the end of each caption window
const MAX_TEMPO = 1.7; // never speed a clip up more than this to fit its window

/**
 * Spoken line per beat key — MUST cover every `beat(key, …)` in e2e/demo-ua.spec.ts.
 * Follows the five-part narrative: концепт → унікальність/потреба → принцип → приклад → висновок.
 */
const NARRATION = {
  // Part 1 — концепт
  concept:
    'Модуль квартири та золотий перетин. Це сайт, який допомагає архітектору зробити планування квартири по-справжньому гармонійним.',
  // Part 2 — унікальність і потреба (емоційний гачок)
  feel:
    'Кожен хоча б раз бував у квартирі з дуже дорогим ремонтом, де начебто все розставлено з розумом, але щось усе одно не так. Підсвідомо відчувається дисбаланс і немає відчуття комфорту.',
  harmony:
    'Саме тут допомагає цей сайт. Він робить дизайн по-справжньому гармонійним за допомогою золотого перерізу, модуля та числа. Того, що закладено в самій природі, у тваринах і в людині.',
  // Part 3 — принцип роботи
  principle:
    'Принцип простий. З висоти стелі та прорізу виводиться єдиний модуль, а з нього — усі пропорції кімнат.',
  // Part 4 — приклад: вводимо дані
  heights:
    'Задаємо висоту стелі та прорізу. Модуль пропонується як найбільший спільний дільник висот, округлений до стандартного значення.',
  module:
    'Активний модуль — сімсот міліметрів. Це рекомендація, яку можна змінити, і завжди видно, звідки взято число.',
  room: 'Вводимо розміри кімнати — довжину та ширину, у міліметрах.',
  golden:
    'Золотий перетин. Довша стіна ділиться у пропорції нуль шістсот вісімнадцять до нуль триста вісімдесят два.',
  grid: 'Відповідність сітці показує, скільки модулів вміщує кімната і наскільки чисто вона лягає.',
  walkway:
    'Прохід. Просвіти повз меблі перевіряються за фіксованими ергономічними порогами.',
  room2: 'Додаємо другу кімнату. Кімнат може бути скільки завгодно, і все оновлюється наживо.',
  bands:
    'Вертикальні смуги показують, як модуль ділить висоту стелі і де розташований проріз.',
  viz2d:
    'Перемикаємось у двовимірний режим. Візуалізатор малює кімнату в масштабі та підсвічує один модуль.',
  viz3d: 'А це той самий модуль у тривимірному об’ємі кімнати.',
  theme: 'Інтерфейс зручний і у світлій, і у темній темі.',
  // Part 5 — висновок
  conclusion:
    'У підсумку — точність чисел і золотий переріз пришвидшують роботу та влучають у комфорт і затишок. Обґрунтований результат за пару хвилин.',
  thanks: 'Дякуємо за перегляд!',
};

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`${cmd} failed (${r.status}): ${r.stderr || r.stdout}`);
  }
  return r.stdout;
}

function probeDurationS(file) {
  const out = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  return parseFloat(out.trim());
}

function assertTool(tool, versionArg = '-version') {
  const r = spawnSync(tool, [versionArg], { encoding: 'utf8' });
  if (r.error) throw new Error(`Required tool "${tool}" not found on PATH.`);
}

// --- Preconditions ---------------------------------------------------------
assertTool('ffmpeg');
assertTool('ffprobe');
if (spawnSync('say', ['-v', '?'], { encoding: 'utf8' }).stdout?.includes(VOICE) !== true) {
  throw new Error(`macOS "say" voice "${VOICE}" (uk_UA) is not installed.`);
}
if (!existsSync(VIDEO)) throw new Error(`Video not found: ${VIDEO}\nRun: npm run test:e2e:demo`);
if (!existsSync(TIMELINE)) throw new Error(`Timeline not found: ${TIMELINE}\nRun: npm run test:e2e:demo`);

// --- Load timeline + video length -----------------------------------------
const { beats } = JSON.parse(readFileSync(TIMELINE, 'utf8'));
const videoDurS = probeDurationS(VIDEO);
rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

// --- Synthesise + fit each clip -------------------------------------------
const clips = [];
for (let i = 0; i < beats.length; i++) {
  const { key, ms } = beats[i];
  const text = NARRATION[key];
  if (!text) throw new Error(`No narration line for beat "${key}". Update NARRATION.`);

  const startS = ms / 1000;
  const nextStartS = i + 1 < beats.length ? beats[i + 1].ms / 1000 : videoDurS;
  const windowS = Math.max(0.8, nextStartS - startS - GAP_S);

  const aiff = path.join(WORK, `${i}-${key}.aiff`);
  run('say', ['-v', VOICE, '-r', String(SAY_RATE), '-o', aiff, text]);
  const rawS = probeDurationS(aiff);

  // Fit inside the window: speed up (atempo) only if the clip overruns; never slow down.
  const tempo = rawS > windowS ? Math.min(MAX_TEMPO, rawS / windowS) : 1;
  const wav = path.join(WORK, `${i}-${key}.wav`);
  run('ffmpeg', [
    '-y', '-i', aiff,
    '-filter:a', `atempo=${tempo.toFixed(4)}`,
    '-ar', '44100', '-ac', '2',
    wav,
  ]);

  clips.push({ wav, delayMs: Math.round(ms) });
  const finalS = Math.min(rawS, windowS).toFixed(2);
  process.stdout.write(
    `beat ${String(i).padStart(2)} ${key.padEnd(8)} @${startS.toFixed(1)}s  window ${windowS.toFixed(1)}s  clip ${rawS.toFixed(1)}s${tempo > 1 ? ` → ×${tempo.toFixed(2)} (${finalS}s)` : ''}\n`,
  );
}

// --- Mux: video + delayed, non-overlapping clips mixed into one AAC track ---
const inputs = ['-y', '-i', VIDEO];
clips.forEach((c) => inputs.push('-i', c.wav));

const filters = clips
  .map((c, idx) => `[${idx + 1}:a]adelay=${c.delayMs}|${c.delayMs}[a${idx}]`)
  .join(';');
const mixIns = clips.map((_, idx) => `[a${idx}]`).join('');
const filterComplex = `${filters};${mixIns}amix=inputs=${clips.length}:normalize=0:dropout_transition=0[aout]`;

mkdirSync(path.dirname(OUT), { recursive: true });
run('ffmpeg', [
  ...inputs,
  '-filter_complex', filterComplex,
  '-map', '0:v:0',
  '-map', '[aout]',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'slow',
  '-c:a', 'aac', '-b:a', '160k',
  '-movflags', '+faststart',
  '-t', videoDurS.toFixed(3),
  OUT,
]);

console.log(`\n✓ Wrote ${path.relative(ROOT, OUT)} (${videoDurS.toFixed(1)}s, video + Ukrainian voice-over)`);

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

/**
 * Show a burned-in caption overlay for the demo recording (demo spec only). Renders a bold title
 * and an optional explanatory subtitle. Injects a fixed, pointer-events:none banner into the page
 * DOM on first call and updates its text thereafter, so every subsequent frame the video captures
 * carries the caption. Because it lives in the page body (not React's tree), it survives mode/theme
 * toggles without being re-rendered away. The demo navigates once, so the element persists for the
 * whole run. `aria-hidden` keeps it out of the accessibility tree; it is a visual-only demo aid and
 * never a selector target. Text is set via `textContent` (never HTML), so caption strings are inert.
 */
export async function caption(page: Page, title: string, subtitle = ''): Promise<void> {
  await page.evaluate(
    ({ title, subtitle }) => {
      const ID = 'e2e-demo-caption';
      let el = document.getElementById(ID);
      if (!el) {
        el = document.createElement('div');
        el.id = ID;
        el.setAttribute('aria-hidden', 'true');
        el.style.cssText = [
          'position:fixed',
          'left:50%',
          'bottom:6%',
          'transform:translateX(-50%)',
          'width:min(1100px,86vw)',
          'box-sizing:border-box',
          'padding:20px 40px',
          'background:rgba(15,23,42,0.92)',
          'color:#f8fafc',
          'text-align:center',
          'border-radius:16px',
          'z-index:2147483647',
          'pointer-events:none',
          'box-shadow:0 12px 40px rgba(0,0,0,0.45)',
        ].join(';');
        document.body.appendChild(el);
      }
      el.textContent = '';
      const h = document.createElement('div');
      h.textContent = title;
      h.style.cssText = 'font:700 34px/1.3 Inter,system-ui,-apple-system,sans-serif';
      el.appendChild(h);
      if (subtitle) {
        const s = document.createElement('div');
        s.textContent = subtitle;
        s.style.cssText =
          'margin-top:10px;font:400 23px/1.45 Inter,system-ui,-apple-system,sans-serif;opacity:0.88';
        el.appendChild(s);
      }
    },
    { title, subtitle },
  );
}

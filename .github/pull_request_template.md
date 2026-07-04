## Автор
Ihor Kalyniak

## Проєкт
**Apartment Module & Golden Ratio Calculator** — односторінковий клієнтський застосунок, який
автоматизує пропорційне планування квартири: за висотою стелі, висотою прорізу та розмірами
кімнат пропонує модуль квартири й виводить висотні смуги, поділ зон за золотим перетином, аналіз
вкладання в сітку та рекомендації щодо проходів. Уся математика — суто на клієнті (без бекенду,
БД чи експорту), інтерфейс двомовний (UA/EN), є перемикач режимів 2D⇄3D і read-only візуалізатор
модуля (2D SVG / lazy-loaded 3D `@react-three/fiber`).
Стек: **Next.js (App Router) + React + TypeScript + Tailwind CSS**, 3D — `@react-three/fiber` +
`@react-three/drei` + `three`; тести — `node --test` + **Playwright** e2e.

## Відео-демо (1–2 хв)
https://github.com/Igor-Kalyniak/golden-ratio/blob/dev/demo/demo-ua.mp4

## Які практики Agentic Engineering застосовано
- **Контекст-інженерія.** Статичний контекст зафіксовано в `AGENTS.md`/`CLAUDE.md` (огляд проєкту,
  команди, обмеження стеку — 2D=чистий SVG, 3D=лише lazy-loaded `@react-three/fiber`) + продуктові
  доки в `docs/` (`PDR.md` з нумерованими вимогами `FR-*`/`NFR-*`/`TC-*`/`BC-*`, `DESIGN.md`,
  `CAPABILITIES.md`, `PRODUCT-BRIEF.md`). Динамічний контекст — task-scoped **skills** під
  `.agents/skills/` (`nextjs-frontend`, `design-tokens`, `design-layout-components`,
  `calculation-logic`, `i18n-strings`), які підвантажуються лише коли релевантні.
- **Цикли (loop engineering).** Кожна спроможність проходила `ship-capability` loop:
  propose → validate → apply → review → QA/trajectory-eval → archive → docs — замість покрокового
  ручного промптингу.
- **Жива передача стану між сесіями.** [`docs/CURRENT_STATE.md`](../docs/CURRENT_STATE.md) — живий
  handoff-лог: наприкінці кожної сесії агента оновлюються «Last action / Status / Next steps», щоб
  наступне вікно (людина чи агент) одразу мало контекст, що зроблено й що далі, без перечитування
  всієї історії.
- **Maker ≠ Checker / суб-агенти.** Код писав один агент (Maker), а рев'ю робили окремі свіжі
  суб-агенти (Checkers), які не писали цей код: `code-reviewer`, `spec-compliance-auditor`,
  `security-reviewer`, `qa-trajectory-evaluator`. Додатково — **автоматичне рев'ю PR від CodeRabbit**
  як зовнішній Checker: усі зауваження протріажено й доведено до фіксу (або обґрунтовано відхилено),
  з перевіркою `node --test` + `tsc` + `next build` перед прийняттям.
- **Верифікація.** Юніт-тести `node --test` (**107/107** зелені) + **Playwright** e2e-набір проти
  прод-деплою на Vercel (**7/7**): перемикання i18n, канонічні числа з worked-example, режим 2D/3D,
  CRUD кімнат, валідація; `openspec validate --strict` для специфікацій.
- **Специфікації наперед (SDD).** OpenSpec-зміни під `openspec/` + дизайн-специ під
  `docs/superpowers/specs/` писалися **до** імплементації; кожна вимога `FR-*/NFR-*` трасується до
  коду й тестів.
- **Інструменти.** Claude Code (Agent SDK), OpenSpec, subagents, Playwright, Next.js toolchain.
- **Що вирішував я / що агент.** Я задавав продуктові рішення, обсяг і пріоритети та ухвалював
  рев'ю; агент(и) генерували специфікації, код, тести й доки в межах цих обмежень.
---

### Чекліст
- [x] Вказано справжнє імʼя
- [x] Додано посилання на відео-демо (1–2 хв)
- [x] Описано застосовані практики Agentic Engineering
- [x] Результат робочий і доведений до кінця

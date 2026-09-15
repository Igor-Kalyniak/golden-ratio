---
name: i18n-strings
description: Bilingual UA⇄EN internationalization for the Apartment Module & Golden Ratio Calculator — the language pill that swaps every UI string live, the canonical EN/UA dictionary keys, and the rule that calculation labels (¼M, ½M, M, 1.5M, 2M, 3M, 4M) are never translated. Use whenever adding/editing user-facing strings, wiring the EN/UA dictionaries, or building the language toggle. Distilled from docs/DESIGN.md §11.
license: Apache-2.0
metadata:
  version: "1.0.0"
  updated: 2026-06-30
  category: i18n
  source: docs/DESIGN.md
---

# Internationalization (UA ⇄ EN)

The interface is bilingual. The language pill swaps **every UI string** live. Pairs with
[design-layout-components](../design-layout-components/SKILL.md) (where strings render).

## When to use

- Adding or editing any user-facing string.
- Wiring or porting the EN/UA dictionaries.
- Building the `EN | UA` language toggle.

## Rules

- The language pill swaps **every UI string** live (no reload).
- **Calculation labels are never translated:** `¼M`, `½M`, `M`, `1.5M`, `2M`, `3M`, `4M` stay
  identical in both languages.
- The full EN/UA dictionaries are the canonical strings, in the export's `STR` object
  (`docs/design/export/prototype.dc.html`, lines ~392–459). Port them verbatim into the build's
  dictionaries.

## Key entries

| Key | EN | UA |
|---|---|---|
| `title` | Apartment Module & Golden Ratio | Модуль квартири та золотий перетин |
| `subtitle` | Proportional planning instrument · all values in mm | Інструмент пропорційного планування · усі значення в мм |
| `live` | updates live | оновлюється наживо |
| `ceiling` / `opening` / `module` | Ceiling height / Opening height / Module | Висота стелі / Висота прорізу / Модуль |
| `errCeiling` | Must be an integer between 2000 and 5000 mm. | Ціле число від 2000 до 5000 мм. |
| `errOpening` | Must be ≥ 1800 mm and ≤ ceiling height. | Має бути ≥ 1800 мм та ≤ висоти стелі. |
| `errDim` | Must be between 500 and 15000 mm. | Має бути від 500 до 15000 мм. |
| `suggestedFrom` / `suggestedFromRooms` | suggested from heights / from room dimensions | рекомендовано з висот / з розмірів кімнат |
| grid quality | exact / close / poor | точно / близько / погано |
| walkway rating | comfortable / acceptable / tight | комфортно / прийнятно / тісно |
| `vizNote` | Read-only — comprehension aid, to scale. Not a floor plan. | Лише для перегляду — допоміжна схема в масштабі. Не план поверху. |
| `webgl` | 3D unavailable on this device — showing 2D plan instead. | 3D недоступне — показано 2D-план. |

> The table above is the high-traffic subset. The **complete** dictionary lives in the export
> `STR` object — treat that as source of truth and port all keys.

# Verified Room Plan — product design spec

> **Status:** design spec; not approved for implementation.
> **Date:** 2026-09-15
> **Origin:** brainstorming session (skill `brainstorming`)
> **Relationship to `golden-ratio`:** this document describes a **separate
> product** that grows organically out of the `lib/calculations.ts` engine.
> It is not a change to the current app.
> **Identifier namespace:** requirements defined here live in their own
> namespace (`FR-*`, `BC-VRP-*`, `TC-VRP-*`, `LC-*`, `OQ-VRP-*`, `GAP-*`,
> `RISK-*`, `M-*`) and do NOT collide with `docs/PDR.md`. Existing
> `golden-ratio` identifiers (`BC-WALK-01`, `BC-PRIVACY-01`, `TC-DATA-01`,
> `BC-SCOPE-01`) are cited, never redefined.
> **Document language:** English. Ukrainian-language product copy (taglines,
> UI strings) is kept verbatim in Ukrainian with an English gloss, because it
> is the shipped wording for the Ukrainian market, not prose to be translated.

---

## 0. TL;DR

The product turns "will the furniture fit?" from a promise into a computation.

The continuity thesis, in one line:

> **`golden-ratio` verifies clearances against generic furniture depths
> (`FURNITURE_DEPTHS`). The business is verifying clearances against the real
> dimensions of a specific SKU.**

Positioning, in one line (Ukraine):

> **«Кімната під ваш бюджет. Усе поміститься, усе є в наявності, усе привезуть —
> з повною вартістю до копійки.»**
> *(A room that fits your budget. Everything fits, everything is in stock,
> everything can be delivered — with the full cost down to the last kopiyka.)*

Against the main competitor, in its own words:

> **MeltFlex says "Always confirm dimensions with a tape measure before buying."
> We are that check.**
> Ukrainian: «Вони кажуть: "перевірте рулеткою". Ми — це та перевірка.»

---

## 1. Problem and hypothesis

### 1.1 What fails in existing solutions

The typical AI interior pipeline: photo → hidden prompt → attractive image →
visual search → "similar" products → paywall. The user gets inspiration but no
executable plan.

### 1.2 The central product hypothesis

**H1.** A segment exists for which *confidence in the purchase* is worth more
than *image quality*, and it will pay for a verified result rather than for
AI credits.

**H2 (the Ukrainian form of H1, and the priority one).** In Ukraine the binding
constraint is not centimetres but money. The segment pays for an answer to
"what can I actually buy for ₴25,000 so that everything fits and everything can
be delivered?"

**Status of both hypotheses: UNVALIDATED.** See §16 and §17. This is the
single largest risk in this document.

### 1.3 External evidence (weak, n=1)

A MeltFlex AI review (The Gila Herald, 2026-07-29) — a *favourable* review whose
verdict reads, verbatim:

> "It did not decorate the room for us. It gave me a shopping list, showed me the
> sofa I wanted was the wrong sofa, and stopped us buying furniture that would
> have made the room worse… that turned out to be worth more than the picture
> itself."

A user praising a competitor values **negative selection**, not the render.
That is the first external support for H1.

**Mandatory caveat about the source.** The text shows the hallmarks of SEO or
affiliate placement: keyword-shaped headings, an FAQ block, a tidy pros/cons
table, and **statistics with no source given** ("roughly 58 percent of furniture
returns down to… the piece not fitting the space", "seeing an item in context
cuts size related returns by around 71 percent").
**Those two figures are barred from the pitch deck and from marketing until a
primary source is found.** The trustworthy part of the review is its admissions
against interest (§4.2) — not its praise and not its numbers.

---

## 2. Continuity from `golden-ratio`

### 2.1 What carries over (verified by reading the code)

`lib/calculations.ts` — 598 lines of pure functions, 107 unit tests:

| Asset | What it gives the business |
|---|---|
| `computeWalkways(roomWidth, furnitureDepth, oppositeDepth)` | the core of the clearance check |
| `WALKWAY_THRESHOLDS = { comfortable: 900, acceptable: 600 }` | absolute ergonomic thresholds (`BC-WALK-01`: never scale with M) |
| `rateWalkway`, `walkwayMeterBars` | the rating and its visual meter |
| `FURNITURE_DEPTHS = { wardrobeKitchen: 600, sofa: 900, facingUnits: 1200 }` | **a prototype catalog with three archetypes** |
| `computeRoomGrid` | grid-fit quality, signed remainders, rounding direction |
| `layoutRoom2D` / `layoutRoom3D` / `interiorModuleLines` | to-scale rendering, SVG plus lazy three.js |
| `suggestModule`, `computeGoldenSplit`, `computeVerticalBands` | **a deterministic layout generator** (see §2.2) |
| `BOUNDS`, `isValidCeiling/Opening/Dimension` | input validation |
| UA/EN i18n, `CALC_LABELS` (never-translate) | localisation already exists |

### 2.2 The module as a layout prior — the key architectural decision

The module grid M and the golden ratio are a **deterministic generator of a
first-pass plan**. Not AI. The grid yields proportionally sound positions, the
golden ratio divides zones, and `computeWalkways` validates the outcome.

The resulting claim, which no competitor can make:

> Our layouts are derived from architectural proportion and verified clearances,
> not from a diffusion model's hallucination.

**`BC-VRP-MODULE-UI-01`.** The module M, the golden ratio, and the word "module"
**must not surface in the UI** of the new product. These are concepts that
delight an architect and mean nothing to someone buying a sofa. Only the result
surfaces: "the wardrobe goes here; clearance 870 mm — acceptable." Violating
this rule inherits the architect audience the product deliberately declined.

### 2.3 What does not carry over

- **The architectural constraints.** `golden-ratio` is client-side by principle:
  no backend, no persistence, no analytics (`BC-PRIVACY-01`, `TC-DATA-01`,
  `BC-SCOPE-01`). The business needs accounts, a cloud project, a catalog
  service, payments, and GPU rendering. The transferable asset is
  **`lib/calculations.ts` and the visualisers**, not the app shell.
- **An honest valuation of the asset.** 598 lines of pure maths is roughly three
  weeks of work for a competitor. Continuity buys speed and confidence in
  correctness. **It does not buy a moat.** Do not treat it as a defence.

### 2.4 Fate of the current app (OPEN QUESTION)

Undecided: whether `golden-ratio` continues as a standalone product, becomes the
free tier of the new product, or is archived. See §19, `OQ-VRP-09`.

---

## 3. Market and segment

### 3.1 Market #1: Ukraine

**Decision:** Ukraine is the first and only market for version one.

**Why this repairs the main risk.** In the EU calculation, CAC came out at
€40–75 against a €39 price — the unit economics did not close. In Ukraine the
CPC in this category is several times lower, there is no competitor with a local
catalog at all, and the founder has the language and access to retailers. The
choice of market repairs precisely the variable that was killing the model.

**What gets easier:**
- the app is already bilingual UA/EN — localisation exists;
- neither MeltFlex, IKEA Kreativ, nor Planner 5D is localised to a UA catalog;
- a deal with a Ukrainian factory is far more achievable than one with IKEA Group;
- Delivery Path Check gains a local anchor: Nova Poshta publishes dimensional
  limits for its delivery types and branch classes;
- strong SEO demand for "чи влізе диван у ліфт / у двері" ("will the sofa fit in
  the lift / through the door").

**What gets harder (accepted deliberately):**
- **ARPU drops.** €39 is unrealistic; target price is ₴299–599 (~€7–13);
- **product data quality is worse** — marketplaces are populated by sellers;
- **affiliate infrastructure is weaker** — Awin/CJ/Impact barely cover Ukraine;
  work through SalesDoubler, Admitad, and retailers' own programmes;
- **the catalog does not transfer** — expanding to the EU means normalising from
  zero. The engine and the normalisation *process* transfer; the data does not;
- **investors discount UA-only B2C.** External framing: "a proving ground in a
  market where we hold an unfair advantage; the engine is geography-neutral."

### 3.2 Beachhead

> **People furnishing a home on a hard, fixed budget, where the purchase is
> effectively irreversible.**

Two markers, both required:

1. **An externally fixed budget** that does not move. People who relocated to
   another city, took an empty flat, are starting over, or young families. The
   budget is a constraint, not an outcome.
2. **Irreversibility of the purchase.** A significant share of Ukrainian
   furniture is sold **під замовлення** (made to order) — 2–6 week lead times
   and effectively no right of return — plus the reverse logistics of shipping a
   wardrobe back via Nova Poshta. Irreversibility is what makes pre-purchase
   verification maximally valuable.

This is sharper than the US case in the MeltFlex review, where the cost of a
mistake is a three-hour drive to Phoenix.

**`OQ-VRP-01`:** verify the specifics of Ukrainian consumer rights for distance
selling and for made-to-order goods against current legislation.

### 3.3 Rejected segments (and why)

| Segment | Why rejected |
|---|---|
| All homeowners | untargetable; the pain is diffuse |
| People moving into an empty flat (broad) | the fact of moving is unobservable; the need spans a whole flat, not a room |
| Landlords / Airbnb hosts | economically the best (repeat use, ROI, LTV) but contradicts the fixed B2C constraint. **Retained as an expansion path — see §18.3** |
| Designers and architects | explicitly excluded by the client |

---

## 4. Competitors

### 4.1 The field

| Player | Strengths | Weakness for our job |
|---|---|---|
| **MeltFlex AI** | 20-second render, 25+ styles, very broad coverage, IKEA/Amazon/Wayfair, API/B2B, web + iOS + Android | does not measure (see §4.2); "exact or similar"; a subscription against an episodic task |
| **IKEA Kreativ** | LiDAR scan, removes existing furniture, IKEA SKUs to scale, cart, vertical integration | IKEA only; limited assortment and logistics in Ukraine |
| **Planner 5D / Homestyler** | large 3D catalogs, editing, renders | no real local SKUs, no total cost, no delivery verification |
| **Local UA players** | — | **`OQ-VRP-02`: not checked whether any exist.** Mandatory task before launch |

### 4.2 MeltFlex's admissions — each maps to one of our features

Source: the Gila Herald review plus the MeltFlex FAQ quoted within it.

| Their words | Our answer |
|---|---|
| "Do not treat the render as a measured floor plan" / "takes small liberties with scale" / "Not to the inch" | the interval engine (§6) |
| **"Always confirm dimensions with a tape measure before buying"** | **this is our entire product** |
| "The match is the exact item **or a close alternative**" → "strong shortlist, not a guaranteed cart" | the exact SKU or nothing; no "similar" |
| "A dim, cluttered snap gives a muddy render, **and the app will not warn you**" | the confidence model cannot stay silent by construction |
| "4K" that actually lands closer to 2K | never promise what cannot be verified |
| $29/mo standard, $59/mo pro — with churn instructions inside a *positive* review | a one-time price for a finished room |

### 4.3 Correction to the original competitive hypothesis

The original brief assumed the main complaint about AI redesign was "the AI
changes walls, windows and room dimensions." **The review refutes this:** "The
window stayed where the window is… The ceiling fan did not vanish." In
photo-redesign MeltFlex preserves geometry, and this is perceived as a strength.

**Conclusion: the attack line "it invents your room" is weak and is withdrawn.
The line that works is "it does not measure."**

### 4.4 Where not to fight

Do not compete on the render. Twenty seconds, dozens of styles, geometry
preserved — that is a commodity, and even a satisfied user ranked the picture
below the shopping list.

---

## 5. The free/paid boundary

**Principle: the line follows the presence of a catalog.** It coincides with the
cost boundary, the value boundary, and the exact line along which `golden-ratio`
becomes a business (`FURNITURE_DEPTHS` on the left, the catalog on the right).

### 5.1 Free tier — the generic

- `FR-FREE-01` room geometry from entered dimensions;
- `FR-FREE-02` to-scale plan (2D SVG) plus 3D view — inherited from `golden-ratio`;
- `FR-FREE-03` clearances against archetypes (`FURNITURE_DEPTHS`) rated
  comfortable / acceptable / tight;
- `FR-FREE-04` **Delivery Path Check** (§9);
- `FR-FREE-05` **"Second opinion" / negative selection** (§5.4) — the main hook;
- `FR-FREE-06` **atmospheric AI render**: mood and style only, **no dimension
  lines, no labels, no product names, no prices**, watermarked, with an explicit
  "не для замовлення" ("not for ordering") banner.

### 5.2 Paid tier — the specific

- `FR-PAID-01` real SKUs with real product **and packaging** dimensions;
- `FR-PAID-02` clearances recomputed against those dimensions; a conflict map;
- `FR-PAID-03` the technical plan with dimension lines;
- `FR-PAID-04` full cost including delivery and assembly (§10);
- `FR-PAID-05` shopping list and links;
- `FR-PAID-06` Safe Swap;
- `FR-PAID-07` Availability Recovery;
- `FR-PAID-08` a render derived from the verified scene, with a product legend.

### 5.3 The one-line explanation to the user

> **Free — will a sofa fit.
> Paid — will *this* sofa fit, and what it actually costs.**

### 5.4 "Don't buy this" as a headline feature

`FR-FREE-05`. The user pastes a link to a product they are already considering
and gets a verdict: **fits / does not fit / fits but kills the walkway**.

Rationale: this is precisely what the user publicly thanked MeltFlex for (§1.3).
Instant value, zero taste liability, highly shareable, and it needs no catalog —
the dimensions of a single product are facts (see §12).

### 5.5 Accepted cannibalisation risk

**`RISK-CANNIBAL`.** The free tier may be sufficient for most users. "A sofa
900 mm deep will fit; clearance 870 mm" is enough for many people.

This is **not a defect but the central experiment**: free → paid conversion
measures directly whether the promise is worth money. Metric `M-CONV-01` (§16).

---

## 6. The confidence engine — the core of the product

### 6.1 Rejected design: a single room-level score

**`BC-CONF-01`. A single "room accuracy score" is forbidden.** A room can be 90%
confident overall while the one wall that decides the wardrobe is pure guesswork.
Such a number misinforms.

### 6.2 Accepted design: confidence as a property of each edge

**Confidence belongs to every input number and propagates through the
computation. A result inherits the worst confidence among its inputs.**

```
computeWalkways(roomWidth, furnitureDepth, oppositeDepth)
→ confidence(available) = min(confidence of inputs)
```

`FR-GEO-01`. Every pure function in `lib/calculations.ts` gains a wrapper that
carries source and error margin through.

### 6.3 Interval arithmetic — the mechanism

`FR-GEO-02`. The engine computes intervals, not scalars:

```
available = (roomWidth ± e₁) − (depth ± e₂)
```

`FR-GEO-03`. `rateWalkway` is applied to the **interval**, not to a point, and
decides on a single criterion — **does the interval straddle the threshold?**

| Case | Interval vs 900 mm threshold | Action |
|---|---|---|
| 1400 ± 50 | entirely above | the scan suffices, **no measurement needed** |
| 910 ± 50 | **straddles the threshold** | **ask for the tape measure** |
| 700 ± 50 | entirely below | conflict; measuring will not save it |

**Consequence — the product's principal UX value:** the system asks the user to
measure **only what actually decides the outcome**. Usually 1–3 numbers, not 7.
The user does not see "give us data" but "this determines whether the wardrobe
fits."

### 6.4 The four statuses — derived, never assigned

`FR-GEO-04`:

| Status | Condition |
|---|---|
| `Verified` | every input to the result was measured by hand |
| `Estimated` | some inputs come from a scan or photo, but the interval does not straddle a threshold |
| `Needs measurement` | an input is weak **and** the interval straddles a threshold |
| `Conflict` | fails even at the optimistic bound of the interval |

### 6.5 UI rule

`BC-CONF-02`. This must **not** surface as a number or a "score". The moment a
measure becomes a number, people start gaming it. Show a state instead:
**"ready to verify" / "1 measurement needed" / "3 measurements needed"**
(UA: «готово до перевірки» / «потрібен 1 замір» / «потрібно 3 заміри»).

### 6.6 Circumvention — deliberately not defended against

`BC-CONF-03`. A user can enter invented numbers to unlock the paid tier. Do not
police this. The consequence: **confidence is a quality signal for the user, not
a trust signal for the system.** No internal logic — risk, guarantees, quality
analytics — may be built on it.

### 6.7 Legal framing

`BC-LEGAL-01`. The product issues a **FitProof Report**, not a guarantee.
Neither the UI nor the terms of service may create the impression of a guaranteed
outcome. See `RISK-ASYM` (§18).

---

## 7. Geometry input

### 7.1 Decision

**Three sources operate in parallel from day one**, differing only in the size of
the error term `e`:

| Source | Error | Default status |
|---|---|---|
| Manual measurement (tape) | small | `Verified` |
| iOS LiDAR / RoomPlan | ±2–5 cm on walls, worse on niches, radiators, reveals | `Estimated` |
| Photo / floor plan | large, honestly declared | `Estimated` |

`FR-GEO-05`. The combination: a scan or photo produces fast draft geometry, then
§6.3 determines which 1–3 numbers must be confirmed with a tape measure for the
result to become `Verified`.

### 7.2 Why this beats either extreme

- Measurement changes from an entry barrier into an **on-demand, targeted
  request**.
- The paywall stops being a withholding tactic and becomes an **honest quality
  condition**: the paid plan cannot be issued until the data supports
  verification.
- The scan no longer has to be accurate. It has to be **approximately right and
  honest about its own error**. That is a dramatically lower bar.

### 7.3 Photos are context only

`BC-GEO-01`. Photos are used for style, rendering, and understanding what is
already in the room. **No number extracted from a photo may enter a computation
as `Verified`.**

### 7.4 Input model — required fields

`FR-GEO-06`. Beyond length/width/height:

- room door opening width, **hinge side and swing direction**;
- window positions and sizes; sill height;
- niches and projections;
- **radiators, pipes, sockets and switches** (they determine where a TV, desk or
  bed can go) — see `GAP-04` (§20);
- **existing furniture that stays** — as a measured obstacle with no SKU, see
  `GAP-01` (§20);
- **building data for Delivery Path Check** — floor, lift (cabin and door
  dimensions), stairwell and entrance width, turns — see `GAP-03`.

### 7.5 Units

`BC-UNITS-01`. Internal representation is **millimetres** (as in `golden-ratio`).
Consumer-facing display is **centimetres and metres**. Architects think in mm,
buyers think in cm; mixing the two is not permitted.

---

## 8. Platforms

### 8.1 Decision: iOS is a sensor, not a client

| Platform | Role |
|---|---|
| **iOS** | RoomPlan scan → geometry with intervals → into the project. Plus **the entire free tier** runs inside the app |
| **Web** | the whole product: measurement, refinement, catalog, SKUs, cost, shopping list, render, payment |
| **Android** | plan/photo upload and manual measurement via the web; no native scan |
| **Shared** | one backend, one project; the scan lands in a project and work continues on the web |

`TC-PLATFORM-01`. LiDAR/RoomPlan is **not available from a browser** — it is a
native iOS framework and WebXR does not expose it. "Scanning from day one"
therefore implies a native iOS app.

### 8.2 Mandatory App Store condition

`BC-IOS-01`. **The free tier must work inside the app and produce a result
without sending the user to the web.** An app that only scans and hands off to a
website is rejected under guideline 4.2 ("minimal functionality"). This is a
review-passing requirement, not a nicety.

Implementation: the free tier is already-written pure maths; serve it through an
embedded web view, **do not rewrite it in Swift**.

### 8.3 Degradation

`NFR-DEGRADE-01`. If iOS is absent or fails, the web works in full — simply with
wider intervals and more measurement requests. The architecture does not change.

### 8.4 Mobile web

`NFR-MOBILE-01`. The core Ukrainian audience is mobile-first. The measurement
flow must work **one-handed, while the other hand holds the tape measure**: one
screen per number, large targets, save after every entry. See `GAP-13` (§20).

---

## 9. Delivery Path Check

### 9.1 What is checked

`FR-DPC-01`. The obstacle sequence as a chain of 3D rectangles with rotations:
building entrance door → stairs or lift → corridor turns → flat entrance door →
room door.

### 9.2 Critical: the box versus the assembled item

`FR-DPC-02`, **`GAP-02` — the single largest gap identified**.

For flat-pack furniture the check must use **packaging dimensions**, not those of
the assembled item. A wardrobe that will not pass through the door assembled
passes easily in boxes. For pre-assembled upholstered furniture (a sofa) the
opposite holds: the whole item must be checked.

**Consequence:** every SKU must carry `assembly: 'flat-pack' | 'assembled' |
'partial'`, and Delivery Path Check selects dimensions accordingly. Without this
flag the feature returns a **systematically wrong answer** for the largest
category of Ukrainian furniture.

### 9.3 Nova Poshta

`FR-DPC-03`. Dimensional limits per delivery type and branch class are published
by the carrier. Take them from current Nova Poshta documentation.

**`BC-DPC-01`. Hard-coding Nova Poshta limits from memory or from secondary
sources is forbidden.** Official documentation only, with a check date stored
alongside the data.

### 9.4 Role in the product

Delivery Path Check is **top of funnel, not the product**. Its value is
one-shot, the mechanic explains itself in five seconds, it shares well, and
search demand exists ("чи влізе диван у ліфт"). Free, no registration.

---

## 10. Total cost

`FR-COST-01`. The final figure must include: goods, delivery, assembly, taxes,
consumables, discounts, and **per-retailer minimum order values**.

`FR-COST-02`. Optimisation modes: lowest total cost / fewest retailers and
deliveries / fastest delivery / best price-quality balance.

`FR-COST-03`. **Price validity window.** Hryvnia prices move with the exchange
rate. A plan generated three weeks ago may be off by 10%. Every estimate carries
a calculation date and a validity period; past that, it is recomputed.
See `GAP-09` (§20).

`FR-COST-04` **Availability Recovery.** When an item goes out of stock or rises
in price: find a compatible substitute → verify dimensions → preserve style →
recompute the budget → show the user the difference.

**`BC-COST-01`.** Multi-retailer sourcing is simultaneously the USP and the
principal operational risk: it breaks delivery, assembly and minimum order
values. Total cost must expose this, not hide it.

---

## 11. Catalog

### 11.1 The selection criterion (non-obvious)

What is needed is **not the largest assortment but clean data and published
packaging dimensions**. Almost nobody publishes packaging — except those who ship
flat. Flat-pack retailers and manufacturers therefore rank above marketplaces.

### 11.2 Scope of version one

`BC-CAT-01`. One or two retailers, one country, one room category (living room
**or** bedroom), **300–600 SKUs**. Not 1500: a room needs roughly 8 item types ×
~50 variants.

### 11.3 Required SKU fields

`FR-CAT-01`:

| Field | Source |
|---|---|
| product dimensions (L×W×H) | product page, manual verification |
| **packaging dimensions** | rarely in feeds; critical for §9.2 |
| **`assembly`** (`flat-pack` / `assembled` / `partial`) | **derived manually; governs §9.2** |
| **clearance zone** (drawer pull-out, door swing) | **derived from item type manually — exists nowhere** |
| price, currency, availability, region | affiliate feed |
| delivery lead time, assembly cost | retailer |
| **`made_to_order`** plus lead time | retailer; determines irreversibility (§3.2) |
| 2D footprint plus height | derived from dimensions |
| source, `checked_at`, confidence | our system |

The `clearance` and `assembly` rows are the **real differentiator in the data**.
`FURNITURE_DEPTHS` in `golden-ratio` is the three-archetype prototype of this
table.

### 11.4 Versioning

`TC-CAT-01`. The catalog is versioned by snapshot; a plan references a
`catalog_snapshot_id`. **Without this, Availability Recovery is technically
impossible.**

### 11.5 Top five candidates (Ukraine)

| # | Candidate | For | Against |
|---|---|---|---|
| 1 | **JYSK Ukraine** (jysk.ua) | mono-brand, flat-pack (packaging data genuinely exists), uniform data discipline, price tier matches the beachhead | decisions are made in Denmark; a UA affiliate programme is unconfirmed |
| 2 | **Epicentr K** (epicentrk.ua) | largest home retail network, own brands mean clean data, 230+ pickup points across 200 cities | part of the assortment is marketplace-like |
| 3 | **Ukrainian factories with their own online stores** (Blest; case-goods brands — Black Red White, ANOVA, ADK, Baltic House) | proper specifications, motivated by the sales channel, **the best odds for a first contract** | each is individually small |
| 4 | **Taburetka.ua / 4ROOM** | one agreement covers many factories; 4ROOM is Kyiv's largest furniture mall | aggregator, aggregated data, packaging unlikely |
| 5 | **Rozetka** | dominant marketplace, real affiliate infrastructure | dimensions entered by sellers, no packaging, duplicate SKUs |

**`BC-CAT-02`. Rozetka is a price-and-availability layer, NOT a source of
dimensions.**

**IKEA Ukraine — outside the top five.** The best data quality in the world for
this job, but traditionally no affiliate programme and a limited UA assortment.
`BC-CAT-03`: **the unofficial IKEA API is forbidden** (legal risk, history of
breakage). Official partnership only, and later.

**Sinsay — rejected.** Fast fashion plus home decor: textiles, tableware, small
decorative items. Not a furniture catalog. Useless for load-bearing items, and
the engine does not need decor dimensions — a cushion creates no walkway
conflict. At most an accessories layer, later.

### 11.6 Anchor strategy

**JYSK plus one Ukrainian factory** as the anchor pair, **Rozetka on top** as the
price-and-availability layer. That is sufficient for 300–600 SKUs covering a
living room and a bedroom.

### 11.7 First-contact script

Ask for four things:
1. a product feed (XML/CSV) with price and availability;
2. **written permission to use photographs and product names for promotion**;
3. product **and packaging** dimension fields;
4. delivery and assembly terms.

Offer in return: traffic with confirmed purchase intent, a reduction in
"wrong size" returns, and a free verification widget on their product page
(the entry point to retailer-side, §18.3).

Affiliate networks operating in Ukraine: **SalesDoubler**, **Admitad**, and
retailers' own programmes.

---

## 12. Legal regime for product data

> A structural analysis, not legal advice. Engage a Ukrainian IP lawyer before
> the first contract. Basis: the Law of Ukraine "Про авторське право і суміжні
> права" (2022 revision, No. 2811-IX).

### 12.1 The key distinction

**Dimensions are facts. Photographs are works.**

| Object | Status | Permitted? |
|---|---|---|
| Dimensions of a single product | fact, unprotected | **yes** |
| Price, availability, lead time | fact | **yes** |
| Product name / article number | generally unprotected | **yes** |
| Textual description | a work | paraphrasing yes, copying no |
| **Product photograph** | **a photographic work** | **licence required** |
| Manufacturer's 3D model | a work | licence required |
| **Bulk extraction of a catalog** | **sui generis database right** | **contract required** |
| Brand logo and name | trade mark | nominative use yes; "official partner" without a contract no |

### 12.2 Two traps

**`LC-01` The database right.** The 2022 revision introduced sui generis
protection for databases modelled on EU Directive 96/9/EC, protecting
**substantial investment** in obtaining, verifying and presenting the contents.
Looking up the dimensions of a single product you are linking the user to is
lawful. Systematically extracting a substantial part of a catalog is
infringement, **even though every individual fact is free**. This is what makes
scraping-as-a-foundation unlawful rather than merely distasteful.

**`LC-02` Terms of use.** Even where IP law is silent, a site's terms may
prohibit automated access — a contractual breach, grounds for a claim and for
blocking. Aggressive automated access could, on a bad-faith reading, touch
Article 361 of the Criminal Code.

**`BC-LEGAL-02`. Scraping as the basis of the catalog is forbidden. Unofficial
APIs are forbidden.**

### 12.3 Three lawful routes for photographs

1. **An affiliate programme** — participation normally includes express
   permission to use photographs, names and prices to promote those products.
   One contract settles the question.
2. **A direct contract with a manufacturer** — the best option: feed, photo
   licence, and a willingness to supply packaging dimensions.
3. **Our own renders — the architectural trump card.** We hold the geometry, so
   we can render a neutral image from dimensions and attributes (colour,
   material), all of which are facts. **The product's visual layer therefore does
   not depend on anyone else's photography.** MeltFlex depends on third-party
   imagery and visual search; we do not.
   Caveat `LC-03`: faithfully reproducing a recognisable designer piece may
   engage registered design rights (промисловий зразок); for generic case goods
   this is not an issue.

### 12.4 Unfair competition

`LC-04`. The Law "Про захист від недобросовісної конкуренції" covers the
improper use of another party's designations and business reputation. Another
company's catalog may not be presented as our own.

---

## 13. Architecture

### 13.1 The contract: Scene Graph

`TC-VRP-ARCH-01`. **The sole carrier of state.** All services communicate only
through it. Everything else is derived.

```
SceneGraph {
  room {
    outline: Polygon                     // mm
    openings[]  { type: door|window, pos, width, height,
                  swing: in|out, hinge: left|right }
    obstacles[] { type: radiator|pipe|socket|niche|existing_furniture,
                  bbox, source, confidence }
    building    { floor, lift {w,d,h,doorW}, stairW, corridorW, turns[] }
    // every number carries: value, error, source, measured_at, confidence
  }
  items[] {
    sku_ref, catalog_snapshot_id
    position, rotation
    locked: bool
    placed_by: solver|user
    dims_source, confidence
  }
  constraints[]  // see §14
  budget { total, currency: UAH, spent, mode }
  verdicts[]     // Verified | Estimated | Needs measurement | Conflict
}
```

### 13.2 Four services

**1. Catalog Service** — the single source of product truth. Normalisation
(§11.3), snapshot versioning, ingestion pipeline (feed plus manual normalisation
plus QA).

**2. Geometry Engine** — deterministic, **AI-free**, offline-testable. Input:
outline, openings, obstacles, SKUs, constraints. Output: valid positions or a
structured conflict. Internals: interval arithmetic (§6), collisions, clearances,
door swing arcs, **circulation as a traversability graph** (not pairwise
distances), and the delivery path as a chain of 3D rectangles with rotations.
**This is the moat code.**

**3. AI Layer** — **with no authority over facts**. Three roles:
- extracting constraints from natural language into structured constraints;
- generating candidate SKU sets that the Geometry Engine then **validates**
  (**generate-and-verify, never generate-and-trust**);
- explaining the result in human language.

`BC-AI-01`. **The LLM never returns coordinates as truth. The LLM does not decide
whether a sofa fits in an alcove.**

**4. Renderer** — deterministic from the Scene Graph (three.js). Diffusion is
img2img with strict structural control over a finished render only; **it must not
alter walls, object positions, or the shape of selected products**. This is Later.

### 13.3 The architecture test

`TC-VRP-ARCH-02`. **Remove the AI Layer entirely and the product must remain
functional** — worse, but correct. If it does not, what has been built is a
wrapper around an image-generation API.

---

## 14. Constraint Memory and Safe Swap

`FR-CONSTR-01`. The user pins rules: this wall cannot change; this furniture
stays; a 90 cm walkway is required here; the sofa must fold out; pet-safe
materials only; no glass tables; delivery by a specific date; the budget must not
be exceeded.

`FR-CONSTR-02`. The system **must preserve those rules across every iteration or
explain the conflict**. Re-generation must not destroy prior decisions.

`FR-SWAP-01` **Safe Swap.** Substitution by command: ₴X cheaper; 20 cm smaller;
available by Friday; from the same retailer; a different colour; child- or
pet-safe. A swap must not break walkways, budget, style, or the other decisions.

`FR-CONFLICT-01` **Behaviour when nothing fits** (`GAP-06`). For a small
Ukrainian flat on a small budget, "nothing fits" is a frequent outcome, not an
edge case. It is the moment the product either earns trust or loses the user. A
designed response is required: **which constraint to relax and what that buys**
("remove the second wardrobe and you gain 60 cm of walkway"; "+₴3,000 to the
budget opens up four options") — not an empty "conflict" screen.

---

## 15. User workflow

1. **Entry, no registration.** "What do you have?" → photo / plan / scan / manual
   measurement. Plus two fields: **budget** and deadline.
2. **Geometry.** Show the reconstructed outline; request confirmation only of
   those dimensions whose intervals straddle a threshold (§6.3).
3. **Constraints.** Five questions maximum: who lives here, what stays, what
   cannot move, style from three images, budget.
4. **Free preview.** One variant: **the plan fully visible, the total cost fully
   visible, the SKU list hidden**, plus a watermarked atmospheric render.
5. **Paywall.** `BC-PAY-01`: **after the total cost, before the SKU list.** The
   cost proves the value; the SKUs are the goods.
6. **Result.** Three variants plus the FitProof report, walkway map, and landed
   cost.
7. **Editing.** Safe Swap, lock, recompute.
8. **Purchase.** Split by retailer, links, a "measure this before ordering"
   checklist, and **Delivery Path Check as the final step**.
9. **After.** A reminder at day 7, Availability Recovery, and a "what did you
   buy?" follow-up (this feeds the North Star).

---

## 16. Metrics

### 16.1 North Star

`M-NSM`. **The number of rooms actually furnished according to the app's plan.**
Not the number of images generated.

`BC-METRIC-01`. The metric is measurable only via self-report (§18, `RISK-ATTR`).
The day-30 follow-up is a mandatory part of the product, not an option.

### 16.2 Product metrics

| ID | Metric |
|---|---|
| `M-CONV-01` | free → paid conversion (**the primary test of the hypothesis**, §5.5) |
| `M-FIT-01` | share of physically valid layouts |
| `M-VER-01` | share of decisions at status `Verified` |
| `M-MEAS-01` | average measurements requested per room (target ≤3) |
| `M-DROP-01` | drop-off rate at the measurement step |
| `M-TTF-01` | time to the first executable variant |
| `M-AVAIL-01` | availability of chosen SKUs at purchase time |
| `M-BUDGET-01` | deviation of final price from budget |
| `M-BUY-01` | click-throughs to purchase → confirmed purchases |
| `M-RET-01` | returns caused by size |
| `M-CAC-01` | CAC by channel, organic and paid reported separately |

---

## 17. Go / No-Go after the first pilot

### 17.1 Go — only if all hold simultaneously

- ≥20 payments at a CAC ≤15% of price;
- ≥60% of customers bought ≥50% of the listed items within 30 days;
- ≥50% return for a second room or refer someone;
- `M-VER-01` ≥70% (otherwise the product is homework);
- `M-MEAS-01` ≤3 measurements;
- in interviews, customers cite **confidence and total cost** as the reason for
  buying — not the picture.

### 17.2 No-Go / pivot

- they buy the report but do not buy furniture → we are selling entertainment;
- **the render cohort in the A/B is equally satisfied** → the USP has no value
  (§17.3);
- >40% of decisions land at `Needs measurement` and users drop off there;
- CAC shows no sign of an organic component;
- dimensions cannot be lawfully obtained for >30% of required SKUs.

### 17.3 Mandatory A/B inside the pilot

**Half receive an attractive render with approximate products; half receive a
plain technical plan with exact SKUs and total cost.**

If the render cohort buys at the same rate, the central hypothesis is refuted.
This must be learned across 20 users, not across two years.

---

## 18. Risks

### 18.1 Unvalidated assumptions

| ID | Risk |
|---|---|
| `RISK-WTP` | **whether anyone pays at all.** Zero data points. First revenue is pushed out ~six months (§18.2) |
| `RISK-TASTE` | taste uncertainty far exceeds size uncertainty. A user will look at a perfect plan and say "but I don't like that sofa" |
| `RISK-FREQ` | a room is furnished once every 5–7 years. No retention → no organic growth → every unit of revenue is bought |
| `RISK-MOMENT` | furnishing is 20 decisions over 3 months involving a partner and parents. A "final answer in one sitting" product fights the nature of the process |
| `RISK-DATA` | exact dimensions and clearances are openly available almost nowhere; the accuracy promise is bounded by data, not by algorithms |
| `RISK-SCAN` | RoomPlan is ±2–5 cm; a high share of `Needs measurement` makes the product feel like homework |
| `RISK-RETAIL` | once fit-checking proves valuable, retailers will build it in — they already hold the data and their motivation (returns) is stronger. **We may be building a feature for someone else's product** |
| `RISK-ROT` | 1500 SKUs is manual labour; with 20–30% annual assortment churn we run to stand still |
| `RISK-ASYM` | "Verified" is asymmetric: 95% success builds no reputation, 5% failure destroys it. One viral post — "their app said it would fit" — costs more than the entire marketing budget |
| `RISK-ATTR` | a user buys 60% of the list, swaps two items, and gets one second-hand. The North Star is barely measurable without self-report |
| `RISK-WAR` | availability volatility, logistics, power outages (affecting GPU rendering), and limited investor appetite for UA-only B2C |

### 18.2 Scope risk — accepted knowingly

Over the course of the session, scope grew to: scan + photo + manual measurement
+ iOS + web + catalog + layout generation + rendering + payments + cloud
projects.

**Estimate: 5–8 months with 2–3 engineers, plus 80–250 person-hours of manual
catalog normalisation — before the first paying user.**

The original alternative (a manual service plus a free tool) cost ~3 weeks and
answered `RISK-WTP`. It was declined deliberately.

**The recommendation still stands:** if there is any way to put the paid layer in
front of users a month earlier, even in an ugly form, it is worth more than any
feature on the list.

### 18.3 The counter-argument: why this fails even with a good product

The product works perfectly and still does not survive: a real but
**low-frequency and secondary** pain, in a category with **high CAC and zero
retention**, built on **data we do not own**, against players **who need this
feature more than we do**.

**Stronger alternative positionings (retained as pivot paths):**

1. **Retailer-side (strongest).** "Fit & Delivery check for furniture
   e-commerce" — a widget on the product page and in the cart. The retailer pays,
   because a returned sofa costs a significant share of the order and reverse
   logistics costs more than the item. Same engine, and the economics close. The
   B2C app becomes a demo.
2. **"Second opinion" (§5.4) as a standalone product.** Zero taste liability,
   all value in verification, instantly comprehensible, highly shareable.
3. **One purchase instead of one room.** "Buy the right sofa": a single
   expensive, high-risk, frequently returned item. An order of magnitude less
   data, higher conversion, clear search demand. Buildable in ~6 weeks.
4. **Prosumer (landlords, hosts).** Repeat use across 3–10 properties, clear ROI,
   justified CAC. Rejected because of the B2C constraint, but economically the
   strongest.

Ranking by unit economics: **1 > 2 > 3 > 4 > the current positioning.**

---

## 19. Open questions

| ID | Question |
|---|---|
| `OQ-VRP-01` | Ukrainian consumer rights: distance selling and made-to-order goods |
| `OQ-VRP-02` | do local Ukrainian competitors exist — **check before launch** |
| `OQ-VRP-03` | does JYSK Ukraine run an affiliate programme (unconfirmed by search) |
| `OQ-VRP-04` | current Nova Poshta dimensional limits by delivery type |
| `OQ-VRP-05` | primary source for the furniture return statistics (58% / 71% from the review) |
| `OQ-VRP-06` | payment provider: LiqPay / Fondy / WayForPay / Monobank; legal form (ФОП), taxation, terms of service |
| `OQ-VRP-07` | refund policy for the service itself when FitProof is wrong |
| `OQ-VRP-08` | interface language for the UA market: UA primary, EN secondary; RU undecided |
| `OQ-VRP-09` | fate of the current `golden-ratio`: standalone product / free tier / archive |
| `OQ-VRP-10` | real UA CPCs and conversion rates for target queries — replace estimates with data |
| `OQ-VRP-11` | product name and domain |

---

## 20. Identified gaps (completeness review)

Gaps found while consolidating this spec, ordered by danger.

| ID | Gap | Why it is dangerous |
|---|---|---|
| `GAP-02` | **box vs assembled item** in Delivery Path Check | the feature returns a **systematically wrong answer** for flat-pack, the largest category. Addressed in §9.2 and §11.3 (`assembly`) |
| `GAP-01` | **the user's existing furniture** | the whole session designed an empty room; most people already own something. Needed as a measured obstacle with no SKU. Addressed in §7.4 |
| `GAP-06` | **behaviour when nothing fits** | a frequent outcome for small flats and small budgets; the moment trust is lost. Addressed in `FR-CONFLICT-01` |
| `GAP-11` | **demand is entirely unvalidated** | the largest risk in this document; `RISK-WTP` |
| `GAP-03` | **building data** (floor, lift, stairs, turns) | Delivery Path Check is incomplete without it. Addressed in §7.4, §13.1 |
| `GAP-04` | **sockets, switches, pipes** | they determine where a TV, desk or bed can go. Addressed in §7.4 |
| `GAP-13` | **one-handed mobile measurement UX** | measuring is done with a tape measure in the other hand; a desktop form does not work here. Addressed in `NFR-MOBILE-01` |
| `GAP-09` | **price validity window** (hryvnia exchange rate) | an estimate goes stale faster than availability does. Addressed in `FR-COST-03` |
| `GAP-05` | **interior doors swinging inward** | they consume usable floor area; covered by the openings model (`swing`, `hinge`) |
| `GAP-07` | **refunds for the service** | trust plus consumer law. `OQ-VRP-07` |
| `GAP-12` | **UA/RU language** | a sensitive question for this market. `OQ-VRP-08` |
| `GAP-08` | **payments and legal entity** | blocks taking money at all. `OQ-VRP-06` |
| `GAP-10` | **local competitors unchecked** | `OQ-VRP-02` |
| `GAP-14` | **units: mm vs cm** | mixing them is not permitted. Addressed in `BC-UNITS-01` |
| `GAP-15` | **fate of `golden-ratio`** | `OQ-VRP-09` |

---

## 21. Feature priorities

### Must
manual measurement plus scan/photo as parallel inputs; the interval engine with
propagating confidence; a catalog of 300–600 SKUs (1–2 retailers, UA); a
deterministic layout solver (collisions, walkways, door swings, windows); the
**to-scale 2D plan**; the FitProof report with statuses; Delivery Path Check
honouring `assembly`; total cost in hryvnia; shopping list plus links; Safe Swap
along one axis; conflict behaviour; purchase follow-up; the free second opinion.

### Should
3D view (view only); Constraint Memory; Availability Recovery; a second
retailer; the atmospheric render.

### Later
photorealistic rendering from the scene; AR; multi-room; paid human review;
white-label / API; the retailer-side widget.

### Do not build
video generation; our own 3D model generation for products; exteriors and
gardens; 25 styles; social features; image generation as the basis of the
pipeline; an "AI chat designer"; custom kitchens; scraping; unofficial APIs.

**`BC-VRP-SCOPE-01`. 3D is not in Must.** Confidence is conveyed better by a plan
with dimension lines than by a 3D scene. 3D drags in model licensing, bundle size
and a WebGL fallback. A product that does not compete on the picture must not
build the picture first.

---

## 22. What counts as success for this document

It describes a product where:
- facts are computed by deterministic code and subjective judgement by AI, and
  removing the AI does not break correctness;
- the promise ("it will fit") is backed by a mechanism (intervals), not by
  wording;
- the monetisation boundary coincides with the cost boundary and the data
  boundary;
- the principal risk (`RISK-WTP`) is named rather than hidden, and has a cheap
  test (§17.3).

The next step is an implementation plan (skill `writing-plans`) — **after**
`OQ-VRP-02`, `OQ-VRP-03` and `OQ-VRP-11` are resolved.

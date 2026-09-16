# Verified Room Plan — product design spec

> **Status:** design spec; not approved for implementation.
> **Date:** 2026-09-15 (revised 2026-09-16 — ergonomics as a first-class axis;
> deliverable format and computational-honesty boundary)
> **Origin:** brainstorming session (skill `brainstorming`)
> **Relationship to `golden-ratio`:** this document describes a **separate
> product** that grows organically out of the `lib/calculations.ts` engine.
> It is not a change to the current app.
> **Identifier namespace:** requirements defined here live in their own
> namespace (`FR-*`, `NFR-*`, `BC-VRP-*`, `BC-*`, `TC-VRP-*`, `LC-*`, `OQ-VRP-*`,
> `GAP-*`, `RISK-*`, `M-*`) and do NOT collide with `docs/PDR.md`. Existing
> `golden-ratio` identifiers (`BC-WALK-01`, `BC-PRIVACY-01`, `TC-DATA-01`,
> `BC-SCOPE-01`) are cited, never redefined.
> **Document language:** English. Ukrainian-language product copy (taglines,
> UI strings) and customer quotes are kept verbatim in Ukrainian with an English
> gloss, because they are the shipped wording and the real voice of the market,
> not prose to be translated.

## Contents

| § | Section |
|---|---|
| 0 | [The pitch](#0-the-pitch) |
| 0a | [The thesis, in engineering terms](#0a-the-thesis-in-engineering-terms) |
| 1 | [Problem, hypothesis and the voice of the customer](#1-problem-hypothesis-and-the-voice-of-the-customer) |
| 2 | [Continuity from `golden-ratio`](#2-continuity-from-golden-ratio) |
| 3 | [Market and segment](#3-market-and-segment) |
| 4 | [Competitors and adjacent players](#4-competitors-and-adjacent-players) |
| 5 | [The free/paid boundary](#5-the-freepaid-boundary) |
| 6 | [The confidence engine](#6-the-confidence-engine--axis-one-will-it-fit) |
| 7 | [Ergonomics — axis two: will it be comfortable?](#7-ergonomics--axis-two-will-it-be-comfortable) |
| 8 | [The visual system: plan, elevation, 3D](#8-the-visual-system-plan-elevation-3d) |
| 9 | [Geometry and personal input](#9-geometry-and-personal-input) |
| 10 | [Platforms](#10-platforms) |
| 11 | [Delivery Path Check](#11-delivery-path-check) |
| 12 | [Total cost](#12-total-cost) |
| 13 | [Catalog](#13-catalog) |
| 14 | [Legal regime for product data](#14-legal-regime-for-product-data) |
| 15 | [Architecture](#15-architecture) |
| 16 | [Constraint Memory and Safe Swap](#16-constraint-memory-and-safe-swap) |
| 17 | [User workflow](#17-user-workflow) |
| 18 | [Metrics](#18-metrics) |
| 19 | [Go / No-Go](#19-go--no-go-after-the-first-pilot) |
| 20 | [Risks](#20-risks) |
| 21 | [Open questions](#21-open-questions) |
| 22 | [Identified gaps](#22-identified-gaps-completeness-review) |
| 23 | [Feature priorities](#23-feature-priorities) |
| 24 | [What counts as success](#24-what-counts-as-success-for-this-document) |
| 25 | [Interview answers and the numbers to know cold](#25-interview-answers-and-the-numbers-to-know-cold) |

---

## 0. The pitch

*Written to be read aloud. A YC interview runs 10–15 minutes and answers land in
30–60 seconds, so every claim below is short, specific, and either a number or a
plainly stated absence of one.*

### The one-liner

> **We tell you whether the furniture you are about to buy will fit your room,
> suit your body, and get through your door — before you pay for it.**

No jargon version, for someone outside the category: *you enter your room's
dimensions and your height; we tell you what to buy and what will go wrong if
you buy the wrong thing.*

### Who hurts if we stop existing tomorrow

Three real people, all in Ukraine, all this month:

- the person whose kitchen countertop is about to be cut to 85 cm, because
  that is the number in the standard table — and who is 1.85 m tall. That is
  not a return. That is a new countertop;
- the person who ordered a made-to-order wardrobe with a 2–6 week lead time and
  no right of return, and will discover on delivery day that it does not fit the
  lift;
- the person with ₴25,000 and an empty room, who does not know that the total
  will land at ₴34,000 once delivery, assembly and minimum order values are
  added, and will run out of money halfway.

Nobody is currently answering any of those three questions with a number.

### What we have built

- A **deterministic geometry engine** — 598 lines of pure functions, 107 passing
  unit tests, live in production. It already computes clearances against
  absolute human thresholds and renders rooms to scale in 2D and 3D.
- A **shipped, bilingual (UA/EN) product** built on it, with an end-to-end
  Playwright suite running against the live deployment.
- A specification, this document, that has survived being argued with: it names
  its own fifteen-plus gaps and its own fatal risks rather than hiding them.

### What we have NOT built

Stated first, because a pitch that buries this fails the first follow-up
question:

- **zero users. Zero revenue. Nothing launched to a customer.**
- no catalog, no payments, no iOS app;
- the ergonomic reference values are not yet traced to citable standards
  ([`OQ-VRP-12`](#21-open-questions)).

About 40% of each YC batch is idea-stage, so the absence of revenue is not
itself disqualifying. **Moving slowly is.** Which is why the plan below is not
the plan this spec originally contained.

### The correction we are making to our own plan

The full product in this document is **5–8 months from a first paying user**.
That is the wrong shape for a company with no users, and we are saying so
ourselves rather than waiting to be told.

The free ergonomic layer ([§7](#7-ergonomics--axis-two-will-it-be-comfortable))
needs **no catalog, no payments, no iOS and no backend**. It is weeks of work,
not months. It is personal, shareable, and it answers a question people already
search for. It ships first, it gets users, and every number in
[§18](#18-metrics) starts coming in months before the paid layer exists.

**Next 8 weeks:** ship the free ergonomic checker; source the anchor values
properly; get it in front of the audience that Ukrainian renovation studios have
already proven exists for this content ([§1.5](#15-external-evidence-for-the-free-tier-ergonomic-content));
measure `M-ERG-02` (do people give us their height?) and `M-SHARE-01` (does it
travel?). Then decide whether the paid layer is worth building.

### Why now

- Every AI interior tool now ends at the same sentence — *"always confirm
  dimensions with a tape measure before buying"* — which means the whole
  category has publicly conceded the exact gap we fill.
- Phone LiDAR scanning became ordinary, so approximate room geometry is now free
  to obtain; what remains scarce is knowing **which** measurement actually
  matters, which is a computation, not a sensor.
- Ukraine has no localised competitor at the data layer, and a wartime
  displacement economy in which furnishing a room on a fixed budget, against a
  deadline, with irreversible purchases, is a mass condition rather than a niche.

### Why us

- We did not start from a market and look for a product. We built the geometry
  engine first, as a working tool, and discovered that its clearance logic was
  already the business.
- Ukraine is home, not a target market picked off a map: the language, the
  retailers, the delivery constraints and the failure stories are first-hand.
- The seven customer quotes in [§1.4](#14-voice-of-the-customer-the-cost-of-та-нормально-буде)
  came from a practising contractor, not a survey panel.

### The business

- **₴299–599 once per verified room** (~€7–13). Not a subscription: furnishing is
  an event. The incumbent charges $29–59 per month for an episodic task, and its
  own most favourable review contains instructions for cancelling.
- Affiliate revenue on a ₴20–40k basket as a second line.
- Retailer-side licensing ([§20.3](#203-the-counter-argument-why-this-fails-even-with-a-good-product))
  as the path where the unit economics are strongest — returns cost retailers far
  more than they cost us.

### The biggest risk, named before we are asked

**Nobody has paid us anything, and the belief that people will pay for
verification rather than for pictures is unproven.** The pilot tests it directly
and cheaply: half the users get an attractive render with approximate products,
half get a plain verified plan with exact products and a total cost
([§19.3](#193-mandatory-ab-inside-the-pilot)). If the render group converts
equally, we are wrong, and we will know across 20 users rather than across two
years.

### The ask

Funding and the batch to compress the next 12 months into 3: ship the free
layer, source the anchor library, sign the first retail catalog, and run the
paid pilot to a go/no-go ([§19](#19-go--no-go-after-the-first-pilot)).

---

## 0a. The thesis, in engineering terms

The continuity thesis, in one line:

> **`golden-ratio` verifies clearances against generic furniture depths
> (`FURNITURE_DEPTHS`) and absolute human thresholds (`WALKWAY_THRESHOLDS`).
> The business is verifying the same things against the real dimensions of a
> specific SKU and the real body of a specific user.**

The product turns two questions that are normally answered by opinion into two
questions answered by computation:

1. **Will it fit?** — collisions, clearances, door swings, delivery path.
2. **Will it be comfortable?** — ergonomics measured against the user's own body.

Positioning, in one line (Ukraine):

> **«Кімната під ваш бюджет. Усе поміститься, усе є в наявності, усе привезуть —
> з повною вартістю до копійки.»**
> *(A room that fits your budget. Everything fits, everything is in stock,
> everything can be delivered — with the full cost down to the last kopiyka.)*

The enemy, named by the market itself (see [§1.4](#14-voice-of-the-customer-the-cost-of-та-нормально-буде)):

> **«Та нормально буде» — найдорожча фраза в ремонті.**
> *("It'll be fine" is the most expensive phrase in a renovation.)*

Against the main software competitor, in its own words:

> **MeltFlex says "Always confirm dimensions with a tape measure before buying."
> We are that check.**
> Ukrainian: «Вони кажуть: "перевірте рулеткою". Ми — це та перевірка.»


## 1. Problem, hypothesis and the voice of the customer

### 1.1 What fails in existing solutions

The typical AI interior pipeline: photo → hidden prompt → attractive image →
visual search → "similar" products → paywall. The user gets inspiration but no
executable plan.

Separately, and more importantly for Ukraine: none of these tools answers
**ergonomic** questions at all. They place objects; they do not ask how tall the
person using them is.

### 1.2 The central product hypothesis

**H1.** A segment exists for which *confidence in the purchase* is worth more
than *image quality*, and it will pay for a verified result rather than for
AI credits.

**H2 (the Ukrainian form of H1, and the priority one).** In Ukraine the binding
constraint is not centimetres but money. The segment pays for an answer to
"what can I actually buy for ₴25,000 so that everything fits and everything can
be delivered?"

**H3 (added 2026-09-16).** Ergonomic correctness is a *stronger and cheaper*
hook than fit correctness, because it needs no catalog, it is personal to the
user, and demand for it is already demonstrated organically
(see [§1.5](#15-external-evidence-for-the-free-tier-ergonomic-content)).

**Status of all three hypotheses: UNVALIDATED.** See [§18](#18-metrics) and
[§19](#19-go--no-go-after-the-first-pilot). This is the largest risk in this
document.

### 1.3 External evidence on paid intent (weak, n=1)

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
against interest ([§4.2](#42-meltflexs-admissions--each-maps-to-one-of-our-features))
— not its praise and not its numbers.

### 1.4 Voice of the customer: the cost of «та нормально буде»

Collected from a practising Ukrainian renovation contractor describing the
sentences that precede the most expensive mistakes. Verbatim, with gloss:

| Quote (UA) | English gloss | What it actually is |
|---|---|---|
| «Розетку потім перенесемо» | "We'll move the socket later" | a ₴-thousands rework treated as free |
| «Витяжки вистачить» | "The hood will be enough" | an unverified appliance spec |
| «Та навіщо там гідроізоляція?» | "Why would we need waterproofing there?" | an invisible risk discounted to zero |
| «Дизайнер нам це не намалював» | "The designer didn't draw that for us" | absence of a drawing read as absence of a requirement |
| «Майстер сказав, що всі так роблять» | "The fitter said everyone does it this way" | appeal to practice |
| «В коментарях читала, що це рішення викинуті гроші на вітер» | "I read in the comments this is money down the drain" | appeal to hearsay |
| «Знайомий будівельник сказав, що це не обовʼязково» | "A builder I know said it isn't mandatory" | appeal to authority |

**`BC-VOC-01` — the structural finding.** All seven are the same failure: **a
decision taken from an opinion where a number exists.** Four of the seven are
explicit appeals to authority, practice or hearsay.

This is the product's thesis stated by the market rather than by us, and it is
better evidence than the MeltFlex review because it is Ukrainian, first-hand,
and about the actual failure mode rather than about software.

Two direct consequences for the product:

- **`FR-ERG-08`.** Every computed verdict must be able to show **the number, the
  threshold, and the source** on demand. The answer to «майстер сказав» is not a
  better opinion; it is a citable figure. A verdict the user cannot audit is
  worth no more than the builder's opinion it is meant to replace.
- **`GAP-04` is validated.** «Розетку потім перенесемо» is the single most
  quoted mistake, and sockets were entirely missing from the input model until
  this revision. See [§9.4](#94-input-model--required-fields).

### 1.5 External evidence for the free tier: ergonomic content

Source material analysed: five Instagram carousel posts by **LESNIK.PRO**, a
Ukrainian renovation studio, each a clean ergonomic infographic —
countertop height by user height, TV diagonal vs viewing distance, upper-cabinet
height, extractor-hood clearance, and light colour temperature by room.

Three findings:

1. **Demand for this content is demonstrated.** A contractor whose revenue comes
   from renovations invests in producing ergonomic explainers as primary
   marketing. That is a market signal that ergonomic answers attract and hold the
   exact audience our beachhead describes.
2. **The format is a static image; the product is a calculator.** Every one of
   those carousels is a *lookup table rendered as a picture*. The same content,
   personalised to the user's own height, room and appliance, is strictly more
   useful and cannot be screenshotted away. **This is what the free tier should
   be.**
3. **LESNIK.PRO is not a software competitor but an ideal distribution
   partner.** A studio that already educates an engaged audience on ergonomics
   is the cheapest channel for a free ergonomic calculator. Partially answers
   [`OQ-VRP-02`](#21-open-questions); recorded as a channel hypothesis, not a
   deal.

**`LC-05` — usage constraint.** These carousels are a third party's copyrighted
marketing works. They are used here as market evidence only. Our own
infographics and rule values must be produced independently and sourced
independently ([§7.7](#77-source-discipline--non-negotiable)); their layouts,
imagery and wording must not be reproduced.

### 1.6 Reference: the project board format

Source material: a Ukrainian house-project presentation board («СУЧАСНИЙ
БУДИНОК»), supplied as a format reference. It combines, on one sheet: a
dimensioned elevation, exterior renders, a floor plan with a **numbered room
schedule and an area table**, interior renders per room, and a footer strip of
headline specs (area, bedrooms, bathrooms, terrace, energy class).

**What is worth taking — the format, not the content.**

1. **The deliverable is a board, not a screen.** One sheet that can be printed,
   sent to a fitter, or shown to a partner. This directly attacks `RISK-MOMENT`
   ([§20](#20-risks)): furnishing is twenty decisions over three months involving
   other people, and an artifact that survives outside the app is how a decision
   travels between them. Specified in [§8.6](#86-the-deliverable-one-board-not-a-screen).
2. **The numbered room schedule with areas** is an expected, conventional element
   and is trivially derivable from geometry we already hold. It was missing from
   this spec entirely.
3. **The dimensioned elevation** confirms the format decision in
   [§8](#8-the-visual-system-plan-elevation-3d): a vertical view with a dimension
   chain is what this market reads as a serious document.

**What must not be taken.**

- **It is a house; we do rooms in flats.** Exterior renders, terrace, site, roof
  and façade are irrelevant to our beachhead ([§3.2](#32-beachhead)). Copying the
  board's content rather than its layout would drag scope toward house design —
  the failure mode this project has repeatedly had to resist.
- **It is an architect's deliverable.** Ours is self-service and must not imply
  architectural completeness — no structure, no engineering, no permits, no
  drawing-set conventions. See `BC-VIZ-03` ([§8.6](#86-the-deliverable-one-board-not-a-screen)).
- **The energy-efficiency badge is out of scope**, on principle rather than by
  preference. See [§7.8](#78-what-we-refuse-to-compute).

*Note on the source: it was read from a low-resolution image and several plan
labels were not legible. Only its layout intent is taken as reference; none of
its figures or wording enters our product. `LC-05` applies — a third party's
board is a work, to be analysed and never reproduced.*

---

## 2. Continuity from `golden-ratio`

### 2.1 What carries over (verified by reading the code)

`lib/calculations.ts` — 598 lines of pure functions, 107 unit tests:

| Asset | What it gives the business |
|---|---|
| `computeWalkways(roomWidth, furnitureDepth, oppositeDepth)` | the core of the clearance check |
| `WALKWAY_THRESHOLDS = { comfortable: 900, acceptable: 600 }` | **absolute human thresholds** (`BC-WALK-01`: never scale with M) — the prototype of the whole ergonomic anchor system |
| `rateWalkway`, `walkwayMeterBars` | rating against a threshold, plus its visual meter |
| `FURNITURE_DEPTHS = { wardrobeKitchen: 600, sofa: 900, facingUnits: 1200 }` | **a prototype catalog with three archetypes** |
| `computeVerticalBands`, `layoutBandDiagram`, `BandNameKey` (`band.basePlinth` / `band.workZone` / `band.doorHead` / `band.upperCeiling`) | **an elevation diagram that already names a "work zone"** — the ergonomic section view, 80% built ([§8.2](#82-the-elevation-view-is-already-built)) |
| `computeRoomGrid` | grid-fit quality, signed remainders, rounding direction |
| `layoutRoom2D` / `layoutRoom3D` / `interiorModuleLines` | to-scale rendering, SVG plus lazy three.js |
| `suggestModule`, `computeGoldenSplit` | **a deterministic layout generator** (see [§2.2](#22-the-module-as-a-layout-prior--the-key-architectural-decision)) |
| `BOUNDS`, `isValidCeiling/Opening/Dimension` | input validation |
| UA/EN i18n, `CALC_LABELS` (never-translate) | localisation already exists |

**The two most valuable inheritances are the ones that were least obvious:**
`WALKWAY_THRESHOLDS` is already an ergonomic anchor with the correct semantics
(absolute, human, never scaled), and `layoutBandDiagram` is already an
ergonomic elevation renderer.

### 2.2 The module as a layout prior — the key architectural decision

The module grid M and the golden ratio are a **deterministic generator of a
first-pass plan**. Not AI. The grid yields proportionally sound positions, the
golden ratio divides zones, and `computeWalkways` validates the outcome.

The resulting claim, which no competitor can make:

> Our layouts are derived from architectural proportion, verified clearances and
> the user's own body — not from a diffusion model's hallucination.

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
  The ergonomic anchor library ([§7](#7-ergonomics--axis-two-will-it-be-comfortable))
  is a better moat candidate, because it is sourced data plus curation, not code.

### 2.4 Fate of the current app (OPEN QUESTION)

Undecided: whether `golden-ratio` continues as a standalone product, becomes the
free tier of the new product, or is archived. See [`OQ-VRP-09`](#21-open-questions).

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
- strong SEO demand for "чи влізе диван у ліфт / у двері" and for ergonomic
  queries ("яка висота стільниці", "на якій висоті вішати телевізор");
- a proven local content format to compete with ([§1.5](#15-external-evidence-for-the-free-tier-ergonomic-content)).

**What gets harder (accepted deliberately):**
- **ARPU drops.** €39 is unrealistic; target price is ₴299–599 (~€7–13);
- **product data quality is worse** — marketplaces are populated by sellers;
- **affiliate infrastructure is weaker** — Awin/CJ/Impact barely cover Ukraine;
  work through SalesDoubler, Admitad, and retailers' own programmes;
- **the catalog does not transfer** — expanding to the EU means normalising from
  zero. The engine, the ergonomic anchors and the normalisation *process*
  transfer; the product data does not;
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

A third marker, added after [§1.4](#14-voice-of-the-customer-the-cost-of-та-нормально-буде),
sharpens targeting further: **people mid-renovation**, where an ergonomic error
is set in concrete rather than merely returned. A countertop cut to the wrong
height is not a return; it is a new countertop.

**[`OQ-VRP-01`](#21-open-questions):** verify Ukrainian consumer rights for
distance selling and for made-to-order goods against current legislation.

### 3.3 Rejected segments (and why)

| Segment | Why rejected |
|---|---|
| All homeowners | untargetable; the pain is diffuse |
| People moving into an empty flat (broad) | the fact of moving is unobservable; the need spans a whole flat, not a room |
| Landlords / Airbnb hosts | economically the best (repeat use, ROI, LTV) but contradicts the fixed B2C constraint. **Retained as an expansion path — see [§20.3](#203-the-counter-argument-why-this-fails-even-with-a-good-product)** |
| Designers and architects | explicitly excluded by the client |

---

## 4. Competitors and adjacent players

### 4.1 The field

| Player | Strengths | Weakness for our job |
|---|---|---|
| **MeltFlex AI** | 20-second render, 25+ styles, very broad coverage, IKEA/Amazon/Wayfair, API/B2B, web + iOS + Android | does not measure ([§4.2](#42-meltflexs-admissions--each-maps-to-one-of-our-features)); "exact or similar"; a subscription against an episodic task; **no ergonomics at all** |
| **IKEA Kreativ** | LiDAR scan, removes existing furniture, IKEA SKUs to scale, cart, vertical integration | IKEA only; limited assortment and logistics in Ukraine; **no personal ergonomics** |
| **Planner 5D / Homestyler** | large 3D catalogs, editing, renders | no real local SKUs, no total cost, no delivery verification, no ergonomic verdicts |
| **LESNIK.PRO and similar UA studios** | an engaged local audience already educated on ergonomics; credibility from real projects | not software; static infographics, not personalised calculation. **Channel candidate, not competitor** ([§1.5](#15-external-evidence-for-the-free-tier-ergonomic-content)) |
| **Other local UA software** | — | **[`OQ-VRP-02`](#21-open-questions): still unchecked.** Mandatory before launch |

**Strategic reading.** Nobody in the software field competes on ergonomics, and
the people who do compete on ergonomics are not building software. That gap is
the cheapest defensible ground available.

### 4.2 MeltFlex's admissions — each maps to one of our features

Source: the Gila Herald review plus the MeltFlex FAQ quoted within it.

| Their words | Our answer |
|---|---|
| "Do not treat the render as a measured floor plan" / "takes small liberties with scale" / "Not to the inch" | the interval engine ([§6](#6-the-confidence-engine--axis-one-will-it-fit)) |
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
The lines that work are "it does not measure" and "it does not know how tall you
are."**

### 4.4 Where not to fight

Do not compete on the render. Twenty seconds, dozens of styles, geometry
preserved — that is a commodity, and even a satisfied user ranked the picture
below the shopping list.

---

## 5. The free/paid boundary

**Principle: the line follows the presence of a catalog.** It coincides with the
cost boundary, the value boundary, and the exact line along which `golden-ratio`
becomes a business (`FURNITURE_DEPTHS` on the left, the catalog on the right).

**Ergonomics falls entirely on the free side**, because ergonomic verdicts need
the room and the user, never a SKU ([§7.6](#76-ergonomics-is-free--and-that-is-strategic)).

### 5.1 Free tier — the generic and the personal

- `FR-FREE-01` room geometry from entered dimensions;
- `FR-FREE-02` to-scale plan (2D SVG), **elevation/section view**, and 3D view —
  inherited from `golden-ratio` ([§8](#8-the-visual-system-plan-elevation-3d));
- `FR-FREE-03` clearances against archetypes (`FURNITURE_DEPTHS`) rated
  comfortable / acceptable / tight;
- `FR-FREE-04` **Delivery Path Check** ([§11](#11-delivery-path-check));
- `FR-FREE-05` **"Second opinion" / negative selection** ([§5.4](#54-dont-buy-this-as-a-headline-feature))
  — the main hook;
- `FR-FREE-06` **the full ergonomic anchor check** ([§7](#7-ergonomics--axis-two-will-it-be-comfortable))
  against the user's own height and room;
- `FR-FREE-07` **atmospheric AI render**: mood and style only, **no dimension
  lines, no labels, no product names, no prices**, watermarked, with an explicit
  «не для замовлення» ("not for ordering") banner.

### 5.2 Paid tier — the specific

- `FR-PAID-01` real SKUs with real product **and packaging** dimensions;
- `FR-PAID-02` clearances recomputed against those dimensions; a conflict map;
- `FR-PAID-03` the technical plan with dimension lines;
- `FR-PAID-04` full cost including delivery and assembly ([§12](#12-total-cost));
- `FR-PAID-05` shopping list and links;
- `FR-PAID-06` Safe Swap;
- `FR-PAID-07` Availability Recovery;
- `FR-PAID-08` a render derived from the verified scene, with a product legend;
- `FR-PAID-09` **per-SKU ergonomic and installation verdicts** — the free tier
  says "your countertop should be 91–93 cm"; the paid tier says "this cabinet
  line reaches that height with these legs, and this hood requires this
  clearance per its manual" ([§7.5](#75-safety-critical-anchors-come-from-the-manual-not-from-a-rule)).

### 5.3 The one-line explanation to the user

> **Free — what height it should be, and whether a sofa fits.
> Paid — which product achieves it, and what it actually costs.**

### 5.4 "Don't buy this" as a headline feature

`FR-FREE-05`. The user pastes a link to a product they are already considering
and gets a verdict: **fits / does not fit / fits but kills the walkway / fits but
is the wrong height for you**.

Rationale: this is precisely what the user publicly thanked MeltFlex for
([§1.3](#13-external-evidence-on-paid-intent-weak-n1)). Instant value, zero taste
liability, highly shareable, and it needs no catalog — the dimensions of a single
product are facts (see [§14](#14-legal-regime-for-product-data)).

### 5.5 Accepted cannibalisation risk

**`RISK-CANNIBAL`.** The free tier may be sufficient for most users, and adding
ergonomics makes it *more* sufficient, not less.

This is **not a defect but the central experiment**: free → paid conversion
measures directly whether the promise is worth money. Metric `M-CONV-01`
([§18](#18-metrics)). The deliberate trade is a much stronger organic top of
funnel against a harder paid conversion — and organic acquisition is the only
thing that repairs `RISK-FREQ`.

---

## 6. The confidence engine — axis one: will it fit?

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
carries source and error margin through. **This applies identically to ergonomic
anchors**, whose inputs include the user's stated height ([§7.3](#73-the-personal-variable--the-thing-no-competitor-holds)).

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

`FR-ERG-07`. The same rule governs ergonomic anchors: a countertop height
comfortably inside the recommended band needs no confirmation; one sitting on
the boundary triggers a request to confirm the user's height or the floor
finish thickness.

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
outcome. See `RISK-ASYM` ([§20](#20-risks)).

---

## 7. Ergonomics — axis two: will it be comfortable?

> Added 2026-09-16. This section is the largest change to the product since the
> original brief, and it closes [`GAP-16`](#22-identified-gaps-completeness-review).

### 7.1 Why this is a second axis, not a feature

Fit and ergonomics are different questions with different inputs and different
failure modes:

| | Axis 1 — fit | Axis 2 — ergonomics |
|---|---|---|
| Question | will the object occupy this space without conflict? | will a person operate it without strain? |
| Inputs | room geometry + item dimensions | room geometry + **the user's body** + task |
| Needs a catalog? | yes, for exact verdicts | **no** |
| Failure mode | it does not fit; you return it | it fits and it is wrong every day for ten years |
| Reversibility | a return | often set in concrete |

The second failure mode is worse and less recoverable, and **no competitor
addresses it**. `WALKWAY_THRESHOLDS` in `golden-ratio` already belongs to axis 2
— 900 mm is not a fit constraint, it is a human one. The engine has been doing
ergonomics since day one without naming it.

### 7.2 The anchor system

**`FR-ERG-01`.** Ergonomic rules are expressed as **anchors** — named, versioned,
sourced records — not as constants scattered through the code. `WALKWAY_THRESHOLDS`
becomes the first entry in this library rather than a special case.

```
ErgonomicAnchor {
  id                 // 'counter.height', 'hood.clearance', 'tv.distance', …
  applies_to         // item type, zone, or appliance class
  inputs[]           // e.g. ['user.height'] | ['tv.diagonal', 'tv.resolution']
  rule               // a range, or a function of the inputs
  bands              // optimal | acceptable | poor  (mirrors rateWalkway)
  consequence_key    // i18n key: what goes wrong if violated
  source             // citation + checked_at  — MANDATORY, see §7.7
  safety_critical    // bool — if true, §7.5 applies
}
```

**`FR-ERG-02`.** Anchor evaluation reuses the axis-1 machinery unchanged:
interval arithmetic, threshold straddling, the four statuses, and the
`walkwayMeterBars`-style meter. An anchor is a threshold; the engine already
knows how to rate an interval against a threshold.

**`FR-ERG-03`.** Every anchor verdict renders as: the computed value, the
recommended band, the verdict, **and the consequence of ignoring it** — never a
bare "wrong". "70 cm — more strain and awkward access" beats a red cross.

### 7.3 The personal variable — the thing no competitor holds

**`FR-ERG-04`.** The product collects and stores the **user's body dimensions**,
starting with standing height and, where an anchor needs it, elbow height and
reach height.

This is strategically significant out of proportion to its cost:

- it is a **fact**, so it belongs to the deterministic engine, not the AI;
- it is **personal**, which gives a genuine reason to create a profile and makes
  results non-transferable between people — a natural retention mechanic in a
  category with `RISK-FREQ`;
- **no catalog contains it and no competitor asks for it**;
- it converts a generic infographic into a personal answer, which is precisely
  the move described in [§1.5](#15-external-evidence-for-the-free-tier-ergonomic-content).

**`BC-ERG-02`.** Body measurements are personal data. Collect the minimum, state
the purpose, allow deletion, and never use them for anything but anchor
evaluation. This is the first point where the product leaves the
`BC-PRIVACY-01` posture inherited from `golden-ratio`, and it must be handled
deliberately rather than by accident. See [`OQ-VRP-16`](#21-open-questions).

**`FR-ERG-05`.** Where a household has several users of different heights, an
anchor must resolve against a **stated primary user per zone**, and flag where
two users' optimal bands do not overlap — showing the compromise rather than
silently averaging it.

### 7.4 Anchors identified from the reference material

Derived from the LESNIK.PRO carousels ([§1.5](#15-external-evidence-for-the-free-tier-ergonomic-content)).
**Every value below is OBSERVED, NOT SOURCED, and must not ship until
[§7.7](#77-source-discipline--non-negotiable) is satisfied.**

| Anchor id | Inputs | Observed rule (unverified) | Notes / hazards |
|---|---|---|---|
| `counter.height` | `user.height` | 150–160 cm → ≈85 cm; 160–170 → 88–90; 170–180 → 91–93; 180–190 → 94–97 | the clearest personalised anchor; must also account for floor finish thickness and appliance constraints |
| `cabinet.upper.clearance` | counter height, `user.reach` | ≈60 cm above the counter comfortable; ≈70 cm strained | interacts with `hood.clearance` above a hob |
| `hood.clearance` | hob type, appliance | <60 cm too low (overheating risk); 65–75 cm optimal; >80 cm loses effectiveness | **safety-critical** — gas and induction differ; see [§7.5](#75-safety-critical-anchors-come-from-the-manual-not-from-a-rule) |
| `tv.distance` | diagonal, resolution | 40″ → 1.2–1.7 m; 50″ → 1.5–2.0 m; 60″ → 1.8–2.4 m; 70″ → 2.1–2.8 m | **contested**: the correct distance depends heavily on resolution; a 4K panel is viewable far closer than a 1080p one. Do not ship a resolution-blind rule |
| `light.temperature` | room / zone | 2700–3000 K bedroom, living; 3500–4000 K kitchen, office, children's; 5000–6500 K work zones, wardrobe, technical | preference plus task, not a hard threshold — must render as guidance, never as a `Conflict` |

**`BC-ERG-01`.** Anchors differ in kind and must be typed accordingly:
`safety` (violation is a hazard), `ergonomic` (violation causes strain),
`preference` (violation is taste). Only the first two may ever produce a
`Conflict`. Rendering a lighting preference as a failure destroys trust in the
anchors that matter.

### 7.5 Safety-critical anchors come from the manual, not from a rule

**`BC-ERG-03`.** For any anchor marked `safety_critical`, a generic range is
**not** an acceptable source. Extractor-hood clearance above a hob is a fire and
overheating matter, it differs between gas and electric/induction, and every
manufacturer specifies its own minimum in the installation manual.

Requirements:
- the catalog carries **`install_clearance`** per appliance SKU, transcribed from
  the manufacturer's installation manual, with the manual cited and dated
  ([§13.3](#133-required-sku-fields));
- where no per-SKU figure is held, the verdict is `Needs measurement`-equivalent
  — "check your hood's manual" — **never** a confident generic number;
- the free tier may show the generic band as *guidance with its source*; only the
  paid tier, holding the SKU, may state a specific clearance.

This is simultaneously the most defensible data asset in the product and the
place where being wrong is most expensive. Nobody else carries per-SKU
installation clearances; assembling them is dull, manual and therefore durable.

### 7.6 Ergonomics is free — and that is strategic

**`BC-ERG-04`.** The entire anchor layer sits in the free tier, because it needs
only the room and the user.

Consequences, all deliberate:

- the free tier becomes genuinely useful rather than a teaser, which is the only
  way to earn organic acquisition — and organic acquisition is the single
  identified repair for `RISK-FREQ` and `M-CAC-01`;
- it produces an inexhaustible content and SEO surface: every anchor is a page,
  a calculator and a shareable answer, competing directly with the static
  infographics that already attract this audience;
- it raises `RISK-CANNIBAL`, which is accepted explicitly in
  [§5.5](#55-accepted-cannibalisation-risk);
- it gives a reason to create a profile before there is any reason to pay.

### 7.7 Source discipline — non-negotiable

**`BC-ERG-05`.** No anchor value may be hard-coded from an infographic, a blog,
a contractor's post, or memory. Every anchor ships with a citation and a
`checked_at` date, and the UI can display both.

This is the same rule already applied to Nova Poshta limits (`BC-DPC-01`) and to
the furniture-return statistics ([§1.3](#13-external-evidence-on-paid-intent-weak-n1)),
and it exists for the same reason: **a product whose entire pitch is "we replace
opinion with numbers" cannot source its numbers from opinion.** Violating this
rule is not a documentation lapse; it refutes the product.

Acceptable sources, in order of preference: the appliance or furniture
manufacturer's own installation documentation; national and international
standards (ДБН / ДСТУ / ISO / EN where applicable); peer-reviewed ergonomics
literature; and industry handbooks with named authorship. See
[`OQ-VRP-12`](#21-open-questions).

### 7.8 What we refuse to compute

**`BC-SCOPE-NOCALC-01`.** No badge, score, class or headline figure may be
displayed unless **every input is held at a stated confidence** and **the rule
converting those inputs into the figure is sourced** (`BC-ERG-05`). A number we
cannot derive honestly is not shown at all — not shown as an estimate, not shown
greyed out, not shown "indicative".

This is the same principle as [§7.7](#77-source-discipline--non-negotiable),
applied to the output side rather than the input side, and it exists because the
product's entire pitch is that it replaces opinion with numbers. A single
decorative metric on the deliverable undermines every honest one beside it.

**Excluded by this rule — energy efficiency / energy class.**

Decided 2026-09-16. An apartment's energy performance depends on the building
envelope, glazing specification, ventilation, the building-level heating system,
thermal bridging, the heating behaviour of neighbouring flats, and orientation. None of
that is observable from a room scan or a tape measure, none of it appears in a
furniture catalog, and none of it can be confirmed by the user with the
instruments we ask them to use. An energy badge would therefore be a number with
no sourced inputs — precisely what `BC-ERG-05` forbids.

It is excluded as a **computation**, not as a topic: qualitative, sourced
guidance that costs nothing to state ("this glazing orientation will make the
room warm in the afternoon") remains acceptable where it carries its source and
makes no numeric claim.

**Also excluded under the same rule**, pre-emptively, because each is a
recurring temptation in this category: acoustic comfort scores, indoor air
quality indices, illuminance (lux) figures without photometric data, any
composite "wellness", "comfort" or "quality" score, and any single-number rating
of a room as a whole.

**What the deliverable shows instead** — every item computed from inputs we
actually hold: room area, minimum clear walkway, ergonomic anchors met out of
those applicable, total cost, delivery feasibility, and verification state.

---

## 8. The visual system: plan, elevation, 3D

> Added 2026-09-16, closing [`GAP-17`](#22-identified-gaps-completeness-review).

### 8.1 Three views, three jobs

**`FR-VIZ-01`.** The product renders three views, and each answers a question the
others cannot:

| View | Answers | Axis |
|---|---|---|
| **Plan** (2D, to scale) | does it fit, and can you walk past it? | fit |
| **Elevation / section** (2D, to scale, with a human figure) | **is it at the right height for you?** | ergonomics |
| **3D** | what does the room feel like? | comprehension |

The original spec had only plan and 3D — which made the ergonomic axis
unrepresentable, since height relationships are invisible in plan.

### 8.2 The elevation view is already built

`layoutBandDiagram` in `lib/calculations.ts` already produces a to-scale vertical
band diagram, already aligns bands to the door head, and already names a
**`band.workZone`**. That is an ergonomic elevation renderer under another name.

**`FR-VIZ-02`.** Extend it rather than rebuild it: keep the band geometry, add
anchor markers (countertop line, upper-cabinet line, hood clearance, TV centre,
eye level) drawn against the same vertical scale.

### 8.3 The human figure at scale

**`FR-VIZ-03`.** The elevation carries a **scaled human silhouette built from the
user's stated height**, with the relevant anchor dimension drawn between the
figure and the object — elbow to countertop, hand to upper shelf, eye to screen.

This is the single most legible way to communicate an ergonomic verdict, and it
is why the reference carousels work: they show a person, a dimension line, and a
number. Our advantage is that the figure is the user's own height rather than a
model's.

**`BC-VIZ-01`.** The figure is a neutral, non-photographic silhouette, generated
from dimensions. It must not reproduce the composition, styling or imagery of
the reference material (`LC-05`).

### 8.4 What each view may and may not show

**`BC-VIZ-02`.** The free atmospheric render carries no dimensions, labels,
product names or prices (`FR-FREE-07`). **The ergonomic elevation is the
opposite and is exempt:** it is free, and it *must* carry dimension lines,
anchor values and the verdict — dimensions are the entire content of that view.

The rule is therefore not "free means no numbers" but: **the atmospheric render
never carries numbers; the technical views always do.** The paywall sits between
generic heights and specific products, not between pictures and numbers.

### 8.5 The content engine

**`FR-VIZ-04`.** Every anchor verdict is exportable as a single shareable image:
the silhouette, the dimension line, the number, the verdict, and the source.

This is the growth loop. The reference material proves the format travels; the
difference is that ours is generated for one person's room and body, carries a
citation, and links back to a calculator that can redo it for the viewer.

### 8.6 The deliverable: one board, not a screen

**`FR-VIZ-05`.** The paid result exports as a **single sheet** — print- and
share-ready — carrying, in one layout: the to-scale plan, the ergonomic
elevation with the user's silhouette, the room schedule, the itemised purchase
list with SKUs, the total cost breakdown, the verdict summary, and the
generation date with the price-validity window (`FR-COST-03`).

Rationale: the decision does not happen inside the app. It happens when the plan
is shown to a partner, sent to a fitter, or carried into a shop. An artifact that
leaves the app is how the product participates in that conversation, and it is
what makes a one-time payment feel like a delivered result rather than rented
access ([§5](#5-the-freepaid-boundary)).

**`FR-VIZ-06`.** The board carries a **numbered room schedule**: index, room
name, area, and the ceiling height used — each number derived from held
geometry, each carrying its verification status.

**`FR-VIZ-07`.** The headline strip carries only figures permitted by
`BC-SCOPE-NOCALC-01` ([§7.8](#78-what-we-refuse-to-compute)): area, minimum clear
walkway, anchors met, total cost, delivery feasibility, verification state.

**`BC-VIZ-03`. The board must not impersonate an architectural drawing set.**
No title block, no sheet numbering, no revision stamps, no signature field, and
no claim of drawing scale beyond "to scale, dimensions as verified". It is a
purchase plan, and its own header says so. This is the visual counterpart of
`BC-LEGAL-01`: the document must not imply an authority or a completeness the
product does not have — no structure, no engineering, no compliance, no permits.

**`BC-VIZ-04`.** The free tier exports a reduced board: plan, elevation,
ergonomic verdicts and room schedule, with the purchase list and total cost
withheld. It carries the atmospheric render under `FR-FREE-07` rules — no
dimensions on that render — while the technical views keep their dimensions per
`BC-VIZ-02`. A free board is a marketing surface, and it should be as
professional as the paid one minus the goods.

---

## 9. Geometry and personal input

### 9.1 Decision

**Three geometry sources operate in parallel from day one**, differing only in
the size of the error term `e`:

| Source | Error | Default status |
|---|---|---|
| Manual measurement (tape) | small | `Verified` |
| iOS LiDAR / RoomPlan | ±2–5 cm on walls, worse on niches, radiators, reveals | `Estimated` |
| Photo / floor plan | large, honestly declared | `Estimated` |

`FR-GEO-05`. The combination: a scan or photo produces fast draft geometry, then
[§6.3](#63-interval-arithmetic--the-mechanism) determines which 1–3 numbers must
be confirmed with a tape measure for the result to become `Verified`.

### 9.2 Why this beats either extreme

- Measurement changes from an entry barrier into an **on-demand, targeted
  request**.
- The paywall stops being a withholding tactic and becomes an **honest quality
  condition**: the paid plan cannot be issued until the data supports
  verification.
- The scan no longer has to be accurate. It has to be **approximately right and
  honest about its own error**. That is a dramatically lower bar.

### 9.3 Photos are context only

`BC-GEO-01`. Photos are used for style, rendering, and understanding what is
already in the room. **No number extracted from a photo may enter a computation
as `Verified`.**

### 9.4 Input model — required fields

`FR-GEO-06`. Beyond length/width/height:

- room door opening width, **hinge side and swing direction**;
- window positions and sizes; sill height;
- niches and projections;
- **sockets, switches, radiators and pipes** — they determine where a TV, desk or
  bed can go, and «розетку потім перенесемо» is the single most quoted expensive
  mistake in [§1.4](#14-voice-of-the-customer-the-cost-of-та-нормально-буде).
  See [`GAP-04`](#22-identified-gaps-completeness-review);
- **existing furniture that stays** — as a measured obstacle with no SKU, see
  [`GAP-01`](#22-identified-gaps-completeness-review);
- **building data for Delivery Path Check** — floor, lift (cabin and door
  dimensions), stairwell and entrance width, turns — see
  [`GAP-03`](#22-identified-gaps-completeness-review);
- **floor finish thickness**, where a countertop or appliance anchor depends on
  finished floor level rather than screed.

### 9.5 Personal input

`FR-ERG-06`. Alongside the room: the **primary user's height per zone**, and
optionally elbow and reach height. One screen, two taps, skippable — but skipping
it downgrades every ergonomic verdict to a generic band with its status set
accordingly, which the UI states plainly.

### 9.6 Units

`BC-UNITS-01`. Internal representation is **millimetres** (as in `golden-ratio`).
Consumer-facing display is **centimetres and metres**. Architects think in mm,
buyers think in cm; mixing the two is not permitted.

---

## 10. Platforms

### 10.1 Decision: iOS is a sensor, not a client

| Platform | Role |
|---|---|
| **iOS** | RoomPlan scan → geometry with intervals → into the project. Plus **the entire free tier, ergonomics included** runs inside the app |
| **Web** | the whole product: measurement, refinement, catalog, SKUs, cost, shopping list, render, payment |
| **Android** | plan/photo upload and manual measurement via the web; no native scan |
| **Shared** | one backend, one project; the scan lands in a project and work continues on the web |

`TC-PLATFORM-01`. LiDAR/RoomPlan is **not available from a browser** — it is a
native iOS framework and WebXR does not expose it. "Scanning from day one"
therefore implies a native iOS app.

### 10.2 Mandatory App Store condition

`BC-IOS-01`. **The free tier must work inside the app and produce a result
without sending the user to the web.** An app that only scans and hands off to a
website is rejected under guideline 4.2 ("minimal functionality"). This is a
review-passing requirement, not a nicety.

The ergonomic anchor layer makes this condition easy to satisfy: it is
self-contained, genuinely useful, and needs no backend.

### 10.3 Degradation

`NFR-DEGRADE-01`. If iOS is absent or fails, the web works in full — simply with
wider intervals and more measurement requests. The architecture does not change.

### 10.4 Mobile web

`NFR-MOBILE-01`. The core Ukrainian audience is mobile-first. The measurement
flow must work **one-handed, while the other hand holds the tape measure**: one
screen per number, large targets, save after every entry. See
[`GAP-13`](#22-identified-gaps-completeness-review).

---

## 11. Delivery Path Check

### 11.1 What is checked

`FR-DPC-01`. The obstacle sequence as a chain of 3D rectangles with rotations:
building entrance door → stairs or lift → corridor turns → flat entrance door →
room door.

### 11.2 Critical: the box versus the assembled item

`FR-DPC-02`, **[`GAP-02`](#22-identified-gaps-completeness-review) — the single
largest gap identified on the fit axis**.

For flat-pack furniture the check must use **packaging dimensions**, not those of
the assembled item. A wardrobe that will not pass through the door assembled
passes easily in boxes. For pre-assembled upholstered furniture (a sofa) the
opposite holds: the whole item must be checked.

**Consequence:** every SKU must carry `assembly: 'flat-pack' | 'assembled' |
'partial'`, and Delivery Path Check selects dimensions accordingly. Without this
flag the feature returns a **systematically wrong answer** for the largest
category of Ukrainian furniture.

### 11.3 Nova Poshta

`FR-DPC-03`. Dimensional limits per delivery type and branch class are published
by the carrier. Take them from current Nova Poshta documentation.

**`BC-DPC-01`. Hard-coding Nova Poshta limits from memory or from secondary
sources is forbidden.** Official documentation only, with a check date stored
alongside the data. Same discipline as `BC-ERG-05`.

### 11.4 Role in the product

Delivery Path Check is **top of funnel, not the product**. Its value is
one-shot, the mechanic explains itself in five seconds, it shares well, and
search demand exists («чи влізе диван у ліфт»). Free, no registration.

---

## 12. Total cost

`FR-COST-01`. The final figure must include: goods, delivery, assembly, taxes,
consumables, discounts, and **per-retailer minimum order values**.

`FR-COST-02`. Optimisation modes: lowest total cost / fewest retailers and
deliveries / fastest delivery / best price-quality balance.

`FR-COST-03`. **Price validity window.** Hryvnia prices move with the exchange
rate. A plan generated three weeks ago may be off by 10%. Every estimate carries
a calculation date and a validity period; past that, it is recomputed.
See [`GAP-09`](#22-identified-gaps-completeness-review).

`FR-COST-04` **Availability Recovery.** When an item goes out of stock or rises
in price: find a compatible substitute → verify dimensions → **re-check ergonomic
anchors** → preserve style → recompute the budget → show the user the difference.

**`BC-COST-01`.** Multi-retailer sourcing is simultaneously the USP and the
principal operational risk: it breaks delivery, assembly and minimum order
values. Total cost must expose this, not hide it.

---

## 13. Catalog

### 13.1 The selection criterion (non-obvious)

What is needed is **not the largest assortment but clean data and published
packaging dimensions**. Almost nobody publishes packaging — except those who ship
flat. Flat-pack retailers and manufacturers therefore rank above marketplaces.

### 13.2 Scope of version one

`BC-CAT-01`. One or two retailers, one country, one room category (living room
**or** bedroom), **300–600 SKUs**. Not 1500: a room needs roughly 8 item types ×
~50 variants.

### 13.3 Required SKU fields

`FR-CAT-01`:

| Field | Source |
|---|---|
| product dimensions (L×W×H) | product page, manual verification |
| **packaging dimensions** | rarely in feeds; critical for [§11.2](#112-critical-the-box-versus-the-assembled-item) |
| **`assembly`** (`flat-pack` / `assembled` / `partial`) | **derived manually; governs [§11.2](#112-critical-the-box-versus-the-assembled-item)** |
| **clearance zone** (drawer pull-out, door swing) | **derived from item type manually — exists nowhere** |
| **`install_clearance`** (appliances) | **transcribed from the manufacturer's installation manual, cited and dated — governs [§7.5](#75-safety-critical-anchors-come-from-the-manual-not-from-a-rule)** |
| **`height_adjustable`** (range, e.g. cabinet legs) | manufacturer; determines whether a `counter.height` anchor can be met |
| price, currency, availability, region | affiliate feed |
| delivery lead time, assembly cost | retailer |
| **`made_to_order`** plus lead time | retailer; determines irreversibility ([§3.2](#32-beachhead)) |
| 2D footprint plus height | derived from dimensions |
| source, `checked_at`, confidence | our system |

The `clearance`, `assembly`, `install_clearance` and `height_adjustable` rows are
the **real differentiator in the data**. `FURNITURE_DEPTHS` in `golden-ratio` is
the three-archetype prototype of this table.

### 13.4 Versioning

`TC-CAT-01`. The catalog is versioned by snapshot; a plan references a
`catalog_snapshot_id`. **Without this, Availability Recovery is technically
impossible.**

### 13.5 Top five candidates (Ukraine)

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

### 13.6 Anchor strategy

**JYSK plus one Ukrainian factory** as the anchor pair, **Rozetka on top** as the
price-and-availability layer. That is sufficient for 300–600 SKUs covering a
living room and a bedroom.

### 13.7 First-contact script

Ask for five things:
1. a product feed (XML/CSV) with price and availability;
2. **written permission to use photographs and product names for promotion**;
3. product **and packaging** dimension fields;
4. **installation manuals for appliances** (for `install_clearance`);
5. delivery and assembly terms.

Offer in return: traffic with confirmed purchase intent, a reduction in
"wrong size" returns, and a free verification widget on their product page
(the entry point to retailer-side, [§20.3](#203-the-counter-argument-why-this-fails-even-with-a-good-product)).

Affiliate networks operating in Ukraine: **SalesDoubler**, **Admitad**, and
retailers' own programmes.

---

## 14. Legal regime for product data

> A structural analysis, not legal advice. Engage a Ukrainian IP lawyer before
> the first contract. Basis: the Law of Ukraine «Про авторське право і суміжні
> права» (2022 revision, No. 2811-IX).

### 14.1 The key distinction

**Dimensions are facts. Photographs are works.**

| Object | Status | Permitted? |
|---|---|---|
| Dimensions of a single product | fact, unprotected | **yes** |
| Price, availability, lead time | fact | **yes** |
| Product name / article number | generally unprotected | **yes** |
| **A clearance figure from a manual** | fact | **yes** to state it; **no** to reproduce the manual |
| Textual description | a work | paraphrasing yes, copying no |
| **Product photograph** | **a photographic work** | **licence required** |
| **A third party's infographic** | **a work** | **may be analysed, never reproduced** (`LC-05`) |
| Manufacturer's 3D model | a work | licence required |
| **Bulk extraction of a catalog** | **sui generis database right** | **contract required** |
| Brand logo and name | trade mark | nominative use yes; "official partner" without a contract no |

### 14.2 Two traps

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

### 14.3 Three lawful routes for photographs

1. **An affiliate programme** — participation normally includes express
   permission to use photographs, names and prices to promote those products.
   One contract settles the question.
2. **A direct contract with a manufacturer** — the best option: feed, photo
   licence, installation manuals, and a willingness to supply packaging
   dimensions.
3. **Our own renders — the architectural trump card.** We hold the geometry, so
   we can render a neutral image from dimensions and attributes (colour,
   material), all of which are facts. **The product's visual layer therefore does
   not depend on anyone else's photography.** MeltFlex depends on third-party
   imagery and visual search; we do not. The ergonomic elevation
   ([§8.3](#83-the-human-figure-at-scale)) is entirely generated and carries no
   third-party rights at all.
   Caveat `LC-03`: faithfully reproducing a recognisable designer piece may
   engage registered design rights (промисловий зразок); for generic case goods
   this is not an issue.

### 14.4 Unfair competition

`LC-04`. The Law «Про захист від недобросовісної конкуренції» covers the
improper use of another party's designations and business reputation. Another
company's catalog may not be presented as our own, and another studio's
infographic style may not be imitated to trade on its reputation.

---

## 15. Architecture

### 15.1 The contract: Scene Graph

`TC-VRP-ARCH-01`. **The sole carrier of state.** All services communicate only
through it. Everything else is derived.

```
SceneGraph {
  room {
    outline: Polygon                     // mm
    openings[]  { type: door|window, pos, width, height,
                  swing: in|out, hinge: left|right }
    obstacles[] { type: radiator|pipe|socket|switch|niche|existing_furniture,
                  bbox, source, confidence }
    finishes    { floorThickness }
    building    { floor, lift {w,d,h,doorW}, stairW, corridorW, turns[] }
    // every number carries: value, error, source, measured_at, confidence
  }
  users[] {
    id, height, elbowHeight?, reachHeight?
    primary_for: [zone]                  // §7.5 multi-user resolution
  }
  items[] {
    sku_ref, catalog_snapshot_id
    position, rotation, mountHeight?
    locked: bool
    placed_by: solver|user
    dims_source, confidence
  }
  constraints[]  // see §16
  budget { total, currency: UAH, spent, mode }
  verdicts[] {
    kind: fit | ergonomic | delivery | budget
    anchor_id?                           // for ergonomic verdicts
    value, band, status, source          // §1.4 auditability
  }
}
```

### 15.2 Five services

**1. Catalog Service** — the single source of product truth. Normalisation
([§13.3](#133-required-sku-fields)), snapshot versioning, ingestion pipeline
(feed plus manual normalisation plus QA).

**2. Anchor Service** — the ergonomic rule library
([§7.2](#72-the-anchor-system)). Versioned, sourced, dated, independently
testable, and independently valuable. Separated from the Geometry Engine
deliberately: rules change on a research cadence, geometry code does not.

**3. Geometry Engine** — deterministic, **AI-free**, offline-testable. Input:
outline, openings, obstacles, users, SKUs, constraints, anchors. Output: valid
positions and verdicts, or a structured conflict. Internals: interval arithmetic
([§6](#6-the-confidence-engine--axis-one-will-it-fit)), collisions, clearances,
door swing arcs, **circulation as a traversability graph** (not pairwise
distances), anchor evaluation, and the delivery path as a chain of 3D rectangles
with rotations. **This is the moat code.**

**4. AI Layer** — **with no authority over facts**. Three roles:
- extracting constraints from natural language into structured constraints;
- generating candidate SKU sets that the Geometry Engine then **validates**
  (**generate-and-verify, never generate-and-trust**);
- explaining the result in human language.

`BC-AI-01`. **The LLM never returns coordinates as truth. The LLM does not decide
whether a sofa fits in an alcove, and it never decides an ergonomic threshold.**

**5. Renderer** — deterministic from the Scene Graph (three.js) for plan,
elevation and 3D. Diffusion is img2img with strict structural control over a
finished render only; **it must not alter walls, object positions, or the shape
of selected products**. This is Later.

### 15.3 The architecture test

`TC-VRP-ARCH-02`. **Remove the AI Layer entirely and the product must remain
functional** — worse, but correct. If it does not, what has been built is a
wrapper around an image-generation API.

---

## 16. Constraint Memory and Safe Swap

`FR-CONSTR-01`. The user pins rules: this wall cannot change; this furniture
stays; a 90 cm walkway is required here; the countertop must suit a 1.62 m user;
the sofa must fold out; pet-safe materials only; no glass tables; delivery by a
specific date; the budget must not be exceeded.

`FR-CONSTR-02`. The system **must preserve those rules across every iteration or
explain the conflict**. Re-generation must not destroy prior decisions.

`FR-SWAP-01` **Safe Swap.** Substitution by command: ₴X cheaper; 20 cm smaller;
available by Friday; from the same retailer; a different colour; child- or
pet-safe. A swap must not break walkways, budget, style, **or any ergonomic
anchor already satisfied** — a cheaper cabinet line that cannot reach the user's
countertop height is not a valid swap.

`FR-CONFLICT-01` **Behaviour when nothing fits** ([`GAP-06`](#22-identified-gaps-completeness-review)).
For a small Ukrainian flat on a small budget, "nothing fits" is a frequent
outcome, not an edge case. It is the moment the product either earns trust or
loses the user. A designed response is required: **which constraint to relax and
what that buys** ("remove the second wardrobe and you gain 60 cm of walkway";
"+₴3,000 to the budget opens up four options"; "accepting 88 cm instead of 91 cm
opens up two cabinet lines — here is what that costs you in daily use") — not an
empty "conflict" screen.

---

## 17. User workflow

1. **Entry, no registration.** "What do you have?" → photo / plan / scan / manual
   measurement. Plus three fields: **budget**, deadline, and **your height**.
2. **Geometry.** Show the reconstructed outline; request confirmation only of
   those dimensions whose intervals straddle a threshold
   ([§6.3](#63-interval-arithmetic--the-mechanism)).
3. **Free ergonomic verdict — delivered before any paywall.** Countertop height,
   shelf height, TV distance, light temperature, walkways: personalised, with
   the elevation view, the silhouette, the numbers and the sources. **This is
   the moment the product proves it is not another render tool.**
4. **Constraints.** Five questions maximum: who lives here, what stays, what
   cannot move, style from three images, budget.
5. **Free preview.** One variant: **the plan and elevation fully visible, the
   total cost fully visible, the SKU list hidden**, plus a watermarked
   atmospheric render.
6. **Paywall.** `BC-PAY-01`: **after the total cost, before the SKU list.** The
   cost proves the value; the SKUs are the goods.
7. **Result.** Three variants plus the FitProof report, the ergonomic report,
   walkway map, and landed cost.
8. **Editing.** Safe Swap, lock, recompute.
9. **Purchase.** Split by retailer, links, a "measure this before ordering"
   checklist, and **Delivery Path Check as the final step**.
10. **After.** A reminder at day 7, Availability Recovery, and a "what did you
    buy?" follow-up (this feeds the North Star).

**`BC-FLOW-01`.** Step 3 precedes the paywall deliberately. A user who receives a
correct, personal, sourced ergonomic answer for free has been given a reason to
trust the paid numbers. Moving ergonomics behind the paywall would optimise one
conversion and destroy the acquisition loop that the whole Ukrainian model rests
on.

---

## 18. Metrics

### 18.1 North Star

`M-NSM`. **The number of rooms actually furnished according to the app's plan.**
Not the number of images generated.

`BC-METRIC-01`. The metric is measurable only via self-report
([§20](#20-risks), `RISK-ATTR`). The day-30 follow-up is a mandatory part of the
product, not an option.

### 18.2 Product metrics

| ID | Metric |
|---|---|
| `M-CONV-01` | free → paid conversion (**the primary test of the hypothesis**, [§5.5](#55-accepted-cannibalisation-risk)) |
| `M-ERG-01` | share of sessions that reach a completed ergonomic verdict (free-tier value delivered) |
| `M-ERG-02` | share of users who supply their height (tests whether the personal axis is accepted) |
| `M-SHARE-01` | shares/exports of anchor cards per session (the growth loop, [§8.5](#85-the-content-engine)) |
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

## 19. Go / No-Go after the first pilot

### 19.1 Go — only if all hold simultaneously

- ≥20 payments at a CAC ≤15% of price;
- ≥60% of customers bought ≥50% of the listed items within 30 days;
- ≥50% return for a second room or refer someone;
- `M-VER-01` ≥70% (otherwise the product is homework);
- `M-MEAS-01` ≤3 measurements;
- `M-ERG-02` ≥50% — users are willing to give their height;
- `M-SHARE-01` shows a measurable organic loop rather than zero;
- in interviews, customers cite **confidence, ergonomic correctness and total
  cost** as the reason for buying — not the picture.

### 19.2 No-Go / pivot

- they buy the report but do not buy furniture → we are selling entertainment;
- **the render cohort in the A/B is equally satisfied** → the USP has no value
  ([§19.3](#193-mandatory-ab-inside-the-pilot));
- the free ergonomic tier is used heavily and converts at ~0% → the free/paid
  line is drawn in the wrong place, and the business is a content site;
- >40% of decisions land at `Needs measurement` and users drop off there;
- CAC shows no sign of an organic component;
- dimensions cannot be lawfully obtained for >30% of required SKUs.

### 19.3 Mandatory A/B inside the pilot

**Half receive an attractive render with approximate products; half receive a
plain technical plan with exact SKUs, ergonomic verdicts and total cost.**

If the render cohort buys at the same rate, the central hypothesis is refuted.
This must be learned across 20 users, not across two years.

---

## 20. Risks

### 20.1 Unvalidated assumptions

| ID | Risk |
|---|---|
| `RISK-WTP` | **whether anyone pays at all.** Zero data points. First revenue is pushed out ~six months ([§20.2](#202-scope-risk--accepted-knowingly)) |
| `RISK-CANNIBAL` | the free tier, now including ergonomics, may be sufficient for most users ([§5.5](#55-accepted-cannibalisation-risk)) |
| `RISK-ANCHOR-SRC` | **authoritative sources for anchor values may not exist in citable form.** If most anchors can only be sourced to trade practice, the product's central claim weakens to "a better opinion". Test this early — it is cheap to test and expensive to discover late |
| `RISK-ERG-SAFETY` | a wrong safety-critical clearance (hood over a gas hob) is a physical hazard, not a bad recommendation. `BC-ERG-03` exists to contain this and must not be relaxed for convenience |
| `RISK-TASTE` | taste uncertainty far exceeds size uncertainty. A user will look at a perfect plan and say "but I don't like that sofa" |
| `RISK-FREQ` | a room is furnished once every 5–7 years. No retention → no organic growth → every unit of revenue is bought. Ergonomic content is the only identified repair |
| `RISK-MOMENT` | furnishing is 20 decisions over 3 months involving a partner and parents. A "final answer in one sitting" product fights the nature of the process |
| `RISK-DATA` | exact dimensions and clearances are openly available almost nowhere; the accuracy promise is bounded by data, not by algorithms |
| `RISK-SCAN` | RoomPlan is ±2–5 cm; a high share of `Needs measurement` makes the product feel like homework |
| `RISK-RETAIL` | once fit-checking proves valuable, retailers will build it in — they already hold the data and their motivation (returns) is stronger. **We may be building a feature for someone else's product.** Ergonomics is the harder half to copy, because it needs the user's body, not the catalog |
| `RISK-ROT` | 1500 SKUs is manual labour; with 20–30% annual assortment churn we run to stand still |
| `RISK-ASYM` | "Verified" is asymmetric: 95% success builds no reputation, 5% failure destroys it. One viral post — «їхній додаток сказав, що поміститься» — costs more than the entire marketing budget |
| `RISK-ATTR` | a user buys 60% of the list, swaps two items, and gets one second-hand. The North Star is barely measurable without self-report |
| `RISK-PII` | body measurements are personal data; mishandling them is both a legal and a trust failure (`BC-ERG-02`) |
| `RISK-WAR` | availability volatility, logistics, power outages (affecting GPU rendering), and limited investor appetite for UA-only B2C |

### 20.2 Scope risk — accepted knowingly

Over the course of the session, scope grew to: scan + photo + manual measurement
+ iOS + web + catalog + layout generation + rendering + payments + cloud projects
+ the ergonomic anchor library and elevation renderer.

**Estimate: 5–8 months with 2–3 engineers, plus 80–250 person-hours of manual
catalog normalisation — before the first paying user.** The anchor library adds
research time rather than engineering time, and it is the one addition that could
plausibly ship *before* the rest.

The original alternative (a manual service plus a free tool) cost ~3 weeks and
answered `RISK-WTP`. It was declined deliberately.

**The recommendation still stands, and ergonomics strengthens it:** the free
ergonomic calculator is shippable in weeks, needs no catalog, no payments and no
iOS, and would put a real audience in front of the product months before the paid
layer exists. If any part of this spec should ship first, it is
[§7](#7-ergonomics--axis-two-will-it-be-comfortable) and
[§8](#8-the-visual-system-plan-elevation-3d).

### 20.3 The counter-argument: why this fails even with a good product

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
2. **The ergonomic calculator as the product.** Free, personal, sourced,
   shareable, no catalog; monetised by affiliate links and retailer placement
   rather than by a plan fee. The cheapest path to an audience, and the only one
   testable in weeks.
3. **"Second opinion" ([§5.4](#54-dont-buy-this-as-a-headline-feature)) as a
   standalone product.** Zero taste liability, all value in verification,
   instantly comprehensible, highly shareable.
4. **One purchase instead of one room.** "Buy the right sofa": a single
   expensive, high-risk, frequently returned item. An order of magnitude less
   data, higher conversion, clear search demand. Buildable in ~6 weeks.
5. **Prosumer (landlords, hosts).** Repeat use across 3–10 properties, clear ROI,
   justified CAC. Rejected because of the B2C constraint, but economically the
   strongest.

Ranking by unit economics: **1 > 2 > 3 > 4 > 5 > the current positioning.**

---

## 21. Open questions

| ID | Question |
|---|---|
| `OQ-VRP-01` | Ukrainian consumer rights: distance selling and made-to-order goods |
| `OQ-VRP-02` | do local Ukrainian software competitors exist — **check before launch**. LESNIK.PRO-class studios are channel candidates, not competitors |
| `OQ-VRP-03` | does JYSK Ukraine run an affiliate programme (unconfirmed by search) |
| `OQ-VRP-04` | current Nova Poshta dimensional limits by delivery type |
| `OQ-VRP-05` | primary source for the furniture return statistics (58% / 71% from the review) |
| `OQ-VRP-06` | payment provider: LiqPay / Fondy / WayForPay / Monobank; legal form (ФОП), taxation, terms of service |
| `OQ-VRP-07` | refund policy for the service itself when a verdict is wrong |
| `OQ-VRP-08` | interface language for the UA market: UA primary, EN secondary; RU undecided |
| `OQ-VRP-09` | fate of the current `golden-ratio`: standalone product / free tier / archive |
| `OQ-VRP-10` | real UA CPCs and conversion rates for target queries — replace estimates with data |
| `OQ-VRP-11` | product name and domain |
| `OQ-VRP-12` | **authoritative sources for every anchor**: which ДБН / ДСТУ / ISO / EN standards apply, and which anchors have no standard and must be sourced to handbooks or literature (`BC-ERG-05`) |
| `OQ-VRP-13` | **hood clearance for gas vs induction** — the range differs, and this is safety-critical (`BC-ERG-03`) |
| `OQ-VRP-14` | **which TV viewing-distance standard to adopt**, and how resolution enters the rule; the observed carousel ranges are resolution-blind |
| `OQ-VRP-15` | anthropometric basis for anchors: which population data underlies "optimal" heights, and how to handle users outside its range |
| `OQ-VRP-16` | privacy and legal treatment of stored body measurements under Ukrainian personal-data law (`BC-ERG-02`, `RISK-PII`) |
| `OQ-VRP-17` | is LESNIK.PRO-style studio partnership a viable distribution channel, and on what terms |
| `OQ-VRP-18` | board page format and print target (A4 portrait vs A3), and whether a printed sheet is genuinely used by this audience or only shared on a phone |
| `OQ-VRP-19` | does withholding the purchase list on the free board (`BC-VIZ-04`) leave it valuable enough to share, or does it read as a crippled teaser |

---

## 22. Identified gaps (completeness review)

Gaps found while consolidating this spec, ordered by danger. Gaps marked
**(2026-09-16)** were found in the ergonomics revision.

| ID | Gap | Why it is dangerous |
|---|---|---|
| `GAP-16` | **ergonomics was absent entirely** **(2026-09-16)** | the product verified that objects fit while ignoring whether they were usable — the failure mode that is set in concrete rather than returned. Now [§7](#7-ergonomics--axis-two-will-it-be-comfortable) |
| `GAP-02` | **box vs assembled item** in Delivery Path Check | the feature returns a **systematically wrong answer** for flat-pack, the largest category. Addressed in [§11.2](#112-critical-the-box-versus-the-assembled-item) and `assembly` |
| `GAP-19` | **safety-critical clearances treated as generic rules** **(2026-09-16)** | a wrong hood clearance over a gas hob is a hazard, not a bad suggestion. Addressed in `BC-ERG-03` |
| `GAP-01` | **the user's existing furniture** | the whole session designed an empty room; most people already own something. Needed as a measured obstacle with no SKU. Addressed in [§9.4](#94-input-model--required-fields) |
| `GAP-18` | **the user's body was not in the data model** **(2026-09-16)** | without it every ergonomic verdict is generic, and the one input no competitor holds is discarded. Addressed in `FR-ERG-04` and the Scene Graph |
| `GAP-06` | **behaviour when nothing fits** | a frequent outcome for small flats and small budgets; the moment trust is lost. Addressed in `FR-CONFLICT-01` |
| `GAP-11` | **demand is entirely unvalidated** | the largest risk in this document; `RISK-WTP` |
| `GAP-17` | **no elevation view** **(2026-09-16)** | height relationships are invisible in plan, so the ergonomic axis was literally unrepresentable. Addressed in [§8](#8-the-visual-system-plan-elevation-3d) |
| `GAP-03` | **building data** (floor, lift, stairs, turns) | Delivery Path Check is incomplete without it. Addressed in [§9.4](#94-input-model--required-fields), [§15.1](#151-the-contract-scene-graph) |
| `GAP-04` | **sockets, switches, pipes** | they determine where a TV, desk or bed can go — and «розетку потім перенесемо» is the most quoted expensive mistake in [§1.4](#14-voice-of-the-customer-the-cost-of-та-нормально-буде). Addressed in [§9.4](#94-input-model--required-fields) |
| `GAP-20` | **verdicts were not auditable** **(2026-09-16)** | a verdict without a visible number, threshold and source is just another opinion, and loses to «майстер сказав». Addressed in `FR-ERG-08` |
| `GAP-13` | **one-handed mobile measurement UX** | measuring is done with a tape measure in the other hand; a desktop form does not work here. Addressed in `NFR-MOBILE-01` |
| `GAP-09` | **price validity window** (hryvnia exchange rate) | an estimate goes stale faster than availability does. Addressed in `FR-COST-03` |
| `GAP-21` | **floor finish thickness** **(2026-09-16)** | countertop and appliance heights are measured from finished floor, not screed; mid-renovation users have neither yet. Addressed in [§9.4](#94-input-model--required-fields) |
| `GAP-22` | **the deliverable format was unspecified** **(2026-09-16)** | the result existed only as app screens, so it could not travel to the partner, the fitter or the shop — the places where the decision is actually made (`RISK-MOMENT`). Addressed in [§8.6](#86-the-deliverable-one-board-not-a-screen) |
| `GAP-23` | **no rule for what may be displayed as a figure** **(2026-09-16)** | without one, decorative metrics (energy class, comfort scores) drift onto the deliverable and discredit the honest numbers beside them. Addressed in `BC-SCOPE-NOCALC-01` |
| `GAP-24` | **no room schedule** **(2026-09-16)** | a conventional, expected element, trivially derivable from geometry already held. Addressed in `FR-VIZ-06` |
| `GAP-05` | **interior doors swinging inward** | they consume usable floor area; covered by the openings model (`swing`, `hinge`) |
| `GAP-07` | **refunds for the service** | trust plus consumer law. [`OQ-VRP-07`](#21-open-questions) |
| `GAP-12` | **UA/RU language** | a sensitive question for this market. [`OQ-VRP-08`](#21-open-questions) |
| `GAP-08` | **payments and legal entity** | blocks taking money at all. [`OQ-VRP-06`](#21-open-questions) |
| `GAP-10` | **local competitors unchecked** | [`OQ-VRP-02`](#21-open-questions) |
| `GAP-14` | **units: mm vs cm** | mixing them is not permitted. Addressed in `BC-UNITS-01` |
| `GAP-15` | **fate of `golden-ratio`** | [`OQ-VRP-09`](#21-open-questions) |

---

## 23. Feature priorities

### Must
the ergonomic anchor library with sourced values; personal height input; the
elevation view with a scaled silhouette; manual measurement plus scan/photo as
parallel inputs; the interval engine with propagating confidence; a catalog of
300–600 SKUs (1–2 retailers, UA) including `assembly` and `install_clearance`; a
deterministic layout solver (collisions, walkways, door swings, windows); the
to-scale 2D plan; the FitProof report with statuses; auditable verdicts showing
number, threshold and source; Delivery Path Check honouring `assembly`; total
cost in hryvnia; shopping list plus links; Safe Swap along one axis that respects
satisfied anchors; conflict behaviour; purchase follow-up; the free second
opinion; the exportable deliverable board with the room schedule.

### Should
3D view (view only); shareable anchor cards; Constraint Memory; Availability
Recovery; a second retailer; the atmospheric render.

### Later
photorealistic rendering from the scene; AR; multi-room; paid human review;
white-label / API; the retailer-side widget; multi-user anchor negotiation beyond
the primary-user rule.

### Do not build
video generation; our own 3D model generation for products; exteriors and
gardens; 25 styles; social features; image generation as the basis of the
pipeline; an "AI chat designer"; custom kitchens; scraping; unofficial APIs;
**any anchor value without a citation**; **energy-efficiency classes or any
other figure barred by `BC-SCOPE-NOCALC-01`** ([§7.8](#78-what-we-refuse-to-compute));
exterior, façade, roof, terrace or site design.

**`BC-VRP-SCOPE-01`. 3D is not in Must.** Confidence is conveyed better by a plan
and an elevation with dimension lines than by a 3D scene. 3D drags in model
licensing, bundle size and a WebGL fallback. A product that does not compete on
the picture must not build the picture first.

---

## 24. What counts as success for this document

It describes a product where:
- facts are computed by deterministic code and subjective judgement by AI, and
  removing the AI does not break correctness;
- both promises — "it will fit" and "it will be comfortable" — are backed by
  mechanisms (intervals and sourced anchors), not by wording;
- every verdict can show its number, its threshold and its source, because the
  market's own failure mode ([§1.4](#14-voice-of-the-customer-the-cost-of-та-нормально-буде))
  is deciding from opinion;
- the monetisation boundary coincides with the cost boundary and the data
  boundary;
- the principal risks (`RISK-WTP`, `RISK-ANCHOR-SRC`) are named rather than
  hidden, and each has a cheap test.

The next step is an implementation plan (skill `writing-plans`) — **after**
[`OQ-VRP-12`](#21-open-questions) (anchor sourcing, which gates
[§7](#7-ergonomics--axis-two-will-it-be-comfortable)),
[`OQ-VRP-02`](#21-open-questions), [`OQ-VRP-03`](#21-open-questions) and
[`OQ-VRP-11`](#21-open-questions) are resolved.

---

## 25. Interview answers and the numbers to know cold

*Drafts, not scripts. Each answer is built to land in 30–60 seconds. Where the
honest answer is "we don't know yet", it says so — a confident invention is the
one failure mode that cannot be recovered from in the room.*

### 25.1 The questions, answered

**What are you making?**
Software that checks whether the furniture you're about to buy will fit your
room, suit your body, and get through your door — before you pay. You give us
the room's dimensions and your height; we give you what to buy, what it costs in
total, and what will go wrong if you buy the wrong thing.

**Why did you pick this idea?**
We built the geometry engine first, as a tool for proportional room planning.
It computes clearances against absolute human thresholds. At some point it
became obvious that this logic *was* the business — every AI interior tool on
the market ends with "go measure it yourself", and we already had the thing that
measures.

**What do you understand that others don't?**
Two things. First, everyone is competing on the picture, and the picture is a
commodity — even the most favourable review of the market leader ranks its
shopping list above its renders. Second, nobody asks how tall the user is. Fit
needs a catalog; ergonomics needs a body. The second input is the one nobody
collects, it's free to obtain, and it produces the failure that gets set in
concrete rather than returned.

**Who are your users?**
People furnishing a room on a fixed budget where the purchase is irreversible.
In Ukraine that's a mass condition, not a niche: a large share of furniture is
made to order, 2–6 week lead times, no practical right of return.

**How do you know they want it?**
Honestly: we don't yet, and that's the thing we're fixing first. What we have is
indirect — Ukrainian renovation studios run their entire marketing on ergonomic
infographics, which tells us the content attracts exactly this audience; and the
most favourable published review of our largest competitor says its best feature
was being told what *not* to buy. That's a signal, not proof. The free layer
ships first specifically to turn it into proof.

**What have you built?**
A deterministic engine: 598 lines of pure functions, 107 passing tests, live in
production, bilingual, with end-to-end tests against the live deployment. No
catalog, no payments, no users.

**What's your growth rate?**
Zero. Nothing is launched. The free ergonomic checker is weeks away, and from
that point we have `M-ERG-02` (do people give us their height), `M-SHARE-01`
(does the result travel) and `M-CONV-01` (does anyone pay).

**How will you make money?**
₴299–599 once per verified room. Affiliate on a ₴20–40k basket second.
Retailer-side licensing is where the economics are strongest, because a returned
sofa costs the retailer a large fraction of the order and the reverse logistics
cost more than the item.

**Why won't a big retailer just build this?**
For the fit half, they might — they hold the catalog and returns hurt them more
than they hurt us. That's a named risk, not a surprise. The ergonomic half is
harder to copy because it needs the user's body rather than the catalog, and it
crosses retailers, which a single retailer has no reason to do.

**What's the biggest thing that could kill you?**
That people want inspiration, not verification. We test it in the pilot with a
split: renders and approximate products for one half, a verified plan with exact
products and total cost for the other. If the render half converts equally, the
thesis is dead and we'll know it across 20 users.

**Why now?**
Phone LiDAR made approximate room geometry free. What's scarce now is knowing
which measurement matters — that's a computation. And the entire AI-interior
category has publicly conceded the gap by telling users to go get a tape measure.

**What's your unfair advantage?**
Ukraine is home, not a market picked off a map, and the engine already exists
and is tested.

### 25.2 Numbers to know cold

Memorise these; a partner will ask for at least three of them.

| Number | Value | Status |
|---|---|---|
| Users | 0 | nothing launched |
| Revenue | 0 | — |
| Price point | ₴299–599 once (~€7–13) | hypothesis, [§3.1](#31-market-1-ukraine) |
| Basket size assumed | ₴20–40k | hypothesis, [`OQ-VRP-10`](#21-open-questions) |
| Affiliate take assumed | low single-digit % of basket | hypothesis |
| CAC | unknown for UA | **must fix** — [`OQ-VRP-10`](#21-open-questions) |
| EU CAC that killed the EU plan | €40–75 against a €39 price | the reason the market is Ukraine |
| Engine | 598 LOC, 107 tests, in production | verified |
| Catalog target for v1 | 300–600 SKUs, 1–2 retailers | [§13.2](#132-scope-of-version-one) |
| Manual normalisation cost | 80–250 person-hours | estimate |
| Time to first paying user, full build | 5–8 months | the number we are correcting |
| Time to free layer shipped | weeks | the plan |
| Repurchase frequency | once per 5–7 years | `RISK-FREQ` — the hardest number we own |

**`BC-PITCH-01`.** Every figure presented externally carries its status —
measured, hypothesis, or unknown. The same discipline the product applies to
ergonomic anchors (`BC-ERG-05`) applies to our own metrics. A founder who
presents a hypothesis as a measurement has the same defect as a product that
presents an opinion as a number, and it is noticed just as fast.

### 25.3 Things not to say

- Any market-size figure we have not computed from a source.
- The 58% / 71% furniture-return statistics — still untraced
  ([`OQ-VRP-05`](#21-open-questions)).
- "No competitors." There are several, one is well funded, and IKEA Kreativ does
  part of this natively.
- Any softening of "zero users". It is the first thing to say, not the last.

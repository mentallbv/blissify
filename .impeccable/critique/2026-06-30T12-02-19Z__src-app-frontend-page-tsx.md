---
target: the homepage
total_score: 23
p0_count: 2
p1_count: 2
timestamp: 2026-06-30T12-02-19Z
slug: src-app-frontend-page-tsx
---
**Method: dual-agent (A: aaa125c8985cb5d2e · B: ab10afaec94d2e4ed)**

*Note: the `/impeccable layout` pass earlier this session already fixed gradient text, dark-section eyebrow, pricing eyebrow, icon-card-grid glassmorphism, and the pricing gradient divider. Scores and issues below reflect the page **after** those fixes.*

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | SearchCard gives no loading state after submit; stat counter animation is decorative, not functional |
| 2 | Match System / Real World | 3 | Dutch is correct and vernacular; "Merken" in nav is ambiguous without context |
| 3 | User Control and Freedom | 2 | No search clear/reset; cycling placeholder removes user control over hint; hero has no "just browsing" escape path |
| 4 | Consistency and Standards | 3 | Token system disciplined; hero H1 hardcodes `fontSize: 64` rather than using the `--type-display` token; `--fw-display-light` and `--fw-display-regular` both resolve to 400 |
| 5 | Error Prevention | 2 | No client-side validation on SearchCard; `locatie` passes display strings while `categorie` passes slugs — mismatch in filter value types |
| 6 | Recognition Rather Than Recall | 3 | Hero pills are excellent affordance; "Merken" nav item lacks sub-label |
| 7 | Flexibility and Efficiency of Use | 2 | No keyboard shortcut to focus search; no autocomplete; pills can't multi-select |
| 8 | Aesthetic and Minimalist Design | 3 | Color restraint is genuine; photo tiles degrade to empty dark boxes without CMS images; Marquee is visual noise |
| 9 | Error Recovery | 1 | No error states in SearchCard or pricing CTAs; CMS fallback is silent — users never know they're seeing hardcoded defaults |
| 10 | Help and Documentation | 2 | FAQ exists but below fold; no "How does this work?" nav link; no inline help on "erkenning" |
| **Total** | | **23/40** | **Acceptable — significant improvements needed** |

---

## Anti-Patterns Verdict

**LLM assessment**: Partial. The gradient text and icon-card-grid glassmorphism were caught and cleaned earlier this session. Remaining tells: (1) The Marquee pre-footer repeating "Blissify ·" at near-zero opacity is borrowed directly from generic design-agency templates. (2) The same numbers (847 opleidingen, 124 opleiders) appear three times on one page — trust strip, SearchCard footer line, and StatCounters — which reads as over-assertion rather than confidence. (3) The dual-audience hero (students AND providers simultaneously) is a structural tell: single-purpose viewports are what editorial brand pages do; two competing messages above the fold is a template hedge.

**Deterministic scan**: 1 finding.
- `transition: padding` in `blissify.css` line 321 — the nav scroll-morph transitions a layout property. This is a genuine performance issue: padding changes force layout recalculation on every animation frame. Confirmed real, not a false positive.

**Browser visualization**: skipped — no local dev server was running.

---

## Overall Impression

The bones of this page are solid: disciplined token system, genuine typographic hierarchy, no decorative clutter except the Marquee. The design reads as considered rather than generated. The biggest issues are not aesthetic — they're structural. Two P0 problems: (1) the photo-tiles section ships broken in the default CMS state (three empty forest boxes), and (2) the homepage serves two incompatible audiences simultaneously. Fix those, and the page meaningfully closes the gap between its editorial ambition and its current execution.

---

## What's Working

1. **Token discipline is category-leading.** Three-color palette enforced across every file without exception. The `--fw-display-light` convention for the serif creates a consistent lightness-as-authority feel. No rogue hex values.
2. **SearchCard is structurally correct.** Native form GET, three focused inputs, terracotta accent on submit (appropriate trust signal), cycling placeholder as a non-intrusive scope affordance. Works without JavaScript.
3. **The "Waarom" dark section works editorially.** After removing the eyebrow and icon roundels, the Freight Display headings in chalk on forest carry real weight. "Curatorisch, niet algoritmisch" is a strong, differentiating copy line that earns its section.

---

## Priority Issues

**[P0] Photo-tile section renders as three empty dark boxes in default CMS state**
- **What**: The "Ontdek hoe Blissify werkt" grid uses `background: var(--surface-dark)` with no image fallback. Without CMS-populated images, three identical 440px tall forest-green rectangles appear.
- **Why it matters**: This is likely what most visitors see before images are live. Three empty dark boxes read as broken — trust destroyed at the moment the page tries to explain how Blissify works.
- **Fix**: Conditionally render a text-only three-column layout when `t.image` is null, or add a meaningful SVG/CSS placeholder per tile category.
- **Suggested command**: `/impeccable harden`

**[P0] Dual-audience hero splits the message for both audiences**
- **What**: "Vind een opleiding" (student) and "Publiceer jouw opleiding" (provider) compete for the same above-fold attention. The subtitle is student-facing; the CTA labels split the audience.
- **Why it matters**: Neither user group sees their story clearly. Providers arrive and immediately need to self-identify and click away. Students are distracted by a CTA that isn't for them. Single-purpose viewports are the editorial standard this brand claims.
- **Fix**: Commit the homepage to students. Give providers their own conversion path via the nav "Voor aanbieders" link (already exists). Remove the ghost "Publiceer" CTA from the hero.
- **Suggested command**: `/impeccable clarify`

**[P1] Triple-counted proof numbers dilute the trust signal**
- **What**: 847 opleidingen and 124 opleiders appear in the trust strip, the SearchCard footer line, and the StatCounters section — three times in one scroll.
- **Why it matters**: Repeating the same numbers signals over-assertion. It also trains the user to ignore them, defeating their purpose. "3 Landen" appears only in the StatCounters with no context — which three?
- **Fix**: Remove numbers from the trust strip and SearchCard footer. Replace with qualitative proof ("Handmatig geverifieerd" / "Direct aanvragen, geen tussenpersoon"). Keep the animated StatCounters as the single canonical display.
- **Suggested command**: `/impeccable clarify`

**[P1] SearchCard has no loading state after submit**
- **What**: Clicking "Zoek opleidingen" triggers a GET form submission with no visual feedback. On slow connections the button is silent for 200ms–3s+.
- **Why it matters**: For a platform whose entire brand is built on transparency and professionalism, a dead button click is a trust break. Users double-click, causing redundant requests.
- **Fix**: Add `onSubmit` state to SearchCard that disables the button and changes its label to "Zoeken…" during submission.
- **Suggested command**: `/impeccable harden`

**[P2] Marquee is decorative noise and a design-template tell**
- **What**: The pre-footer Marquee repeats "Blissify ·" 8 times at ~16% opacity in a 36px band.
- **Why it matters**: It contributes nothing. It is borrowed directly from generic design-agency/SaaS templates — precisely the aesthetic this brand explicitly rejects. It occupies valuable pre-footer screen real estate.
- **Fix**: Remove. Replace with a single editorial closing statement: a trainer quote, a student outcome, or a low-pressure "Klaar om te beginnen?" CTA row in the brand voice.
- **Suggested command**: `/impeccable clarify`

**[P2] Nav `transition: padding` causes layout recalculation on scroll**
- **What**: `blissify.css` line 321 — the scroll-pill morph transitions `padding`, a layout property that forces full layout recalculation on every animation frame.
- **Why it matters**: The nav is sticky and runs on every scroll tick. On mid-range devices this jank is perceptible, especially combined with `backdrop-filter: blur(14px)`.
- **Fix**: Transition `transform: scale()` or `padding` as part of a composited layer, or replace the padding change with a `scale` on the inner container so only the compositor layer changes.
- **Suggested command**: `/impeccable optimize`

---

## Persona Red Flags

**Jordan (First-Timer landing on homepage)**
- Sees three identical dark green boxes in the "how it works" section and assumes the page is broken or incomplete — trust damaged before reaching the FAQ.
- "Merken" in the nav has no sub-label or tooltip; Jordan skips it, potentially missing a discovery path.
- "De Europese standaard" is a bold claim with no supporting third-party reference or accreditation body name above the fold. Jordan wonders: verified by whom?

**Casey (Distracted mobile user, one-handed thumb navigation)**
- On mobile, the hero stacks to single column. The SearchCard appears below the fold under the headline + subtitle + two CTAs + 8 pills. Casey never reaches the primary search tool.
- The hero pills collapse to `flex-wrap: nowrap` horizontal scroll at 860px but there is no visual cue (shadow, partial pill, fade) indicating more pills exist beyond the viewport edge.
- Pricing renders as a 2-column grid at ≤1024px, leaving the third tier orphaned on its own row — visually implies it's less important.

**Riley (Stress tester)**
- Submits the search form with an empty query — /opleidingen receives an empty GET. No error message, no redirect with guidance.
- Notices 124 opleiders in the trust strip AND the StatCounters section — same number, different placement — suspects it is a hardcoded value rather than a live count.
- Clicks "Kies Professional" (the recommended tier), lands on /prijzen, sees the identical pricing cards again. No forward momentum. Closes tab.

---

## Minor Observations

- `--fw-display-light: 400` and `--fw-display-regular: 400` are identical values. If Freight Display Pro supports weight 300, use it for light — the distinction currently creates no visual difference.
- `a { color: inherit; text-decoration: none; }` globally removes underlines. This is an accessibility concern for body-text links.
- Footer tagline "Jouw praktijk begint hier" in display serif at 20px is an editorial closing note — but it is orphaned at the top of the footer column before the newsletter form. Consider making it the footer's headline with the newsletter as its natural pair.
- The hero Eyebrow reads "Professionele wellnessopleiding · België" — accurate but undersells. The differentiator isn't that it's professional (expected), it's that it's curatorial and verified. Consider: "Curatorisch geverifieerd · België".

---

## Questions to Consider

- The homepage pitches both students and providers simultaneously. What is the actual traffic split? Is the homepage optimized for the segment that matters more commercially?
- "De Europese standaard" is a significant claim. Can it be backed by an institutional reference above the fold? If not, should the claim be scoped to Belgium until it can be proven?
- If the Marquee were removed and replaced with one human moment — a trainer quote or a student outcome — what story would that be? That answer reveals what the brand's most powerful proof point actually is, and whether it currently appears anywhere on this page.
- The three "Waarom" dark cards enumerate: curatorial + transparent + flexible scheduling. The third (schedule flexibility) is a feature, not a value. Does its inclusion dilute the editorial authority of the section?

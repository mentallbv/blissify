---
name: Blissify
description: Curated Belgian wellness training marketplace — authoritative, warm, professional
colors:
  forest: "#1a2e25"
  chalk: "#f5f0ea"
  terracotta: "#c4795a"
  neutral-100: "#e8e3dc"
  neutral-200: "#c9c4bc"
  neutral-400: "#8a8880"
  neutral-600: "#4a5568"
  neutral-700: "#2c3440"
  white: "#ffffff"
  status-success: "#2d6a4f"
  status-warning: "#92400e"
  status-error: "#9b1c1c"
typography:
  display:
    fontFamily: "'freight-display-pro', Georgia, 'Times New Roman', serif"
    fontSize: "clamp(2rem, 5vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'acumin-pro', 'DM Sans', system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.25
  title:
    fontFamily: "'acumin-pro', 'DM Sans', system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.25
  body:
    fontFamily: "'acumin-pro', 'DM Sans', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "'acumin-pro', 'DM Sans', system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.12em"
rounded:
  sm: "6px"
  md: "8px"
  pill: "20px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "64px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 22px"
  button-primary-hover:
    backgroundColor: "#14241d"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
  button-accent:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 22px"
  button-accent-hover:
    backgroundColor: "#b56a4c"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.forest}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 22px"
  button-ghost-dark:
    backgroundColor: "transparent"
    textColor: "{colors.chalk}"
    rounded: "{rounded.sm}"
    height: "44px"
    padding: "0 22px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "24px"
  card-dark:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.md}"
    padding: "24px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.neutral-700}"
    rounded: "{rounded.sm}"
    height: "44px"
  tag:
    backgroundColor: "{colors.neutral-100}"
    textColor: "{colors.neutral-600}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  tag-active:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
---

# Design System: Blissify

## 1. Overview

**Creative North Star: "The Verified Editorial"**

Blissify is a platform whose core promise is curation — every provider hand-verified, every course detail transparent. The visual system earns trust the same way a respected magazine does: through restraint, considered typography, and the quiet authority of knowing what to leave out. Freight Display Pro carries headlines with the gravitas of a printed credential. Acumin Pro handles the functional layer — menus, labels, metadata — with the precision of a well-set caption. The chalk surface is a press-paper ground, not a wellness spa backdrop; warmth here comes from photography and the terracotta accent, not from a pastel color scheme.

The design operates at two registers simultaneously: an editorial brand surface (homepage, listings, provider profiles) and a functional product surface (dashboard, onboarding, analytics). Both carry the same voice. The dashboard should feel as considered as the homepage; visual quality does not stop at login.

Density is deliberately low. The platform's positioning is curated over crowded. Breathing room signals selectivity. When in doubt, remove rather than add.

**Key Characteristics:**
- Serif display + sans UI pairing with intentional typographic hierarchy
- Flat surfaces with a single earned elevation moment (the morphing navigation)
- Forest-first palette; terracotta as a trust signal, never decorative
- Hairline borders over shadows; borders do the structural work
- Label/eyebrow type used purposefully, not as scaffolding

## 2. Colors: The Verified Editorial Palette

Three named brand colors, a warm neutral scale, and a minimal status set. Nothing invented; everything functional.

### Primary
- **Deep Verified Forest** (`#1a2e25`): The brand anchor. Used on primary buttons, nav, section backgrounds (dark surface), active tags, text headings. The color carries authority — it reads as institutional without being cold.

### Secondary
- **Certification Terracotta** (`#c4795a`): The trust signal. Used on the verified-provider badge, accent buttons, and accent text links. Its rarity is the point — terracotta appears only where Blissify is making a claim of verification or endorsement. Never used purely decoratively.

### Tertiary
*(none — the palette is intentionally tight)*

### Neutral
- **Editorial Chalk** (`#f5f0ea`): The page surface. Warm but not creamy; think press-paper rather than spa cotton. Used as the body background and inside the blurred nav pill.
- **Fog** (`#e8e3dc`): Hairline borders, card borders, disabled button backgrounds, horizontal rules.
- **Stone** (`#c9c4bc`): Stronger borders, input strokes in default state.
- **Ash** (`#8a8880`): Metadata, placeholder text, secondary labels. Must meet 4.5:1 against white or chalk.
- **Slate** (`#4a5568`): Primary body text. Warm-neutral, not true gray.
- **Ink** (`#2c3440`): Strong text — headings in the sans scale, prices, emphasis. Near-dark without being the brand forest.
- **White** (`#ffffff`): Card surfaces only. Page background is chalk, not white.

### Status
- **Approved** (`#2d6a4f`): Success states, published badges.
- **Caution** (`#92400e`): Warning states.
- **Alert** (`#9b1c1c`): Error states, archived badges.

### Named Rules
**The Terracotta Scarcity Rule.** Terracotta appears in exactly three contexts: the verified-provider badge, the accent button variant, and accent text links. If you find yourself reaching for terracotta to make something "pop," the element should probably not pop — use weight, size, or whitespace instead.

**The No-White-Body Rule.** The page background is chalk (`#f5f0ea`), not white. Cards are white; the page is chalk. This layering is the only depth signal outside of the navigation. Never set the page background to white.

## 3. Typography

**Display Font:** Freight Display Pro (serif) via Adobe Fonts/Typekit — `'freight-display-pro', Georgia, 'Times New Roman', serif`
**UI Font:** Acumin Pro via Adobe Fonts/Typekit — `'acumin-pro', 'DM Sans', system-ui, sans-serif` (DM Sans is the graceful fallback until Typekit resolves)

**Character:** Freight Display Pro lends the editorial weight of a printed credential — light-weight serifs, generous optical size, a typeface built for scanning at display scale. Acumin Pro handles everything functional with quiet confidence: legible, slightly condensed, professional without being cold. The pairing works on contrast of register: display type announces, UI type explains.

### Hierarchy

- **Hero** (400 weight, 72px / `clamp(2.5rem, 7vw, 4.5rem)`, lh 1.05): Landing page hero only. Freight Display Pro. Tracked at -0.01em.
- **Display** (400 weight, 64px, lh 1.1): Section heroes, campaign headers. Freight Display Pro.
- **H1** (400 weight, 48px, lh 1.1): Primary page headings. Freight Display Pro.
- **H2** (400 weight, 40px, lh 1.1): Section headings. Freight Display Pro.
- **H3** (400 weight, 28px, lh 1.25): Sub-section headings, card category headings. Freight Display Pro.
- **Lead / Body** (400 weight, 15px / 16px for lead, lh 1.7): All running prose. Acumin Pro. Max line length 65ch.
- **UI** (400 weight, 14px, lh 1.4): Interface labels, form fields, table cells.
- **Small** (400/500 weight, 13px): Secondary metadata, secondary nav links.
- **Label** (500 weight, 11px, uppercase, +0.12em tracking): Category eyebrows, section labels, filter chips, form field labels, verified badge. Use purposefully — not as default section scaffolding.

### Named Rules
**The Serif–Sans Axis Rule.** Freight Display Pro announces; Acumin Pro explains. Never use Freight Display Pro for body copy or UI labels, and never use Acumin Pro for primary display headings. The contrast between the two families is load-bearing.

**The Eyebrow Restraint Rule.** Label type (11px uppercase +0.12em) is a tool, not a template. It earns its place on verified badges, filter chip labels, and form fields. A heading that needs an eyebrow above it to make sense is a heading that needs to be rewritten — not a heading that needs more scaffolding.

## 4. Elevation

Blissify is flat by default. Cards have hairline borders (0.5px `#e8e3dc`), not shadows. Depth is conveyed through the chalk-to-white surface layering, not elevation. This flatness is a deliberate design signal: in a curated editorial context, shadows read as "software" rather than "publication."

The single earned exception is the sticky navigation, which morphs into a blurred backdrop-filter pill on scroll. This one floating element earns its treatment because it is persistent across the entire viewport session and needs to communicate "always available without claiming the page." It uses `backdrop-filter: blur(14px)` with an rgba chalk fill at 72% opacity and an 8px box-shadow for ambient separation. This is not permission to use shadows or glass anywhere else.

### Shadow Vocabulary
- **Scrolled navigation pill** (`0 8px 30px rgba(26, 46, 37, 0.08)`): Applied only to `.blnav-inner` when the nav has the `.is-scrolled` class. Ambient green-tinted shadow, soft and diffuse. No hard drop.

### Named Rules
**The One Elevation Rule.** Shadows exist in exactly one place: the scrolled navigation pill. Every other surface is flat. If a card needs a shadow to feel clickable, the interactive affordance is broken elsewhere (hover state, border darkening, or cursor cue) — fix that instead.

## 5. Components

### Buttons

Restrained and decisive. Buttons do not grow or lift on hover — color shifts only. No shadows, no transforms.

- **Shape:** Gently rounded (6px radius)
- **Height:** 44px standard; 36px small (`--bl-btn--sm`); 52px large (`--bl-btn--lg`)
- **Primary:** Deep Verified Forest background (`#1a2e25`), chalk text. Hover darkens to `#14241d`. Used for the single primary action per screen.
- **Accent:** Certification Terracotta background (`#c4795a`), white text. Hover to `#b56a4c`. Used when Blissify is making a verification-adjacent action ("Start gratis proefperiode", "Vraag info aan"). Never for generic CTAs.
- **Ghost:** Transparent fill, forest border (1px), forest text. Hover adds a 4% forest fill. Used for secondary actions alongside a primary.
- **Ghost Dark:** Same as ghost but chalk border (40% opacity) and chalk text — for use on forest-dark backgrounds.
- **Text Link (`.bl-textlink`):** Underline offset 3px, forest color, medium weight. Used inline in prose or as a tertiary action.
- **Disabled:** Fog background (`#e8e3dc`), ash text (`#8a8880`). No pointer events.
- **Transition:** `background-color`, `color`, `border-color` at 0.18s ease. No transforms.

### Cards / Containers

Flat, white, hairline-bordered. The card's job is to contain, not to float.

- **Corner Style:** Gently rounded (8px radius)
- **Background:** White (`#ffffff`) on chalk page — this contrast is the depth signal.
- **Shadow Strategy:** None (see Elevation). Border is the structural signal.
- **Border:** 0.5px solid Fog (`#e8e3dc`) at rest. Hover state darkens border to Stone (`#c9c4bc`) only — `transition: border-color 0.18s ease`. Nothing else changes.
- **Internal Padding:** 24px standard. The `.card-padding` token.
- **Dark Variant:** Forest background (`#1a2e25`), chalk text. Used for Why Blissify / trust-signal sections. No border.

### Course Card (Signature Component)

The marketplace's core unit. Forest image area (200px tall) with an overlaid category label in nano uppercase chalk. Below: Freight Display Pro title at 18px, provider + location in xs Acumin, price + format in a separated footer. Hover darkens border only — nothing moves. Image fallback is a solid forest rectangle, which reads cleanly when imagery is missing.

### Inputs / Fields

Functional, minimal. No design noise; the form's job is to be completed, not admired.

- **Style:** White fill, 0.5px Stone border (`#c9c4bc`), 6px radius, 44px height.
- **Focus:** Border shifts to Deep Verified Forest (`#1a2e25`). No glow, no ring. `transition: border-color 0.18s ease`.
- **Error:** Red border (`#9b1c1c`). Error message in Alert red below the field.
- **Placeholder:** Uses Ash (`#8a8880`). Must meet 4.5:1 contrast — verify when customizing.
- **Label:** Uppercase, 12px, +0.06em tracking, Ink color. Sits above the field, never floating inside.

### Tags / Filter Chips

Compact identification units. Pill-shaped, uppercase label type.

- **Default:** Fog background (`#e8e3dc`), Slate text. Uppercase 11px, +0.08em tracking, 20px pill radius, 5px×12px padding.
- **Active / Selected:** Forest background, chalk text. Same shape.
- **Filter Pill (active with dismiss):** Forest background, chalk text, with a small `×` icon button at right.
- **Status Pill:** Success/warning/error backgrounds with matching text colors. Same pill shape at 10px font size. For internal dashboard use.

### Navigation

The most structurally distinctive component. Two states:

- **At-rest:** Full-width chalk bar with a 0.5px Fog border-bottom. Wordmark in Freight Display Pro 23px. Nav links in 13px Acumin (400 weight), active link in 500. CTA button in the primary style at 40px height.
- **Scrolled (`.is-scrolled`):** Morphs to a contained pill (max-width 920px, 40px border-radius) with a chalk fill at 72% opacity and `backdrop-filter: blur(14px)`. An ambient green shadow (`0 8px 30px rgba(26,46,37,0.08)`) and a semi-transparent forest border (10% opacity). The pill contracts from the edges via padding change on the wrapper. `transition: all 0.25s ease` on all properties.
- **Mobile (≤780px):** Nav links hidden. Only wordmark and CTA button visible. Mobile menu not yet implemented.

## 6. Do's and Don'ts

### Do:
- **Do** use Freight Display Pro (400 weight, -0.01em tracking) for any heading that is announcing — course titles, section headers, page titles.
- **Do** let whitespace carry the curation signal. Generous section spacing (96px) and card padding (24px) communicate selectivity without a word.
- **Do** use border-darkening as the hover signal on cards and links. `border-color` from `#e8e3dc` to `#c9c4bc` is sufficient.
- **Do** reserve terracotta (`#c4795a`) for verified-provider contexts: the badge, the info-request CTA, and trust-signal links. Three contexts. No more.
- **Do** maintain the chalk (`#f5f0ea`) page background. White is for card surfaces only.
- **Do** keep label/eyebrow type (11px uppercase) for functional identification: badges, filter chips, form labels, metadata. Not for section headings.
- **Do** use `text-wrap: balance` on H1–H3 headings to prevent orphaned headline words.
- **Do** include a `prefers-reduced-motion` alternative for every transition. The nav scroll morphing and StatCounter animations both need reduced-motion versions.
- **Do** show price, duration, accreditation, and location on every course card. Hiding any of these breaks the core transparency promise.

### Don't:
- **Don't** use gradient text (`background-clip: text`). A verified editorial platform does not use typographic decoration. Single solid color only.
- **Don't** use lotus flowers, floating bubbles, soft pastels, or lavender gradients. This is explicitly not that kind of wellness brand. The anti-reference is real.
- **Don't** use generic SaaS startup templates — no hero-metric grids (big number, small label, gradient accent), no feature-bullet icon cards repeated identically, no "Stats that speak for themselves" sections.
- **Don't** use AI-generated landing page aesthetics: no tiny tracked uppercase eyebrows on every section, no 01/02/03 numbered section scaffolding, no cream-body-background with a purple CTA.
- **Don't** use pill-on-everything or soft drop-shadow UI. Buttons are 6px radius, not fully rounded pills. The pill is reserved for filter chips and tags.
- **Don't** add box-shadows to cards. The flat system is a deliberate editorial signal. If something needs a shadow to feel elevated, the elevation should come from the nav pill — nowhere else.
- **Don't** use Freight Display Pro for body copy or labels. It is a display face; it deteriorates below 20px.
- **Don't** use the terracotta accent to draw attention to a CTA that isn't verification-related. Using terracotta for a generic "Sign up" or "Learn more" dilutes the one place it carries meaning.
- **Don't** use side-stripe borders (a colored `border-left` wider than 1px on cards or callouts). Not in this system. Use a background tint or a full border instead.
- **Don't** remove pricing, accreditation, or location from any course-facing component. Transparency is a named design principle; any component that hides those fields violates it.

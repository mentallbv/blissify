# Blissify — Project Context Handoff

_Last updated: 2026-08-14_

---

## What Is Blissify

Belgian wellness-education marketplace (nl-BE). Trainers ("Opleiders") and Brands ("Merken & Leveranciers") pay a subscription to list on the platform. End users browse courses, opleiders, and merken.

**Live URL:** https://blissify.vercel.app  
**Repo path:** `/Users/mentall/Desktop/PROJECTS/BLISSIFY/app/blissify`  
**Admin:** `/admin` (Payload CMS)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 App Router |
| CMS | Payload CMS 3.85.1 |
| Database | Neon Postgres via `@neondatabase/serverless` (vercel-postgres adapter) |
| Storage | Vercel Blob |
| Auth | Payload JWT (cookie `payload-token`) |
| Payment | Mollie REST API (fetch-based, no SDK) |
| Email | Resend |
| CRM | Brevo |
| Leads/Registrations | Supabase PostgREST (fetch-based, no SDK) |
| Deployment | Vercel |

---

## Account Architecture

Two completely separate subscription ladders:

### Opleiders (role: `trainer`)
| Tier key | Label | Annual price |
|---|---|---|
| `basis` | Basis | €99 |
| `medium` | Medium | €249 |
| `premium` | Premium | €549 |

Field on User: `subscriptionTier`

### Merken & Leveranciers (role: `brand`)
| Tier key | Label | Annual price |
|---|---|---|
| `partner_listing` | Partner Listing | €490 |
| `partner_professional` | Partner Professional | €890 |
| `partner_premium` | Partner Premium | €1490 |

Field on User: `brandTier`

### Subscription status field (`subscriptionStatus`)
`active` | `pending_payment` | `inactive` | `canceled` | `past_due`

### Other subscription fields (all `saveToJWT: true`)
- `subscriptionBillingCycle`: `yearly` | `monthly`
- `subscriptionCommitment`: `annual` | `cancel_anytime`
- `subscriptionTrialEndsAt`: date
- `subscriptionMinimumEndsAt`: date (annual commitment block)
- `mollieCustomerId`, `mollieSubscriptionId`

---

## Key Files

### Payment / Mollie
- `src/lib/mollie.ts` — Mollie REST client (no SDK). Key functions:
  - `createCustomer`, `createFirstPayment`, `createSubscription`, `cancelSubscription`
  - `createFirstPayment` uses `sequenceType: 'first'` and charges **€0.02** when trial is enabled (mandate auth), full amount otherwise
  - `TIER_AMOUNT` / `BRAND_TIER_AMOUNT` — annual prices as strings
- `src/app/api/subscription/start/route.ts` — POST endpoint to initiate checkout
  - Validates role + tier ladder match
  - Reads `getPricingCatalog()` for billing config (trial, monthly markup, commitment)
  - Creates/reuses Mollie customer, persists `pending_payment`, creates first payment, returns `checkoutUrl`
  - `SITE_URL` for redirects = `process.env.NEXT_PUBLIC_SITE_URL || 'https://blissify.be'` — **must be set in Vercel env**
- `src/app/api/webhooks/mollie/route.ts` — POST webhook
  - Parses `id` (only `tr_`), fetches real payment from Mollie
  - On `paid`: sets `active`, creates recurring subscription with `startDate = nextChargeAt`
  - On `failed/expired/canceled`: sets `inactive`, emails admin
- `src/app/api/subscription/cancel/route.ts` — POST cancel
  - Blocks cancellation if `subscriptionCommitment === 'annual'` and `subscriptionMinimumEndsAt > now`
  - Otherwise cancels at Mollie, sets `canceled`, removes from Brevo

### Data / Config
- `src/lib/data.ts` — `getPricingCatalog()` reads Pricing global from Payload
- `src/lib/email.ts` — `SITE_URL`, Resend helpers
- `src/lib/brevo.ts` — `brevoAddContact`, `brevoRemoveFromList`
- `src/lib/supabase.ts` — `getRegistrationsForCourses`, `createRegistration`
- `src/lib/session.ts` — `getCurrentUser()`, `getCurrentProfile()`
- `src/lib/pricing.ts` — `monthlyPrice(annualPrice, markupPercent)`

### Globals (Payload)
- `src/globals/Pricing.ts` — Pricing tiers + billing config
  - Billing group: `trialEnabled`, `trialDays`, `monthlyEnabled`, `monthlyMarkupPercent`, `monthlyCommitment`
- `src/globals/SubscriptionSettings.ts` — `homepageOpleiderTiers`, `homepageBrandTiers`
- `src/globals/SiteSettings.ts` — site-wide config

### Collections
- `src/collections/Users.ts` — all subscription fields, `saveToJWT: true`
- `src/collections/Courses.ts` — `isBookable` flag (set by server from brand tier)
- `src/collections/Categories.ts`, `Locations.ts`, `Media.ts`, etc.

### Frontend pages
- `src/app/(frontend)/` — all public pages
- `src/app/(frontend)/dashboard/` — authenticated dashboard (opleider + brand)
  - `abonnement/page.tsx` — subscription management, CheckoutButton, CancelButton
  - `inschrijvingen/page.tsx` — registrations (brand only, professional+)
- `src/app/(frontend)/prijzen/` — public pricing page (redirects to `/prijzen/opleiders` by default)
- `src/app/(frontend)/opleidingen/` — course directory
- `src/app/(frontend)/opleiders/` — trainer directory
- `src/app/(frontend)/merken/` — brands directory (Envato-style filter bar, URL-driven)

### Components
- `src/components/onboarding/OnboardingFlow.tsx` — multi-step onboarding (tier selection → checkout)
- `src/components/site/SearchCard.tsx` — hero search (scope: courses/opleiders/merken)
- `src/components/ui/` — Button, ButtonLink, Input, Select, FormErrorCard, etc.

---

## Vercel Environment Variables Required

| Variable | Value |
|---|---|
| `MOLLIE_API_KEY` | `test_…` (confirmed working — customer creation succeeds) |
| `MOLLIE_WEBHOOK_URL` | `https://blissify.vercel.app/api/webhooks/mollie` |
| `NEXT_PUBLIC_SITE_URL` | `https://blissify.vercel.app` |
| `DATABASE_URL` | Neon pooled connection |
| `DATABASE_URL_UNPOOLED` | Neon direct connection (for migrations) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role |
| `RESEND_API_KEY` | Resend |
| `BREVO_API_KEY` | Brevo |
| `BREVO_LIST_ID` | Brevo list |
| `ADMIN_EMAIL` | Admin notification email |
| `PAYLOAD_SECRET` | Payload JWT secret |

---

## Current Status: Mollie Payment

### What works
- `MOLLIE_API_KEY` is set and valid — Mollie customer `cst_tmVrHDpV2N` was created successfully
- Registration flow works (409 errors on re-registration are expected, not a bug)
- Onboarding reaches tier selection and calls `/api/subscription/start`

### Proven working (13/8/2026, test mode)
A full checkout completed end-to-end on profile `pfl_TMZpyyRkop`:
- Payment `tr_xr2Ef9kL2J4KCU94gfKVJ` — paid, €0.02, Mastercard, `sequenceType: first`
- Mandate `mdt_hTbLGXU8sK` — valid
- Subscription `sub_jUJij5RdsH` — active, €549.00, 12 months, next charge **20/8/2026**

So the code path works. (That subscription is leftover test data and will really charge — cancel it in the dashboard if unwanted.)

### Current error
```
Mollie 422 /customers/<id>/payments:
{"status":422,"title":"Unprocessable Entity","detail":"No suitable payment methods found"}
```

### Root cause — verified via the /methods API
Not the trial, and not the amount. Querying `/methods` on the profile:

| Query | Result |
|---|---|
| no sequenceType, any amount | `banktransfer, bancontact, kbc, belfius` |
| `sequenceType=oneoff` | `banktransfer, bancontact, kbc, belfius` |
| **`sequenceType=first`** (what checkout uses) | **none, at every amount incl. €0.02** |
| `sequenceType=recurring` | `creditcard` |

From `/methods/all`: **`creditcard` status = `rejected`** (it worked at 10:30 that morning, so Mollie declined the application afterwards), and **`directdebit` is not activated**. Credit card was the only mandate-capable method enabled. Bancontact/KBC/Belfius can create a mandate, but only when SEPA Direct Debit is enabled on the account.

### Fix (Mollie dashboard — not code)
1. Settings → Payment methods → enable **SEPA Direct Debit**. This alone makes Bancontact valid for `first` payments.
2. Chase the **rejected credit card** application (usually blocked on company details / bank account / ID verification).

### Test cards (once a method is available)
- Visa paid: `4242 4242 4242 4242`, any future expiry, any CVC
- Mastercard paid: `5555 5555 5555 4444`
- Visa declined: `4000 0000 0000 0002`

### Diagnosing this again
`MOLLIE_API_KEY` in `.env` is an OAuth `access_` token and works with curl:
```bash
curl -s -H "Authorization: Bearer $KEY" \
  "https://api.mollie.com/v2/methods/all?testmode=true&profileId=pfl_TMZpyyRkop"
```

---

## Open Decisions — need an answer before the work can start

These are business decisions, not technical unknowns. Nothing here is blocked on
code; each one blocks code.

### 1. Are the listed prices incl. or excl. BTW? ⚠️ blocks invoicing
`TIER_AMOUNT` in `src/lib/mollie.ts` charges a flat €99 / €249 / €549, and no
page states VAT either way.
- If **inclusive**: real revenue on Basis is €81.82, €17.18 is BTW. Margins are
  21% below what the tier table suggests.
- If **exclusive** (the B2B norm): Mollie should charge €119.79, not €99.00 —
  every payment taken so far has under-collected, and no invoice can reconcile
  against the Mollie amount.

The invoice total must match the Mollie payment to the cent, so this has to be
settled before any invoicing is built. Belgian B2B convention is to advertise
excl. btw with "excl. btw" stated next to the price.

### 2. Refunds and credit notes
Does anyone ever get money back — cancelling mid-year on an annual commitment, a
disputed trial conversion? If yes, credit notes are needed, which is the part
self-hosted invoicing most often gets wrong.

### 3. Selling outside Belgium?
Belgian customer → 21% BTW. EU business elsewhere with a valid VAT number → 0%
under reverse charge, but only with VIES validation and the reverse-charge
mention on the invoice. Belgium-only makes this much simpler.

### 4. Which invoicing provider
Leaning **Billit** (strongest standalone Belgian API, native Peppol). Teamleader
Focus only makes sense if the CRM is also wanted. **Ask the accountant what they
already use** — matching their system removes a monthly reconciliation chore.

### Invoicing background (researched 14/8/2026)
- **Mollie cannot do this.** Mollie has no customer-invoicing feature; its
  Invoices API is Mollie billing *you* for their fees, and is read-only. No
  dashboard setting will produce an invoice for a subscriber.
- Customers are businesses, so these are **B2B invoices**. Belgium's structured
  e-invoicing mandate (Peppol BIS) for domestic B2B took effect 1 January 2026 —
  **confirm scope with the accountant**; if it applies, a PDF by email is not
  compliant on its own.
- Legal requirements either way: sequential numbering, 21% BTW, both VAT
  numbers, reverse-charge wording where relevant, 7-year retention.

### Prerequisites once decided
- Users collect **no VAT number and no billing address** today. A B2B invoice
  cannot be issued without both.
- The trigger is `payment.paid` in `src/app/api/webhooks/mollie/route.ts`. It
  must be **idempotent** (Mollie retries webhooks; a duplicate would burn an
  invoice number) and must handle **recurring** charges, not just the first
  payment — that branch currently only special-cases `sequenceType === 'first'`,
  so the €549 renewal would go uninvoiced.

---

## Pending / Known Gaps

1. **Mollie payment methods** — see above; no mandate-capable method is enabled, so checkout 422s. Blocks all payment testing.
2. **Stuck `pending_payment` account** — an account shows `pending_payment` while its `subscriptionExpiresAt` (20/8/2027) proves the webhook ran and set it active. Cause is fixed (see below), but that row still needs correcting by hand. **Unresolved:** no user in the DB that local `.env` points at (`ep-tiny-mud-ahqckeif`) has any `mollie_customer_id` — either Vercel targets a different database, or the production seed wiped user 55. Needs the account's email to trace.
3. **`/prijzen` monthly/annual toggle** — public pricing page has no billing cycle toggle (only dashboard + onboarding do)
4. **Brands trial logic** — `start` route applies `trialEnabled` from billing config to brands too; spec says brands should be annual-only, no trial. Needs a role check in `start/route.ts`
5. **Supabase `registrations` table DDL** — needs to be run in production Supabase for in-platform registrations to work
6. **Production seed data** — live site still shows 20 opleidingen / 11 opleiders / 5 Merken (test seed not yet run against prod DB)
7. **Testing requires deploying to main** — Mollie rejects localhost redirect/webhook URLs, and a Vercel preview URL doesn't work either because `MOLLIE_WEBHOOK_URL` points at production, so the webhook lands on the wrong deployment.

---

## Shipped 14/8/2026

- **`c35e773`** — trial can be cancelled. The annual-commitment block in
  `cancel/route.ts` rejected *every* annual signup including trials, so trial
  users could never cancel. Now skipped while `subscriptionTrialEndsAt` is in the
  future, and the commitment date is cleared. UI shows the trial end date and a
  "Proefperiode stoppen" button.
- **`c35e773`** — the subscription write in `start/route.ts` moved to *after*
  Mollie accepts the payment. A failed checkout used to leave the account on
  `pending_payment` (that's gap 2 above), and an abandoned upgrade granted the
  new tier before it was paid for. `subscriptionMinimumEndsAt` now travels in
  payment metadata so the webhook sets it on the tier-change path.
- **`2f3b174`** — payment method picker. New `GET /api/subscription/methods`,
  `PaymentMethodPicker`, wired into both the dashboard and onboarding. Appears
  only after a tier is chosen and only when ≥2 methods exist. `resolvePlan()`
  extracted to `src/lib/subscription-plan.ts` so pricing can't drift between
  the two routes.
- **`2f3b174`** — `start/route.ts` no longer returns raw Mollie errors (they
  carry internal customer ids) to the browser. Missing methods → 503 with a
  Dutch message; everything else → generic 500. Detail logged server-side.

---

## Design System

The design system is defined in CSS custom properties in `src/app/(frontend)/globals.css`. Key tokens:

- Fonts: `--font-display` (Canela), `--font-ui` (Inter)
- Colors: `--text-brand`, `--text-body`, `--text-meta`, `--text-accent`, `--text-strong`
- Surfaces: `--surface-page`, `--surface-card`, `--surface-dark`
- Border: `--border-hairline`
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`
- Brand color: `--blissify-forest` (green), `--blissify-chalk` (off-white)

All components use inline styles with CSS variables — no Tailwind, no CSS modules.

---

## How to Continue

When starting a new chat, paste this file or reference it with:

> "Continue building Blissify. Context is in `BLISSIFY_CONTEXT.md` in the project root. The project instructions are in `CLAUDE.md`. Start by reading both."

Then describe the specific task you want to work on next.

# Blissify 2.0 implementation progress

Last updated: 24 August 2026

## Purpose

This file is the implementation handover and recovery note for the client requirements in `Blissify 2.0.pdf`. It records what has been confirmed, what has been changed, what remains, and which assumptions were made. Update this file after every completed implementation batch.

## Current status

- The complete 17-page PDF has been extracted and visually inspected.
- The new plans, prices, entitlements, filters, and subscription rules have been identified.
- The existing project architecture and relevant files have been mapped.
- Pricing and entitlement foundation implemented locally.
- Core implementation is complete locally. Verification is complete except for the database-dependent suite and the existing production-build hang.
- Changes will be developed and verified locally first. Do not deploy or seed production without a separate instruction from the project owner.

## Decisions and assumptions

### Stable internal tier identifiers

To preserve current database records and avoid a destructive enum migration, existing internal tier identifiers will remain stable while all client-facing labels and entitlements change:

| Existing internal value | New public plan name |
|---|---|
| `basis` | Opleider Lite |
| `medium` | Opleider Premium |
| `premium` | Opleider Ultimate |
| `partner_listing` | Partner Lite |
| `partner_professional` | Partner Premium |
| `partner_premium` | Partner Ultimate |

### Partner category-limit conflict

The PDF contains two different limits:

- Main comparison table: 1 / 3 / unlimited
- Later descriptive text: 2 / 5 / 10

The main comparison table is treated as authoritative, so the implementation target is **1 / 3 / unlimited** unless the client confirms otherwise.

### Prices and VAT

All prices in the PDF are explicitly excluding VAT. The UI must state this clearly. The exact tax calculation and invoicing behavior must be checked while implementing Mollie because cross-border B2B VAT handling cannot safely be inferred from the PDF alone.

## Confirmed new pricing

### Opleiders

| Plan | Monthly | Annual | Active courses |
|---|---:|---:|---:|
| Opleider Lite | €15 | €150 | 1 |
| Opleider Premium | €49 | €490 | 5 |
| Opleider Ultimate | €97 | €970 | Unlimited |

- Monthly subscriptions may be cancelled for the next monthly renewal.
- Annual subscriptions are prepaid and include two free months.
- All plans renew automatically until renewal is cancelled.

### Partners

| Plan | Annual | Categories | Active courses |
|---|---:|---:|---:|
| Partner Lite | €490 | 1 | 0 |
| Partner Premium | €890 | 3 | 5 |
| Partner Ultimate | €1,490 | Unlimited | Unlimited |

- Partner subscriptions are annual-only and prepaid.
- All plans renew automatically until renewal is cancelled.

## Confirmed entitlement changes

### Opleiders

- Lite: professional profile, course page, searchable profile, one active course, no statistics.
- Premium: up to five active courses and basic statistics.
- Ultimate: unlimited courses, advanced per-course analytics, course comparison, trends, CTR, priority ranking, rotating homepage exposure, own branding, and Ultimate badge.

### Partners

- Lite: brand page and searchable profile; no course pages or statistics.
- Premium: up to five active courses and basic statistics.
- Ultimate: unlimited courses, advanced analytics, exclusive/priority visibility, rotating homepage exposure, product-launch highlighting, own branding, Ultimate badge, and co-branded courses.

## Subscription lifecycle requirements

- There is no free trial.
- A VAT number and/or Chamber of Commerce number is mandatory during purchase.
- The buyer must confirm: “Ik handel in het kader van mijn beroeps- of bedrijfsactiviteit”.
- Upgrade: effective immediately, unused subscription value is credited pro rata, the difference is charged, and a new subscription period starts immediately.
- Downgrade: scheduled for the next renewal while current benefits remain active.
- Before a downgrade, excess courses should be deactivated by the user. If not, the oldest excess courses are automatically deactivated at renewal.
- Cancellation stops only the next renewal. It does not refund the active paid period.
- Confirmation email must be sent after cancellation, upgrade, or downgrade and must state the exact effective/end date.
- After expiry, paid public visibility is removed.
- Account and reusable profile data are retained for 12 months after inactivity.
- After 12 months, the inactive account is deleted, except legally required invoice/administrative records, generally retained for seven years.

## Filter and taxonomy work required

### Partner directory

- Extend product-type taxonomy to the full 16-category list in the PDF.
- Enforce subscription-based category limits.
- Add/confirm filters for partner type, origin, positioning, values, courses, new partners, and top-rated partners.
- Show result counts and use collapsible filter groups.

### Course directory

- Replace/extend course taxonomy with all 13 category groups and their subcategories.
- Add/confirm provider-type, level, format, focus, certification, location, new, trending, free, and price-range filters.
- Use collapsible filter groups.

## Implementation checklist

### 1. Tier and pricing foundation

- [x] Update public labels for all six plans.
- [x] Update fallback prices and Payload Pricing global defaults.
- [x] Mark prices as excluding VAT in the pricing UI.
- [x] Remove all free-trial behavior from pricing resolution and copy.
- [x] Make Partner plans annual-only.
- [x] Apply the exact annual and monthly prices representing two free annual months.
- [x] Update default homepage eligibility and ranking rules.

### 2. Entitlements

- [x] Update course limits for every Opleider plan.
- [x] Update category and course entitlement values for every Partner plan.
- [x] Update basic versus advanced analytics permissions at the entitlement layer.
- [x] Restrict priority, homepage rotation, branding, badge, launch highlighting, and co-branding to Ultimate at the entitlement layer.
- [x] Apply the same rules in frontend rendering, dashboard controls, API routes, Payload hooks, and seed data.

### 3. Database and CMS

- [x] Add required billing/company fields.
- [x] Add fields for pending plan/cycle changes and their effective date.
- [x] Add cancellation/renewal timestamps needed by the lifecycle.
- [x] Extend Partner product taxonomy.
- [x] Extend course categories/subcategories and filter fields.
- [x] Create and register a safe Payload/Postgres migration.
- [x] Regenerate `src/payload-types.ts` without losing existing local changes.

### 4. Mollie and subscription flows

- [x] Update Mollie amounts and plan metadata.
- [x] Collect professional-purchase confirmation and company registration data.
- [x] Implement immediate prorated upgrades.
- [x] Implement renewal-time downgrades.
- [x] Change cancellation to stop renewal rather than entitlement immediately.
- [x] Process expired subscriptions and excess-course deactivation safely.
- [x] Send lifecycle confirmation emails with exact dates.
- [ ] Confirm VAT/tax and invoice behavior before any live payment launch.

### 5. Pricing and account UI

- [x] Update the Opleider pricing page and homepage pricing block.
- [x] Update the Partner pricing page.
- [x] Update onboarding and checkout summaries.
- [x] Update subscription dashboard actions and status explanations.
- [x] Clearly communicate monthly versus annual commitments.
- [x] Clearly communicate upgrade, downgrade, cancellation, and no-refund rules.

### 6. Filters and directories

- [x] Implement complete Partner filter taxonomy.
- [x] Implement complete hierarchical course taxonomy in the seed dataset.
- [x] Add counts and collapsible filter groups.
- [x] Extend query parsing and database filtering for the new fields.

### 7. Seed and documentation

- [x] Update all seeded plans, prices, users, courses, brands, and subscription settings.
- [x] Ensure seeded records exercise every plan and entitlement.
- [ ] Update project context and client-feedback tracker where relevant.
- [ ] Document stable internal identifiers versus public plan names.

### 8. Verification

- [x] Run migrations against an isolated local/preview database (`local-development`).
- [x] Run the destructive seed against the isolated development database and separate public development Blob store.
- [x] Run `tsc --noEmit`.
- [x] Run targeted PDF pricing and entitlement tests (3/3 pass).
- [ ] Run the database integration suite after migrating a safe non-production database.
- [x] Investigate the production build: Turbopack hangs under Node 20 and 24; webpack fallback fails in the existing Payload/Vercel Blob client import path.
- [ ] Test responsive pricing, onboarding, dashboard, directory, and detail pages.
- [ ] Test Mollie end-to-end with a test API key before using a live key.
- [ ] Review the final diff and confirm no unrelated local work was overwritten.

## External decisions or integrations still required

- Confirm the intended Partner category limits if the client wants the descriptive values (2 / 5 / 10) instead of the comparison-table values (1 / 3 / unlimited).
- Confirm VAT rules for Belgian, Dutch, and other EU professional buyers, including reverse-charge handling and VAT-number validation.
- Confirm how Plug&Pay invoicing should be connected, including API/webhook credentials and responsibility for invoice creation.
- Confirm the exact retention/deletion process before enabling automated permanent deletion in production.

## Files expected to be involved

- `src/lib/tier-features.ts`
- `src/lib/pricing.ts`
- `src/lib/mollie.ts`
- `src/lib/merken-filters.ts`
- `src/lib/filters.ts`
- `src/lib/data.ts`
- `src/globals/Pricing.ts`
- `src/globals/SubscriptionSettings.ts`
- `src/collections/Users.ts`
- `src/collections/Courses.ts`
- `src/collections/Brands.ts`
- `src/collections/Trainers.ts`
- `src/components/site/PricingPlans.tsx`
- `src/components/site/FilterSidebar.tsx`
- `src/components/site/MerkenFilterBar.tsx`
- `src/components/onboarding/OnboardingFlow.tsx`
- `src/components/dashboard/SubscriptionActions.tsx`
- `src/app/(frontend)/dashboard/abonnement/page.tsx`
- `src/app/api/subscription/start/route.ts`
- `src/app/api/subscription/cancel/route.ts`
- `src/app/api/webhooks/mollie/route.ts`
- `src/app/api/cron/subscriptions/route.ts`
- `src/seed.ts`
- `src/migrations/`
- `src/payload-types.ts`

## Worktree safety note

The repository already contains local changes and untracked project notes. They belong to the project owner and must be preserved. Do not reset, discard, or overwrite them while implementing Blissify 2.0.

## Implementation log

### 24 August 2026 — pricing and entitlement foundation

- Retained legacy internal tier keys as stable database identifiers.
- Changed all public plan labels to Opleider/Partner Lite, Premium, and Ultimate.
- Applied Opleider prices €15/€150, €49/€490, and €97/€970.
- Applied Partner annual prices €490, €890, and €1,490.
- Disabled trials regardless of stale CMS values.
- Made Partner monthly checkout invalid.
- Updated course, category, analytics, branding, ranking, homepage, badge, launch, and co-brand entitlements.
- Ran `npx tsc --noEmit`: clean after this batch.

### 24 August 2026 — subscription, schema, taxonomy and verification

- Added professional buyer declaration, VAT/KvK or enterprise number, and billing country fields.
- Added subscription start, cancellation, pending downgrade, effective-date, and inactivity timestamps.
- Implemented immediate upgrades with unused-period pro-rata credit and a new subscription period.
- Implemented downgrades at renewal, including Mollie next-charge updates and oldest-course deactivation when limits are exceeded.
- Changed cancellation to stop only automatic renewal while preserving the paid period.
- Added activation, cancellation, upgrade, and downgrade confirmation emails with effective dates.
- Added all 16 Partner product categories and server-side 1/3/unlimited category enforcement.
- Added all 13 PDF course category groups and subcategories to the seed dataset.
- Added complete certification types, top-rated Partner filtering, and multi-value philosophy filtering.
- Generated and registered `20260824_124554_blissify_2` migration and regenerated Payload types.
- Added `jsdom`, repaired the existing test import, and added three focused Blissify 2.0 tests; all three pass.
- Confirmed homepage, pricing pages, directories, and registration returned HTTP 200 during local route checks.
- Confirmed `npx tsc --noEmit` is clean after the complete batch.
- Full database test is blocked until a safe non-production DB receives the migration; current local env resolves to `ep-tiny-mud-ahqckeif.c-3.us-east-1.aws.neon.tech/neondb`, previously identified as production.
- Turbopack production build still hangs. Webpack fallback exposes an existing client/server bundling problem in the Payload Vercel Blob upload handler.
- Production dependency audit reports 10 high and 6 moderate vulnerabilities; no automatic or breaking upgrades were applied as part of this PDF implementation.

### 25 August 2026 — isolated development environment

- Created and verified a dedicated Neon `local-development` branch with a unique writable endpoint.
- Applied all pending migrations, including `20260824_124554_blissify_2`.
- Created a separate public Vercel Blob store for development media.
- Updated the seed command to load `.env.local` only, preventing accidental production database use.
- Completed the full Blissify 2.0 seed successfully, including tier test accounts and media uploads.

### 27 August 2026 — authenticated tier verification

- Verified Opleider Lite, Premium, and Ultimate dashboard access against seeded accounts.
- Added frontend course-limit states so users cannot open the creation form after reaching their tier limit.
- Added a distinct Ultimate advanced-analytics section with course comparison, CTR, and trend columns.
- Verified Partner Lite and Premium publishing and analytics restrictions.
- Added Partner Ultimate product-launch highlighting and co-branding fields, dashboard controls, server-side entitlement enforcement, public course-detail rendering, Payload types, and migration `20260826_partner_ultimate_course_features`.
- Confirmed TypeScript is clean and all four integration tests pass.

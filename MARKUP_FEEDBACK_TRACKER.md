# Blissify — Client Markup Feedback Tracker

Source: [Client Markup board](https://app.markup.io/markup/b75e5bd3-a178-4b2c-9645-f1a6321776f5?view_mode=Desktop)  
Reviewed: 14 August 2026  
Board state at review: 23 active comments, 0 marked resolved.

This tracker maps each annotation to the current implementation. “Implemented” means the relevant CMS fields, frontend and/or tier logic are in the codebase; it is not a replacement for a final user-acceptance test.

## Status key

- **Implemented** — built in the current codebase.
- **Partial / verify** — a substantial part is built, but the full client request or its exact behaviour still needs a decision or test.
- **Deferred** — intentionally not included in the current scope.

## Homepage and global feedback

| Markup comment | Client request | Status | Current implementation / remaining work |
| --- | --- | --- | --- |
| #3 | Add a separate **Merken & Leveranciers** account type and its three annual plans. | **Implemented** | Brand users, `partner_listing`, `partner_professional`, and `partner_premium` tiers, their prices, publishing limits, visibility and registration permissions are implemented. |
| #4 | Allow monthly payment and a free trial. | **Implemented** | CMS-controlled 7-day trial, monthly option, 10% monthly uplift and annual/cancel-anytime commitment setting are implemented. Mollie checkout still needs end-to-end testing locally. |
| #5 | Confirm the option for monthly payment and a free trial. | **Implemented** | Same implementation as #4. |
| #6 | Consider paid visibility add-ons (homepage course, category top position, featured badge). | **Deferred** | Not implemented. The original comment itself suggested this may be too complex for now. Current featured exposure remains governed by tier eligibility. |
| #7 | Rename “Merken” to **Merken & Leveranciers**, including partners, wholesalers and suppliers. | **Implemented** | Navigation, directories, registration and pricing use “Merken & Leveranciers”. |
| #8 | Add a second homepage search/discovery route for brands and suppliers, with product/category, partner type, origin, positioning, values and optional counts/collapsible filters. | **Partial / verify** | The full filter taxonomy and collapsible, counted filter bar are implemented on `/merken`. The homepage hero filters were intentionally left unchanged after they were approved; there is a brand CTA and brand directory route, rather than a second homepage search panel. |
| #9 | Add brands and suppliers wherever relevant. | **Implemented** | Brand/supplier account type, directory, profile, pricing, registration and homepage featured-course section are present. |
| #11 | Remove platform claims that providers/courses are verified, checked or recognised; visitors should judge using reviews and provider information. | **Partial / verify** | Platform-level verification language was removed from current homepage, directories and seeded CMS copy. Certificates are presented as provider information. Remaining wording should receive a final site-wide acceptance pass, especially after future CMS edits. |
| #17 | Add a CTA for brands/products: “Zet je Merk/product in de kijker”. | **Implemented** | Homepage has a brand CTA linking to brand registration. |
| #18 | Include information about the Merken & Leveranciers area. | **Implemented** | Dedicated brand directory, profiles, pricing, registration path and navigation are present. |
| #19 | Apply the Opleider pricing: Basis €99/year, Medium €249/year, Premium €549/year, with the listed tier features. | **Implemented** | Separate Opleider pricing page and homepage pricing tab use these values; course limits, search priority, branding, homepage exposure and analytics gates follow the tier rules. |
| #20 | Add Merken & Leveranciers to pricing. | **Implemented** | Separate `/prijzen/merken-leveranciers` page and pricing dropdown item are present. |
| #24 | Add featured education sections for both independent providers and brands/suppliers. | **Implemented** | Homepage has separate featured-brand-course and featured-opleider-course sections. Eligibility follows subscription settings/tier logic. |

## Brand and supplier directory

| Markup comment | Client request | Status | Current implementation / remaining work |
| --- | --- | --- | --- |
| #15 — `/merken` | Provide the same filter capability as on the homepage. | **Partial / verify** | `/merken` has the richer brand-specific, collapsible filter system; it is not a literal duplicate of the approved homepage hero filters. Validate desired UX with the client. |
| #12 — `/merken/[slug]` | Brand profile needs partner type, name, logo, banner, up to about five gallery images, description, site/socials, origin, local partners and email enquiry. | **Implemented** | Brands collection/profile includes type, logo, cover image, five-image gallery, description, website, Instagram/Facebook/TikTok, origin, local partners and email CTA. |

## Providers, course directory and course detail

| Markup comment | Client request | Status | Current implementation / remaining work |
| --- | --- | --- | --- |
| #16 — `/opleiders` | Do not use “verified”; show all providers with category, location and provider-type filters. | **Implemented** | Verification claim removed; directory copy and filters support category, location and independent/brand provider type. |
| #13 — `/opleidingen` | Show independent, product and equipment training together; distinguish types visually with badges. | **Implemented** | Unified course directory supports trainer and brand courses, with provider-type badges and palette-consistent styling. |
| #14 — `/opleidingen` | Provide the same filters as the homepage. | **Partial / verify** | Course directory has hierarchical category, provider type, audience, location, format and advanced filters. It goes beyond the frozen homepage hero filter UI; final filter parity should be confirmed with the client. |
| #1 — course detail | Provide full course information: image, description, format, language, location, dates/times, participants/private, model/lunch, level, contact/socials, reviews and related courses. | **Partial / verify** | CMS and course form support cover, description, format, language, location, dates/times, participants, model/lunch and level. Detail page includes practical information, provider contact/socials, verified-email review workflow and similar courses. Confirm any still-missing fields (for example a richer event/webinar format taxonomy or direct provider social data) against the final client expectation. |
| #21 — course detail | Offer multiple response templates for enquiries, as a Premium feature. | **Implemented** | Premium-gated response templates are stored per user and available in the dashboard leads flow. |

## Pricing and registration

| Markup comment | Client request | Status | Current implementation / remaining work |
| --- | --- | --- | --- |
| #10 — `/prijzen` | Add Merken & Leveranciers. | **Implemented** | Pricing menu has Opleiders and Merken & Leveranciers routes; homepage pricing can switch audience. |
| #22 — `/registreren` | Show subscription information during registration. | **Implemented** | Registration/onboarding has account-type and tier selection with pricing information before checkout. |
| #23 — `/registreren` | Brand/supplier is a distinct account; academies belong under trainer, with tier-based course volume. | **Implemented** | Registration separates trainer and brand accounts. Trainer tiers control course limits; brand tiers separately control visibility and course/registration features. |

## Important follow-up items outside the original visual comments

- **Mollie testing:** subscription code is built, but it has not completed an end-to-end local Mollie test (checkout, webhook, recurring subscription and cancellation).
- **Final acceptance test:** test the active Markup board items on desktop and mobile with non-seeded provider accounts before marking the board resolved.
- **CMS governance:** future editors must not reintroduce platform-level verification claims in FAQs, provider copy or page content.


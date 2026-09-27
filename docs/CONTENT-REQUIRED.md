# Content required from the owner

The site publishes only what the record supports. The items below are withheld or softened until the owner confirms them. Each item says what to supply and where it goes.

## Blocks a release build

| # | Item | Why it matters | Where |
|---|---|---|---|
| 1 | **Consent for four field photographs**: `field-enumerator`, `field-capi`, `field-capi-2`, `field-pilot` | They show identifiable survey respondents and enumerators and open the film's first beat. `npm run check:release` fails until each is `"consent": "clear"`. If consent cannot be recorded, replace them with photos that have consent. | `content/photos.json` |
| 2 | **Production domain** | Canonical URLs, sitemap, Open Graph and the API's same-origin check use it. Release verification rejects the `.example` placeholder. | `SITE_ORIGIN` env var (Vercel sets a fallback automatically) |

`training-hall` is also pending consent but is not used on the site.

## Withheld until confirmed

| # | Item | Current treatment |
|---|---|---|
| 3 | **Assignment dates that conflict between sources**: B2, B3, B4, B5, B7, B19, B27, B28 | Periods hidden; year ranges used only where they agree. Supply agreed start and end months. |
| 4 | **Periods for other assignments** (B29–B37) | Shown without dates. |
| 5 | **FSI lecture dating**: the banner reads October 2013; ADB's FSI technical assistance in the record is 2014–2015 | About timeline says "The dating of this role against the record is being confirmed." Confirm the role behind the 2013 workshop. |
| 6 | **Years of experience** | Resolved: owner stated 20 years (About, ledger A11). |
| 7 | **LinkedIn URL** | Not shown (`person.linkedin` is a placeholder in `portfolio.json`). |
| 8 | **Email on the professional domain** | The site shows the Gmail address from the record. |
| 9 | **Role at IP3 Consulting** | Not mentioned. |
| 10 | **Outcomes**: approvals, financing, adoption or policy change that followed an assignment, with a document to cite | None claimed. Scope figures are labelled "in scope — not an outcome". |
| 11 | **Testimonials** with written permission | None shown. |
| 12 | **Environmental and social valuation methods** actually used (e.g. which shadow prices or benefit-transfer approach) | Offered only as capabilities within the cost-benefit family, citing Jolshiri, off-grid appliances, BMDF and ESMAP. No named methods. |
| 13 | **Publications** (reports and briefs he authored or co-authored, with links) | Not listed. |
| 14 | **UNDP / UNESCO engagements** (in the IP3 profile only) | Excluded until the CV or a contract confirms them. |
| 15 | **ProposalDesk turnaround times** ("24–48 hours", "48-hour core turnaround", "3–5 days") | Carried over from the base site as the owner's own offer. Confirm they are current operating commitments. |

## Operations (not content)

- **Resend account**: verify the sending domain, then set `RESEND_API_KEY`, `ENQUIRY_TO` and `ENQUIRY_FROM`. Until then the form hands briefs to the visitor's email or WhatsApp.
- **Optional Cloudflare Turnstile**: set `TURNSTILE_SITE_KEY` (build) and `TURNSTILE_SECRET_KEY` (runtime).
- **Rate limiting** at the host before any paid campaign.

When an item is resolved, update the source file and run `npm run check`. For items 1 and 2, run `npm run check:release`.

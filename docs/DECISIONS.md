# Decisions — v2 ("Show your working")

Version 2.0.0-preview · 28 September 2026. Base: `website-source-export.zip` (commit `2f22f43`). v1 records are in `docs/v1/`.

Each entry says what was decided, why, and what it costs.

## Architecture

**D1. Keep the base's zero-dependency Node generator instead of the Astro build in MASTER-PROMPT.**
The brief was "use the attached one as a base". The base builds with Node built-ins only. It has no npm packages, needs no install step and runs on any host. Astro would add a toolchain, not a capability this site needs.
Cost: no component framework. Components are template functions in `build/components.mjs`.

**D2. Split the single `build.mjs` into modules.** The modules are `build/data.mjs`, `html.mjs`, `components.mjs`, `layout.mjs` and `pages/*.mjs`. `build.mjs` only orchestrates. CSS is split into ordered layers (`src/css/00–07`) and concatenated at build time. JS is native ES modules in `src/js/`, with no bundler.

**D3. Keep `content/portfolio.json` untouched.** It is the CV-derived record. Everything editorial is in `content/site.json`: rewrites, service families, pillar assessments and the figures used. Every claim there cites an `EVIDENCE-LEDGER.md` row.

**D4. One serverless function, written as a Web-standard handler.** `api/enquiry.js` exports `POST(request)`, which Vercel runs as-is. The same `handle(request, env)` can be mounted on Netlify, Cloudflare Workers or the local `server.mjs`.
The function has no SDKs: Resend and Turnstile are called with `fetch`. It stores nothing.
With no provider configured it answers `{fallback:true}`, and the page builds an email/WhatsApp brief instead.

## Design system

**D5. The concept is "Show your working": an appraisal laid out on a light table.** Photographs are prints: ink (dithered) until developed. Figures are spreadsheet cells with addresses, and a FormulaBar under the header shows the source of whatever is hovered or focused. Red markup is the reviewer's pen.
The goal is to avoid the generic "consultant with gradient and stock photo" look while staying truthful to how an appraisal economist actually works.

**D6. Ink twins at five widths.** `tools/build-media.py` makes 240–960px versions, with a dither cell of about width/140.
Why: one binary-dithered image downscaled by the browser produced moiré. Pre-rendering per width keeps the dots crisp.

**D7. Typefaces.** Anek Latin (condensed display, font-stretch 78–82%), Newsreader (reading serif) and Martian Mono (cells and sources). All are self-hosted variable WOFF2 under the OFL; licences are in `assets/fonts/`.

**D8. Square corners, no gradients as decoration, no glassmorphism, no stock imagery.** The only imagery is the owner's own photographs.

## Motion

**D9. Four motion tiers, set before first paint.** An inline script, hashed in the CSP, sets `html[data-motion]`:
- `webgl`: fine pointer, 4 GB or more of device memory, no data saver.
- `dom`: touch or low-memory devices.
- `lite`: Save-Data or a 2g connection.
- `static`: `prefers-reduced-motion`.

The `lite` check originally matched `3g`. It was narrowed to `2g`: desktop Chrome reports `3g` on ordinary connections, which had downgraded capable machines.

**D10. The film is progressive.** The HTML is a readable stack of seven beats in their final state. JS pins it only when the viewport is at least 960 × 620 and the tier is `webgl` or `dom`. That pin is one ScrollTrigger scrubbing one GSAP timeline labelled b1–b7.
If initialisation throws, `rollback()` restores the static stack, so a failure can never leave blank beats.
Keyboard focus into an off-stage beat jumps the scroll to it; nothing is hidden with `aria-hidden`.

**D11. WebGL is limited to one effect: the darkroom develop.** It uses one canvas per stage and draws only prints mid-develop (0 < p < 1), with a noise threshold and a red developer edge. The DOM owns p = 0 and p = 1.
If the context is lost, or WebGL2 is missing, a CSS clip-path wipe does the same job. The device-pixel ratio is capped at 1.75.

**D12. Beat 4's cash-flow sheet is labelled "ILLUSTRATIVE STRUCTURE — NOT CLIENT DATA".** It demonstrates discounting (NPV moves as r goes from 0 to 12%) without implying any client's numbers.

## Evidence and content

**D13. Evidence discipline is enforced by the build, not by memory.**
- Every `data-fx` ref must match a row on `/evidence/`. Computed grid cells use the `FIT!` sheet prefix, so they cannot collide with ledger addresses.
- `verify.mjs` fails on banned claims (MASTER-PROMPT §3.4), for example years of experience, "World Bank standards", summed scope figures, prices, CV personal data and named software.
- Scope figures are always labelled "in scope — not an outcome".

**D14. Consent gate.** `photo()` records any use of a photo whose consent is not `clear`. Preview builds warn; `--release` builds and `verify.mjs --release` fail.
Four field photos in beat 1 are pending: they show identifiable respondents and enumerators.

**D15. Current assignments list responsibilities, not outputs.** Case pages for `status: current` read "What the role covers" and carry a note that planned outputs are not claimed as complete.

**D16. The "Why it fits" section is a client-type × service-family grid built from the record.** It replaced a repeat of beat 7's pillar matrix.
It answers the brief's "diversified clients" point with counts, not adjectives. Every cell deep-links to the filtered work board.

## Hosting and operations

**D17. Headers from one definition.** `build.mjs` writes both `vercel.json` and `_headers` (Netlify/Cloudflare) from the same CSP and cache lists.
Only fonts and the vendored GSAP are cached as immutable. CSS, JS and media keep stable names, so they revalidate. The base marked all of `/assets/*` immutable for a year, which would have pinned stale CSS and JS after a redeploy.

**D18. Canonical origin.** The origin is `SITE_ORIGIN`, else Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, else a `.example` placeholder that release verification rejects.

**D19. The contact form works without JavaScript.** A plain form post to `/api/enquiry` is answered with a 303 redirect to `/contact/#sent` or `/contact/#direct`. CSS `:target` then shows the matching note.

**D20. `.openai/hosting.json` is kept as inert metadata.** Nothing reads it. The optional `document.modelContext` hook from v1 was not carried over.

## Known limits

- No real-device performance measurement or screen-reader pass has been done. Checks were run in desktop Chrome (1440 × 900), in headless Chrome at 1440 × 900 and 390 × 844, and with reduced-motion and dark themes.
- The Resend and Turnstile paths are tested against stubbed network responses, not live accounts.
- No analytics, CRM, lead storage or rate limiting. Add rate limiting at the host (for example Vercel Firewall) before any paid campaign.

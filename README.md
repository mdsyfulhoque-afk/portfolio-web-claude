# Syful Hoque — the economics behind the yes

Portfolio site for Mohammad Syful Hoque, development economist, Dhaka. Version 2 ("Show your working") is built on the base export of 28 September 2026.

It runs as a static site plus one optional serverless function. There are no npm dependencies and nothing is tied to an AI builder's platform. It deploys to Vercel as-is and to any static host with minor configuration.

## Commands

Requires Node.js 22.9 or newer (tested on 24.16.0).

```sh
npm run build          # dist/ from content + templates (preview build)
npm run check          # verify.mjs: routes, anchors, assets, JSON-LD, CSP, banned claims, ledger refs, budgets
npm run start          # http://127.0.0.1:4173 — serves dist/ and mounts /api/enquiry
npm run dev            # build + start
npm run build:release  # fails while any photo on the site lacks recorded consent
npm run check:release  # release build + release verification
```

`npm ci` installs nothing; the dependency graph is intentionally empty.

## What is where

```text
build.mjs              orchestrates the build; writes dist/, sitemap, robots, llms.txt, _headers, _redirects, vercel.json
build/data.mjs         loads content, builds the Evidence Ledger, consent tracking, canonical origin
build/components.mjs   print, plate, pack, matrix, pillars, exhibit, doors … (template functions)
build/layout.mjs       page shell, pre-paint motion-tier script (CSP-hashed), header, FormulaBar, footer
build/pages/*.mjs      home (hero, seven-beat film, fit grid), services, work, evidence, about, contact, ProposalDesk, insights
content/portfolio.json the CV-derived record — never edited by the redesign
content/site.json      editorial layer: service families, pillar assessments, sourced figures
content/photos.json    photo captions, frame numbers and consent status
src/css/00–07          fonts, tokens, base, chrome, components, home, pages, motion (concatenated in order)
src/js/site.js         theme, FormulaBar, doors, tabs, loupe, work board, contact form, film loader
src/js/film.js         the pinned film: one GSAP timeline, seven beats, rollback on failure
src/js/develop-gl.js   the WebGL2 "darkroom develop" shader
api/enquiry.js         POST /api/enquiry — Web-standard handler (Resend + optional Turnstile, or fallback)
assets/                fonts (+ OFL licences), vendored GSAP/ScrollTrigger, processed media, og.jpg
tools/                 optional authoring tools: media pipeline, map builder, OG-card capture
docs/                  DECISIONS.md, CONTENT-REQUIRED.md, DEPLOYMENT.md; docs/v1/ holds the base's records
```

## Before going live

Read `docs/CONTENT-REQUIRED.md`. Two items block a release build: consent for four field photographs, and the production domain. Deployment steps are in `docs/DEPLOYMENT.md`.

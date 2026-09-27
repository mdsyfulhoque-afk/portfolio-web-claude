# Release audit

Audit target: fresh `website-source-export.zip` generated 2026-09-28 from the current editable website project. The previous export was consulted only for its release-document format.

## Release gates

| Gate | Result | Evidence |
|---|---|---|
| Current source, not prior archive | PASS | Package assembled from current `build.mjs`, content, CSS, JS, assets, configuration and generated site in `syful-hoque-site`. |
| Complete editable project and generated site | PASS | Source, 45-route `dist/`, local assets, project notes, manifest, portability guide, README and this audit are included. |
| Dependency manifest and lockfile | PASS | `package.json` and npm lockfile v3 are included and match; npm dependency graph is intentionally empty. |
| Clean dependency install | PASS | `npm ci` completed successfully in a newly extracted clean folder using Node 24.16.0 / npm 11.16.0. |
| Build | PASS | `npm run build` completed in the clean extraction and generated the complete static site. |
| Project checks | PASS | `npm run check` passed after the clean build. |
| Routes, links, anchors and assets | PASS | Verifier reported 45 HTML pages, 1,194 local links and 136 local asset references with no unresolved route, anchor or asset. |
| Cinematic motion | PASS | Verifier found the 48 persistent fragments, six scene captions, GSAP/ScrollTrigger pinned scrub choreography, 3D transforms, scene rail and hero camera drift. |
| Accessibility fallbacks | PASS | Verifier confirmed static and reduced-motion paths, page landmarks, headings, and a fail-closed enquiry form; small-screen and no-script behavior are present in source. |
| Local dependency assets | PASS | GSAP, ScrollTrigger, fonts, licenses and artwork are packaged locally; no runtime CDN is needed for the site presentation. |
| Personal-machine path scan | PASS | Freshly extracted package source and generated output contain no references to the author's local drive paths or temporary workspace paths. |
| ChatGPT-only runtime requirement | PASS | Build and run use Node and browser standards only. `.openai/hosting.json` is inert metadata; guarded `document.modelContext` is optional and has a standard browser fallback. |
| Secret and build-folder exclusion | PASS | Archive contains `.env.example` only; no `.env`, credentials, `node_modules`, `.git`, prior archives or QA staging folders. |
| Local runtime smoke test | PASS | Clean-extraction preview served the home page, a work route, privacy route, locally hosted GSAP and ScrollTrigger with HTTP 200. |

## Known limitations

- `SITE_ORIGIN` is optional, build-time only; without an override, canonical metadata uses the current production site URL.
- The original hosted edition may have platform account access controls; the standalone package does not reproduce those controls.
- There is no backend, lead database, CRM, analytics, newsletter, payment or upload integration. The enquiry form prepares a visitor-reviewed email or WhatsApp handoff and does not claim to send or store it.
- The supplied source repository has no newer Git commit than `369656ad7764fbceaca20fb0a5d8e9983b1b9009`; the export captures the current working tree, including local package and documentation updates.

## Disposition

Release-ready portable editable static-site package. Clean extraction, dependency install, build, project checks, route and asset resolution, portability scan and local runtime smoke test passed before delivery.

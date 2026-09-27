# Syful Hoque — Evidence to Systems

Portable source export refreshed 28 September 2026 from the current editable website project.

This is the current standalone source project, not a scrape of the hosted pages and not a repackaging of an earlier export. It contains the source record, templates, styles, scripts, local assets and generated 45-route website.

## Requirements and commands

- Node.js 22.9 or newer (the current release audit used Node.js 24.16.0)
- npm 11.16.0 (current audit; no third-party npm packages are required)

```sh
npm ci
npm run build
npm run check
npm run start
```

Open `http://127.0.0.1:4173/`. `npm run dev` rebuilds and starts the local server. The generated `dist/` directory can also be deployed to a static host.

## Project map

- `build.mjs`: generates the site from the content record, templates and local resources.
- `content/portfolio.json`: editable structured portfolio source.
- `src/site.css` and `src/site.js`: responsive site design and browser behavior.
- `assets/`: self-hosted artwork, fonts, font licenses, GSAP and ScrollTrigger.
- `dist/`: generated site output, included for immediate review and deployment.
- `server.mjs` and `verify.mjs`: local preview server and route, asset, accessibility and cinematic-motion checks.
- `pod/`: evidence, asset, dependency, deployment and handoff notes.
- `vercel.json`: Vercel static deployment settings.

## Cinematic motion and accessibility

The homepage film pins during the scroll sequence. One persistent set of 48 fragments moves through six 3D arrangements, scene captions crossfade, the scene rail navigates the sequence, and the hero image has its own camera drift. GSAP and ScrollTrigger are bundled locally. Reduced-motion, small-screen and script-unavailable users receive the static presentation and ordinary page scrolling.

## Editing content

Edit `content/portfolio.json` and the relevant templates, styles or scripts, then run `npm run build` and `npm run check`. `prepare-fonts.mjs` is optional maintenance tooling; it is not needed to install, build, run or deploy the site.

## Environment

No environment variable is required. Optional build-time `SITE_ORIGIN` sets canonical, sitemap and structured-data URLs for a deployment domain. `.env.example` documents the value; there is no dotenv dependency and `.env` is not loaded automatically.

## Deploy

For Vercel, import the repository and use the included configuration: build command `npm run build`, output directory `dist`. For another static host, build and publish `dist/`. Set `SITE_ORIGIN` before the build when the deployed canonical domain differs from the default site URL.

The optional `.openai/hosting.json` is preserved as original hosting metadata; the standalone website does not read or require it. The guarded `document.modelContext` helper is an optional host integration; the visitor-operated enquiry flow works without it.

## Services and limitations

The project has no backend, database, analytics, CRM, email automation, payment or upload service. The enquiry form prepares a message for the visitor to review and hand off; it does not send or store a lead. The original hosted edition may have account-level access restrictions; this export runs independently on local Node or a conventional static host.

See `PORTABILITY.md`, `EXPORT_MANIFEST.md` and `RELEASE-AUDIT.md` for portability details, archive inventory and clean-extraction results.

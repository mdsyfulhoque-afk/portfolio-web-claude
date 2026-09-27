# Export manifest

- Archive filename: `website-source-export.zip`
- Export date: 2026-09-28
- Source of truth: current editable `syful-hoque-site` working tree, based on revision `369656ad7764fbceaca20fb0a5d8e9983b1b9009` with current local release-document and package metadata updates
- Package type: portable, editable Node.js static-site repository plus generated `dist/`
- Archive layout: project files at the ZIP root; only relative paths are used

## Included repository layout

```text
.
├── .env.example
├── .gitignore
├── .nvmrc
├── .openai/hosting.json              # inert source-host metadata; not a runtime requirement
├── EXPORT_MANIFEST.md
├── PORTABILITY.md
├── README.md
├── RELEASE-AUDIT.md
├── STRATEGY-LOCK.md
├── build.mjs
├── content/portfolio.json
├── package.json
├── package-lock.json
├── pod/                               # evidence, provenance, assets and handoff notes
├── prepare-fonts.mjs                  # optional maintenance script
├── server.mjs
├── src/site.css
├── src/site.js
├── vercel.json
├── verify.mjs
├── assets/                            # local fonts, licenses, artwork, GSAP and ScrollTrigger
└── dist/                              # generated 45-route static website
```

The ZIP's file listing is the exact inventory. `node_modules`, `.git`, nested exports, staging directories and intermediate `.7z`/`.tar.gz` archives are excluded.

## Runtime and package inventory

- Node.js >=22.9; `.nvmrc` specifies Node 22. The clean-extraction audit used Node.js 24.16.0.
- npm 11.16.0; npm lockfile version 3.
- Third-party npm dependencies: none. The browser-side GSAP and ScrollTrigger files are included locally in `assets/`.
- Environment: optional build-time `SITE_ORIGIN`; no secret values or runtime secrets.
- Required external services for rendering: none. Required fonts, images and animation libraries are local.

## Assets

`assets/` includes the locally served hero artwork, Fraunces, Inter and IBM Plex Mono WOFF2 files and their license files, plus `gsap.min.js` and `ScrollTrigger.min.js`. `pod/evidence-sculpture-source.png` records the original image source. Generated `dist/` contains the referenced styles, scripts, images, fonts, route HTML and metadata. Site icons and the concise profile text are generated locally.

## Portability boundary

The optional `.openai/hosting.json` is inert hosting metadata, not an application dependency. The optional `document.modelContext` hook is feature-detected and guarded; without a compatible host, the ordinary browser enquiry preparation still works. There are no ChatGPT-only APIs required to build or render the standalone site.

## Exclusions and limitations

Secrets, `.env`, `node_modules`, `.git`, local packaging/QA work folders, prior ZIPs and tarballs, and the redundant `assets.7z` are excluded. No credentials are required. The project has no server-side submission or lead-storage backend, CRM, analytics, newsletter, payment, or upload service; documentation does not claim these exist.

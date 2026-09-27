# Portability

This editable static-site project builds with Node.js built-in modules and runs independently of ChatGPT or the original Sites host. It requires no account session, database, API key or network download to render the website.

## Clean setup

Requirements: Node.js 22.9+ and npm 11.16.0. From the repository root:

```sh
npm ci
npm run build
npm run check
npm run start
```

Visit `http://127.0.0.1:4173/`. The npm dependency graph is intentionally empty, so `npm ci` installs no third-party packages. `npm run dev` rebuilds before starting the preview server.

## Hosting

Run `npm run build`, then publish `dist/` to a static host. The included `vercel.json` configures the build command and output directory. Set optional build-time `SITE_ORIGIN` to the public HTTPS origin if the production domain differs from the default. `.env.example` documents this setting; the project does not load `.env` automatically.

## Runtime assets and integrations

Images, fonts, font licenses, GSAP and ScrollTrigger are local under `assets/`; the browser does not download required application assets from a CDN. The optional `document.modelContext.registerTool` integration is guarded and only registers a helper if a compatible host provides that API. It does not submit or store an enquiry; the regular form works without it. `.openai/hosting.json` is retained only as inert metadata and is not read by the standalone application.

## Not included

There is no backend, database, secret, private API, analytics account, CRM, newsletter service, payment system, file upload service or server-side lead submission. The site prepares a visitor-reviewed enquiry handoff, not a booking or submission. The original hosted edition's access rules are outside this portable project.

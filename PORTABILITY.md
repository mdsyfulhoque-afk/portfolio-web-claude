# Portability

This project builds with Node.js built-in modules only and runs independently of any AI builder, account session or original host. No npm packages, database or network download are needed to build or render it.

## Clean setup

Requirements: Node.js 22.9+.

```sh
npm ci          # installs nothing: the dependency graph is empty
npm run build
npm run check
npm run start   # http://127.0.0.1:4173/
```

## What runs where

| Layer | Technology | Portable because |
|---|---|---|
| Build | `build.mjs` + `build/*.mjs`, Node built-ins | No toolchain, no install step |
| Pages | Static HTML in `dist/` | Any static host |
| Styles | One concatenated CSS file, self-hosted variable fonts | No CDN, no preprocessor |
| Behaviour | Native ES modules, vendored GSAP/ScrollTrigger, WebGL2 | No bundler. Every effect degrades to a readable static page |
| Enquiry | `api/enquiry.js`, a Web `Request → Response` handler | Runs on Vercel as-is and mounts on Netlify, Cloudflare or Node (see `docs/DEPLOYMENT.md`) |
| Headers | Generated `vercel.json` and `_headers` from one definition | Vercel, Netlify and Cloudflare read them natively |

## External services (all optional)

- Resend for sending briefs, and Cloudflare Turnstile for the spam check. Both are called with plain `fetch` and enabled by environment variables.
- Without them, the form hands a prepared brief to the visitor's own email or WhatsApp.

## Not included

There is no analytics, CRM, lead storage, newsletter, payment or file upload. `.openai/hosting.json` is inert metadata from the base export; nothing reads it.

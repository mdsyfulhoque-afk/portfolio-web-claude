# Escape Pod manifest

Version: 1.0.0 · Date: 16 September 2026

Change summary: replaces an environment-specific prototype with the complete portable production website, cinematic Decision Flow, evidence-qualified commercial pages and working enquiry preparation.

| Path | Purpose |
|---|---|
| `build.mjs` | Deterministic HTML page generator and qualified publication copy |
| `src/site.css` | Responsive editorial design and static/3D scene states |
| `src/site.js` | Navigation, filtering, enquiry preparation and cinematic timeline |
| `content/portfolio.json` | Preserved source record; not served publicly |
| `assets/` | Reproducible local hero and fonts |
| `dist/` | Complete deployable static website |
| `server.mjs` | Local static preview, loopback only |
| `verify.mjs` | Static link, asset, structure and safety checks |
| `prepare-fonts.mjs` | Optional font refresh; unnecessary to rebuild |
| `package.json` | Zero-dependency scripts and release version |
| `.openai/hosting.json` | Existing private Sites project binding |
| `STRATEGY-LOCK.md` | Current scope and 3D decision revision |
| `README.md` | Deterministic reconstruction instructions |
| `pod/*.md` | Decisions, evidence audit, dependencies, assets, deployment and handoff |
| `.env.example` | Documents that no runtime secret is required |

Reconstruct with Node 24.16.0: `node build.mjs`, `node verify.mjs`, `node server.mjs`. No npm install or database migration is required. All application assets are present. Public deployment archives contain only `dist` and its hosting metadata; the separate Escape Pod includes the full source without `.git`, temporary files or secrets.

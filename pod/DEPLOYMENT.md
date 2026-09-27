# Deployment and recovery

Version 1.0.0 · 16 September 2026

## Sites

Reuse the exact project binding in `.openai/hosting.json`. Build and verify, commit the complete source, push to the Sites-provided source branch with a short-lived per-command authentication header, package only the validated `dist` output with the Sites helper, save the exact pushed commit and archive, and deploy privately. Verify a terminal successful deployment before announcing availability.

The intended origin is `https://syful-hoque-evidence-systems.ip3.chatgpt.site`. The application does not widen audience access. Canonical URLs and the sitemap use this origin; update them if the production domain changes.

## Portable hosting

Serve `dist/` on any static host with directory-index support. Configure `404.html` as the custom error page. Apply the policies in `_headers` or the equivalent host configuration. No database, migration or server runtime is required for the deployed application.

## Rollback

Redeploy a previously saved, verified Sites version without changing audience access. To recover locally, check out the desired source tag, run `node build.mjs`, then `node verify.mjs`. Bundled assets make reconstruction independent of external font or image services.

## Before a public campaign

Confirm the intended public audience and domain, business contact ownership, operational service commitments and final offer terms. Reconcile dates if exact periods are needed. Browser QA and real device performance measurement should precede a major paid acquisition campaign. No advertising, analytics or payments are provisioned by this delivery.

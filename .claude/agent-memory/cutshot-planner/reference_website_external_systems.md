---
name: reference-website-external-systems
description: Where CutShot website things live outside the repo — installers on GitHub Releases, form submissions in the Netlify dashboard, hosting on Netlify
metadata:
  type: reference
---

- **Installers (.dmg / .exe, ~100 MB each)** live on **GitHub Releases**, never
  in `public/` and never in the Netlify bundle. Cutting a release = upload the
  binaries there, paste the URLs into `src/data/release.js`, redeploy.
- **Survey submissions** (the `/survey` page, which replaced the feedback form on
  2026-10-03) land in the **Netlify dashboard → Forms → `survey`**. That needs
  Netlify's form detection ON; it was off until then (`ignore_html_forms: true`),
  so the old `feedback` form never registered and never delivered anything.
  `netlify api listSiteForms` lists what is registered. There is no database.
- **Hosting/deploys:** Netlify with `@netlify/plugin-nextjs`. The only env var is
  `NEXT_PUBLIC_SITE_URL` (absolute OG URLs). Note the project has Vercel skills
  and MCP available in the environment — ignore them, this site is Netlify.

**How to apply:** when asked "where do I see the feedback" or "how do I ship a
new version", point at these, not at the repo. See
[[project-website-spec-is-closed]].

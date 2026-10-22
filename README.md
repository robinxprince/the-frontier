# THE FRONTIER

A public cross-disciplinary research publication, built as a static GitHub Pages site.

## Development

Node 24 or later. Run `npm ci --ignore-scripts`, `npm test`, and `npm run build`. Serve `dist` with a static server. Set `SITE_URL` to the deployment root when building; GitHub Actions supplies it automatically. No database, paid API or private runtime credential is needed.

## Content

- `content/editions/*.md`: permanent dated editions, with JSON front matter between `---` lines.
- `content/templates/daily.md`: daily edition format.
- `EDITORIAL.md`: research and learning preferences.
- `PUBLISHING.md`: verified-source and daily publishing runbook.
- `data/topics.json`: stable topic IDs.
- `data/learning.json`: verified lecture/course libraries.

Pages include archive search, static topic browsing, RSS, downloadable Markdown, sitemap, accessible navigation and mobile layouts. JavaScript is only needed for archive filtering. All content remains readable without it. Raw HTML and unsafe links in Markdown are neutralized.

## Deployment

`pages.yml` builds, tests and deploys pushes to main using GitHub Pages Actions. In repository Settings → Pages, use GitHub Actions. `daily.yml` checks publication status at 07:00 Asia/Kolkata. Research/writing runs in the existing desktop scheduled task and publishes using the owner's existing GitHub authorization; see the runbook for its availability limits. This intentionally replaces paid API research at the owner's request.

The initial evergreen guide is not a fabricated daily briefing. New verified daily editions will be archived as they are published. Preserve dated paths and use correction notes for substantive updates.

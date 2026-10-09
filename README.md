# Kun Qian — personal website

[English](https://sldyns.github.io/) · [中文](https://sldyns.github.io/zh/)

A bilingual personal website for research, publications, software, and side projects.
Built with HTML, CSS, and JavaScript, with no framework or third-party build dependencies.

## Source

- `site/`: homepage content and publication metadata in both languages.
- `scripts/build.mjs`: shared layouts, CV, software, metadata, sitemap, and redirects.
- `scripts/check.mjs`: page, link, locale, and content checks.
- `assets/`: styles, scripts, and favicon.
- `images/`: portrait, project screenshots, and credited paper figures.
- `.github/workflows/deploy.yml`: build, check, and publish to GitHub Pages.

## Build and preview

With Node.js 22 or later; no package installation is needed:

```sh
npm run build
npm run check
python -m http.server 4000 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:4000/`. Build output goes to the ignored `dist/` directory.
To disable indexing and analytics events during preview, build into a separate directory:

```sh
node scripts/build.mjs --preview --out /absolute/path/to/preview
node scripts/check.mjs --preview --out /absolute/path/to/preview
python -m http.server 4000 --bind 127.0.0.1 --directory /absolute/path/to/preview
```

English lives at `/`, Chinese at `/zh/`; each includes home, publications, software,
and CV pages. Content and navigation work without JavaScript. Language switches
preserve the page and section. Research illustrations use decorative synthetic
geometry and respect reduced-motion settings. GoatCounter supplies the existing
visitor and like counters; tracking requires the production hostname.

## Publish

Push source changes to `master`. GitHub Actions builds and checks the site, then
deploys only `dist/`. Generated HTML is not committed. The workflow can also be
run manually. GitHub Pages uses **GitHub Actions** as its publishing source.

Legacy `/about/`, `/about.html`, `/resume/`, and `/publications.html` addresses
redirect to the current pages.

## Credits and license

This repository previously contained AcademicPages history, derived from Minimal
Mistakes. Its Git history was restarted in October 2026 after a complete local
backup. The current website uses custom layouts and assets.

The inherited MIT copyright notice is preserved in `LICENSE`. Project screenshot
sources and paper figure licenses are documented in `images/projects/README.md`
and `images/research/README.md`. Those figures retain their respective licenses.

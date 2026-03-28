# Repository Guidelines

## Project Structure & Module Organization
This repository is a static multi-page site deployed from the project root. Page entry points live at the top level: `index.html`, `services.html`, `pricing.html`, `success-stories.html`, `about-us.html`, and `contact-us.html`. Shared styling is in `assets/css/styles.css`, and shared browser behavior is in `assets/js/main.js`. Store reusable images and site media under `static/` or `assets/`; keep the current logo path at `static/logo-placeholder.svg` unless you also update the HTML references.

## Build, Test, and Development Commands
There is no build step for production output.

- `python -m http.server 8080`
  Starts a simple local preview from the repository root.
- `npx wrangler pages dev .`
  Optional Cloudflare-style local preview when Wrangler is available.
- `git status`
  Check pending changes before opening a pull request.

## Coding Style & Naming Conventions
Use 2 spaces for HTML indentation and 2 spaces or the existing style in CSS/JS blocks; keep edits consistent within the file you touch. Prefer semantic HTML, kebab-case class names (`site-header`, `primary-nav`), and descriptive `js-` hooks for behavior targets (`js-hero`). In JavaScript, use `const` by default, guard DOM queries before attaching listeners, and keep shared logic in `assets/js/main.js` unless a page requires isolated behavior.

## Testing Guidelines
No automated test suite is configured yet. Before submitting changes, manually verify each affected page in a browser, confirm mobile navigation behavior, and check that links, forms, and section reveal animations still work. If you add JavaScript behavior, test at least one desktop and one narrow/mobile viewport.

## Commit & Pull Request Guidelines
Recent history uses short, imperative commit messages such as `Add Cloudflare Workers configuration` and `initial site.` Keep subject lines brief and specific. Pull requests should include a clear summary, affected pages/assets, manual test notes, and screenshots for visual changes. Link the related issue or task when available.

## Deployment & Configuration Notes
`wrangler.jsonc` points Cloudflare asset serving at the repository root. Keep the site deployable as plain static files: avoid introducing build-only dependencies unless the deployment workflow is updated at the same time.

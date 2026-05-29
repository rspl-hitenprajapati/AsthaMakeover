# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Astha Makeover and Academy is a static multi-page website for a beauty salon in Nadiad, Gujarat, India. It is deployed via Cloudflare Pages with no build step — files are served directly from the project root.

## Local Development

```powershell
# Simple local preview (from project root)
python -m http.server 8080
# Open http://localhost:8080/index.html
```

There is no build process, test suite, or linter. Manually verify affected pages in a browser before committing — check mobile navigation toggle, section reveal animations, links, and forms at both desktop and mobile viewports.

## Deployment

Cloudflare Pages serves assets directly from the repository root (`wrangler.jsonc` sets `assets.directory: "."`). Keep the site deployable as plain static files: do not introduce build-only dependencies unless the deployment workflow is updated simultaneously.

## Architecture

**Page entry points** at root: `index.html`, `services.html`, `pricing.html`, `success-stories.html`, `about-us.html`, `contact-us.html`. Each page follows the same structure: `<head>` with SEO/schema → sticky header → `<main id="main-content">` → mobile book bar (phones only) → footer.

**Shared resources:**
- `assets/css/styles.css` — all styling (~1800 lines). CSS custom properties define the design system (`--bg`, `--primary`, `--accent`, `--container`). Breakpoints: 960px (tablet), 760px (mobile).
- `assets/js/main.js` — shared behavior: mobile nav toggle, header scroll state (`.nav--solid`), footer year, Intersection Observer reveal animations (`.reveal` / `[data-motion="reveal"]`), parallax (`.js-parallax`), marquee clone.
- `static/logo.png` — brand logo referenced in all HTML files. The placeholder fallback is `static/logo-placeholder.svg`.

## Coding Conventions

- **HTML:** 2-space indentation, semantic elements, kebab-case class names (`site-header`, `primary-nav`), `js-` prefix for behavior targets (`js-hero`).
- **CSS:** 2-space indentation, extend existing custom properties rather than hardcoding colors or sizes.
- **JS:** `const` by default; guard DOM queries before attaching listeners; keep shared logic in `assets/js/main.js` — only add page-specific scripts inline when the behavior is isolated to one page.

## Commit Style

Short, imperative subject lines (e.g., `Add pricing section animation`, `Fix mobile nav on contact page`). Include affected pages, manual test notes, and screenshots in PR descriptions for visual changes.

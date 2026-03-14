# Astha Makeover and Academy Website

Static multi-page website built for Cloudflare Pages deployment.

## Pages

- `/index.html` (Home)
- `/services.html`
- `/pricing.html`
- `/success-stories.html`
- `/about-us.html`
- `/contact-us.html`

## Local Preview

Use any static server from project root, for example:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080/index.html`.

## Cloudflare Pages Deployment

- Framework preset: `None` (Static HTML)
- Build command: leave empty
- Build output directory: `/` (project root)

## Branding Assets

Temporary logo is at:

- `/static/logo-placeholder.svg`

Replace it with your final logo and keep the same file path, or update image references in the HTML files.

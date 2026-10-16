# Ludlam Point — website

A from-scratch redesign of [ludlampoint.com](https://www.ludlampoint.com): a cinematic, scroll-driven single page for Ludlam Point, 6880 SW 44th Street, Miami, FL 33155.

Static HTML, CSS and vanilla JavaScript. No build step and no dependencies.

## Run it

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Any static host works (GitHub Pages, Netlify, Vercel, S3). For GitHub Pages: **Settings → Pages → Deploy from branch → `main` / root**.

## Structure

| File | What it does |
|---|---|
| `index.html` | Page markup, SEO metadata, schema.org `ApartmentComplex` data |
| `assets/css/styles.css` | Design tokens, layout, scroll scenes, mobile art direction, reduced motion |
| `assets/js/data.js` | **All content**: floor plans, photos, amenities, links, hours, legal links |
| `assets/js/main.js` | Rendering and interactions: scroll scenes, plan filter and detail, gallery, lightbox, map, nav, mobile dock |

## Updating content

Edit `assets/js/data.js` only. All facts there were taken from the official site on Oct 16, 2026.

- **Prices** are a dated snapshot (`checkedOn`). Every plan links to its live page in the official leasing system for current pricing and availability. Set `showPriceSnapshot: false` to hide prices entirely.
- **Specials** show only between `special.starts` and `special.ends`, then hide automatically.
- **Photos**: the original files are in `assets/photos/`. The site loads WebP copies from `assets/img/` at 640, 1280 and 1920 px. After adding or replacing a photo, run `python3 scripts/build-images.py`. If a local copy is missing, that photo falls back to the property's Entrata media library. `scripts/download-photos.sh` re-downloads the originals from that library.

## Leasing actions

All CTAs use the official systems: Apply (Entrata application portal), Schedule a Tour (official contact / guest-card form), Check Availability (live plan pages), 360° tour (TourBuilder), Resident portal (Homebody), and Google Maps directions. The site does not collect form data itself, so it never shows a false confirmation.

## Accessibility and motion

Semantic landmarks, skip link, keyboard-operable dialogs, tabs and lightbox, visible focus states, and `prefers-reduced-motion` support (all scroll scenes rest in their final state). Mobile has its own layouts: swipeable community reel, per-scene amenity photos, full-screen plan sheet and a leasing dock that hides near the footer.

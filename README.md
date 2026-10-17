# Ludlam Point — website

A from-scratch redesign of [ludlampoint.com](https://www.ludlampoint.com): an editorial, cinematic site for Ludlam Point, 6880 SW 44th Street, Miami, FL 33155, built as an architectural film in eight scenes.

Static HTML, CSS and vanilla JavaScript. No build step to serve it and no runtime dependencies.

## Run it

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Any static host works. For GitHub Pages: **Settings → Pages → Deploy from branch → `main` / root**.

## Structure

| Path | What it is |
|---|---|
| `index.html` | Homepage: 01 Introduction · 02 Residences · 03 Inside Your Space · 04 Life at Ludlam Point · 05 The Miami Connection · 06 Find Your Residence · 07 Your Next Chapter · 08 Footer |
| `residences/<plan>.html` | One page per floor plan (Carlyle, Delano, Avalon, Beacon), generated from `data.js` |
| `assets/css/styles.css` | Design tokens, scenes, mobile art direction, reduced motion |
| `assets/js/data.js` | **All content**: plans, photos, amenities, links, hours, legal links |
| `assets/js/main.js` | Scroll choreography, residence index, filmstrip and lightbox, amenity sequence, plan table, map, nav, mobile dock |
| `assets/photos/` | Original property photos from the official site |
| `assets/img/<w>/` | WebP copies at 640, 1280 and 1920 px that the site loads |
| `scripts/` | `build-images.py` (photos → WebP), `build-residences.mjs` (plan pages), `download-photos.sh` (re-download originals) |

## Updating content

Edit `assets/js/data.js`, then run `node scripts/build-residences.mjs` so the plan pages match. All facts were taken from the official site on Oct 16, 2026.

- **Prices** are a dated snapshot (`checkedOn`). Every plan links to its live page in the official leasing system. Set `showPriceSnapshot: false` to hide prices.
- **Specials** show only between `special.starts` and `special.ends`.
- **Photos**: add originals to `assets/photos/` and run `python3 scripts/build-images.py`. A missing local copy falls back to the property's Entrata media library.

## Leasing actions

Every call to action uses the official systems: Apply (Entrata application portal), Schedule a Tour and Contact (official contact / guest-card form), Check Availability (live plan pages), Resident Portal (Homebody), Google Maps directions, and the leasing office phone. The site collects no form data itself. The original site lists no social media accounts, so none are linked.

## Accessibility and motion

Semantic landmarks, skip link, keyboard-operable filters, filmstrip and lightbox, visible focus states, and full `prefers-reduced-motion` support: every pinned scene rests in its finished state. Phones get their own layouts: stacked amenity photographs instead of the pinned sequence, inline images in the residence index, card-style plan rows and a leasing dock that hides near the footer.

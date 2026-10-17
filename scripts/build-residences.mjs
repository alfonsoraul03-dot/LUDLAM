#!/usr/bin/env node
/*
 * Builds one static page per floor plan into residences/<id>.html from
 * assets/js/data.js, so every plan has its own URL that search engines
 * can read. Run after editing a plan:
 *
 *     node scripts/build-residences.mjs
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/js/data.js"), "utf8"), ctx);
const LP = ctx.window.LP;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const keyOf = Object.fromEntries(Object.entries(LP.photos).map(([k, v]) => [v, k]));
const checked = new Date(LP.checkedOn + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const outDir = path.join(root, "residences");
fs.mkdirSync(outDir, { recursive: true });

for (const p of LP.plans) {
  const others = LP.plans.filter((o) => o.id !== p.id);
  const kind = p.levels > 1 ? "Two-level" : "Single level";
  const desc = `${p.name} at Ludlam Point: ${p.beds} bedroom, ${p.baths} bath, ${p.sqft} sq ft ${kind.toLowerCase()} floor plan at 6880 SW 44th Street, Miami. See live availability, apply online or schedule a tour.`;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(p.name)} Floor Plan | ${p.beds} Bed, ${p.baths} Bath | Ludlam Point, Miami</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="https://www.ludlampoint.com/residences/${p.id}.html">
  <meta name="theme-color" content="#1c1d1b">
  <meta property="og:title" content="${esc(p.name)} | Ludlam Point">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="../assets/img/1920/${keyOf[p.image]}.webp">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%231c1d1b'/%3E%3Ctext x='16' y='22' font-family='Georgia' font-size='17' text-anchor='middle' fill='%23f3efe7'%3ELP%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body class="residence" data-root="../">
  <a class="skip" href="#main">Skip to content</a>
  <header class="nav is-dark" id="nav">
    <div class="nav__inner">
      <a class="mark" href="../index.html" aria-label="Ludlam Point home">Ludlam<span>Point</span></a>
      <nav class="nav__links" aria-label="Primary">
        <a href="../index.html#residences">Residences</a>
        <a href="../index.html#inside">Interiors</a>
        <a href="../index.html#life">Life Here</a>
        <a href="../index.html#location">Location</a>
        <a href="../index.html#find">Floor Plans</a>
      </nav>
      <div class="nav__actions">
        <a class="nav__apply" href="" data-link="apply" target="_blank" rel="noopener">Apply</a>
        <a class="btn btn--light btn--sm nav__cta" href="" data-link="contact" target="_blank" rel="noopener">Schedule a Tour</a>
        <button class="menu-btn" id="menuToggle" aria-expanded="false" aria-controls="menu"><span class="menu-btn__label">Menu</span><span class="menu-btn__lines" aria-hidden="true"><i></i><i></i></span></button>
      </div>
    </div>
  </header>
  <div class="menu" id="menu" hidden>
    <nav class="menu__links" aria-label="Mobile">
      <a href="../index.html#residences"><small>02</small>Residences</a>
      <a href="../index.html#inside"><small>03</small>Interiors</a>
      <a href="../index.html#life"><small>04</small>Life Here</a>
      <a href="../index.html#location"><small>05</small>Location</a>
      <a href="../index.html#find"><small>06</small>Floor Plans</a>
    </nav>
    <div class="menu__foot">
      <a class="btn btn--light" href="" data-link="contact" target="_blank" rel="noopener">Schedule a Tour</a>
      <a class="btn btn--line-light" href="" data-link="apply" target="_blank" rel="noopener">Apply Online</a>
      <p><span data-fill="street"></span>, <span data-fill="cityline"></span><br><a href="" data-link="phone" data-fill="phone"></a></p>
    </div>
  </div>

  <main id="main">
    <section class="rp-hero">
      <div class="wrap">
        <p class="rp-crumbs"><a href="../index.html#find">Floor plans</a> / ${esc(p.name)}</p>
        <div class="rp-hero__grid">
          <div>
            <p class="kicker kicker--light"><span>${p.beds === 1 ? "One" : "Two"}</span> Bedroom${p.beds > 1 ? "s" : ""} · ${kind}</p>
            <h1 class="res-title">${esc(p.name)}</h1>
          </div>
          <dl class="rp-hero__facts">
            <div><dt>Bedrooms</dt><dd>${p.beds}</dd></div>
            <div><dt>Baths</dt><dd>${p.baths}</dd></div>
            <div><dt>Sq ft</dt><dd>${p.sqft.toLocaleString()}</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="rp-body" aria-label="${esc(p.name)} details">
      <div class="wrap rp-grid">
        <figure class="rp-plan">
          <img data-photo="${keyOf[p.image]}" data-sizes="(min-width: 861px) 58vw, 100vw" data-eager alt="${esc(p.imageAlt)}">
          <figcaption><a class="textlink" href="../assets/img/1920/${keyOf[p.image]}.webp" target="_blank" rel="noopener">Open full-size floor plan ↗</a></figcaption>
        </figure>
        <div class="rp-side">
          ${p.note ? `<p class="rp-note">${esc(p.note)}</p>` : `<p class="rp-note">A single-level home with ${p.beds} bedroom${p.beds > 1 ? "s" : ""} and ${p.baths} bath${p.baths > 1 ? "s" : ""}.</p>`}
          <div class="rp-price">
            ${LP.showPriceSnapshot && p.fromPrice ? `<p class="label">Total monthly leasing price from</p>
            <p><strong>$${p.fromPrice.toLocaleString("en-US")}</strong> /mo* · ${esc(p.term)}</p>
            <small>*Checked ${checked}. Prices and available homes change often; see live availability for today's figures.</small>` : `<p>See current pricing in the live leasing system.</p>`}
            <small>${esc(LP.deposit)}.</small>
            <p id="specialNote" class="special" hidden></p>
          </div>
          <div class="rp-ctas">
            <a class="btn btn--dark" href="${esc(p.url)}" target="_blank" rel="noopener">See Available ${esc(p.name)} Homes ↗</a>
            <a class="btn btn--line" href="" data-link="apply" target="_blank" rel="noopener">Apply Online ↗</a>
            <a class="btn btn--line" href="" data-link="contact" target="_blank" rel="noopener">Schedule a Tour ↗</a>
            <p class="fine">Or call the leasing office: <a href="" data-link="phone" data-fill="phone"></a></p>
          </div>
          <div class="rp-features">
            <h2>Home features</h2>
            <ul id="featureList"></ul>
            <p class="fine">Not all features are available in every rental home.</p>
          </div>
          <p class="fine" id="pricingNote"></p>
        </div>
      </div>
    </section>

    <section class="rp-others" aria-labelledby="others-title">
      <div class="wrap">
        <h2 id="others-title">Other floor plans</h2>
        <ul class="rp-others__list">
          ${others.map((o) => `<li><a href="${o.id}.html"><span>${esc(o.name)}</span><span>${o.beds} bed · ${o.baths} bath · ${o.sqft} sq ft${o.levels > 1 ? " · Two-level" : ""}</span></a></li>`).join("\n          ")}
        </ul>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="wrap footer__grid">
      <div>
        <p class="footer__mark">Ludlam Point</p>
        <address><span data-fill="street"></span><br><span data-fill="cityline"></span><br><a href="" data-link="phone" data-fill="phone"></a></address>
      </div>
      <nav class="footer__nav" aria-label="Footer">
        <a href="../index.html#residences">Residences</a>
        <a href="../index.html#find">Floor Plans</a>
        <a href="../index.html#life">Life Here</a>
        <a href="../index.html#location">Location</a>
        <a href="" data-link="apply" target="_blank" rel="noopener">Apply</a>
        <a href="" data-link="residents" target="_blank" rel="noopener">Resident Portal</a>
      </nav>
      <div class="footer__legal">
        <p class="eho"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 15 16 5l12 10v13H4z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11 17h10M11 22h10" stroke="currentColor" stroke-width="2"/></svg> Equal Housing Opportunity</p>
        <p>Professionally managed by <span data-fill="manager"></span>.</p>
        <ul id="legalLinks"></ul>
      </div>
    </div>
    <div class="wrap footer__base">
      <p>© <span id="year">2026</span> Ludlam Point. Prices, availability and specials are subject to change.</p>
      <a href="../index.html">Back to home</a>
    </div>
  </footer>

  <div class="dock" id="dock">
    <a class="dock__btn" href="${esc(p.url)}" target="_blank" rel="noopener">Availability</a>
    <a class="dock__btn dock__btn--main" href="" data-link="contact" target="_blank" rel="noopener">Schedule a Tour</a>
  </div>

  <script src="../assets/js/data.js"></script>
  <script src="../assets/js/main.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(outDir, p.id + ".html"), html);
  console.log("wrote residences/" + p.id + ".html");
}

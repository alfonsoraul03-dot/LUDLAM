/* Ludlam Point — interactions. No dependencies.
   Runs on the homepage and on the residence pages; every module checks
   that its elements exist before doing anything. */
(function () {
  "use strict";
  const LP = window.LP;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileMQ = window.matchMedia("(max-width: 860px)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + n.toLocaleString("en-US");
  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const ROOT = document.body.dataset.root || "";   // "../" on residence pages
  const motionOn = () => !reduceMotion.matches;

  /* ------------------------------------------------------------
     Images: own WebP copies first, then the property's media library
     ------------------------------------------------------------ */
  const LOCAL_WIDTHS = [640, 1280, 1920];
  const REMOTE_WIDTHS = [640, 1080, 1600, 2400];
  const keyOf = {};
  Object.entries(LP.photos).forEach(([k, p]) => { keyOf[p] = k; });
  const local = (key, w) => ROOT + "assets/img/" + w + "/" + key + ".webp";
  const sized = (path, w) => LP.media + "fit-in/" + w + "x" + w + "/" + path;
  const original = (path) => LP.media + path;
  function applyStage(img) {
    const path = img._photo, key = keyOf[path];
    if (img._stage === 0 && key && LP.useLocalPhotos) {
      img.srcset = LOCAL_WIDTHS.map((w) => local(key, w) + " " + w + "w").join(", ");
      img.src = local(key, 1280);
    } else if (img._stage <= 1) {
      img._stage = 1;
      img.srcset = REMOTE_WIDTHS.map((w) => sized(path, w) + " " + w + "w").join(", ");
      img.src = sized(path, 1600);
    } else if (img._stage === 2) {
      img.removeAttribute("srcset");
      img.src = original(path);
    } else {
      img.classList.add("is-missing");
    }
  }
  function setPhoto(img, path, opts = {}) {
    if (!path) return;
    img.decoding = "async";
    img.loading = opts.eager ? "eager" : "lazy";
    if (opts.eager) img.fetchPriority = "high";
    img.sizes = opts.sizes || "100vw";
    img.classList.remove("is-missing");
    img._photo = path; img._stage = 0;
    img.onerror = () => { img._stage += 1; applyStage(img); };
    applyStage(img);
  }
  const photoTag = (path, alt, sizes) => { const i = document.createElement("img"); i.alt = alt || ""; setPhoto(i, path, { sizes }); return i; };
  $$("img[data-photo]").forEach((img) => setPhoto(img, LP.photos[img.dataset.photo], { sizes: img.dataset.sizes, eager: img.hasAttribute("data-eager") }));

  /* ------------------------------------------------------------
     Links and shared facts
     ------------------------------------------------------------ */
  const prop = LP.property;
  const links = Object.assign({ phone: prop.phoneHref }, LP.links);
  $$("[data-link]").forEach((a) => { const h = links[a.dataset.link]; if (h) a.href = h; });
  const fills = { street: prop.street, cityline: `${prop.city}, ${prop.state} ${prop.zip}`, phone: prop.phone, manager: prop.manager };
  $$("[data-fill]").forEach((el) => { el.textContent = fills[el.dataset.fill] || ""; });
  const fillHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; return el; };
  fillHTML("hoursList", prop.hours.map((h) => `<dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd>`).join(""));
  fillHTML("legalLinks", LP.legal.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join(""));
  fillHTML("featureList", LP.homeFeatures.map((f) => `<li>${esc(f)}</li>`).join(""));
  fillHTML("alsoList", (LP.alsoHere || []).map((f) => `<li>${esc(f)}</li>`).join(""));
  fillHTML("nearbyList", LP.nearby.map((g) => `<div><dt>${esc(g.group)}</dt><dd>${g.items.map(esc).join(" / ")}</dd></div>`).join(""));
  const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  const copyBtn = $("#copyPhone");
  if (copyBtn) copyBtn.addEventListener("click", () => {
    const status = $("#copyStatus");
    const fail = () => { status.textContent = "Couldn't copy. The number is " + prop.phone + "."; };
    try {
      navigator.clipboard.writeText(prop.phone).then(() => { status.textContent = "Number copied."; setTimeout(() => (status.textContent = ""), 3000); }, fail);
    } catch (e) { fail(); }
  });

  const today = new Date();
  const sp = LP.special;
  const specialActive = !!sp && today >= new Date(sp.starts + "T00:00:00") && today <= new Date(sp.ends + "T23:59:59");
  const checked = new Date(LP.checkedOn + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const sn = $("#specialNote");
  if (sn && specialActive) { sn.textContent = sp.text; sn.hidden = false; }
  const pn = $("#pricingNote");
  if (pn) pn.textContent = (LP.showPriceSnapshot ? `*Total monthly leasing price, starting prices checked ${checked}. ` : "") + LP.pricingDisclosure;

  /* ------------------------------------------------------------
     Statement: split into words that light up with scroll
     ------------------------------------------------------------ */
  const stText = $("#statementText");
  let words = [];
  if (stText) {
    const txt = stText.textContent.trim();
    stText.setAttribute("aria-label", txt);
    stText.innerHTML = txt.split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${esc(w)} </span>`).join("");
    words = $$(".w", stText);
  }

  /* ------------------------------------------------------------
     02 — Residence index: cursor-following photo, filter shortcuts
     ------------------------------------------------------------ */
  const cursor = $("#cursorImg");
  if (cursor) {
    const cImg = $("img", cursor);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      cursor.style.setProperty("--cx", cx.toFixed(1) + "px");
      cursor.style.setProperty("--cy", cy.toFixed(1) + "px");
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    $$(".index__row").forEach((row) => {
      row.addEventListener("mouseenter", () => {
        if (!finePointer.matches || mobileMQ.matches) return;
        setPhoto(cImg, LP.photos[row.dataset.img], { sizes: "380px", eager: true });
        cursor.classList.add("is-on");
      });
      row.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
      row.addEventListener("mousemove", (e) => {
        const w = cursor.offsetWidth, h = cursor.offsetHeight;
        tx = e.clientX + 28; ty = e.clientY - h / 2;
        if (tx + w > window.innerWidth - 16) tx = e.clientX - w - 28;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
  }
  $$("[data-filter-link]").forEach((a) => a.addEventListener("click", () => setFilter(a.dataset.filterLink)));

  /* ------------------------------------------------------------
     03 — Interior filmstrip + lightbox
     ------------------------------------------------------------ */
  const filmTrack = $("#filmTrack");
  const lb = $("#lightbox");
  let lbSet = [], lbIndex = 0, lbReturn = null;
  function showLB(i) {
    lbIndex = (i + lbSet.length) % lbSet.length;
    const [path, cap] = lbSet[lbIndex];
    const img = $("#lbImg");
    img.classList.add("is-swapping");
    const swap = () => {
      img.alt = cap;
      setPhoto(img, path, { sizes: "100vw", eager: true });
      $("#lbCaption").textContent = cap;
      $("#lbCount").textContent = `${lbIndex + 1} / ${lbSet.length}`;
      img.classList.remove("is-swapping");
    };
    motionOn() ? setTimeout(swap, 150) : swap();
  }
  function openLB(set, i, from) { lbSet = set; lbReturn = from; showLB(i); lb.showModal(); $("#lbNext").focus(); }
  if (lb) {
    lb.addEventListener("close", () => { if (lbReturn) lbReturn.focus(); });
    $("#lbClose").addEventListener("click", () => lb.close());
    $("#lbPrev").addEventListener("click", () => showLB(lbIndex - 1));
    $("#lbNext").addEventListener("click", () => showLB(lbIndex + 1));
    lb.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") showLB(lbIndex + 1); if (e.key === "ArrowLeft") showLB(lbIndex - 1); });
    lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
    let tX = null;
    lb.addEventListener("touchstart", (e) => { tX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (tX === null) return;
      const dx = e.changedTouches[0].clientX - tX;
      if (Math.abs(dx) > 50) showLB(lbIndex + (dx < 0 ? 1 : -1));
      tX = null;
    });
  }
  if (filmTrack) {
    const set = LP.interiors;
    set.forEach(([path, cap], i) => {
      const li = document.createElement("li");
      li.className = "film__item";
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Open photo: " + cap);
      b.appendChild(photoTag(path, cap, "(min-width: 861px) 45vw, 90vw"));
      b.addEventListener("click", () => openLB(set, i, b));
      const p = document.createElement("p");
      p.textContent = cap;
      li.append(b, p);
      filmTrack.appendChild(li);
    });
    $("#filmCount").textContent = `${set.length} photographs`;
    const step = () => Math.max(280, filmTrack.clientWidth * 0.7);
    $("#filmPrev").addEventListener("click", () => filmTrack.scrollBy({ left: -step(), behavior: motionOn() ? "smooth" : "auto" }));
    $("#filmNext").addEventListener("click", () => filmTrack.scrollBy({ left: step(), behavior: motionOn() ? "smooth" : "auto" }));
  }

  /* ------------------------------------------------------------
     04 — Life: pinned sequence; active amenity follows scroll
     ------------------------------------------------------------ */
  const life = $("#life");
  const lifeFrames = $("#lifeFrames");
  const lifeList = $("#lifeList");
  let lifeActive = -1;
  if (life) {
    LP.life.forEach((a, i) => {
      const fig = document.createElement("figure");
      fig.appendChild(photoTag(a.photo, "", "100vw"));
      lifeFrames.appendChild(fig);
      const li = document.createElement("li");
      li.className = "life__item";
      li.innerHTML = `<div class="life__media"></div><p class="life__name">${esc(a.name)}</p><div class="life__line"><span>${esc(a.line)}</span></div>`;
      $(".life__media", li).appendChild(photoTag(a.photo, a.alt, "92vw"));
      lifeList.appendChild(li);
    });
    setLife(0);
  }
  function setLife(i) {
    if (!life || i === lifeActive) return;
    lifeActive = i;
    $$("figure", lifeFrames).forEach((f, j) => { f.classList.toggle("is-active", j === i); f.classList.toggle("is-past", j < i); });
    $$(".life__item", lifeList).forEach((li, j) => li.classList.toggle("is-active", j === i));
  }

  /* ------------------------------------------------------------
     06 — Find your residence: filterable table + preview
     ------------------------------------------------------------ */
  const plans = LP.plans;
  const rows = $("#planRows");
  const preview = $("#previewImg");
  let filter = "all", previewId = null;
  const matches = (p) => filter === "all" || (filter === "two-level" ? p.levels > 1 : String(p.beds) === filter);
  const planPage = (p) => ROOT + "residences/" + p.id + ".html";
  function renderRows() {
    if (!rows) return;
    const shown = plans.filter(matches);
    if (!shown.length) { rows.innerHTML = `<p class="find__empty">No floor plans match this filter.</p>`; return; }
    rows.innerHTML = shown.map((p, i) => `
      <div class="plan-row" role="row" data-plan="${p.id}" style="animation-delay:${i * 70}ms">
        <div class="plan-row__thumb" aria-hidden="true"></div>
        <div class="plan-row__name" role="cell">
          <a href="${planPage(p)}">${esc(p.name)}</a>
          <span class="plan-row__tag">${p.levels > 1 ? "Two-level" : "Single level"}</span>
        </div>
        <div role="cell"><span class="plan-row__cell-label">Beds</span><span class="plan-row__num">${p.beds}</span></div>
        <div role="cell"><span class="plan-row__cell-label">Baths</span><span class="plan-row__num">${p.baths}</span></div>
        <div role="cell"><span class="plan-row__cell-label">Sq ft</span><span class="plan-row__num">${p.sqft.toLocaleString()}</span></div>
        <div class="plan-row__price" role="cell">${LP.showPriceSnapshot && p.fromPrice
          ? `<strong>${money(p.fromPrice)}</strong><small>/mo* · ${esc(p.term)}</small>`
          : `<small>See live pricing</small>`}</div>
        <div class="plan-row__actions" role="cell">
          <a class="btn btn--dark btn--sm" href="${planPage(p)}" aria-label="View the ${esc(p.name)} floor plan">View Plan</a>
          <a class="btn btn--line btn--sm" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="Check ${esc(p.name)} availability on the official leasing site">Availability ↗</a>
        </div>
      </div>`).join("");
    $$(".plan-row", rows).forEach((row) => {
      const p = plans.find((x) => x.id === row.dataset.plan);
      $(".plan-row__thumb", row).appendChild(photoTag(p.image, "", "90vw"));
      row.addEventListener("mouseenter", () => showPreview(p));
      row.addEventListener("focusin", () => showPreview(p));
    });
    previewId = null;
    showPreview(shown[0]);
  }
  function showPreview(p) {
    if (!preview || !p || previewId === p.id) return;
    previewId = p.id;
    $$(".plan-row", rows).forEach((r) => r.classList.toggle("is-active", r.dataset.plan === p.id));
    preview.classList.add("is-swapping");
    const swap = () => {
      setPhoto(preview, p.image, { sizes: "36vw" });
      preview.alt = p.imageAlt;
      $("#previewCap").textContent = `${p.name} — ${p.beds} bed · ${p.baths} bath · ${p.sqft} sq ft`;
      preview.classList.remove("is-swapping");
    };
    motionOn() ? setTimeout(swap, 180) : swap();
  }
  function setFilter(f) {
    if (!rows) return;
    filter = f;
    $$(".filter").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === f)));
    renderRows();
  }
  $$(".filter").forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));
  renderRows();

  /* ------------------------------------------------------------
     Map, loaded as it approaches the viewport
     ------------------------------------------------------------ */
  const mapFrame = $("#mapFrame");
  if (mapFrame) {
    const loadMap = () => {
      if (mapFrame.querySelector("iframe")) return;
      const f = document.createElement("iframe");
      f.src = LP.links.mapEmbed;
      f.title = "Map showing Ludlam Point at 6880 SW 44th Street, Miami";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.addEventListener("load", () => { const b = $("#mapLoad"); if (b) b.remove(); });
      mapFrame.appendChild(f);
    };
    $("#mapLoad").addEventListener("click", loadMap);
    new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { loadMap(); o.disconnect(); } }, { rootMargin: "600px 0px" }).observe(mapFrame);
  }

  /* ------------------------------------------------------------
     Nav, menu, dock
     ------------------------------------------------------------ */
  const nav = $("#nav");
  const menu = $("#menu");
  const toggle = $("#menuToggle");
  const dock = $("#dock");
  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    $(".menu-btn__label", toggle).textContent = open ? "Close" : "Menu";
    document.body.classList.toggle("menu-open", open);
    if (open) { menu.scrollTop = 0; $("a", menu).focus({ preventScroll: true }); }
  }
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); } });
  mobileMQ.addEventListener("change", (e) => { if (!e.matches) setMenu(false); });

  const darkZones = $$(".intro, .statement, .life, .chapter, .rp-hero");
  let endInView = false;
  const endZones = new Map();
  const endIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => endZones.set(en.target, en.isIntersecting));
    endInView = Array.from(endZones.values()).some(Boolean);
    update();
  }, { threshold: 0.05 });
  $$(".chapter, .footer, .rp-others").forEach((el) => endIO.observe(el));

  const navLinks = $$(".nav__links a");
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) navLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id)));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  ["residences", "inside", "life", "location", "find"].forEach((id) => { const el = document.getElementById(id); if (el) sectionIO.observe(el); });

  /* ------------------------------------------------------------
     Scroll engine
     ------------------------------------------------------------ */
  const scenes = $$("[data-scroll]");
  const layers = $$(".inside__layer");
  const insideStage = $(".inside__stage");
  let lastY = window.scrollY, ticking = false;

  function measure() {
    if (life) {
      const pinned = motionOn() && !mobileMQ.matches;
      life.style.height = pinned ? (window.innerHeight * (0.62 * LP.life.length + 1)) + "px" : "";
    }
    update();
  }

  function update() {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;

    // Nav theme: light text over dark scenes, ink on ivory
    if (!document.body.classList.contains("menu-open")) {
      const probe = (nav.offsetHeight || 70) / 2;
      const overDark = darkZones.some((z) => { const r = z.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; });
      const atTop = y < 20 && document.body.classList.contains("home");
      nav.classList.toggle("is-solid", !overDark);
      nav.classList.toggle("is-dark", overDark && !atTop);
      const down = y > lastY + 4 && y > vh;
      if (down) nav.classList.add("is-hidden");
      else if (y < lastY - 4 || y < vh) nav.classList.remove("is-hidden");
    }
    lastY = y;
    if (dock) dock.classList.toggle("is-visible", y > vh * 0.6 && !endInView);

    if (!motionOn()) return;

    scenes.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 1.5) return;
      let p;
      if (sec.dataset.scroll === "through") p = clamp01((vh - r.top) / (vh + r.height));
      else { const run = sec.offsetHeight - vh; p = run > 0 ? clamp01(-r.top / run) : 0; }
      sec.style.setProperty("--p", p.toFixed(4));

      if (sec.id === "statement" && words.length) {
        const lit = Math.round(clamp01(p * 1.15) * words.length);
        words.forEach((w, i) => w.classList.toggle("is-on", i < lit));
      }
      if (sec === life && !mobileMQ.matches) {
        setLife(Math.min(LP.life.length - 1, Math.floor(p * LP.life.length * 0.999)));
      }
    });

    // Layered parallax in "Inside your space"
    if (insideStage && !mobileMQ.matches) {
      const r = insideStage.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) {
        const t = (r.top + r.height / 2 - vh / 2) / vh; // ~ -1..1
        layers.forEach((l) => l.style.setProperty("--ly", (t * parseFloat(l.dataset.speed) * 600).toFixed(1)));
      }
    }
  }

  if (reduceMotion.matches) {
    words.forEach((w) => w.classList.add("is-on"));
    $$(".life__item").forEach((li) => li.classList.add("is-active"));
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(measure));
  mobileMQ.addEventListener("change", measure);
  reduceMotion.addEventListener("change", () => location.reload());
  window.addEventListener("load", measure);
  measure();
})();

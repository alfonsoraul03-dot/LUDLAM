/* Ludlam Point — interactions. No dependencies. */
(function () {
  "use strict";
  const LP = window.LP;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileMQ = window.matchMedia("(max-width: 860px)");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + n.toLocaleString("en-US");

  /* ------------------------------------------------------------
     Images: responsive srcset from the property's media library,
     with a fallback to the original file if a resized copy fails.
     ------------------------------------------------------------ */
  const WIDTHS = [640, 1080, 1600, 2400];
  const sized = (path, w) => LP.media + "fit-in/" + w + "x" + w + "/" + path;
  const original = (path) => LP.media + path;

  function setPhoto(img, path, opts = {}) {
    if (!path) return;
    img.decoding = "async";
    if (!opts.eager) img.loading = "lazy";
    else img.fetchPriority = "high";
    img.sizes = opts.sizes || "100vw";
    img.srcset = WIDTHS.map((w) => sized(path, w) + " " + w + "w").join(", ");
    img.src = sized(path, 1600);
    img.addEventListener("error", function onErr() {
      if (!img.dataset.fallback) {
        img.dataset.fallback = "1";
        img.removeAttribute("srcset");
        img.src = original(path);
      } else {
        img.removeEventListener("error", onErr);
        img.classList.add("is-missing");
      }
    });
  }
  function photoTag(path, alt, sizes, extra = "") {
    const img = document.createElement("img");
    img.alt = alt || "";
    setPhoto(img, path, { sizes });
    if (extra) img.className = extra;
    return img;
  }

  $$("img[data-photo]").forEach((img) => {
    setPhoto(img, LP.photos[img.dataset.photo], { sizes: img.dataset.sizes, eager: img.hasAttribute("data-eager") });
  });

  /* ------------------------------------------------------------
     Links and shared facts
     ------------------------------------------------------------ */
  const prop = LP.property;
  const links = Object.assign({ phone: prop.phoneHref }, LP.links);
  $$("[data-link]").forEach((a) => {
    const href = links[a.dataset.link];
    if (href) a.href = href;
  });
  const fills = {
    street: prop.street,
    cityline: `${prop.city}, ${prop.state} ${prop.zip}`,
    phone: prop.phone,
    manager: prop.manager,
  };
  $$("[data-fill]").forEach((el) => { el.textContent = fills[el.dataset.fill] || ""; });

  $("#hoursList").innerHTML = prop.hours.map((h) => `<dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd>`).join("");
  $("#legalLinks").innerHTML = LP.legal.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join("");
  $("#year").textContent = new Date().getFullYear();
  $("#featureList").innerHTML = LP.homeFeatures.slice(0, 12).map((f) => `<li>${esc(f)}</li>`).join("");
  $("#nearbyList").innerHTML = LP.nearby.map((g) => `
    <div class="hood__group"><h3>${esc(g.group)}</h3><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("");

  /* Copy phone number */
  $("#copyPhone").addEventListener("click", () => {
    const status = $("#copyStatus");
    const done = () => { status.textContent = "Number copied."; setTimeout(() => (status.textContent = ""), 3000); };
    try {
      navigator.clipboard.writeText(prop.phone).then(done, () => { status.textContent = "Couldn't copy. The number is " + prop.phone + "."; });
    } catch (e) { status.textContent = "Couldn't copy. The number is " + prop.phone + "."; }
  });

  /* ------------------------------------------------------------
     Special offer: shown only inside its valid dates
     ------------------------------------------------------------ */
  const today = new Date();
  const inRange = (s) => s && today >= new Date(s.starts + "T00:00:00") && today <= new Date(s.ends + "T23:59:59");
  const specialActive = inRange(LP.special);
  if (specialActive) {
    const note = $("#specialNote");
    note.textContent = LP.special.text;
    note.hidden = false;
  }
  const checked = new Date(LP.checkedOn + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  $("#pricingNote").textContent = (LP.showPriceSnapshot ? `*Starting prices checked ${checked}. ` : "") + LP.pricingDisclosure;

  /* ------------------------------------------------------------
     Floor plans
     ------------------------------------------------------------ */
  const plans = LP.plans;
  const list = $("#planList");
  const previewImg = $("#planPreviewImg");
  const previewName = $("#planPreviewName");
  let filter = "all";

  const matches = (p) => filter === "all" || (filter === "two-level" ? p.levels > 1 : String(p.beds) === filter);
  const bedLabel = (n) => n + (n === 1 ? " Bedroom" : " Bedrooms");
  const bathLabel = (n) => n + (n === 1 ? " Bath" : " Baths");

  function priceHTML(p) {
    if (!LP.showPriceSnapshot || !p.fromPrice) return `<p class="plan__price"><small>Pricing in the live leasing system</small></p>`;
    return `<p class="plan__price">From <strong>${money(p.fromPrice)}</strong>/mo* <small>· ${esc(p.term)}</small></p>`;
  }

  function renderPlans() {
    const shown = plans.filter(matches);
    if (!shown.length) {
      list.innerHTML = `<li class="plans__empty">No plans match this filter.</li>`;
      return;
    }
    list.innerHTML = shown.map((p, i) => `
      <li class="plan" data-plan="${p.id}" style="animation-delay:${i * 70}ms">
        <div class="plan__thumb"></div>
        <div class="plan__main">
          <h3 class="plan__name">${esc(p.name)}${p.levels > 1 ? `<span class="plan__tag">Two-level</span>` : ""}</h3>
          <p class="plan__specs"><span><b>${bedLabel(p.beds)}</b></span><span>${bathLabel(p.baths)}</span><span>${p.sqft.toLocaleString()} sq ft</span></p>
          ${priceHTML(p)}
        </div>
        <div class="plan__actions">
          <button class="btn btn--ink btn--sm" type="button" data-open="${p.id}">View Plan</button>
          <a class="btn btn--line btn--sm" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="Check availability for ${esc(p.name)} (opens the official leasing site)">Check Availability ↗</a>
        </div>
      </li>`).join("");
    $$(".plan", list).forEach((row) => {
      const p = plans.find((x) => x.id === row.dataset.plan);
      const thumb = photoTag(p.image, p.imageAlt, "(max-width: 860px) 90vw, 180px");
      $(".plan__thumb", row).appendChild(thumb);
      row.addEventListener("mouseenter", () => preview(p));
      row.addEventListener("focusin", () => preview(p));
    });
    preview(shown[0]);
  }

  let currentPreview = null;
  function preview(p) {
    if (!p || currentPreview === p.id) return;
    currentPreview = p.id;
    $$(".plan", list).forEach((r) => r.classList.toggle("is-active", r.dataset.plan === p.id));
    previewImg.classList.add("is-swapping");
    setTimeout(() => {
      previewImg.removeAttribute("data-fallback");
      previewImg.classList.remove("is-missing");
      setPhoto(previewImg, p.image, { sizes: "40vw" });
      previewImg.alt = p.imageAlt;
      previewName.textContent = p.name + " · " + p.sqft + " sq ft";
      previewImg.classList.remove("is-swapping");
    }, reduceMotion.matches ? 0 : 180);
  }

  $$(".chip").forEach((chip) => chip.addEventListener("click", () => {
    filter = chip.dataset.filter;
    $$(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    currentPreview = null;
    renderPlans();
  }));
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open]");
    if (btn) openPlan(btn.dataset.open, btn);
  });
  renderPlans();

  /* Plan detail dialog — deep-linkable as #plan-<name> */
  const pd = $("#planDialog");
  let pdIndex = 0, pdReturn = null;

  function fillPlan(i) {
    pdIndex = (i + plans.length) % plans.length;
    const p = plans[pdIndex];
    $("#pdIndex").textContent = `${pdIndex + 1} / ${plans.length}`;
    $("#pdName").textContent = p.name;
    const img = $("#pdImg");
    img.removeAttribute("data-fallback");
    img.classList.remove("is-missing");
    img.alt = p.imageAlt;
    setPhoto(img, p.image, { sizes: "(max-width: 860px) 100vw, 60vw" });
    img.loading = "eager";
    $("#pdImgLink").href = original(p.image);
    $("#pdSpecs").innerHTML = `
      <div><dt>Bedrooms</dt><dd>${p.beds}</dd></div>
      <div><dt>Baths</dt><dd>${p.baths}</dd></div>
      <div><dt>Sq ft</dt><dd>${p.sqft.toLocaleString()}</dd></div>`;
    const note = $("#pdNote");
    note.hidden = !p.note;
    note.textContent = p.note || "";
    const price = LP.showPriceSnapshot && p.fromPrice
      ? `<p class="from">Total monthly leasing price from <strong>${money(p.fromPrice)}</strong>/mo* <small>· ${esc(p.term)}</small></p>
         <small>*Checked ${checked}. Prices and available homes change often; see live pricing for today's figures.</small>`
      : `<p class="from">See current pricing in the live leasing system.</p>`;
    $("#pdPrice").innerHTML = price + `<small>${esc(LP.deposit)}.</small>` +
      (specialActive ? `<p class="special">${esc(LP.special.text)}</p>` : "");
    $("#pdLive").href = p.url;
    $("#pdLive").setAttribute("aria-label", `See available ${p.name} homes on the official leasing site`);
    $("#pdFeatures").innerHTML = LP.homeFeatures.map((f) => `<li>${esc(f)}</li>`).join("");
    $("#pdDisclosure").textContent = LP.pricingDisclosure;
    history.replaceState(null, "", "#plan-" + p.id);
  }
  function openPlan(id, from) {
    const i = plans.findIndex((p) => p.id === id);
    if (i < 0) return;
    pdReturn = from || document.activeElement;
    fillPlan(i);
    if (!pd.open) pd.showModal();
    $("#pdClose").focus();
  }
  function closePlan() { if (pd.open) pd.close(); }
  pd.addEventListener("close", () => {
    history.replaceState(null, "", location.pathname + location.search);
    if (pdReturn && document.contains(pdReturn)) pdReturn.focus();
  });
  pd.addEventListener("click", (e) => { if (e.target === pd) closePlan(); });
  $("#pdClose").addEventListener("click", closePlan);
  $("#pdPrev").addEventListener("click", () => fillPlan(pdIndex - 1));
  $("#pdNext").addEventListener("click", () => fillPlan(pdIndex + 1));
  pd.addEventListener("keydown", (e) => {
    if (e.target.closest("summary, a, input")) return;
    if (e.key === "ArrowRight") fillPlan(pdIndex + 1);
    if (e.key === "ArrowLeft") fillPlan(pdIndex - 1);
  });
  const fromHash = () => {
    const m = location.hash.match(/^#plan-([a-z]+)$/);
    if (m) openPlan(m[1]);
  };
  window.addEventListener("hashchange", fromHash);
  fromHash();

  /* ------------------------------------------------------------
     Amenity scenes
     ------------------------------------------------------------ */
  const visual = $("#sceneVisual");
  const sceneList = $("#sceneList");
  LP.scenes.forEach((s, i) => {
    const fig = document.createElement("figure");
    fig.dataset.scene = s.id;
    fig.appendChild(photoTag(s.photo, "", "45vw"));
    if (i === 0) fig.classList.add("is-active");
    visual.appendChild(fig);

    const art = document.createElement("article");
    art.className = "scene" + (i === 0 ? " is-active" : "");
    art.dataset.scene = s.id;
    art.innerHTML = `
      <div class="scene__media"></div>
      <p class="scene__index">${String(i + 1).padStart(2, "0")} of ${String(LP.scenes.length).padStart(2, "0")}</p>
      <h3 class="scene__title">${esc(s.title)}</h3>
      <p class="scene__body">${esc(s.body)}</p>
      <ul class="scene__items">${s.items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
    $(".scene__media", art).appendChild(photoTag(s.photo, s.alt, "90vw"));
    sceneList.appendChild(art);
  });
  const sceneIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.dataset.scene;
      $$(".scene", sceneList).forEach((a) => a.classList.toggle("is-active", a.dataset.scene === id));
      $$("figure", visual).forEach((f) => f.classList.toggle("is-active", f.dataset.scene === id));
    });
  }, { rootMargin: "-45% 0px -45% 0px" });
  $$(".scene", sceneList).forEach((a) => sceneIO.observe(a));

  /* ------------------------------------------------------------
     Gallery + lightbox
     ------------------------------------------------------------ */
  const sets = {
    apartments: LP.gallery.apartments,
    community: LP.gallery.community,
    plans: plans.map((p) => [p.image, p.name + " floor plan · " + bedLabel(p.beds) + ", " + p.sqft + " sq ft"]),
  };
  const grid = $("#galleryGrid");
  const more = $("#galleryMore");
  const tabs = $$('[role="tab"]');
  let tab = "apartments", expanded = false;
  const INITIAL = 12;

  tabs.forEach((t) => { $("span", t).textContent = sets[t.dataset.tab].length; });

  function renderGallery() {
    const items = sets[tab];
    const shown = expanded ? items : items.slice(0, INITIAL);
    grid.classList.toggle("gallery__grid--plans", tab === "plans");
    grid.innerHTML = "";
    shown.forEach(([path, cap], i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "gallery__item";
      b.style.animationDelay = Math.min(i, 8) * 50 + "ms";
      b.setAttribute("aria-label", "Open photo: " + cap);
      const fig = document.createElement("figure");
      fig.style.margin = "0"; fig.style.height = "100%";
      fig.appendChild(photoTag(path, cap, tab === "plans" ? "(max-width: 860px) 100vw, 50vw" : "(max-width: 860px) 100vw, 60vw"));
      const fc = document.createElement("figcaption");
      fc.textContent = tab === "plans" ? cap.split(" floor plan")[0] : cap;
      fig.appendChild(fc);
      b.appendChild(fig);
      b.addEventListener("click", () => openLightbox(i, b));
      grid.appendChild(b);
    });
    more.hidden = expanded || items.length <= INITIAL;
    more.textContent = `Show all ${items.length} photos`;
  }
  function selectTab(t, focus) {
    tab = t.dataset.tab; expanded = false;
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute("aria-selected", String(on));
      x.tabIndex = on ? 0 : -1;
    });
    grid.setAttribute("aria-labelledby", t.id);
    if (focus) t.focus();
    renderGallery();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") selectTab(tabs[(i + 1) % tabs.length], true);
      if (e.key === "ArrowLeft") selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });
  more.addEventListener("click", () => {
    expanded = true;
    const first = grid.children.length;
    renderGallery();
    const next = grid.children[first];
    if (next) next.focus({ preventScroll: true });
  });
  renderGallery();

  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  let lbIndex = 0, lbReturn = null;
  function showLB(i) {
    const items = sets[tab];
    lbIndex = (i + items.length) % items.length;
    const [path, cap] = items[lbIndex];
    lbImg.classList.add("is-swapping");
    const swap = () => {
      lbImg.removeAttribute("data-fallback");
      lbImg.classList.remove("is-missing");
      lbImg.alt = cap;
      setPhoto(lbImg, path, { sizes: "100vw" });
      lbImg.loading = "eager";
      $("#lbCaption").textContent = cap;
      $("#lbCount").textContent = `${lbIndex + 1} / ${items.length}`;
      lbImg.classList.remove("is-swapping");
    };
    reduceMotion.matches ? swap() : setTimeout(swap, 150);
    // warm the next image
    const nxt = items[(lbIndex + 1) % items.length];
    if (nxt) { const pre = new Image(); pre.src = sized(nxt[0], 1600); }
  }
  function openLightbox(i, from) {
    lbReturn = from;
    showLB(i);
    lb.showModal();
    $("#lbNext").focus();
  }
  lb.addEventListener("close", () => { if (lbReturn) lbReturn.focus(); });
  $("#lbClose").addEventListener("click", () => lb.close());
  $("#lbPrev").addEventListener("click", () => showLB(lbIndex - 1));
  $("#lbNext").addEventListener("click", () => showLB(lbIndex + 1));
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") showLB(lbIndex + 1);
    if (e.key === "ArrowLeft") showLB(lbIndex - 1);
  });
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showLB(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ------------------------------------------------------------
     Map: Google Maps embed, loaded when it approaches the viewport
     ------------------------------------------------------------ */
  const mapFrame = $("#mapFrame");
  function loadMap() {
    if (mapFrame.querySelector("iframe")) return;
    const f = document.createElement("iframe");
    f.src = LP.links.mapEmbed;
    f.title = "Map showing Ludlam Point at 6880 SW 44th Street, Miami";
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer-when-downgrade";
    f.addEventListener("load", () => { const b = $("#mapLoad"); if (b) b.remove(); });
    mapFrame.appendChild(f);
  }
  $("#mapLoad").addEventListener("click", loadMap);
  new IntersectionObserver((en, obs) => {
    if (en[0].isIntersecting) { loadMap(); obs.disconnect(); }
  }, { rootMargin: "600px 0px" }).observe(mapFrame);

  /* ------------------------------------------------------------
     Navigation, mobile menu, dock
     ------------------------------------------------------------ */
  const nav = $("#nav");
  const hero = $(".hero");
  const dock = $("#dock");
  const visit = $("#visit");
  const menu = $("#menu");
  const toggle = $("#menuToggle");

  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    $(".nav__toggle-label", toggle).textContent = open ? "Close" : "Menu";
    document.body.classList.toggle("menu-open", open);
    if (open) { menu.scrollTop = 0; $("a", menu).focus({ preventScroll: true }); }
  }
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); } });
  mobileMQ.addEventListener("change", (e) => { if (!e.matches) setMenu(false); });

  // Hide the dock once the visit section or footer is on screen (they carry the same actions)
  let visitInView = false;
  const endZones = new Map();
  const endIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => endZones.set(en.target, en.isIntersecting));
    visitInView = Array.from(endZones.values()).some(Boolean);
    update();
  }, { threshold: 0.05 });
  endIO.observe(visit);
  endIO.observe($(".footer"));

  // Current-section highlight in the nav
  const navLinks = $$(".nav__links a");
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id)));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  ["apartments", "amenities", "gallery", "neighborhood"].forEach((id) => sectionIO.observe(document.getElementById(id)));

  /* ------------------------------------------------------------
     Scroll scenes: one rAF loop sets --p (0→1) per scene
     ------------------------------------------------------------ */
  const scenes = $$("[data-scroll]");
  const reel = $("#community");
  const track = $(".reel__track", reel);
  const featureImg = $(".features__img");
  let lastY = window.scrollY, ticking = false, reelDistance = 0;

  function measure() {
    if (!reduceMotion.matches && !mobileMQ.matches) {
      reelDistance = Math.max(0, track.scrollWidth - window.innerWidth);
      reel.style.height = window.innerHeight + reelDistance + "px";
    } else {
      reelDistance = 0;
      reel.style.height = "";
      track.style.transform = "";
    }
    update();
  }

  function update() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const heroH = hero.offsetHeight;

    // Nav state
    if (document.body.classList.contains("menu-open")) {
      nav.dataset.state = "solid";
    } else if (y < heroH - 90) {
      nav.dataset.state = "over-hero";
    } else if (y > lastY + 4 && y > heroH + 200 && !pd.open) {
      nav.dataset.state = "hidden";
    } else if (y < lastY - 4 || nav.dataset.state !== "hidden") {
      nav.dataset.state = "solid";
    }
    lastY = y;

    // Mobile dock
    dock.classList.toggle("is-visible", y > heroH * 0.6 && !visitInView);

    if (reduceMotion.matches) return;

    // Hero drift
    if (y < heroH) hero.style.setProperty("--hero-shift", (y * 0.28).toFixed(1));

    // Pinned scenes
    scenes.forEach((s) => {
      const r = s.getBoundingClientRect();
      const run = s.offsetHeight - vh;
      if (r.bottom < -vh || r.top > vh * 1.5) return;
      const p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 1;
      s.style.setProperty("--p", p.toFixed(4));
      if (s === reel && reelDistance) track.style.transform = `translate3d(${(-p * reelDistance).toFixed(1)}px,0,0)`;
    });

    // Kitchen parallax
    const fr = featureImg.getBoundingClientRect();
    if (fr.bottom > 0 && fr.top < vh) {
      const t = (fr.top + fr.height / 2 - vh / 2) / vh; // -1..1
      featureImg.style.setProperty("--py", (t * -40 - 40).toFixed(1));
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(measure));
  reduceMotion.addEventListener("change", () => {
    scenes.forEach((s) => s.style.setProperty("--p", 1));
    measure();
  });
  if (reduceMotion.matches) scenes.forEach((s) => s.style.setProperty("--p", 1));
  measure();
  window.addEventListener("load", measure);
})();

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
  const clamp01 = (n) => Math.min(1, Math.max(0, n));

  /* ------------------------------------------------------------
     Images. Each photo tries, in order:
       1. the site's own WebP copies (assets/img/<w>/<key>.webp)
       2. resized copies from the property's media library
       3. the original file on the media library
     ------------------------------------------------------------ */
  const LOCAL_WIDTHS = [640, 1280, 1920];
  const REMOTE_WIDTHS = [640, 1080, 1600, 2400];
  const keyOf = {};
  Object.entries(LP.photos).forEach(([k, p]) => { keyOf[p] = k; });
  const local = (key, w) => "assets/img/" + w + "/" + key + ".webp";
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
    img._photo = path;
    img._stage = 0;
    img.onerror = () => { img._stage += 1; applyStage(img); };
    applyStage(img);
  }
  function photoTag(path, alt, sizes) {
    const img = document.createElement("img");
    img.alt = alt || "";
    setPhoto(img, path, { sizes });
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
  $$("[data-link]").forEach((a) => { const h = links[a.dataset.link]; if (h) a.href = h; });
  const fills = { street: prop.street, cityline: `${prop.city}, ${prop.state} ${prop.zip}`, phone: prop.phone, manager: prop.manager };
  $$("[data-fill]").forEach((el) => { el.textContent = fills[el.dataset.fill] || ""; });

  $("#hoursList").innerHTML = prop.hours.map((h) => `<dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd>`).join("");
  $("#legalLinks").innerHTML = LP.legal.map((l) => `<li><a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join("");
  $("#year").textContent = new Date().getFullYear();
  $("#featureList").innerHTML = LP.homeFeatures.map((f) => `<li>${esc(f)}</li>`).join("");
  $("#nearbyList").innerHTML = LP.nearby.map((g) => `
    <div class="hood__group"><h3>${esc(g.group)}</h3><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`).join("");

  $("#copyPhone").addEventListener("click", () => {
    const status = $("#copyStatus");
    const fail = () => { status.textContent = "Couldn't copy. The number is " + prop.phone + "."; };
    try {
      navigator.clipboard.writeText(prop.phone).then(() => {
        status.textContent = "Number copied.";
        setTimeout(() => (status.textContent = ""), 3000);
      }, fail);
    } catch (e) { fail(); }
  });

  /* Special offer shows only inside its dates */
  const today = new Date();
  const s = LP.special;
  const specialActive = !!s && today >= new Date(s.starts + "T00:00:00") && today <= new Date(s.ends + "T23:59:59");
  if (specialActive) { const n = $("#specialNote"); n.textContent = s.text; n.hidden = false; }
  const checked = new Date(LP.checkedOn + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  $("#pricingNote").textContent = (LP.showPriceSnapshot ? `*Starting prices checked ${checked}. ` : "") + LP.pricingDisclosure;

  /* ------------------------------------------------------------
     Step inside: photo + room color follow the active step
     ------------------------------------------------------------ */
  const inside = $("#inside");
  const insideMedia = $("#insideMedia");
  const insideSteps = $("#insideSteps");
  const counter = document.createElement("span");
  counter.className = "inside__count";
  insideMedia.appendChild(counter);
  LP.insideSteps.forEach((st, i) => {
    const fig = document.createElement("figure");
    fig.dataset.i = i;
    fig.appendChild(photoTag(st.photo, "", "(min-width: 861px) 55vw, 100vw"));
    insideMedia.appendChild(fig);

    const art = document.createElement("article");
    art.className = "step";
    art.dataset.i = i;
    art.innerHTML = `
      <div class="step__media"></div>
      <span class="step__kicker">${esc(st.kicker)}</span>
      <h3 class="step__title">${esc(st.title)}</h3>
      <p class="step__body">${esc(st.body)}</p>`;
    $(".step__media", art).appendChild(photoTag(st.photo, st.alt, "92vw"));
    insideSteps.appendChild(art);
  });
  let activeStep = -1;
  function setStep(i) {
    if (i === activeStep) return;
    const figs = $$("figure", insideMedia);
    figs.forEach((f) => f.classList.remove("was-active"));
    if (figs[activeStep]) figs[activeStep].classList.add("was-active");
    figs.forEach((f, j) => f.classList.toggle("is-active", j === i));
    activeStep = i;
    inside.dataset.tone = LP.insideSteps[i].tone;
    counter.textContent = `${LP.insideSteps[i].kicker} · ${i + 1}/${LP.insideSteps.length}`;
  }
  setStep(0);
  const stepIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) setStep(Number(en.target.dataset.i)); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  $$(".step", insideSteps).forEach((a) => stepIO.observe(a));

  /* ------------------------------------------------------------
     Floor plan viewer
     ------------------------------------------------------------ */
  const plans = LP.plans;
  const planList = $("#planList");
  const stage = $("#planStage");
  const stageImg = $("#stageImg");
  let filter = "all";
  let current = plans[0].id;
  const bed = (n) => n + (n === 1 ? " Bedroom" : " Bedrooms");
  const bath = (n) => n + (n === 1 ? " Bath" : " Baths");
  const matches = (p) => filter === "all" || (filter === "two-level" ? p.levels > 1 : String(p.beds) === filter);
  const toneVar = (t) => `var(--${t || "pool"})`;

  function renderList() {
    const shown = plans.filter(matches);
    if (!shown.some((p) => p.id === current)) current = shown.length ? shown[0].id : null;
    if (!shown.length) {
      planList.innerHTML = `<p class="plans__empty">No plans match this filter.</p>`;
      stage.hidden = true;
      return;
    }
    stage.hidden = false;
    planList.innerHTML = shown.map((p, i) => `
      <button class="plan-tab" role="tab" id="tab-${p.id}" data-plan="${p.id}" data-tone="${p.tone}"
              style="--tone:${toneVar(p.tone)};animation-delay:${i * 60}ms"
              aria-selected="${p.id === current}" aria-controls="planStage" tabindex="${p.id === current ? 0 : -1}">
        <span class="plan-tab__name">${esc(p.name)}</span>
        <span class="plan-tab__meta">${p.beds} bd · ${p.baths} ba · ${p.sqft.toLocaleString()} sq ft</span>
        <span class="plan-tab__arrow" aria-hidden="true">→</span>
      </button>`).join("");
    showPlan(current, true);
  }
  function showPlan(id, force) {
    const p = plans.find((x) => x.id === id);
    if (!p || (!force && id === current && stageImg._photo === p.image)) return;
    current = id;
    $$(".plan-tab", planList).forEach((t) => {
      const on = t.dataset.plan === id;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    stage.setAttribute("aria-labelledby", "tab-" + id);
    stage.style.setProperty("--tone", toneVar(p.tone));
    const swap = () => {
      setPhoto(stageImg, p.image, { sizes: "(min-width: 861px) 40vw, 92vw", eager: true });
      stageImg.alt = p.imageAlt;
      stageImg.classList.remove("is-swapping");
    };
    stageImg.classList.add("is-swapping");
    reduceMotion.matches ? swap() : setTimeout(swap, 160);
    $("#stageName").textContent = p.name;
    $("#stageLevels").textContent = p.levels > 1 ? "Two-level" : "Single level";
    $("#stageSpecs").innerHTML = `
      <div><dt>Beds</dt><dd>${p.beds}</dd></div>
      <div><dt>Baths</dt><dd>${p.baths}</dd></div>
      <div><dt>Sq ft</dt><dd>${p.sqft.toLocaleString()}</dd></div>`;
    $("#stagePrice").innerHTML = LP.showPriceSnapshot && p.fromPrice
      ? `From <strong>${money(p.fromPrice)}</strong>/mo* · ${esc(p.term)}<small>*Total monthly leasing price, checked ${checked}. See live pricing for today's figures.</small>`
      : `See current pricing in the live leasing system.`;
    const live = $("#stageLive");
    live.href = p.url;
    live.setAttribute("aria-label", `Check availability for ${p.name} on the official leasing site`);
    $("#stageOpen").dataset.plan = p.id;
  }
  planList.addEventListener("click", (e) => {
    const t = e.target.closest(".plan-tab");
    if (t) showPlan(t.dataset.plan);
  });
  planList.addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
    const tabs = $$(".plan-tab", planList);
    const i = tabs.findIndex((t) => t.dataset.plan === current);
    const next = tabs[(i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + tabs.length) % tabs.length];
    if (next) { e.preventDefault(); showPlan(next.dataset.plan); next.focus(); }
  });
  $$(".pill[data-filter]").forEach((pill) => pill.addEventListener("click", () => {
    filter = pill.dataset.filter;
    $$(".pill[data-filter]").forEach((p) => p.setAttribute("aria-pressed", String(p === pill)));
    renderList();
  }));
  $("#stageOpen").addEventListener("click", (e) => openPlan(e.currentTarget.dataset.plan, e.currentTarget));
  renderList();

  /* Plan detail sheet — deep-linkable as #plan-<name> */
  const pd = $("#planDialog");
  let pdIndex = 0, pdReturn = null;
  function fillPlan(i) {
    pdIndex = (i + plans.length) % plans.length;
    const p = plans[pdIndex];
    $("#pdIndex").textContent = `${pdIndex + 1} / ${plans.length}`;
    $("#pdName").textContent = p.name;
    const img = $("#pdImg");
    img.alt = p.imageAlt;
    setPhoto(img, p.image, { sizes: "(max-width: 860px) 100vw, 60vw", eager: true });
    $("#pdImgLink").href = LP.useLocalPhotos ? local(keyOf[p.image], 1920) : original(p.image);
    $("#pdSpecs").innerHTML = `
      <div><dt>Beds</dt><dd>${p.beds}</dd></div>
      <div><dt>Baths</dt><dd>${p.baths}</dd></div>
      <div><dt>Sq ft</dt><dd>${p.sqft.toLocaleString()}</dd></div>`;
    const note = $("#pdNote");
    note.hidden = !p.note;
    note.textContent = p.note || "";
    $("#pdPrice").innerHTML = (LP.showPriceSnapshot && p.fromPrice
      ? `<p class="from">Total monthly leasing price from <strong>${money(p.fromPrice)}</strong>/mo* · ${esc(p.term)}</p>
         <small>*Checked ${checked}. Prices and available homes change often; see live pricing for today's figures.</small>`
      : `<p class="from">See current pricing in the live leasing system.</p>`) +
      `<small>${esc(LP.deposit)}.</small>` + (specialActive ? `<p class="special">${esc(s.text)}</p>` : "");
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
  pd.addEventListener("close", () => {
    history.replaceState(null, "", location.pathname + location.search);
    if (pdReturn && document.contains(pdReturn)) pdReturn.focus();
  });
  pd.addEventListener("click", (e) => { if (e.target === pd) pd.close(); });
  $("#pdClose").addEventListener("click", () => pd.close());
  $("#pdPrev").addEventListener("click", () => fillPlan(pdIndex - 1));
  $("#pdNext").addEventListener("click", () => fillPlan(pdIndex + 1));
  pd.addEventListener("keydown", (e) => {
    if (e.target.closest("summary, a")) return;
    if (e.key === "ArrowRight") fillPlan(pdIndex + 1);
    if (e.key === "ArrowLeft") fillPlan(pdIndex - 1);
  });
  const fromHash = () => { const m = location.hash.match(/^#plan-([a-z]+)$/); if (m) openPlan(m[1]); };
  window.addEventListener("hashchange", fromHash);
  fromHash();

  /* ------------------------------------------------------------
     Amenities: four color scenes
     ------------------------------------------------------------ */
  const track = $("#dayTrack");
  LP.scenes.forEach((sc, i) => {
    const art = document.createElement("article");
    art.className = "scene scene--" + (sc.tone || "sun");
    art.innerHTML = `
      <div class="scene__photo"></div>
      <div class="scene__text">
        <span class="scene__num" aria-hidden="true">0${i + 1}</span>
        <h3 class="scene__title">${esc(sc.title)}</h3>
        <p class="scene__body">${esc(sc.body)}</p>
        <ul class="scene__items">${sc.items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>`;
    $(".scene__photo", art).appendChild(photoTag(sc.photo, sc.alt, "(min-width: 861px) 45vw, 92vw"));
    track.appendChild(art);
  });
  const end = document.createElement("div");
  end.className = "scene__end";
  end.innerHTML = `<p>Pets welcome. Dogs and cats are allowed; ask the leasing team about pet policies and fees.</p>
    <a class="link" href="${esc(LP.links.amenities)}" target="_blank" rel="noopener">Full amenity list on the official site ↗</a>`;
  track.appendChild(end);

  /* ------------------------------------------------------------
     Gallery + lightbox
     ------------------------------------------------------------ */
  const sets = {
    apartments: LP.gallery.apartments,
    community: LP.gallery.community,
    plans: plans.map((p) => [p.image, `${p.name} · ${bed(p.beds)}, ${p.sqft} sq ft`]),
  };
  const grid = $("#galleryGrid");
  const more = $("#galleryMore");
  const tabs = $$('.pill[role="tab"]');
  let tab = "apartments", expanded = false;
  const INITIAL = 12;
  tabs.forEach((t) => { $("small", t).textContent = sets[t.dataset.tab].length; });

  function renderGallery() {
    const items = sets[tab];
    const shown = expanded ? items : items.slice(0, INITIAL);
    grid.classList.toggle("gallery__grid--plans", tab === "plans");
    grid.innerHTML = "";
    shown.forEach(([path, cap], i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "shot";
      b.style.animationDelay = Math.min(i, 8) * 45 + "ms";
      b.setAttribute("aria-label", "Open photo: " + cap);
      b.appendChild(photoTag(path, cap, tab === "plans" ? "(max-width: 860px) 100vw, 50vw" : "(max-width: 860px) 100vw, 55vw"));
      const label = document.createElement("span");
      label.textContent = cap;
      label.setAttribute("aria-hidden", "true");
      b.appendChild(label);
      b.addEventListener("click", () => openLightbox(i, b));
      grid.appendChild(b);
    });
    more.hidden = expanded || items.length <= INITIAL;
    more.textContent = `Show all ${items.length} photos`;
  }
  function selectTab(t, focus) {
    tab = t.dataset.tab; expanded = false;
    tabs.forEach((x) => { const on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1; });
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
      lbImg.alt = cap;
      setPhoto(lbImg, path, { sizes: "100vw", eager: true });
      $("#lbCaption").textContent = cap;
      $("#lbCount").textContent = `${lbIndex + 1} / ${items.length}`;
      lbImg.classList.remove("is-swapping");
    };
    reduceMotion.matches ? swap() : setTimeout(swap, 140);
  }
  function openLightbox(i, from) { lbReturn = from; showLB(i); lb.showModal(); $("#lbNext").focus(); }
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
     Map: Google Maps embed, loaded as it approaches the viewport
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
  new IntersectionObserver((en, obs) => { if (en[0].isIntersecting) { loadMap(); obs.disconnect(); } }, { rootMargin: "600px 0px" }).observe(mapFrame);

  /* ------------------------------------------------------------
     Nav, mobile menu, dock
     ------------------------------------------------------------ */
  const nav = $("#nav");
  const hero = $(".hero");
  const dock = $("#dock");
  const menu = $("#menu");
  const toggle = $("#menuToggle");
  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    if (open) { menu.scrollTop = 0; $("a", menu).focus({ preventScroll: true }); }
  }
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); } });
  mobileMQ.addEventListener("change", (e) => { if (!e.matches) setMenu(false); });

  let endInView = false;
  const endZones = new Map();
  const endIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => endZones.set(en.target, en.isIntersecting));
    endInView = Array.from(endZones.values()).some(Boolean);
    update();
  }, { threshold: 0.05 });
  endIO.observe($("#visit"));
  endIO.observe($(".footer"));

  const navLinks = $$(".nav__links a");
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) navLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id)));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  ["apartments", "amenities", "gallery", "neighborhood"].forEach((id) => sectionIO.observe(document.getElementById(id)));

  /* ------------------------------------------------------------
     Scroll scenes: one rAF loop sets --p (0→1) per pinned scene
     ------------------------------------------------------------ */
  const pinned = $$("[data-scroll]");
  const day = $("#amenities");
  const dayIntro = $(".day__intro");
  const deckCards = $$(".card");
  let lastY = window.scrollY, ticking = false, dayDistance = 0;

  const motionOn = () => !reduceMotion.matches;
  const desktopMotion = () => motionOn() && !mobileMQ.matches;

  function measure() {
    // Room above the framed hero photo = height of the headline block
    const copy = $(".hero__copy");
    hero.style.setProperty("--top", Math.round(copy.offsetTop + copy.offsetHeight + (mobileMQ.matches ? 22 : 34)) + "px");

    if (desktopMotion()) {
      dayDistance = Math.max(0, track.scrollWidth - window.innerWidth);
      day.style.height = window.innerHeight + dayDistance + "px";
    } else {
      dayDistance = 0;
      day.style.height = "";
      track.style.transform = "";
      dayIntro.style.removeProperty("--shift");
      deckCards.forEach((c) => c.style.removeProperty("transform"));
    }
    update();
  }

  function update() {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;

    // Nav: transparent on the hero top, solid after, hides while scrolling down
    if (document.body.classList.contains("menu-open")) {
      nav.classList.remove("is-hidden");
    } else {
      nav.classList.toggle("is-solid", y > 30);
      const goingDown = y > lastY + 4 && y > vh * 1.2 && !pd.open;
      if (goingDown) nav.classList.add("is-hidden");
      else if (y < lastY - 4 || y < vh) nav.classList.remove("is-hidden");
    }
    lastY = y;

    dock.classList.toggle("is-visible", y > vh * 0.7 && !endInView);

    if (!motionOn()) return;

    pinned.forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 1.5) return;
      const run = sec.offsetHeight - vh;
      const p = run > 0 ? clamp01(-r.top / run) : 0;
      sec.style.setProperty("--p", p.toFixed(4));

      if (sec.id === "community" && !mobileMQ.matches) fanCards(p);
      if (sec === day && dayDistance) {
        const x = -p * dayDistance;
        track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        dayIntro.style.setProperty("--shift", x.toFixed(1));
      }
    });
  }

  // Postcards: start as a tight stack, end as a fanned row
  function fanCards(p) {
    const n = deckCards.length;
    const w = deckCards[0].offsetWidth;
    const avail = window.innerWidth - w - 80;
    const spread = Math.min(w * 0.92, avail / (n - 1));
    const e = 1 - Math.pow(1 - clamp01(p * 1.35), 3); // ease-out
    deckCards.forEach((c, i) => {
      const mid = i - (n - 1) / 2;
      const x = mid * spread * e;
      const y = (1 - e) * (i * -10) + Math.abs(mid) * 18 * e;
      const base = parseFloat(c.style.getPropertyValue("--r")) || 0;
      const rot = base * (1 - e) + mid * 4 * e;
      c.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      c.style.zIndex = String(n - Math.round(Math.abs(mid)));
    });
  }

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(measure));
  reduceMotion.addEventListener("change", () => { pinned.forEach((x) => x.style.setProperty("--p", 0)); measure(); });
  mobileMQ.addEventListener("change", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener("load", measure);
  measure();
})();

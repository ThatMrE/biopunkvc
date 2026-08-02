/* ============================================================
   BIOPUNK — The Early-Stage Biotech Capital Map
   Vanilla JS: render + search + filter + sort + submit.
   Data lives in assets/data.js (window.CAPITAL_MAP).
   ============================================================ */
(function () {
  "use strict";

  var MAP = window.CAPITAL_MAP || { sources: [], updated: "" };
  var SOURCES = Array.isArray(MAP.sources) ? MAP.sources.slice() : [];

  var TYPES = [
    "Accelerator", "Pre-seed/Seed VC", "Corporate VC", "Venture Studio",
    "Government Grant", "Philanthropic Grant", "Fellowship", "Angel/Syndicate",
    "Prize/Competition", "Crowdfunding"
  ];
  var SECTORS = [
    "Therapeutics", "Oncology & Immunology", "Neuroscience", "Rare & Genetic Disease",
    "Longevity & Aging", "Global & Infectious Health", "Diagnostics & Devices",
    "Genomics", "Platforms & Tools", "Digital & Data / TechBio",
    "Synbio & Biomanufacturing", "Agtech & Food", "Climate & Industrial Bio",
    "Cross-cutting / All Biotech"
  ];
  var CAPITALS = ["Non-dilutive", "Equity", "Convertible/SAFE", "Mixed"];
  var STAGES = ["Idea", "Pre-seed", "Pre-seed–Seed", "Seed"];
  var STAGE_RANK = { "Idea": 0, "Pre-seed": 1, "Pre-seed–Seed": 2, "Seed": 3 };
  var CALLS = ["Rolling", "Cohorts", "Recurring", "Closed"];

  // ---- State ----
  var state = { q: "", type: "", sector: "", capital: "", stage: "", call: "", openOnly: false, sort: "type" };
  // which state keys are "advanced" (live in the collapsible panel)
  var ADVANCED = ["capital", "stage", "call", "openOnly"];

  // ---- Helpers ----
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function callLabel(c) {
    if (c === "Rolling") return "Rolling · apply anytime";
    if (c === "Cohorts") return "Cohorts · batch intake";
    if (c === "Recurring") return "Recurring call";
    if (c === "Closed") return "Not currently open";
    return c;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function count(field, value) {
    var n = 0;
    for (var i = 0; i < SOURCES.length; i++) if (SOURCES[i][field] === value) n++;
    return n;
  }

  function matches(item) {
    if (state.type && item.type !== state.type) return false;
    if (state.sector && item.sector !== state.sector) return false;
    if (state.capital && item.capital !== state.capital) return false;
    if (state.stage && item.stage !== state.stage) return false;
    if (state.call && item.call !== state.call) return false;
    if (state.openOnly && item.call === "Closed") return false;
    if (state.q) {
      var hay = (item.name + " " + item.focus + " " + item.sector + " " + item.geo + " " +
                 item.hq + " " + item.blurb + " " + item.type + " " + item.capital + " " + item.stage).toLowerCase();
      var terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var i = 0; i < terms.length; i++) { if (hay.indexOf(terms[i]) === -1) return false; }
    }
    return true;
  }

  function sortItems(a, b) {
    if (state.sort === "az") return a.name.localeCompare(b.name);
    if (state.sort === "stage") {
      var d = (STAGE_RANK[a.stage] || 9) - (STAGE_RANK[b.stage] || 9);
      return d !== 0 ? d : a.name.localeCompare(b.name);
    }
    if (state.sort === "sector") {
      var sa = SECTORS.indexOf(a.sector), sb = SECTORS.indexOf(b.sector);
      if (sa === -1) sa = 99; if (sb === -1) sb = 99;
      if (sa !== sb) return sa - sb;
      return a.name.localeCompare(b.name);
    }
    var ta = TYPES.indexOf(a.type), tb = TYPES.indexOf(b.type);
    if (ta === -1) ta = 99; if (tb === -1) tb = 99;
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name);
  }

  // ---- Rendering ----
  var gridEl, countEl;

  function cardHTML(item) {
    var host = item.url ? '<a class="ext" href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer" aria-label="Visit ' + esc(item.name) + '">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg></a>' : '';
    var nameInner = item.url
      ? '<a href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">' + esc(item.name) + '</a>'
      : esc(item.name);
    var meta = [];
    if (item.amount) meta.push('<span class="card-amount">' + esc(item.amount) + '</span>');
    if (item.stage)  meta.push('<span><b>Stage</b> ' + esc(item.stage) + '</span>');
    if (item.geo)    meta.push('<span><b>Where</b> ' + esc(item.geo) + '</span>');
    if (item.sector) meta.push('<span><b>Sector</b> ' + esc(item.sector) + '</span>');

    return '' +
      '<article class="card" data-type="' + esc(item.type) + '">' +
        '<div class="card-top">' +
          '<div class="card-name">' + nameInner + '</div>' + host +
        '</div>' +
        '<div class="badges">' +
          '<span class="badge badge-type" data-type="' + esc(item.type) + '">' + esc(item.type) + '</span>' +
          '<span class="badge badge-cap">' + esc(item.capital) + '</span>' +
          (item.call ? '<span class="badge badge-call" data-call="' + esc(item.call) + '" title="Application status">' + esc(callLabel(item.call)) + '</span>' : '') +
        '</div>' +
        '<p class="card-blurb">' + esc(item.blurb) + '</p>' +
        '<div class="card-meta">' + meta.join("") + '</div>' +
      '</article>';
  }

  // ---- Active-filter pills ----
  var PILL_DEFS = [
    { key: "q",        label: "Search",   get: function () { return state.q ? '“' + state.q + '”' : ""; }, clear: function () { state.q = ""; var s = $("#search"); if (s) s.value = ""; } },
    { key: "type",     label: "Category", get: function () { return state.type; },    clear: function () { state.type = ""; sync("#f-type"); } },
    { key: "sector",   label: "Sector",   get: function () { return state.sector; },  clear: function () { state.sector = ""; sync("#f-sector"); } },
    { key: "capital",  label: "Capital",  get: function () { return state.capital; }, clear: function () { state.capital = ""; sync("#f-capital"); } },
    { key: "stage",    label: "Stage",    get: function () { return state.stage; },   clear: function () { state.stage = ""; sync("#f-stage"); } },
    { key: "call",     label: "Status",   get: function () { return state.call; },    clear: function () { state.call = ""; sync("#f-status"); } },
    { key: "openOnly", label: "",         get: function () { return state.openOnly ? "Accepting now" : ""; }, clear: function () { state.openOnly = false; var o = $("#open-only"); if (o) o.checked = false; } }
  ];
  function sync(sel) { var e = $(sel); if (e) e.value = state[e.dataset.field]; }

  function renderPills() {
    var wrap = $("#active-pills");
    if (!wrap) return;
    wrap.innerHTML = "";
    var any = false;
    PILL_DEFS.forEach(function (d) {
      var val = d.get();
      if (!val) return;
      any = true;
      var pill = el("button", "pill");
      pill.type = "button";
      pill.innerHTML = (d.label ? '<span class="pk">' + esc(d.label) + '</span> ' : "") + esc(val) + ' <span class="x" aria-hidden="true">×</span>';
      pill.setAttribute("aria-label", "Remove filter " + (d.label ? d.label + " " : "") + val);
      pill.addEventListener("click", function () { d.clear(); update(); });
      wrap.appendChild(pill);
    });
    wrap.classList.toggle("hidden", !any);
    // advanced-filter count on the "More filters" button
    var adv = ADVANCED.filter(function (k) { return state[k]; }).length;
    var badge = $("#more-count");
    if (badge) { badge.textContent = adv ? adv : ""; badge.classList.toggle("hidden", !adv); }
  }

  function render() {
    var list = SOURCES.filter(matches).sort(sortItems);
    countEl.innerHTML = '<b>' + list.length + '</b> of ' + SOURCES.length + ' sources';
    gridEl.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : '<div class="empty"><h3>No matches</h3><p>Try clearing a filter or broadening your search.</p></div>';
  }

  function update() { renderPills(); render(); }

  // ---- Selects ----
  function fillSelect(sel, values, allLabel, labelFn) {
    if (!sel) return;
    var field = sel.dataset.field;
    var html = '<option value="">' + allLabel + '</option>';
    values.forEach(function (v) {
      var c = count(field, v);
      if (c > 0) html += '<option value="' + esc(v) + '">' + esc(labelFn ? labelFn(v) : v) + ' (' + c + ')</option>';
    });
    sel.innerHTML = html;
  }

  function clearAll() {
    state = { q: "", type: "", sector: "", capital: "", stage: "", call: "", openOnly: false, sort: state.sort };
    ["#search"].forEach(function (s) { var e = $(s); if (e) e.value = ""; });
    ["#f-type", "#f-sector", "#f-capital", "#f-stage", "#f-status"].forEach(sync);
    var oo = $("#open-only"); if (oo) oo.checked = false;
    update();
  }

  // ---- Submit form (Netlify Forms) ----
  function wireForm() {
    var form = $("#submit-form");
    if (!form) return;
    var typeSel = $("#form-type");
    if (typeSel) {
      TYPES.forEach(function (t) { var o = el("option"); o.value = t; o.textContent = t; typeSel.appendChild(o); });
      var other = el("option"); other.value = "Other"; other.textContent = "Other / not sure"; typeSel.appendChild(other);
    }
    var statusEl = $("#form-status");
    form.addEventListener("submit", function (e) {
      var bot = form.querySelector('input[name="bot-field"]');
      if (bot && bot.value) { e.preventDefault(); return; }
      e.preventDefault();
      var data = new FormData(form);
      var body = new URLSearchParams();
      data.forEach(function (v, k) { body.append(k, v); });
      statusEl.textContent = "Submitting…"; statusEl.className = "form-status";
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
        .then(function (r) {
          if (!r.ok) throw new Error("net");
          statusEl.textContent = "Thank you — your submission was received. We review additions before they go live.";
          statusEl.className = "form-status ok"; form.reset();
        })
        .catch(function () {
          statusEl.innerHTML = 'Submission failed. Please email <a href="mailto:er.creates@gmail.com">er.creates@gmail.com</a> or open a GitHub issue.';
          statusEl.className = "form-status err";
        });
    });
  }

  // ---- Reveal on scroll ----
  function wireReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -60px 0px" });
    document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
  }

  // ---- Boot ----
  function boot() {
    gridEl = $("#grid");
    countEl = $("#result-count");

    var upd = $("#updated-date"); if (upd && MAP.updated) upd.textContent = MAP.updated;
    var total = $("#stat-total"); if (total) total.textContent = SOURCES.length;
    var nd = $("#stat-nondil"); if (nd) nd.textContent = SOURCES.filter(function (s) { return s.capital === "Non-dilutive"; }).length;
    var typesCount = $("#stat-types"); if (typesCount) typesCount.textContent = new Set(SOURCES.map(function (s) { return s.type; })).size;

    var typeSel = $("#f-type");     if (typeSel) { typeSel.dataset.field = "type";    fillSelect(typeSel, TYPES, "All categories"); }
    var secSel  = $("#f-sector");   if (secSel)  { secSel.dataset.field = "sector";   fillSelect(secSel, SECTORS, "All sectors"); }
    var capSel  = $("#f-capital");  if (capSel)  { capSel.dataset.field = "capital";  fillSelect(capSel, CAPITALS, "Any capital type"); }
    var stgSel  = $("#f-stage");    if (stgSel)  { stgSel.dataset.field = "stage";    fillSelect(stgSel, STAGES, "Any stage"); }
    var calSel  = $("#f-status");   if (calSel)  { calSel.dataset.field = "call";     fillSelect(calSel, CALLS, "Any status", callLabel); }

    var s = $("#search");
    if (s) s.addEventListener("input", function () { state.q = s.value.trim(); update(); });
    if (typeSel) typeSel.addEventListener("change", function () { state.type = typeSel.value; update(); });
    if (secSel)  secSel.addEventListener("change", function () { state.sector = secSel.value; update(); });
    if (capSel)  capSel.addEventListener("change", function () { state.capital = capSel.value; update(); });
    if (stgSel)  stgSel.addEventListener("change", function () { state.stage = stgSel.value; update(); });
    if (calSel)  calSel.addEventListener("change", function () { state.call = calSel.value; update(); });
    var sortSel = $("#f-sort"); if (sortSel) sortSel.addEventListener("change", function () { state.sort = sortSel.value; render(); });
    var openOnly = $("#open-only"); if (openOnly) openOnly.addEventListener("change", function () { state.openOnly = openOnly.checked; update(); });
    var clr = $("#clear"); if (clr) clr.addEventListener("click", clearAll);

    // More-filters disclosure
    var moreBtn = $("#more-toggle"), morePanel = $("#more-panel");
    if (moreBtn && morePanel) {
      moreBtn.addEventListener("click", function () {
        var open = morePanel.hasAttribute("hidden");
        if (open) morePanel.removeAttribute("hidden"); else morePanel.setAttribute("hidden", "");
        moreBtn.setAttribute("aria-expanded", String(open));
      });
    }

    update();
    wireForm();
    wireReveal();
    var y = document.getElementById("year"); if (y) y.textContent = "2026";
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

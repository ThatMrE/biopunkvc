/* ============================================================
   BIOPUNK — The Early-Stage Biotech Capital Map
   Vanilla JS: render + search + filter + sort + submit.
   Data lives in assets/data.js (window.CAPITAL_MAP).
   ============================================================ */
(function () {
  "use strict";

  var MAP = window.CAPITAL_MAP || { sources: [], updated: "" };
  var SOURCES = Array.isArray(MAP.sources) ? MAP.sources.slice() : [];

  // Canonical ordering of types (drives chip order + submit dropdown).
  var TYPES = [
    "Accelerator",
    "Pre-seed/Seed VC",
    "Corporate VC",
    "Venture Studio",
    "Government Grant",
    "Philanthropic Grant",
    "Fellowship",
    "Angel/Syndicate",
    "Prize/Competition",
    "Crowdfunding"
  ];
  var CAPITALS = ["Non-dilutive", "Equity", "Convertible/SAFE", "Mixed"];
  var STAGES = ["Idea", "Pre-seed", "Pre-seed–Seed", "Seed"];
  var STAGE_RANK = { "Idea": 0, "Pre-seed": 1, "Pre-seed–Seed": 2, "Seed": 3 };
  // Application status: Rolling (anytime) / Cohorts (batch) / Recurring (cyclical) / Closed (dormant)
  var CALLS = ["Rolling", "Cohorts", "Recurring", "Closed"];

  // ---- State ----
  var state = {
    q: "",
    types: new Set(),      // empty = all
    capital: "",           // "" = all
    stage: "",             // "" = all
    call: "",              // "" = all
    openOnly: false,       // hide "Closed"
    sort: "type"
  };

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

  function matches(item) {
    if (state.types.size && !state.types.has(item.type)) return false;
    if (state.capital && item.capital !== state.capital) return false;
    if (state.stage && item.stage !== state.stage) return false;
    if (state.call && item.call !== state.call) return false;
    if (state.openOnly && item.call === "Closed") return false;
    if (state.q) {
      var hay = (item.name + " " + item.focus + " " + item.geo + " " + item.hq + " " +
                 item.blurb + " " + item.type + " " + item.capital + " " + item.stage).toLowerCase();
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
    // default: group by type (canonical order), then A–Z
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
    if (item.focus)  meta.push('<span><b>Focus</b> ' + esc(item.focus) + '</span>');

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

  function render() {
    var list = SOURCES.filter(matches).sort(sortItems);
    countEl.innerHTML = '<b>' + list.length + '</b> of ' + SOURCES.length + ' sources';
    if (!list.length) {
      gridEl.innerHTML = '<div class="empty"><h3>No matches</h3><p>Try clearing a filter or broadening your search.</p></div>';
      return;
    }
    gridEl.innerHTML = list.map(cardHTML).join("");
  }

  // ---- Filter UI wiring ----
  function buildChips() {
    var wrap = $("#type-chips");
    if (!wrap) return;
    var counts = {};
    SOURCES.forEach(function (s) { counts[s.type] = (counts[s.type] || 0) + 1; });
    TYPES.forEach(function (t) {
      if (!counts[t]) return;
      var c = el("button", "chip");
      c.type = "button";
      c.setAttribute("aria-pressed", "false");
      c.setAttribute("data-type", t);
      c.innerHTML = esc(t) + '<span class="cnt">' + counts[t] + '</span>';
      c.addEventListener("click", function () {
        if (state.types.has(t)) { state.types.delete(t); c.setAttribute("aria-pressed", "false"); }
        else { state.types.add(t); c.setAttribute("aria-pressed", "true"); }
        render();
      });
      wrap.appendChild(c);
    });
  }

  function fillSelect(sel, values, allLabel, labelFn) {
    if (!sel) return;
    var field = sel.dataset.field;
    var html = '<option value="">' + allLabel + '</option>';
    values.forEach(function (v) {
      // only include values that actually appear in the data
      if (SOURCES.some(function (s) { return s[field] === v; })) {
        html += '<option value="' + esc(v) + '">' + esc(labelFn ? labelFn(v) : v) + '</option>';
      }
    });
    sel.innerHTML = html;
  }

  function clearAll() {
    state.q = ""; state.types.clear(); state.capital = ""; state.stage = ""; state.call = ""; state.openOnly = false;
    var s = $("#search"); if (s) s.value = "";
    var cap = $("#f-capital"); if (cap) cap.value = "";
    var stg = $("#f-stage"); if (stg) stg.value = "";
    var cal = $("#f-status"); if (cal) cal.value = "";
    var oo = $("#open-only"); if (oo) oo.checked = false;
    document.querySelectorAll("#type-chips .chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    render();
  }

  // ---- Submit form (Netlify Forms) progressive enhancement ----
  function wireForm() {
    var form = $("#submit-form");
    if (!form) return;

    // Populate the type dropdown in the form
    var typeSel = $("#form-type");
    if (typeSel) {
      TYPES.forEach(function (t) {
        var o = el("option"); o.value = t; o.textContent = t; typeSel.appendChild(o);
      });
      var other = el("option"); other.value = "Other"; other.textContent = "Other / not sure"; typeSel.appendChild(other);
    }

    var statusEl = $("#form-status");
    form.addEventListener("submit", function (e) {
      // Honeypot check
      var bot = form.querySelector('input[name="bot-field"]');
      if (bot && bot.value) { e.preventDefault(); return; }

      e.preventDefault();
      var data = new FormData(form);
      var body = new URLSearchParams();
      data.forEach(function (v, k) { body.append(k, v); });

      statusEl.textContent = "Submitting…";
      statusEl.className = "form-status";

      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
        .then(function (r) {
          if (!r.ok) throw new Error("net");
          statusEl.textContent = "Thank you — your submission was received. We review additions before they go live.";
          statusEl.className = "form-status ok";
          form.reset();
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
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -60px 0px" });
    document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
  }

  // ---- Boot ----
  function boot() {
    gridEl = $("#grid");
    countEl = $("#result-count");

    // Updated date + counts in hero
    var upd = $("#updated-date"); if (upd && MAP.updated) upd.textContent = MAP.updated;
    var total = $("#stat-total"); if (total) total.textContent = SOURCES.length;
    var nd = $("#stat-nondil");
    if (nd) nd.textContent = SOURCES.filter(function (s) { return s.capital === "Non-dilutive"; }).length;
    var typesCount = $("#stat-types");
    if (typesCount) typesCount.textContent = new Set(SOURCES.map(function (s) { return s.type; })).size;

    buildChips();
    var capSel = $("#f-capital"); if (capSel) { capSel.dataset.field = "capital"; fillSelect(capSel, CAPITALS, "All capital types"); }
    var stgSel = $("#f-stage"); if (stgSel) { stgSel.dataset.field = "stage"; fillSelect(stgSel, STAGES, "All stages"); }
    var calSel = $("#f-status"); if (calSel) { calSel.dataset.field = "call"; fillSelect(calSel, CALLS, "Any application status", callLabel); }

    var s = $("#search");
    if (s) s.addEventListener("input", function () { state.q = s.value.trim(); render(); });
    if (capSel) capSel.addEventListener("change", function () { state.capital = capSel.value; render(); });
    if (stgSel) stgSel.addEventListener("change", function () { state.stage = stgSel.value; render(); });
    if (calSel) calSel.addEventListener("change", function () { state.call = calSel.value; render(); });
    var openOnly = $("#open-only");
    if (openOnly) openOnly.addEventListener("change", function () { state.openOnly = openOnly.checked; render(); });
    var sortSel = $("#f-sort");
    if (sortSel) sortSel.addEventListener("change", function () { state.sort = sortSel.value; render(); });
    var clr = $("#clear"); if (clr) clr.addEventListener("click", clearAll);

    render();
    wireForm();
    wireReveal();

    document.getElementById("year") && (document.getElementById("year").textContent = "2026");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();

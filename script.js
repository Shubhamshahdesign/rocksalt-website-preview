/* Rocksalt Café × Deli — site behaviour */
(function () {
  "use strict";

  // ---------- Opening hours (Europe/London) ----------
  // Day index: 0 = Sunday … 6 = Saturday. Times in minutes from midnight.
  var HOURS = {
    0: [510, 1260], // Sun 08:30 – 21:00
    1: [510, 1200], // Mon 08:30 – 20:00
    2: [510, 1200],
    3: [510, 1200],
    4: [510, 1200],
    5: [510, 1200], // Fri
    6: [510, 1260]  // Sat 08:30 – 21:00
  };

  function londonNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[map.weekday], mins: (parseInt(map.hour, 10) % 24) * 60 + parseInt(map.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function fmt(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm;
  }

  function updateStatus() {
    var now = londonNow();
    var today = HOURS[now.day];
    var open = now.mins >= today[0] && now.mins < today[1];
    var text;
    if (open) {
      text = "Open now · until " + fmt(today[1]);
    } else if (now.mins < today[0]) {
      text = "Closed · opens today at " + fmt(today[0]);
    } else {
      text = "Closed · opens tomorrow at " + fmt(HOURS[(now.day + 1) % 7][0]);
    }
    var el = document.querySelector("[data-status]");
    var dot = document.querySelector("[data-status-dot]");
    if (el) el.textContent = text;
    if (dot) { dot.classList.toggle("is-open", open); dot.classList.toggle("is-closed", !open); }

    var row = document.querySelector('[data-hours] tr[data-day="' + now.day + '"]');
    document.querySelectorAll("[data-hours] tr").forEach(function (r) { r.classList.remove("is-today"); });
    if (row) row.classList.add("is-today");
  }
  updateStatus();
  setInterval(updateStatus, 60 * 1000);

  // ---------- Mobile navigation ----------
  var toggle = document.querySelector("[data-nav-toggle]");
  var list = document.querySelector("[data-nav-list]");
  function closeNav() {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "false");
    list.classList.remove("is-open");
  }
  if (toggle && list) {
    toggle.addEventListener("click", function () {
      var openNow = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!openNow));
      list.classList.toggle("is-open", !openNow);
    });
    list.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) closeNav(); });
  }

  // ---------- Header shadow on scroll ----------
  var header = document.querySelector("[data-header]");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Menu tabs (accessible tablist) ----------
  var tablist = document.querySelector("[data-tabs]");
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t, false); });
      t.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }

  // ---------- Active nav link ----------
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__list a[href^="#"]:not(.btn)'));
  if ("IntersectionObserver" in window && links.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id); });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (l) { var s = document.querySelector(l.getAttribute("href")); if (s) spy.observe(s); });
  }

  // ---------- Reveal on scroll ----------
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // ---------- Year ----------
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();

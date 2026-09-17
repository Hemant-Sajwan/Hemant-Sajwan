/* =========================================================
   CISSP Accelerator — interactions
   ========================================================= */

/* -----------------------------------------------------------
   1) Registration link — set once, applied everywhere.
   Replace the value below with your live registration / checkout URL.
----------------------------------------------------------- */
var REGISTRATION_URL = "#register"; // e.g. "https://checkout.hemantsajwan.com/cissp"

(function applyRegistrationLink() {
  if (!REGISTRATION_URL || REGISTRATION_URL === "#register") return;
  document.querySelectorAll("[data-register]").forEach(function (el) {
    el.setAttribute("href", REGISTRATION_URL);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
})();

/* -----------------------------------------------------------
   2) Current year in footer
----------------------------------------------------------- */
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* -----------------------------------------------------------
   3) Sticky header shadow on scroll
----------------------------------------------------------- */
var header = document.getElementById("siteHeader");
if (header) {
  var onScroll = function () {
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* -----------------------------------------------------------
   4) Reveal-on-scroll (respects reduced-motion)
----------------------------------------------------------- */
(function reveal() {
  var els = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

  els.forEach(function (el) { io.observe(el); });
})();

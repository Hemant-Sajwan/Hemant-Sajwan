/* =========================================================
   CISSP Accelerator — shared script for all 3 variations
   ========================================================= */

/* Registration link: each page sets window.REGISTRATION_URL before
   loading this script. Replace the placeholder in each HTML file with
   the live checkout (paid) / registration (free) link. */
(function applyReg() {
  var url = window.REGISTRATION_URL;
  if (!url || url.charAt(0) === "#") return;
  document.querySelectorAll("[data-register]").forEach(function (el) {
    el.setAttribute("href", url);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
})();

/* current year */
var y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

/* reveal on scroll */
(function reveal() {
  var els = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  els.forEach(function (el) { io.observe(el); });
})();

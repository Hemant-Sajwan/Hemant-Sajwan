/* =========================================================
   CISSP Accelerator — interactions
   ========================================================= */

/* -----------------------------------------------------------
   1) Registration link — set once, applied to every CTA.
   Replace with your live registration / checkout URL.
----------------------------------------------------------- */
var REGISTRATION_URL = "#offer"; // e.g. "https://checkout.hemantsajwan.com/cissp"

/* -----------------------------------------------------------
   2) Video — paste a YouTube/Vimeo EMBED url here.
   Example YouTube:  "https://www.youtube.com/embed/XXXXXXXXXXX"
   Example Vimeo:    "https://player.vimeo.com/video/XXXXXXXXX"
   Leave empty to keep the poster + play button placeholder.
----------------------------------------------------------- */
var VIDEO_EMBED_URL = "";

/* ---------- apply registration link ---------- */
(function applyRegistrationLink() {
  if (!REGISTRATION_URL || REGISTRATION_URL.charAt(0) === "#") return;
  document.querySelectorAll("[data-register]").forEach(function (el) {
    el.setAttribute("href", REGISTRATION_URL);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener");
  });
})();

/* ---------- video player ---------- */
(function video() {
  var frame = document.getElementById("videoFrame");
  var play = document.getElementById("videoPlay");
  if (!frame || !play) return;

  var url = VIDEO_EMBED_URL || frame.getAttribute("data-embed");

  function mount() {
    if (!url) return; // no video yet — leave placeholder
    var iframe = document.createElement("iframe");
    iframe.src = url + (url.indexOf("?") > -1 ? "&" : "?") + "autoplay=1";
    iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.title = "CISSP Accelerator intro video";
    frame.innerHTML = "";
    frame.appendChild(iframe);
  }
  play.addEventListener("click", mount);
})();

/* ---------- countdown to the workshop ---------- */
(function countdown() {
  var el = document.getElementById("countdown");
  if (!el) return;
  var deadline = new Date(el.getAttribute("data-deadline")).getTime();
  if (isNaN(deadline)) return;

  var dEl = el.querySelector("[data-d]");
  var hEl = el.querySelector("[data-h]");
  var mEl = el.querySelector("[data-m]");
  var sEl = el.querySelector("[data-s]");
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };

  function tick() {
    var diff = deadline - Date.now();
    if (diff <= 0) {
      dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = "00";
      clearInterval(timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    dEl.textContent = pad(Math.floor(s / 86400));
    hEl.textContent = pad(Math.floor((s % 86400) / 3600));
    mEl.textContent = pad(Math.floor((s % 3600) / 60));
    sEl.textContent = pad(s % 60);
  }
  tick();
  var timer = setInterval(tick, 1000);
})();

/* ---------- current year ---------- */
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- sticky header shadow ---------- */
var header = document.getElementById("siteHeader");
if (header) {
  var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 12); };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- reveal-on-scroll (respects reduced-motion) ---------- */
(function reveal() {
  var els = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    els.forEach(function (el) { el.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
  els.forEach(function (el) { io.observe(el); });
})();

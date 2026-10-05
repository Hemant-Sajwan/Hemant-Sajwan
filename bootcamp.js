/* Shared script for the new bootcamp pages */

// Point every "Reserve your seat" button at the page's registration link
(function () {
  var url = window.REGISTRATION_URL;
  if (!url || url === "#") return;
  document.querySelectorAll("[data-register]").forEach(function (el) {
    el.href = url;
    el.target = "_blank";
    el.rel = "noopener";
  });
})();

// Keep the copyright year current
var year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Testimonial carousel: arrows, dots, counter and swipe (swipe is built into the browser)
document.querySelectorAll("[data-carousel]").forEach(function (box) {
  var track = box.querySelector(".carousel-track");
  var slides = track.children;
  var dots = box.querySelector(".carousel-dots");
  var count = box.querySelector(".carousel-count");
  var current = 0;

  for (var i = 0; i < slides.length; i++) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Testimonial " + (i + 1));
    dot.addEventListener("click", goTo.bind(null, i));
    dots.appendChild(dot);
  }

  function goTo(i) {
    i = (i + slides.length) % slides.length; // wrap around at either end
    track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft });
  }

  function update() {
    current = Math.round(track.scrollLeft / track.clientWidth);
    Array.prototype.forEach.call(dots.children, function (d, i) {
      d.setAttribute("aria-selected", i === current ? "true" : "false");
    });
    count.textContent = (current + 1) + " / " + slides.length;
  }

  box.querySelector(".prev").addEventListener("click", function () { goTo(current - 1); });
  box.querySelector(".next").addEventListener("click", function () { goTo(current + 1); });
  track.addEventListener("scroll", function () { window.requestAnimationFrame(update); });
  update();
});

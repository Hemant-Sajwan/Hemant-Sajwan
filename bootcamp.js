/* Shared script for the new bootcamp pages */

// Registration pop-up: every "Register Now" button opens the form
(function () {
  var modal = document.getElementById("register-form");
  if (!modal) return;
  var form = modal.querySelector("form");
  var status = modal.querySelector(".reg-status");
  var submit = modal.querySelector(".reg-submit");

  function open(e) {
    e.preventDefault();
    showStep("form");
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    form.querySelector("input[name=first_name]").focus();
  }
  function close() { if (modal.close) modal.close(); else modal.removeAttribute("open"); }
  function showStep(name) {
    modal.querySelectorAll(".reg-step").forEach(function (s) { s.hidden = s.getAttribute("data-step") !== name; });
  }

  document.querySelectorAll("[data-register]").forEach(function (el) { el.addEventListener("click", open); });
  modal.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", close); });
  // clicking the dark area outside the form closes it
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });

  // field checks: first name, email and phone are required
  var rules = {
    first_name: function (v) { return v.trim().length > 0; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    phone: function (v) { var d = v.replace(/\D/g, ""); return /^\+?[\d\s().-]+$/.test(v.trim()) && d.length >= 8 && d.length <= 15; }
  };
  function check(input) {
    var rule = rules[input.name];
    if (!rule) return true;
    var ok = rule(input.value);
    input.closest(".reg-field").classList.toggle("invalid", !ok);
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }
  form.querySelectorAll("input").forEach(function (input) {
    input.addEventListener("blur", function () { if (input.value) check(input); });
    input.addEventListener("input", function () {
      if (input.closest(".reg-field") && input.closest(".reg-field").classList.contains("invalid")) check(input);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var firstBad = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!check(input) && !firstBad) firstBad = input;
    });
    if (firstBad) { firstBad.focus(); return; }

    var info = window.BOOTCAMP || {};
    form.elements.bootcamp_dates.value = info.dates || "";
    var data = new FormData(form);
    var name = form.elements.first_name.value.trim();
    var endpoint = window.FORM_ENDPOINT;
    var payment = window.PAYMENT_URL;

    function done(testMode) {
      if (payment) { window.location.href = payment; return; }   // paid page: go to payment
      modal.querySelector("[data-name]").textContent = name;
      modal.querySelector(".reg-test").hidden = !testMode;
      form.reset();
      showStep("done");
    }

    if (!endpoint) { done(true); return; }   // TEST MODE: nothing is sent anywhere

    submit.disabled = true;
    status.textContent = "Sending…";
    var google = endpoint.indexOf("script.google.com") !== -1;
    fetch(endpoint, {
      method: "POST",
      body: data,
      mode: google ? "no-cors" : "cors",
      headers: google ? {} : { Accept: "application/json" }
    }).then(function (res) {
      if (!google && !res.ok) throw new Error("Bad response");
      status.textContent = "";
      done(false);
    }).catch(function () {
      status.textContent = "Sorry, something went wrong. Please try again, or email support@hemantsajwan.com.";
    }).then(function () { submit.disabled = false; });
  });
})();

// Fill in the bootcamp dates, time(s) and mode from window.BOOTCAMP (set at the top of each page)
(function () {
  var info = window.BOOTCAMP;
  if (!info) return;
  document.querySelectorAll("[data-bootcamp]").forEach(function (el) {
    var value = info[el.getAttribute("data-bootcamp")];
    if (value == null) return;
    if (Array.isArray(value)) value = value.join(el.getAttribute("data-join") || "\n");
    el.textContent = value;
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

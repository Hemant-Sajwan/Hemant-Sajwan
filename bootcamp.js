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

  // ---- phone: country dropdown + number box ----
  var select = form.elements.country_iso;
  var numberBox = form.elements.phone_number;
  var countries = window.PHONE_COUNTRIES || [];
  var byIso = {};
  countries.forEach(function (c) { byIso[c[0]] = c; });
  var POPULAR = ["IN", "AE", "AU", "NZ", "US", "CA", "GB", "SG", "SA", "QA"];

  function flag(iso) {   // turns "IN" into the 🇮🇳 flag emoji
    return String.fromCodePoint.apply(null, iso.split("").map(function (ch) { return 127397 + ch.charCodeAt(0); }));
  }
  function addGroup(label, list) {
    var group = document.createElement("optgroup");
    group.label = label;
    list.forEach(function (c) {
      if (!c) return;
      var o = document.createElement("option");
      o.value = c[0];
      o.textContent = flag(c[0]) + "  " + c[1] + " (+" + c[2] + ")";
      group.appendChild(o);
    });
    select.appendChild(group);
  }
  addGroup("Popular", POPULAR.map(function (iso) { return byIso[iso]; }));
  addGroup("All countries", countries);

  // pre-select the likely country from the device's time zone (nothing is sent anywhere)
  var guess = "IN";
  try {
    var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    var cc = (window.TIMEZONE_COUNTRY || {})[zone];
    if (cc && byIso[cc]) guess = cc;
  } catch (err) { /* keep India */ }
  select.value = guess;

  function updateCountry() {
    var c = byIso[select.value];
    if (!c) return;
    modal.querySelector("[data-flag]").textContent = flag(c[0]);
    modal.querySelector("[data-dial]").textContent = "+" + c[2];
    numberBox.placeholder = c[5] || "";
  }
  select.addEventListener("change", function () {
    updateCountry();
    if (numberBox.closest(".reg-field").classList.contains("invalid")) check(numberBox);
  });
  updateCountry();

  // returns the number's digits (without country code or leading 0), or null if it doesn't look right
  function phoneDigits() {
    var c = byIso[select.value];
    var raw = numberBox.value.trim();
    if (!c || !raw || /[^\d\s().+-]/.test(raw)) return null;
    var d = raw.replace(/\D/g, "");
    var code = String(c[2]);
    if (/^\s*(\+|00)/.test(raw)) {          // they typed the country code anyway
      d = d.replace(/^00/, "");
      if (d.indexOf(code) !== 0) return null;
      d = d.slice(code.length);
    }
    d = d.replace(/^0+/, "");                // drop the local leading 0
    return d.length >= c[3] && d.length <= c[4] ? d : null;
  }

  // field checks: first name, email and phone are required
  var rules = {
    first_name: function (v) { return v.trim().length > 0; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    phone_number: function () { return phoneDigits() !== null; }
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
    var country = byIso[select.value];
    form.elements.phone.value = "+" + country[2] + " " + phoneDigits();   // e.g. +91 9876543210
    form.elements.country.value = country[1];
    var data = new FormData(form);
    var name = form.elements.first_name.value.trim();
    var endpoint = window.FORM_ENDPOINT;
    var payment = window.PAYMENT_URL;

    function done(testMode) {
      if (payment) { window.location.href = payment; return; }   // paid page: go to payment
      modal.querySelector("[data-name]").textContent = name;
      modal.querySelector(".reg-test").hidden = !testMode;
      form.reset();
      select.value = guess;
      updateCountry();
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

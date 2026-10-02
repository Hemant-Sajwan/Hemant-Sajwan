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

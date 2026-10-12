/**
 * CISSP Accelerator – bootcamp registrations
 * ------------------------------------------------------------------
 * Paste this whole file into your Google Sheet:
 *   Extensions → Apps Script → replace everything → Save.
 * Then deploy it as a Web app (see SETUP.md next to this file).
 *
 * What it does for every registration from the pop-up form:
 *   1. Adds a row to the tab for that bootcamp batch (created if missing):
 *      "morning-bootcamp" (Mon–Tue) or "evening-bootcamp" (Wed–Thu).
 *      The page says which one (batch: "morning" / "evening" at the top of the page).
 *      Your other tabs (and Pabbly) are never touched.
 *   2. Sends a confirmation email to the person (free-bootcamp entries only;
 *      paid-page entries haven't paid yet, so they are marked "Payment pending").
 */

// ================== SETTINGS – edit these if you like ==================
var SETTINGS = {
  // One tab per bootcamp batch. The left side is the "batch" value set at the top of each landing page.
  TABS: {
    morning: "morning-bootcamp",   // Mon–Tue bootcamp
    evening: "evening-bootcamp"    // Wed–Thu bootcamp
  },
  // Entries from a page with no (or an unknown) batch value go here.
  DEFAULT_TAB: "morning-bootcamp",

  SEND_EMAIL: true,                       // false = only save to the sheet
  FROM_NAME: "Hemant Sajwan",             // name people see as the sender
  REPLY_TO: "support@hemantsajwan.com",   // where replies go
  // Send from this address (Google Workspace). It must be the account that owns this sheet,
  // or a "Send mail as" alias of it in Gmail settings. Otherwise the email comes from the owner's address.
  FROM_ADDRESS: "support@hemantsajwan.com",
  EMAIL_SUBJECT: "You're registered: 2-Day CISSP Accelerator – Domain 1 Bootcamp",

  // Optional: paste the Zoom link to include it in the email, e.g. "https://zoom.us/j/123..."
  // Leave "" and the email says the joining details will follow.
  ZOOM_LINK: "",

  // Paid-page entries: send the confirmation email only after payment (false),
  // or straight away like free entries (true).
  EMAIL_PAID_BEFORE_PAYMENT: false
};
// =======================================================================

// Column order for the tabs. Each value is written under the column with the same heading,
// so you can also drag columns around in the sheet yourself (keep the headings unchanged).
var COLUMNS = ["Bootcamp dates", "Bootcamp time", "Timestamp", "First name", "Email", "Phone",
               "Country", "Challenges", "Page", "Status"];

/** Receives each registration from the website form. */
function doPost(e) {
  var p = (e && e.parameter) || {};

  // spam trap: people never fill this hidden field, bots usually do
  if (p.website) return reply({ ok: true });

  var entry = {
    firstName: clean(p.first_name, 60),
    email: clean(p.email, 120).toLowerCase(),
    phone: clean(p.phone, 25),
    country: clean(p.country, 60),
    challenges: clean(p.challenges, 1000),
    page: clean(p.page, 60),
    dates: clean(p.bootcamp_dates, 80),
    times: clean(p.bootcamp_times, 120),
    mode: clean(p.bootcamp_mode, 60),
    batch: clean(p.batch, 20).toLowerCase()
  };
  if (!entry.firstName || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(entry.email) || !entry.phone) {
    return reply({ ok: false, error: "missing or invalid fields" });
  }

  var isPaid = /paid/i.test(entry.page);
  var status = isPaid ? "Payment pending" : "Registered";

  // send the email first so its result can be recorded in the row
  if (SETTINGS.SEND_EMAIL && (!isPaid || SETTINGS.EMAIL_PAID_BEFORE_PAYMENT)) {
    status += sendConfirmation(entry) ? " · email sent" : " · email NOT sent";
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);   // one write at a time, so rows never overlap
  try {
    appendByHeading(getTab(tabFor(entry.batch)), {
      "Bootcamp dates": entry.dates, "Bootcamp time": entry.times, "Timestamp": new Date(),
      "First name": entry.firstName, "Email": entry.email, "Phone": entry.phone,
      "Country": entry.country, "Challenges": entry.challenges, "Page": entry.page, "Status": status
    });
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}

/** Lets you open the web-app link in a browser to check it is running. */
function doGet() {
  return ContentService.createTextOutput("Bootcamp registration receiver is running.");
}

/** Sends the confirmation email. Returns true if it was sent. */
function sendConfirmation(entry) {
  try {
    if (MailApp.getRemainingDailyQuota() < 1) return false;
    var joining = SETTINGS.ZOOM_LINK
      ? 'Join on Zoom: <a href="' + esc(SETTINGS.ZOOM_LINK) + '">' + esc(SETTINGS.ZOOM_LINK) + "</a>"
      : "You’ll receive the information you need to join the sessions before the bootcamp.";
    var challengeLine = entry.challenges
      ? "<p>Thank you for sharing your challenges. I’ll keep them in mind during the sessions.</p>"
      : "";
    var html =
      '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0d1b2a;max-width:560px">' +
      "<p>Hi " + esc(entry.firstName) + ",</p>" +
      "<p>Thank you for registering for the <strong>2-Day CISSP Accelerator – Domain 1 Bootcamp</strong>.</p>" +
      '<table style="border-collapse:collapse;margin:12px 0;background:#eef2f7;border-left:4px solid #FFD401">' +
      row("Dates", entry.dates) + row("Time", entry.times) + row("Mode", entry.mode) +
      "</table>" +
      "<p>" + joining + "</p>" +
      challengeLine +
      "<p>Have a question? Just reply to this email.</p>" +
      "<p>See you there,<br>Hemant Sajwan<br>CISSP Accelerator</p>" +
      "</div>";
    var plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    var opts = { name: SETTINGS.FROM_NAME, replyTo: SETTINGS.REPLY_TO, htmlBody: html };
    var owner = String(Session.getEffectiveUser().getEmail() || "").toLowerCase();
    var from = String(SETTINGS.FROM_ADDRESS || "").toLowerCase();
    if (from && from !== owner && GmailApp.getAliases().map(function (a) { return a.toLowerCase(); }).indexOf(from) !== -1) {
      opts.from = SETTINGS.FROM_ADDRESS;              // send as the support@ alias
      GmailApp.sendEmail(entry.email, SETTINGS.EMAIL_SUBJECT, plain, opts);
    } else {
      MailApp.sendEmail(entry.email, SETTINGS.EMAIL_SUBJECT, plain, opts);   // owner's own address
    }
    return true;
  } catch (err) {
    console.error("Email failed: " + err);
    return false;
  }
}

/**
 * Run this once from the editor (select "testSetup" at the top, click Run).
 * It creates the tab and emails a sample confirmation to YOUR OWN address,
 * so you can check how it looks. Nothing is sent to anyone else.
 */
function testSetup() {
  setupTabs();
  var me = Session.getActiveUser().getEmail();
  var ok = sendConfirmation({
    firstName: "Hemant (test)", email: me, dates: "14th & 15th Oct 2026 (Wed–Thu)",
    times: "7:30 PM IST (India)", mode: "Online (English)", challenges: "Test"
  });
  console.log(ok ? "Test email sent to " + me : "Test email could not be sent");
}

/**
 * Run this once from the editor (select "setupTabs" at the top, click Run).
 * Renames the old "Bootcamp Registrations" tab to the morning tab (rows kept),
 * creates any batch tab that is missing, and puts the columns of every batch tab
 * in the COLUMNS order (existing rows move with their columns). Sends no email.
 */
function setupTabs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var old = ss.getSheetByName("Bootcamp Registrations");
  if (old && !ss.getSheetByName(SETTINGS.DEFAULT_TAB)) old.setName(SETTINGS.DEFAULT_TAB);
  Object.keys(SETTINGS.TABS).forEach(function (k) { orderColumns(getTab(SETTINGS.TABS[k])); });
  console.log("Tabs ready: " + Object.keys(SETTINGS.TABS).map(function (k) { return SETTINGS.TABS[k]; }).join(", "));
}

// ---------------- helpers ----------------
function tabFor(batch) { return SETTINGS.TABS[batch] || SETTINGS.DEFAULT_TAB; }
function getTab(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(COLUMNS);
    sh.getRange(1, 1, 1, COLUMNS.length).setFontWeight("bold").setBackground("#004AAD").setFontColor("#ffffff");
    sh.setFrozenRows(1);
    var ts = COLUMNS.indexOf("Timestamp") + 1;
    sh.getRange(1, ts, sh.getMaxRows(), 1).setNumberFormat("dd mmm yyyy, hh:mm");
  }
  return sh;
}
function headings(sh) {
  var n = sh.getLastColumn();
  return n ? sh.getRange(1, 1, 1, n).getValues()[0].map(function (h) { return String(h).trim(); }) : [];
}
// Adds one row, putting each value under its heading. A missing heading is added at the end.
function appendByHeading(sh, values) {
  var head = headings(sh);
  Object.keys(values).forEach(function (h) {
    if (head.indexOf(h) === -1) {
      head.push(h);
      sh.getRange(1, head.length).setValue(h).setFontWeight("bold").setBackground("#004AAD").setFontColor("#ffffff");
    }
  });
  sh.appendRow(head.map(function (h) { return h in values ? safeCell(values[h]) : ""; }));
}
// Moves columns (with their data) so the headings follow the COLUMNS order.
function orderColumns(sh) {
  COLUMNS.forEach(function (name, i) {
    var at = headings(sh).indexOf(name) + 1;
    if (at > 0 && at !== i + 1) sh.moveColumns(sh.getRange(1, at, sh.getMaxRows(), 1), i + 1);
  });
}
function clean(v, max) { return String(v || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max); }
// stop text like "=..." or "+91..." being treated as a spreadsheet formula
function safeCell(v) { return typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v; }
function esc(s) {
  return String(s || "").replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function row(label, value) {
  return value ? '<tr><td style="padding:6px 14px;font-weight:bold">' + label + '</td><td style="padding:6px 14px">' +
    esc(value) + "</td></tr>" : "";
}
function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

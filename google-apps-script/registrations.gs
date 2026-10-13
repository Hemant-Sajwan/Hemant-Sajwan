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
 *   3. Sends a WhatsApp confirmation (approved template) through the Meta WhatsApp
 *      Cloud API, once the keys are added (see WHATSAPP-SETUP.md). Same rule as the email.
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

  // WhatsApp community link shown in the email
  WHATSAPP_LINK: "https://wa.cisspaccelerator.com/",

  // Your regular WhatsApp number for queries, country code + digits only, e.g. "919876543210".
  // Shown in the email as a tap-to-chat link. Leave "" to show only the support email.
  SUPPORT_WHATSAPP: "919871157549",

  // Paid-page entries: send the confirmation email only after payment (false),
  // or straight away like free entries (true).
  EMAIL_PAID_BEFORE_PAYMENT: false,

  // ---- WhatsApp confirmation (Meta WhatsApp Cloud API) ----
  // The access token and phone number ID are NOT stored here. They go in
  // Project Settings → Script Properties (WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID).
  // Until both are there, no WhatsApp message is sent.
  SEND_WHATSAPP: true,
  WHATSAPP_TEMPLATE: "bootcamp_registration",   // template name exactly as approved in WhatsApp Manager
  WHATSAPP_LANGUAGE: "en",                      // template language code, e.g. "en" or "en_US"
  // What fills the template's {{1}}, {{2}}, {{3}} ... in that order.
  // Choices: "firstName", "dates", "times", "mode", "email"
  WHATSAPP_PARAMS: ["firstName", "dates", "times"],
  // Your own WhatsApp number (with country code) for the testWhatsApp function, e.g. "+91 98765 43210"
  WHATSAPP_TEST_NUMBER: "919871157549",
  GRAPH_API_VERSION: "v23.0"
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
  if (SETTINGS.SEND_WHATSAPP && (!isPaid || SETTINGS.EMAIL_PAID_BEFORE_PAYMENT)) {
    var wa = sendWhatsApp(entry);
    if (wa) status += wa.ok ? " · WhatsApp sent" : " · WhatsApp NOT sent";   // nothing added while not set up
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
    var p = function (html) { return '<p style="margin:0 0 14px">' + html + "</p>"; };
    var joinHtml = SETTINGS.ZOOM_LINK
      ? '<a href="' + esc(SETTINGS.ZOOM_LINK) + '">' + esc(SETTINGS.ZOOM_LINK) + "</a>"
      : "<em>Will be shared as we get closer to the bootcamp</em>";
    var joinText = SETTINGS.ZOOM_LINK || "Will be shared as we get closer to the bootcamp";
    var wa = SETTINGS.WHATSAPP_LINK;
    var supportWa = String(SETTINGS.SUPPORT_WHATSAPP || "").replace(/\D/g, "");
    var queriesHtml = "For any queries or concerns, email " +
      '<a href="mailto:support@hemantsajwan.com">support@hemantsajwan.com</a>' +
      (supportWa ? ' or WhatsApp me at <a href="https://wa.me/' + supportWa + '">+' + supportWa + "</a>" : "") + ".";
    var queriesText = "For any queries or concerns, email support@hemantsajwan.com" +
      (supportWa ? " or WhatsApp me at https://wa.me/" + supportWa : "") + ".";
    var html =
      '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0d1b2a;max-width:560px">' +
      p("Hi " + esc(entry.firstName) + ",") +
      p("Congratulations on signing up, and welcome to the <strong>2-Day CISSP Accelerator - Domain 1 Bootcamp</strong>!") +
      p("You’ve made a smart move toward crushing your CISSP goals, and I’m here to help you do it with clarity, confidence, and speed.") +
      p("<strong>🗓️ Bootcamp Schedule:</strong>") +
      '<table style="border-collapse:collapse;margin:0 0 14px;background:#eef2f7;border-left:4px solid #FFD401">' +
      row("Dates:", esc(entry.dates)) + row("Time:", esc(entry.times)) + row("Join Link:", joinHtml) +
      "</table>" +
      p("You’ll get 2 days of focused, high-impact training covering the Domain 1 of CISSP designed to simplify complex concepts and accelerate your exam prep.") +
      p("<strong>📬 What’s next?</strong>") +
      p("Join our whatsapp community to get useful updates and resources:<br>" +
        '<a href="' + esc(wa) + '">' + esc(wa.replace(/^https?:\/\//, "")) + "</a>") +
      p("You’ll receive reminders and joining link before each session. Block your calendar so that you don't miss out.") +
      p(queriesHtml) +
      p("And in case this email landed in your spam or promotions or junk folder, please mark it as “Not Spam/Promotion/Junk”, so you don’t miss such emails the next time.") +
      p("Get ready to:<br>✅ Simplify your CISSP strategy<br>✅ Avoid overwhelm with a structured plan<br>✅ Understand the concepts so they stick longer") +
      p("This isn’t another generic training. It’s a fast-track to getting CISSP-ready, minus the stress.") +
      p("Excited to see you in the sessions,<br><br>Hemant") +
      "</div>";
    var plain = [
      "Hi " + entry.firstName + ",",
      "Congratulations on signing up, and welcome to the 2-Day CISSP Accelerator - Domain 1 Bootcamp!",
      "You’ve made a smart move toward crushing your CISSP goals, and I’m here to help you do it with clarity, confidence, and speed.",
      "🗓️ Bootcamp Schedule:\nDates: " + (entry.dates || "") + "\nTime: " + (entry.times || "") + "\nJoin Link: " + joinText,
      "You’ll get 2 days of focused, high-impact training covering the Domain 1 of CISSP designed to simplify complex concepts and accelerate your exam prep.",
      "📬 What’s next?",
      "Join our whatsapp community to get useful updates and resources:\n" + wa,
      "You’ll receive reminders and joining link before each session. Block your calendar so that you don't miss out.",
      queriesText,
      "And in case this email landed in your spam or promotions or junk folder, please mark it as “Not Spam/Promotion/Junk”, so you don’t miss such emails the next time.",
      "Get ready to:\n✅ Simplify your CISSP strategy\n✅ Avoid overwhelm with a structured plan\n✅ Understand the concepts so they stick longer",
      "This isn’t another generic training. It’s a fast-track to getting CISSP-ready, minus the stress.",
      "Excited to see you in the sessions,\n\nHemant"
    ].join("\n\n");
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
 * Sends the WhatsApp template message.
 * Returns null when WhatsApp isn't set up yet, otherwise { ok: true/false, detail: "..." }.
 */
function sendWhatsApp(entry) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty("WHATSAPP_TOKEN");
  var phoneId = props.getProperty("WHATSAPP_PHONE_NUMBER_ID");
  if (!token || !phoneId) return null;
  var to = String(entry.phone || "").replace(/\D/g, "");          // "+91 98765 43210" -> "919876543210"
  if (to.length < 8) return { ok: false, detail: "phone number too short" };
  var params = SETTINGS.WHATSAPP_PARAMS.map(function (key) {
    // template values may not contain line breaks or long runs of spaces
    var text = String(entry[key] || "-").replace(/\s+/g, " ").trim() || "-";
    return { type: "text", text: text };
  });
  var template = { name: SETTINGS.WHATSAPP_TEMPLATE, language: { code: SETTINGS.WHATSAPP_LANGUAGE } };
  if (params.length) template.components = [{ type: "body", parameters: params }];
  try {
    var res = UrlFetchApp.fetch(
      "https://graph.facebook.com/" + SETTINGS.GRAPH_API_VERSION + "/" + encodeURIComponent(phoneId) + "/messages", {
        method: "post",
        contentType: "application/json",
        headers: { Authorization: "Bearer " + token },
        payload: JSON.stringify({ messaging_product: "whatsapp", to: to, type: "template", template: template }),
        muteHttpExceptions: true
      });
    var code = res.getResponseCode();
    var body = res.getContentText();
    if (code >= 200 && code < 300) return { ok: true, detail: body };
    console.error("WhatsApp failed (" + code + "): " + body);
    return { ok: false, detail: code + " " + body };
  } catch (err) {
    console.error("WhatsApp failed: " + err);
    return { ok: false, detail: String(err) };
  }
}

/**
 * Run this after adding WHATSAPP_TOKEN in Project Settings → Script Properties
 * (select "findPhoneNumberId" at the top, click Run). It lists the WhatsApp numbers
 * the token can use, with their Phone number IDs. Sends nothing.
 */
function findPhoneNumberId() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty("WHATSAPP_TOKEN");
  if (!token) { console.log("Add WHATSAPP_TOKEN in Project Settings → Script Properties first."); return; }
  var base = "https://graph.facebook.com/" + SETTINGS.GRAPH_API_VERSION;
  var get = function (url) {
    var res = UrlFetchApp.fetch(url, { headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true });
    return JSON.parse(res.getContentText() || "{}");
  };
  // which WhatsApp accounts the token was given (or WHATSAPP_BUSINESS_ACCOUNT_ID, if set)
  var accounts = [];
  var own = props.getProperty("WHATSAPP_BUSINESS_ACCOUNT_ID");
  if (own) accounts.push(own);
  else {
    var info = get(base + "/debug_token?input_token=" + encodeURIComponent(token));
    if (info.error) { console.log("Meta replied: " + info.error.message); return; }
    var scopes = (info.data && info.data.scopes) || [];
    console.log("Token permissions: " + (scopes.join(", ") || "none"));
    if (scopes.indexOf("whatsapp_business_messaging") === -1) {
      console.log("The token is missing whatsapp_business_messaging. Make a new token and tick it (step 4C).");
      return;
    }
    ((info.data && info.data.granular_scopes) || []).forEach(function (sc) {
      if (/^whatsapp_business_/.test(sc.permission)) (sc.target_ids || []).forEach(function (id) {
        if (accounts.indexOf(id) === -1) accounts.push(id);
      });
    });
  }
  if (!accounts.length) {
    console.log("Meta didn't say which WhatsApp account this token is for. Add your WhatsApp account ID as the script property " +
      "WHATSAPP_BUSINESS_ACCOUNT_ID (Business settings → Accounts → WhatsApp accounts → your account → ID), then run this again.");
    return;
  }
  accounts.forEach(function (acc) {
    var list = get(base + "/" + acc + "/phone_numbers?fields=id,display_phone_number,verified_name");
    if (list.error) {
      console.log("WhatsApp account " + acc + ": " + list.error.message +
        " (check that this WhatsApp account is assigned to the system user with full control, step 4B, then make a new token)");
      return;
    }
    if (!(list.data || []).length) console.log("WhatsApp account " + acc + " has no phone numbers. Is this the right account ID?");
    (list.data || []).forEach(function (n) {
      console.log(n.display_phone_number + " (" + n.verified_name + ")  →  Phone number ID: " + n.id);
    });
  });
}

/**
 * Run this from the editor after adding the WhatsApp keys (select "testWhatsApp", click Run).
 * Sends the template to WHATSAPP_TEST_NUMBER only, with sample details, and shows Meta's answer.
 */
function testWhatsApp() {
  if (!SETTINGS.WHATSAPP_TEST_NUMBER) { console.log("Put your number in WHATSAPP_TEST_NUMBER first."); return; }
  var r = sendWhatsApp({
    firstName: "Hemant (test)", phone: SETTINGS.WHATSAPP_TEST_NUMBER,
    dates: "14th & 15th Oct 2026 (Wed–Thu)", times: "7:30 PM IST (India)", mode: "Online (English)", email: "test"
  });
  if (!r) console.log("WhatsApp is not set up: add WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Project Settings → Script Properties.");
  else console.log((r.ok ? "Sent. " : "NOT sent. ") + "Meta replied: " + r.detail);
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
// value must already be HTML-safe (use esc() on user text)
function row(label, valueHtml) {
  return '<tr><td style="padding:6px 14px;font-weight:bold;vertical-align:top">' + label +
    '</td><td style="padding:6px 14px">' + valueHtml + "</td></tr>";
}
function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

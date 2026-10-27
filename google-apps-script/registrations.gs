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
 *
 * Paid registrations: Razorpay notifies Pabbly the moment a payment succeeds, and Pabbly
 * passes the buyer's details here (see PAID-SETUP.md). The row is marked PAID and the
 * same email and WhatsApp confirmations go out.
 *
 * Reminder and follow-up emails (2–20): see reminders.gs and emails.gs (REMINDERS-SETUP.md).
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

  // ---- Paid registrations (Razorpay → Pabbly → this script) ----
  // Which batch paid buyers are booked into: its dates and time come from that row of the Settings tab.
  PAID_BATCH_KEY: "evening",
  // Pabbly must send this secret with every payment (stored in Script Properties as PAID_SECRET),
  // so nobody else can add fake "paid" rows.

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
var COLUMNS = ["Bootcamp dates", "Bootcamp time", "Paid/Free?", "Timestamp", "First name", "Email", "Phone",
               "Country", "Challenges", "Page", "Status", "Emails sent", "Unsubscribed", "Payment ID"];

/** Receives each registration from the website form. */
function doPost(e) {
  var p = (e && e.parameter) || {};
  // Pabbly may send JSON instead of form fields
  if (e && e.postData && /json/i.test(e.postData.type || "")) {
    try { var body = JSON.parse(e.postData.contents || "{}"); Object.keys(body).forEach(function (k) { p[k] = String(body[k]); }); } catch (err) {}
  }

  // spam trap: people never fill this hidden field, bots usually do
  if (p.website) return reply({ ok: true });

  if (p.source === "razorpay") return reply(handlePaid(p));

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
  var emailed = false;

  // send the email first so its result can be recorded in the row
  if (SETTINGS.SEND_EMAIL && (!isPaid || SETTINGS.EMAIL_PAID_BEFORE_PAYMENT)) {
    emailed = sendConfirmation(entry);
    status += emailed ? " · email sent" : " · email NOT sent";
  }
  if (SETTINGS.SEND_WHATSAPP && (!isPaid || SETTINGS.EMAIL_PAID_BEFORE_PAYMENT)) {
    var wa = sendWhatsApp(entry);
    if (wa) status += wa.ok ? " · WhatsApp sent" : " · WhatsApp NOT sent";   // nothing added while not set up
  }

  var ts = new Date();
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);   // one write at a time, so rows never overlap
  try {
    appendByHeading(getTab(tabFor(entry.batch)), {
      "Bootcamp dates": entry.dates, "Bootcamp time": entry.times, "Paid/Free?": "FREE", "Timestamp": ts,
      "First name": entry.firstName, "Email": entry.email, "Phone": entry.phone,
      "Country": entry.country, "Challenges": entry.challenges, "Page": entry.page, "Status": status,
      "Emails sent": emailed ? "1" : ""
    });
  } finally {
    lock.releaseLock();
  }
  warnIfDatesDiffer(entry.batch, entry.dates);
  onNewRegistration(ts);      // books email 2 (1 hour after registering), see reminders.gs
  return reply({ ok: true });
}

/** Tells you once if a page's dates don't match its row in the Settings tab (then reminders wouldn't reach those people). */
function warnIfDatesDiffer(batchKey, dates) {
  try {
    var b = readBatches().filter(function (x) { return x.key === batchKey; })[0];
    if (!b || normDates(b.dates) === normDates(dates)) return;
    var key = "DATES_WARNED|" + batchKey + "|" + normDates(dates);
    var props = PropertiesService.getScriptProperties();
    if (props.getProperty(key)) return;
    props.setProperty(key, "1");
    notifyAdmin("Dates on the page don't match the Settings tab",
      "A registration for the " + batchKey + " batch came in with the dates \"" + dates + "\", but the Settings tab says \"" + b.dates +
      "\".\n\nPeople registered with different dates won't get the reminder emails. Make the page's EDIT EACH WEEK block and the Settings tab match exactly.");
  } catch (err) { console.error(err); }
}

/**
 * A paid registration passed on by Pabbly after a successful Razorpay payment.
 * Expected fields: secret, name, email, phone, payment_id (amount optional).
 */
function handlePaid(p) {
  var secret = PropertiesService.getScriptProperties().getProperty("PAID_SECRET");
  if (!secret || p.secret !== secret) return { ok: false, error: "not allowed" };

  var fullName = clean(p.name, 80);
  var b = readBatches().filter(function (x) { return x.key === SETTINGS.PAID_BATCH_KEY; })[0];
  if (!b) notifyAdmin("Paid registration: no Settings row for the " + SETTINGS.PAID_BATCH_KEY + " batch",
    "A payment came in from " + fullName + " <" + p.email + "> but the Settings tab has no " + SETTINGS.PAID_BATCH_KEY +
    " row with dates and a Day 1 start, so the row has no bootcamp dates. Fill in the Settings tab and add the dates to that row.");
  var batch = b ? { tab: b.tab, dates: b.dates, times: b.time } : { tab: tabFor(SETTINGS.PAID_BATCH_KEY), dates: "", times: "" };
  var entry = {
    firstName: fullName.split(" ")[0] || fullName,   // greeting uses the first name only
    email: clean(p.email, 120).toLowerCase(),
    phone: clean(p.phone, 25),
    dates: batch.dates, times: batch.times, mode: "Online (English)",
    paymentId: clean(p.payment_id, 40)
  };
  if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(entry.email) || !entry.phone) {
    return { ok: false, error: "missing or invalid fields" };
  }
  if (entry.phone.charAt(0) !== "+" && /^\d{11,15}$/.test(entry.phone)) entry.phone = "+" + entry.phone;

  var sh = getTab(batch.tab);
  var ts = new Date();
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // the same payment can be passed on twice (retries); only the first one counts
    if (entry.paymentId && hasValue(sh, "Payment ID", entry.paymentId)) return { ok: true, duplicate: true };
    var row = appendByHeading(sh, {
      "Bootcamp dates": entry.dates, "Bootcamp time": entry.times, "Paid/Free?": "PAID", "Timestamp": ts,
      "First name": fullName, "Email": entry.email, "Phone": entry.phone,
      "Page": "Paid bootcamp", "Status": "Paid", "Payment ID": entry.paymentId
    });
  } finally {
    lock.releaseLock();
  }

  var status = "Paid";
  var emailed = SETTINGS.SEND_EMAIL && sendConfirmation(entry);
  if (SETTINGS.SEND_EMAIL) status += emailed ? " · email sent" : " · email NOT sent";
  if (SETTINGS.SEND_WHATSAPP) {
    var wa = sendWhatsApp(entry);
    if (wa) status += wa.ok ? " · WhatsApp sent" : " · WhatsApp NOT sent";
  }
  setByHeading(sh, row, "Status", status);
  if (emailed) setByHeading(sh, row, "Emails sent", "1");
  onNewRegistration(ts);
  return { ok: true };
}

/**
 * Run this once (select "makePaidSecret", click Run). It creates a random secret, saves it in
 * Script Properties as PAID_SECRET and shows it in the log so you can paste it into Pabbly.
 * Running it again makes a NEW secret, and Pabbly must then be updated too.
 */
function makePaidSecret() {
  var secret = Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "").slice(0, 8);
  PropertiesService.getScriptProperties().setProperty("PAID_SECRET", secret);
  console.log("Saved. Paste this into the Pabbly step as the value of \"secret\": " + secret);
}

/**
 * Run this from the editor to try a paid registration without paying
 * (select "testPaidRegistration", click Run). It adds a row marked PAID to the
 * paid batch tab, emails YOU and sends the WhatsApp to WHATSAPP_TEST_NUMBER.
 */
function testPaidRegistration() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty("PAID_SECRET")) { console.log("Add PAID_SECRET in Script Properties first."); return; }
  var r = handlePaid({
    secret: props.getProperty("PAID_SECRET"), name: "Hemant Test", email: Session.getActiveUser().getEmail(),
    phone: SETTINGS.WHATSAPP_TEST_NUMBER || "", payment_id: "test_" + new Date().getTime()
  });
  console.log(r.ok ? "Done. Check the " + tabFor(SETTINGS.PAID_BATCH_KEY) + " tab, your inbox and WhatsApp." : "Didn't work: " + r.error);
}

/** Opening the web-app link: the unsubscribe link (see reminders.gs), otherwise a "running" check. */
function doGet(e) {
  if (e && e.parameter && e.parameter.unsub) return handleUnsubscribe(e.parameter);
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
    deliver(entry.email, SETTINGS.EMAIL_SUBJECT, plain, html);   // from support@ (see reminders.gs)
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
 * Run this once when setting up the reply notifications (Pabbly): select
 * "connectRepliesToApp" at the top and click Run. It tells your WhatsApp account to send
 * incoming messages to the "Bootcamp sheet" app, whose webhook then forwards them to Pabbly.
 * Needs WHATSAPP_TOKEN and WHATSAPP_BUSINESS_ACCOUNT_ID in Script Properties. Sends no message.
 * Other connected apps (e.g. a whitelabel) keep receiving messages as before.
 */
function connectRepliesToApp() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty("WHATSAPP_TOKEN");
  var waba = props.getProperty("WHATSAPP_BUSINESS_ACCOUNT_ID");
  if (!token || !waba) { console.log("Add WHATSAPP_TOKEN and WHATSAPP_BUSINESS_ACCOUNT_ID in Script Properties first."); return; }
  var url = "https://graph.facebook.com/" + SETTINGS.GRAPH_API_VERSION + "/" + encodeURIComponent(waba) + "/subscribed_apps";
  var opts = { headers: { Authorization: "Bearer " + token }, muteHttpExceptions: true };
  var res = UrlFetchApp.fetch(url, Object.assign({ method: "post" }, opts));
  console.log(res.getResponseCode() < 300 ? "Done. Meta replied: " + res.getContentText()
                                          : "Didn't work. Meta replied: " + res.getContentText());
  var list = JSON.parse(UrlFetchApp.fetch(url, opts).getContentText() || "{}");
  ((list && list.data) || []).forEach(function (a) {
    var app = a.whatsapp_business_api_data || {};
    console.log("Connected app: " + (app.name || "?") + " (" + (app.id || "?") + ")");
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
  Object.keys(SETTINGS.TABS).forEach(function (k) {
    var sh = getTab(SETTINGS.TABS[k]);
    addMissingHeadings(sh);
    orderColumns(sh);
    fillBlank(sh, "Paid/Free?", "FREE");   // rows from before this column existed were free sign-ups
    var sent = headings(sh).indexOf("Emails sent") + 1;   // keep "1, 2, 3" as text (Sheets may read it as a date)
    if (sent > 0) sh.getRange(1, sent, sh.getMaxRows(), 1).setNumberFormat("@");
  });
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
    sh.getRange(1, COLUMNS.indexOf("Emails sent") + 1, sh.getMaxRows(), 1).setNumberFormat("@");
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
  return sh.getLastRow();
}
function addMissingHeadings(sh) {
  var head = headings(sh);
  COLUMNS.forEach(function (h) {
    if (head.indexOf(h) === -1) {
      head.push(h);
      sh.getRange(1, head.length).setValue(h).setFontWeight("bold").setBackground("#004AAD").setFontColor("#ffffff");
    }
  });
}
function setByHeading(sh, row, heading, value) {
  var col = headings(sh).indexOf(heading) + 1;
  if (col > 0) sh.getRange(row, col).setValue(safeCell(value));
}
function hasValue(sh, heading, value) {
  var col = headings(sh).indexOf(heading) + 1;
  var last = sh.getLastRow();
  if (col < 1 || last < 2) return false;
  return sh.getRange(2, col, last - 1, 1).getValues().some(function (r) { return String(r[0]) === value; });
}
// puts value into every empty cell of that column on rows that have data
function fillBlank(sh, heading, value) {
  var col = headings(sh).indexOf(heading) + 1;
  var last = sh.getLastRow();
  if (col < 1 || last < 2) return;
  var range = sh.getRange(2, col, last - 1, 1);
  range.setValues(range.getValues().map(function (r) { return [r[0] === "" ? value : r[0]]; }));
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

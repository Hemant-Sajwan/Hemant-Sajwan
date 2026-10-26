/**
 * CISSP Accelerator – reminder & follow-up email engine
 * ------------------------------------------------------------------
 * Paste this whole file into a THIRD script file in the same Apps Script project
 * (Files "+" → Script → name it "reminders"). The wording of the emails is in emails.gs.
 *
 * How it works
 *   - Each batch (morning / evening) has ONE row in the "Settings" tab: the dates as shown on the
 *     page, the time shown in emails, the exact Day 1 and Day 2 start, the join link and the replay links.
 *   - People belong to a batch when the "Bootcamp dates" in their row matches the Settings row.
 *   - Every email has a send time (see emails.gs). The script books an alarm for the next email that is
 *     due, sends it, then books the next one. An hourly safety check catches anything missed.
 *   - People only get emails whose send time is AFTER they registered (email 2: 1 hour after they
 *     registered, skipped if that would be after Day 1 starts).
 *   - Promotional emails get an unsubscribe link and skip people who unsubscribed.
 *   - Replay emails wait until the replay link is in the Settings tab (you get a reminder to add it).
 *   - After each email goes out you get a summary: who got it and who didn't.
 *
 * One-time setup: run "setupReminders" (see REMINDERS-SETUP.md).
 */

var REMINDER_SETTINGS = {
  ADMIN_EMAIL: "support@hemantsajwan.com",   // where summaries and notifications go
  BOOKING_LINK: "https://calendly.com/hemantsajwan/",
  // The web app link (same as FORM_ENDPOINT on the free page). Used for the unsubscribe link.
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwyXSlj3sdRX9tlnjn1vcxH-lNPv9L3GgrGsti_2AuO_f01eqbJaI7hnHNfP-lGlWT0Pw/exec",
  KEEP_COPIES_IN_SENT: false,   // false = reminders don't stay in the Sent folder (confirmations still do)
  TIME_ZONE: "Asia/Kolkata",
  SETTINGS_TAB: "Settings",
  LATE_LIMIT_HOURS: 24          // after-session emails are dropped if they're this late (e.g. script was off)
};

var SETTINGS_HEADINGS = ["Batch", "Registrations tab", "Dates (exactly as on the page)", "Time (shown in emails)",
  "Day 1 starts", "Day 2 starts", "Join link", "Day 1 replay link", "Day 2 replay link"];

// ===================== one-time setup =====================

/** Run once: creates the Settings tab and the columns, switches on the timer. Sends nothing to registrants. */
function setupReminders() {
  setupTabs();                                   // adds "Emails sent" and "Unsubscribed" columns
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getSpreadsheetTimeZone() !== REMINDER_SETTINGS.TIME_ZONE) {
    console.log("Spreadsheet time zone changed from " + ss.getSpreadsheetTimeZone() + " to " + REMINDER_SETTINGS.TIME_ZONE);
    ss.setSpreadsheetTimeZone(REMINDER_SETTINGS.TIME_ZONE);
  }
  ensureSettingsTab();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty("REMINDERS_START")) props.setProperty("REMINDERS_START", String(Date.now()));
  if (!props.getProperty("UNSUB_SECRET")) props.setProperty("UNSUB_SECRET", Utilities.getUuid() + Utilities.getUuid());
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "safetyEmailCheck") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("safetyEmailCheck").timeBased().everyHours(1).create();
  scheduleNextEmail();
  console.log("Reminders are on. Fill in the Settings tab, then run showSchedule to check the send times.");
}

/** Run this any time (especially after editing the Settings tab): shows when each email goes out, and books the next alarm. Sends nothing. */
function showSchedule() {
  var batches = readBatches();
  if (!batches.length) { console.log("No batch in the Settings tab has a Day 1 start yet."); return; }
  batches.forEach(function (b) {
    var people = batchRows(b);
    console.log("=== " + b.key + " batch: " + b.dates + "  (" + people.length + " registered so far) ===");
    console.log("Day 1 starts " + fmt(b.day1) + (b.day2 ? ", Day 2 starts " + fmt(b.day2) : ", Day 2 start MISSING"));
    EMAILS.forEach(function (e) {
      if (e.anchor === "registration") { console.log("Email " + e.id + ": 1 hour after each registration"); return; }
      var due = dueTime(b, e);
      if (!due) { console.log("Email " + e.id + ": needs the Day 2 start"); return; }
      var state = isDone(b, e) ? "  [done]" : "";
      var missing = (e.needs || []).filter(function (k) { return !b[k]; });
      console.log("Email " + e.id + ": " + fmt(due) + state + (missing.length ? "  (waiting for " + missing.join(", ") + ")" : "") +
                  "  – " + e.subject);
    });
  });
  scheduleNextEmail();                                   // (re)book the next alarm, e.g. after editing the Settings tab
  var next = PropertiesService.getScriptProperties().getProperty("NEXT_RUN");
  console.log("Next alarm: " + (next ? fmt(new Date(+next)) : "none"));
}

/** Sends every email (2–19) to ADMIN_EMAIL only, filled in with the first batch's details, so you can check them. */
function previewAllEmails() {
  var b = readBatches()[0] || { key: "sample", dates: "28th & 29th Oct 2026 (Wed–Thu)", time: "7:30 PM IST (India)",
    join_link: "https://example.com/join", replay_link_day1: "https://example.com/replay-1", replay_link_day2: "https://example.com/replay-2" };
  EMAILS.forEach(function (e) {
    var vars = varsFor(b, { firstName: "Hemant", email: REMINDER_SETTINGS.ADMIN_EMAIL });
    var msg = buildEmail(e, vars);
    deliver(REMINDER_SETTINGS.ADMIN_EMAIL, "[Preview " + e.id + "] " + e.subject, msg.text, msg.html);
  });
  console.log("Sent " + EMAILS.length + " previews to " + REMINDER_SETTINGS.ADMIN_EMAIL);
}

// ===================== the timer =====================

function safetyEmailCheck() { runEmailSchedule(); }

/** Sends whatever is due now, then books the next alarm. */
function runEmailSchedule() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return;                  // another run is busy; it will book the next alarm
  var started = Date.now(), outOfTime = false;
  var budget = function () { return Date.now() - started < 4.5 * 60 * 1000; };   // Google allows 6 min per run
  try {
    var now = new Date();
    readBatches().forEach(function (b) {
      if (outOfTime) return;
      // ---- batch-wide emails ----
      EMAILS.forEach(function (e) {
        if (outOfTime || e.anchor === "registration" || isDone(b, e)) return;
        var due = dueTime(b, e);
        if (!due || due.getTime() > now.getTime() + 30 * 1000) return;           // not due yet
        var anchor = e.anchor === "day1" ? b.day1 : b.day2;
        if (e.minutes < 0 && now >= anchor) { markDone(b, e); notifyAdmin("Email " + e.id + " skipped (too late)",
          "Email " + e.id + " (\"" + e.subject + "\") for the " + b.key + " batch was due " + fmt(due) +
          " but the session had already started, so it was not sent."); return; }
        if (e.minutes >= 0 && now.getTime() - due.getTime() > REMINDER_SETTINGS.LATE_LIMIT_HOURS * 3600e3) { markDone(b, e); return; }
        var missing = (e.needs || []).filter(function (k) { return !b[k]; });
        if (missing.length) { askForLinkOnce(b, e, missing); return; }
        var people = batchRows(b).filter(function (r) {
          return r.ts && r.ts < due && !hasSent(r, e.id) && !(e.promo && r.unsub);
        });
        var res = sendToPeople(b, e, people, budget);
        if (res.stoppedEarly) outOfTime = true; else markDone(b, e);
        sendSummary(b, e, res);
      });
      // ---- email 2: 1 hour after each registration ----
      if (outOfTime) return;
      var start = +PropertiesService.getScriptProperties().getProperty("REMINDERS_START") || 0;
      EMAILS.filter(function (e) { return e.anchor === "registration"; }).forEach(function (e) {
        var due = [], skip = [];
        batchRows(b).forEach(function (r) {
          if (!r.ts || r.ts.getTime() < start || hasSent(r, e.id) || hasSent(r, e.id + "-")) return;
          var t = r.ts.getTime() + e.minutes * 60e3;
          if (t >= b.day1.getTime()) { skip.push(r); return; }                // would land after Day 1 starts
          if (t <= now.getTime() + 30 * 1000 && !(e.promo && r.unsub)) due.push(r);
        });
        skip.forEach(function (r) { addSentMark(r, e.id + "-"); });
        if (!due.length) return;
        var res = sendToPeople(b, e, due, budget);
        if (res.stoppedEarly) outOfTime = true;
        if (res.failed.length) sendSummary(b, e, res);                        // only tell you when something failed
      });
    });
  } catch (err) {
    notifyAdmin("Reminder emails: something went wrong", String(err && err.stack || err));
  } finally {
    lock.releaseLock();
  }
  scheduleNextEmail(outOfTime ? new Date(Date.now() + 60e3) : null);
}

/** Books one alarm for the next email that is due (or `soon`, if given). */
function scheduleNextEmail(soon) {
  var now = Date.now(), next = soon ? soon.getTime() : Infinity;
  var start = +PropertiesService.getScriptProperties().getProperty("REMINDERS_START") || 0;
  readBatches().forEach(function (b) {
    EMAILS.forEach(function (e) {
      if (e.anchor === "registration") {
        if (b.day1.getTime() <= now) return;
        batchRows(b).forEach(function (r) {
          if (!r.ts || r.ts.getTime() < start || hasSent(r, e.id) || hasSent(r, e.id + "-") || (e.promo && r.unsub)) return;
          var t2 = r.ts.getTime() + e.minutes * 60e3;
          if (t2 < b.day1.getTime()) next = Math.min(next, t2);
        });
        return;
      }
      if (isDone(b, e)) return;
      var due = dueTime(b, e);
      if (!due) return;
      var t = due.getTime();
      if (t < now) {                                    // overdue: waiting for a link, or just missed
        var waiting = (e.needs || []).some(function (k) { return !b[k]; });
        t = now + (waiting ? 30 : 1) * 60e3;
      }
      next = Math.min(next, t);
    });
  });
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "runEmailSchedule") ScriptApp.deleteTrigger(t);
  });
  var props = PropertiesService.getScriptProperties();
  if (next === Infinity) { props.deleteProperty("NEXT_RUN"); return; }
  next = Math.max(next, now + 60e3);                    // alarms must be in the future
  ScriptApp.newTrigger("runEmailSchedule").timeBased().at(new Date(next)).create();
  props.setProperty("NEXT_RUN", String(next));
}

/** Called after each new registration: books an earlier alarm if email 2 for this person comes first. */
function onNewRegistration(ts) {
  try {
    var e2 = EMAILS.filter(function (e) { return e.anchor === "registration"; })[0];
    if (!e2) return;
    var t = ts.getTime() + e2.minutes * 60e3;
    var next = +PropertiesService.getScriptProperties().getProperty("NEXT_RUN") || Infinity;
    if (t >= next) return;
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return;                    // the running job will book the next alarm
    try { scheduleNextEmail(); } finally { lock.releaseLock(); }
  } catch (err) { console.error("Could not book the next reminder: " + err); }
}

// ===================== sending =====================

function sendToPeople(b, e, people, budget) {
  var res = { sent: [], failed: [], stoppedEarly: false, startedAt: new Date() };
  for (var i = 0; i < people.length; i++) {
    if (!budget()) { res.stoppedEarly = true; break; }
    var r = people[i];
    if (MailApp.getRemainingDailyQuota() < 1) {
      res.failed.push({ r: r, why: "daily email limit reached" });
      continue;
    }
    try {
      var msg = buildEmail(e, varsFor(b, r));
      deliver(r.email, e.subject, msg.text, msg.html);
      addSentMark(r, e.id);
      res.sent.push(r);
    } catch (err) {
      res.failed.push({ r: r, why: String(err.message || err) });
      addSentMark(r, e.id + "✗");
    }
  }
  if (!REMINDER_SETTINGS.KEEP_COPIES_IN_SENT && res.sent.length) removeSentCopies(e.subject, res.startedAt, res.sent);
  return res;
}

/** Sends one email from the support@ address (same route as the confirmation email). */
function deliver(to, subject, plain, html) {
  var opts = { name: SETTINGS.FROM_NAME, replyTo: SETTINGS.REPLY_TO, htmlBody: html };
  var owner = String(Session.getEffectiveUser().getEmail() || "").toLowerCase();
  var from = String(SETTINGS.FROM_ADDRESS || "").toLowerCase();
  if (from && from !== owner && GmailApp.getAliases().map(function (a) { return a.toLowerCase(); }).indexOf(from) !== -1) {
    opts.from = SETTINGS.FROM_ADDRESS;
    GmailApp.sendEmail(to, subject, plain, opts);
  } else {
    MailApp.sendEmail(to, subject, plain, opts);
  }
}

/** Moves the copies of a reminder just sent out of the Sent folder (only threads with no replies). */
function removeSentCopies(subject, since, people) {
  try {
    var to = {};
    people.forEach(function (r) { to[r.email] = true; });
    var q = 'in:sent subject:"' + subject.replace(/"/g, "") + '" after:' + Math.floor(since.getTime() / 1000 - 60);
    GmailApp.search(q, 0, 500).forEach(function (th) {
      if (th.getMessageCount() !== 1) return;
      var m = th.getMessages()[0];
      var addr = (String(m.getTo()).match(/[^\s<>,]+@[^\s<>,]+/) || [""])[0].toLowerCase();
      if (to[addr]) th.moveToTrash();
    });
  } catch (err) { console.error("Could not tidy the Sent folder: " + err); }
}

function sendSummary(b, e, res) {
  var lines = ["Email " + e.id + ": " + e.subject, "Batch: " + b.key + " (" + b.dates + ")", ""];
  lines.push("Sent to " + res.sent.length + (res.sent.length ? ":" : "."));
  res.sent.forEach(function (r) { lines.push("  ✓ " + r.name + " <" + r.email + ">"); });
  if (res.failed.length) {
    lines.push("", "NOT sent to " + res.failed.length + ":");
    res.failed.forEach(function (f) { lines.push("  ✗ " + f.r.name + " <" + f.r.email + ">: " + f.why); });
  }
  if (res.stoppedEarly) lines.push("", "(More people still to go: the rest are being sent in a minute.)");
  notifyAdmin("Email " + e.id + " " + (res.failed.length ? "sent with " + res.failed.length + " failed" : "sent") +
              ": " + b.key + " batch (" + res.sent.length + " people)", lines.join("\n"));
}

function askForLinkOnce(b, e, missing) {
  var key = "ASKED|" + b.key + "|" + b.day1.getTime() + "|" + e.id;
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty(key)) return;
  props.setProperty(key, "1");
  var names = missing.map(function (k) { return k === "replay_link_day1" ? "Day 1 replay link" : "Day 2 replay link"; });
  notifyAdmin("Add the " + names.join(" and ") + " – email " + e.id + " is waiting",
    "Email " + e.id + " (\"" + e.subject + "\") for the " + b.key + " batch is due now, but the " + names.join(" and ") +
    " is empty in the Settings tab.\n\nPaste the link into the Settings tab. The email goes out automatically within 30 minutes.");
}

function notifyAdmin(subject, text) {
  try { MailApp.sendEmail(REMINDER_SETTINGS.ADMIN_EMAIL, "[Bootcamp emails] " + subject, text); }
  catch (err) { console.error("Could not notify: " + err); }
}

// ===================== building an email =====================

function varsFor(b, r) {
  return {
    first_name: r.firstName || r.name || "there", dates: b.dates, time: b.time,
    join_link: b.join_link, replay_link_day1: b.replay_link_day1, replay_link_day2: b.replay_link_day2,
    booking_link: REMINDER_SETTINGS.BOOKING_LINK, email: r.email
  };
}

/** Turns the simple format used in emails.gs into an HTML email and a plain-text version. */
function buildEmail(e, vars) {
  var body = e.body;
  if (e.promo) body += "\n\n---\n\nNot interested in these emails? [Click here to unsubscribe](" + unsubscribeUrl(vars.email) + ")";
  var fill = function (s) { return s.replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? String(vars[k] || "") : m; }); };
  var inline = function (s) {
    var out = esc(s)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) { return '<a href="' + u + '" style="color:#0A3A82;font-weight:bold">' + t + "</a>"; })
      .replace(/(^|[\s(])(https?:\/\/[^\s<]+)/g, function (m, pre, u) { return pre + '<a href="' + u + '" style="color:#0A3A82">' + u + "</a>"; })
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return out;
  };
  var blocks = fill(body).split(/\n\s*\n/);
  var html = blocks.map(function (blk) {
    var lines = blk.split("\n").map(function (l) { return l.replace(/\s+$/, ""); }).filter(function (l) { return l.trim(); });
    if (!lines.length) return "";
    if (lines.length === 1 && /^-{3,}$/.test(lines[0])) return '<hr style="border:0;border-top:1px solid #E2E5EA;margin:18px 0">';
    if (lines.length > 1 && lines.every(function (l) { return /^\s*[-*] /.test(l); })) {
      return '<ul style="margin:0 0 14px;padding-left:22px">' + lines.map(function (l) {
        return '<li style="margin:0 0 6px">' + inline(l.replace(/^\s*[-*] /, "")) + "</li>";
      }).join("") + "</ul>";
    }
    return '<p style="margin:0 0 14px">' + lines.map(inline).join("<br>") + "</p>";
  }).join("");
  html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1B2432;max-width:580px">' + html + "</div>";
  var text = fill(body).replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1: $2");
  return { html: html, text: text };
}

// ===================== unsubscribe =====================

function unsubscribeUrl(email) {
  return REMINDER_SETTINGS.WEB_APP_URL + "?unsub=" + encodeURIComponent(email) + "&t=" + unsubToken(email);
}
function unsubToken(email) {
  var secret = PropertiesService.getScriptProperties().getProperty("UNSUB_SECRET") || "";
  var sig = Utilities.computeHmacSha256Signature(String(email).toLowerCase(), secret);
  return Utilities.base64EncodeWebSafe(sig).replace(/=+$/, "").slice(0, 22);
}

/** Opened from the unsubscribe link (doGet). Marks the person in every batch tab and tells you. */
function handleUnsubscribe(p) {
  var email = String(p.unsub || "").toLowerCase().trim();
  var page = function (title, msg) {
    return HtmlService.createHtmlOutput(
      '<div style="font-family:Arial,sans-serif;max-width:520px;margin:12vh auto;padding:0 20px;color:#1B2432">' +
      '<h2 style="color:#0B2551">' + title + "</h2><p>" + msg + "</p></div>").setTitle(title);
  };
  if (!email || p.t !== unsubToken(email)) return page("Link not valid", "This unsubscribe link isn’t valid. Please reply to any of our emails and we’ll take care of it.");
  var already = false, found = 0, names = [];
  Object.keys(SETTINGS.TABS).forEach(function (k) {
    var sh = getTab(SETTINGS.TABS[k]);
    var head = headings(sh), last = sh.getLastRow();
    var ce = head.indexOf("Email"), cu = head.indexOf("Unsubscribed"), cn = head.indexOf("First name");
    if (ce < 0 || cu < 0 || last < 2) return;
    var vals = sh.getRange(2, 1, last - 1, head.length).getValues();
    vals.forEach(function (v, i) {
      if (String(v[ce]).toLowerCase().trim() !== email) return;
      found++;
      if (cn >= 0 && names.indexOf(v[cn]) === -1) names.push(v[cn]);
      if (v[cu]) { already = true; return; }
      sh.getRange(i + 2, cu + 1).setValue(new Date());
    });
  });
  if (found && !already) {
    notifyAdmin("Unsubscribed: " + (names.join(", ") || email), (names.join(", ") || "Someone") + " <" + email + "> unsubscribed " +
      "from the promotional emails at " + fmt(new Date()) + ".\nThey still get the bootcamp reminders and replay links.");
  }
  return page("You’re unsubscribed", "You won’t get any more promotional emails from us. " +
    "If you’re registered for a bootcamp, you’ll still receive the session reminders and replay links.");
}

// ===================== reading the sheet =====================

function ensureSettingsTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(REMINDER_SETTINGS.SETTINGS_TAB);
  if (sh) return sh;
  sh = ss.insertSheet(REMINDER_SETTINGS.SETTINGS_TAB, 0);
  sh.appendRow(SETTINGS_HEADINGS);
  sh.getRange(1, 1, 1, SETTINGS_HEADINGS.length).setFontWeight("bold").setBackground("#004AAD").setFontColor("#ffffff");
  sh.setFrozenRows(1);
  sh.appendRow(["morning", SETTINGS.TABS.morning, "", "", "", "", "", "", ""]);
  sh.appendRow(["evening", SETTINGS.TABS.evening, "", "", "", "", "", "", ""]);
  sh.getRange(2, 5, 10, 2).setNumberFormat("dd mmm yyyy, hh:mm");
  sh.getRange(1, 3).setNote("Must match the dates in the EDIT EACH WEEK block of the landing page, word for word.");
  sh.getRange(1, 5).setNote("Type like 28/10/2026 19:30 (India time). It then shows as 28 Oct 2026, 19:30.");
  sh.setColumnWidths(1, SETTINGS_HEADINGS.length, 190);
  return sh;
}

/** Reads the Settings tab. Only rows with a Day 1 start count. */
function readBatches() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REMINDER_SETTINGS.SETTINGS_TAB);
  if (!sh || sh.getLastRow() < 2) return [];
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, SETTINGS_HEADINGS.length).getValues();
  return vals.map(function (v) {
    return {
      key: String(v[0]).trim(), tab: String(v[1]).trim(), dates: String(v[2]).trim(), time: String(v[3]).trim(),
      day1: toDate(v[4]), day2: toDate(v[5]), join_link: String(v[6]).trim(),
      replay_link_day1: String(v[7]).trim(), replay_link_day2: String(v[8]).trim()
    };
  }).filter(function (b) { return b.key && b.tab && b.dates && b.day1; });
}

/** Everyone registered for this batch (rows whose "Bootcamp dates" match the Settings row). */
function batchRows(b) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(b.tab);
  if (!sh || sh.getLastRow() < 2) return [];
  var head = headings(sh);
  var col = function (h) { return head.indexOf(h); };
  var c = { dates: col("Bootcamp dates"), ts: col("Timestamp"), name: col("First name"), email: col("Email"),
            sent: col("Emails sent"), unsub: col("Unsubscribed"), status: col("Status") };
  var want = normDates(b.dates);
  var vals = sh.getRange(2, 1, sh.getLastRow() - 1, head.length).getValues();
  var out = [];
  vals.forEach(function (v, i) {
    if (normDates(v[c.dates]) !== want) return;
    var email = String(v[c.email]).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return;
    if (/payment pending/i.test(String(v[c.status]))) return;
    var name = String(v[c.name]).trim();
    out.push({ sheet: sh, row: i + 2, sentCol: c.sent + 1, ts: v[c.ts] instanceof Date ? v[c.ts] : toDate(v[c.ts]),
               name: name, firstName: name.split(" ")[0], email: email,
               sent: String(c.sent >= 0 ? v[c.sent] : ""), unsub: c.unsub >= 0 && !!v[c.unsub] });
  });
  return out;
}

function dueTime(b, e) {
  var anchor = e.anchor === "day1" ? b.day1 : e.anchor === "day2" ? b.day2 : null;
  return anchor ? new Date(anchor.getTime() + e.minutes * 60e3) : null;
}
function doneKey(b, e) { return "DONE|" + b.key + "|" + b.day1.getTime() + "|" + e.id; }
function isDone(b, e) { return !!PropertiesService.getScriptProperties().getProperty(doneKey(b, e)); }
function markDone(b, e) { PropertiesService.getScriptProperties().setProperty(doneKey(b, e), String(Date.now())); }

// "Emails sent" column holds e.g. "1, 2, 3, 7✗" (✗ = failed, "2-" = skipped)
function hasSent(r, id) { return r.sent.split(/,\s*/).indexOf(String(id)) !== -1; }
function addSentMark(r, mark) {
  r.sent = r.sent ? r.sent + ", " + mark : String(mark);
  if (r.sentCol > 0) r.sheet.getRange(r.row, r.sentCol).setValue(r.sent);
}

function normDates(s) { return String(s || "").toLowerCase().replace(/[–—]/g, "-").replace(/\s+/g, ""); }
function toDate(v) {
  if (v instanceof Date && !isNaN(v)) return v;
  var s = String(v || "").trim();
  if (!s) return null;
  var formats = ["dd/MM/yyyy HH:mm", "d/M/yyyy H:mm", "yyyy-MM-dd HH:mm", "dd MMM yyyy, HH:mm"];
  for (var i = 0; i < formats.length; i++) {
    try { var d = Utilities.parseDate(s, REMINDER_SETTINGS.TIME_ZONE, formats[i]); if (d && !isNaN(d)) return d; } catch (err) {}
  }
  return null;
}
function fmt(d) { return Utilities.formatDate(d, REMINDER_SETTINGS.TIME_ZONE, "EEE d MMM yyyy, h:mm a"); }

# Reminder & follow-up emails: setup

Emails 2–20 go out automatically at their set times (see `emails.gs` for the wording and timing).
People only get the emails whose send time comes **after** they registered. Promotional emails
(2–5 and 18–20) have an unsubscribe link. Reminders and replay emails always go out.

The project now has **three** script files:

| File | What it is |
|---|---|
| `registrations.gs` | registrations, confirmation email, WhatsApp, paid buyers (as before) |
| `reminders.gs` | the timer that sends emails 2–20, the Settings tab, summaries, unsubscribe |
| `emails.gs` | the wording and timing of emails 2–20. **Edit this one to change an email.** |

## One-time setup (about 10 minutes)
1. **Extensions → Apps Script.** Replace everything in the existing file (`Code.gs`) with `registrations.gs`.
2. Click **+** next to *Files* → **Script**, name it `reminders`, and paste `reminders.gs`.
3. Click **+** again → **Script**, name it `emails`, and paste `emails.gs`. **Save** (💾).
4. Select **setupReminders** and click **Run**. Google asks for one new permission
   ("Allow this application to run when you are not present"). Allow it.
   This creates the **Settings** tab and the **Emails sent** / **Unsubscribed** columns, and switches on the timer.
5. **Fill in the Settings tab** (one row per batch, see below).
6. Run **showSchedule**. The log lists every email with its send time and books the first alarm. Check them.
7. Optional: run **previewAllEmails**. All 19 emails go to support@ only, so you can read them.
8. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.**
   (Needed for the unsubscribe link.)

## The Settings tab
| Column | Example |
|---|---|
| Batch | `evening` (don't change) |
| Registrations tab | `evening-bootcamp` (don't change) |
| Dates (exactly as on the page) | `28th & 29th Oct 2026 (Wed–Thu)`: **word for word** the same as on the landing page |
| Time (shown in emails) | `7:30 PM IST (India) / 6 PM GST (UAE)` |
| Day 1 starts | type `28/10/2026 19:30` (India time). It shows as *28 Oct 2026, 19:30* |
| Day 2 starts | `29/10/2026 19:30` |
| Join link | the webinar link |
| Day 1 replay link | add after the Day 1 session |
| Day 2 replay link | add after the Day 2 session |

## Each week: the dates change by themselves
**8 hours before Day 1** of a batch (morning: Monday 3:00 AM IST, evening: Wednesday 11:30 AM IST):
- the landing pages switch to next week's dates (same days and times), and
- the script adds a **new row** for next week's batch to the Settings tab: same time and join link, empty replay links.
  You get an email: **"Next … batch added"**.
- just before that, a **highlighted row** is added at the bottom of the batch's registrations tab with its lead count,
  e.g. `Leads for 4th & 5th Nov 2026 (Wed–Thu): 22 (India: 10, UAE: 12)`. The same line is in the email.
  Each email address counts once; unfinished payments aren't counted; paid buyers' country comes from their phone code.

The current batch keeps its own row until its emails are done (a week after Day 2, then the row is removed),
so its people still get the replay, feedback and follow-up emails.

What you do:
1. **After each session**, paste the **replay link** into **that batch's row** (the older row, not next week's).
   If it's missing when the replay email is due, the email waits, you get a reminder, and it goes out within
   30 minutes of you adding the link.
2. If the new batch has a **different join link**, change it in the new row (before 24 hours before its Day 1).
3. To change the days or times, or skip a week: change `day1` (and `times`) in the BOOTCAMP block at the top of
   the landing page, and the batch's newest row in the Settings tab, then run **showSchedule**.
   `NEXT_BATCH_HOURS_BEFORE` at the top of `reminders.gs` sets the 8 hours (0 switches the new rows off).

## What you'll receive (at support@)
- After each email goes out: **who got it** and **who didn't** (and why).
- **Unsubscribed: name**, when someone clicks the unsubscribe link.
- **Add the Day 1/Day 2 replay link**, when a replay email is waiting.
- **Dates on the page don't match the Settings tab**, if someone registers with dates that differ.

## Good to know
- Copies of reminders are removed from the Sent folder (`KEEP_COPIES_IN_SENT: false` in `reminders.gs`).
  Confirmations stay there as before.
- The **Emails sent** column shows what each person got, e.g. `1, 2, 3, 6`. `2-` = skipped
  (registered too close to Day 1), `7✗` = failed.
- The script checks every 15 minutes (backup) in addition to its exact alarms.
- Google allows about 1,500 emails a day. On Day 1 and Day 2 everyone gets 5 emails, so a batch can have about 300 people.
- Booking link and the summary address are at the top of `reminders.gs` (`BOOKING_LINK`, `ADMIN_EMAIL`).

## Purchased, Attended and Comments
Both registrations tabs have **Purchased** and **Attended** tick boxes and a **Comments** column at the end.
Tick a person's box when they buy or attend (tick one row per person if they registered twice).

Each yellow **Leads for …** row has a live count in its **Comments** cell, e.g.
`No. of purchases = 1 (UAE: 1)  ·  Attended = 15 (India: 8, UAE: 7)`. It counts the ticked rows of that batch
and updates as soon as you tick or untick someone. (It lives in Comments because a count can't sit in the
columns it counts.) Paid buyers' Country is filled in from their phone code.

## Monthly report (1st of each month, 9 AM IST)
An email to support@ and a row in the **Monthly summary** tab: last month's total leads (each email once),
leads per country, Meta ad spend and cost per lead. Run **monthlyReport** any time to see the previous month.

**Ad spend** needs a read-only Meta token (once):
1. business.facebook.com → **Business settings → Users → System users → Add**: name `Reports`, role **Employee**.
2. Select it → **Assign assets → Ad accounts →** your ad account → only **View performance** → Save.
3. **Generate new token** → pick your app → tick only **ads_read** → expiry **Never** → copy the token.
4. Apps Script → **Project Settings → Script Properties → Add**:
   `META_ADS_TOKEN` = the token, `META_AD_ACCOUNT_ID` = the ad account number (Ads Manager, top left).
5. Run **monthlyReport** to check.

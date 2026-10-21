# Reminder & follow-up emails: setup

Emails 2–19 go out automatically at their set times (see `emails.gs` for the wording and timing).
People only get the emails whose send time comes **after** they registered. Promotional emails
(2–5 and 17–19) have an unsubscribe link. Reminders and replay emails always go out.

The project now has **three** script files:

| File | What it is |
|---|---|
| `registrations.gs` | registrations, confirmation email, WhatsApp, paid buyers (as before) |
| `reminders.gs` | the timer that sends emails 2–19, the Settings tab, summaries, unsubscribe |
| `emails.gs` | the wording and timing of emails 2–19. **Edit this one to change an email.** |

## One-time setup (about 10 minutes)
1. **Extensions → Apps Script.** Replace everything in the existing file (`Code.gs`) with `registrations.gs`.
2. Click **+** next to *Files* → **Script**, name it `reminders`, and paste `reminders.gs`.
3. Click **+** again → **Script**, name it `emails`, and paste `emails.gs`. **Save** (💾).
4. Select **setupReminders** and click **Run**. Google asks for one new permission
   ("Allow this application to run when you are not present"). Allow it.
   This creates the **Settings** tab and the **Emails sent** / **Unsubscribed** columns, and switches on the timer.
5. **Fill in the Settings tab** (one row per batch, see below).
6. Run **showSchedule**. The log lists every email with its send time. Check them.
7. Optional: run **previewAllEmails**. All 18 emails go to support@ only, so you can read them.
8. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.**
   (Needed for the unsubscribe link.)

## The Settings tab
| Column | Example |
|---|---|
| Batch | `evening` (don't change) |
| Registrations tab | `evening-bootcamp` (don't change) |
| Dates (exactly as on the page) | `28th & 29th Oct 2026 (Wed–Thu)`: **word for word** the same as the page's EDIT EACH WEEK block |
| Time (shown in emails) | `7:30 PM IST (India) / 6 PM GST (UAE)` |
| Day 1 starts | type `28/10/2026 19:30` (India time). It shows as *28 Oct 2026, 19:30* |
| Day 2 starts | `29/10/2026 19:30` |
| Join link | the webinar link |
| Day 1 replay link | add after the Day 1 session |
| Day 2 replay link | add after the Day 2 session |

## Each week
1. Update the **EDIT EACH WEEK** block on the landing page(s) **and** the batch's row in the Settings tab (same dates).
2. Clear the two replay links. Change the join link only if it changed.
3. Run **showSchedule** to check the times.
4. After each session, paste the **replay link**. If it's missing when the replay email is due, the email waits,
   you get a reminder, and it goes out within 30 minutes of you adding the link.

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
- Google allows about 1,500 emails a day. On Day 1 and Day 2 everyone gets 5 emails, so a batch can have about 300 people.
- Booking link and the summary address are at the top of `reminders.gs` (`BOOKING_LINK`, `ADMIN_EMAIL`).

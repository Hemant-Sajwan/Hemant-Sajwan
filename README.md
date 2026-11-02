# CISSP Accelerator: Domain 1 Bootcamp pages (Hemant Sajwan)

Static site for cisspaccelerator.com, served by GitHub Pages. No build step.

| Address | Page |
|---|---|
| `/` | Paid bootcamp, evening batch (Razorpay) |
| `/fve/` | Free bootcamp, evening batch |
| `/fvm/` | Free bootcamp, morning batch |
| `/free`, `/free-bootcamp` | Old addresses: forward to `/fvm/` and `/fve/` |
| `/thank-you/` | After registering or paying |
| `/privacy-policy/`, `/terms-and-conditions/`, `/refund-policy/`, `/contact-us/` | Legal pages |
| `/old/` | Archive of the earlier pages (copies of the whitelabel site) |

**Dates change by themselves every week**, 8 hours before Day 1: the pages move to next week's dates and
the Google Sheet script adds next week's row to the Settings tab (see `google-apps-script/REMINDERS-SETUP.md`).
To change the days or times, edit `day1` / `times` in the BOOTCAMP block at the top of each landing page.

- Shared files: `bootcamp.css`, `bootcamp-v2.css`, `bootcamp.js`, `phone-countries.js`, `images/`.
- Google Sheet scripts and setup guides: `google-apps-script/`.
- Before going live: `LAUNCH-CHECKLIST.md`.

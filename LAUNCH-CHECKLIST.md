# Launch checklist: CISSP Accelerator Domain 1 Bootcamp pages

Pages: `/bootcamp-free/` (free), `/bootcamp/` (paid, INR 97), `/thank-you/`,
`/privacy-policy/`, `/terms-and-conditions/`, `/refund-policy/`, `/contact-us/`.

> **Note for whoever works on this next (including Claude in a new session):**
> before the pages go live, check every unticked item below with Hemant,
> and **raise item 1 (reminder emails) even if he doesn't mention it.** He asked to be reminded.

## Must discuss before going live
1. [ ] **Reminder emails** ("starts tomorrow", "starts in 1 hour"). Hemant wants these; not built yet.
   Plan: a timed trigger in the same Google Apps Script that emails everyone registered for the next batch.

## Must be done before going live
2. [ ] **Connect the free form to Google Sheets.** Follow `google-apps-script/SETUP.md`, then put the
   web-app link in `FORM_ENDPOINT` at the top of `bootcamp-free/index.html`. Until then the form is in test mode.
3. [ ] **Confirmation email sender:** Google Workspace. The script sends from `support@hemantsajwan.com`
   (`FROM_ADDRESS` setting) if that is the sheet owner or a "Send mail as" alias.
4. [ ] **Paid registrations to the sheet + confirmation email after payment.** Plan: the script checks Razorpay
   every ~10 minutes using Razorpay API keys (stored in the script's private settings, never in the repo).
5. [ ] **Razorpay redirect after payment:** `https://hemant-sajwan.github.io/Hemant-Sajwan/thank-you/`
6. [ ] **Thank-you page Step 1 / Step 2 text** promises an email and a WhatsApp message. Make sure both are
   really sent (items 2–4 and 8), or soften the wording.
7. [ ] **Real dates and times** in the `EDIT EACH WEEK` block at the top of both landing pages.
8. [ ] **WhatsApp confirmation** via Meta WhatsApp Cloud API (Hemant's own WhatsApp Business number,
   approved template). Needs access token, phone number ID, template name.
9. [ ] **Merge the draft branch into `main`** (via pull request) so GitHub Pages publishes the pages.

## Open questions / nice to have
- [x] Facebook Pixel + Google Tag Manager on all three pages (same IDs as the live site).
- [ ] Track paid sign-ups as "Purchase" (INR 97) instead of "Lead".
- [ ] Day 2 intro line mentions Day 1 topics. Suggested replacement is in the chat history.
- [ ] Q&A wording now that "live" has been removed.
- [ ] Legal text review: refund time limit, "State of India", US-specific terms (DMCA, SSN).
- [ ] Testimonial 1 (LinkedIn): name partly visible behind the red marks. Consider trimming the top.
- [ ] Second free page with different timings.

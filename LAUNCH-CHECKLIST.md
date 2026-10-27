# Launch checklist: CISSP Accelerator Domain 1 Bootcamp pages

Pages: `/` (paid, INR 97, evening batch), `/fve/` (free, evening batch), `/fvm/` (free, morning batch), `/thank-you/`,
`/privacy-policy/`, `/terms-and-conditions/`, `/refund-policy/`, `/contact-us/`.
Old addresses still work: `/free` opens `/fvm/` and `/free-bootcamp` opens `/fve/` (tracking tags are kept).
The old whitelabel-copy pages are kept in `/old/`.

> **Note for whoever works on this next (including Claude in a new session):**
> **Live since 27 Oct 2026 on cisspaccelerator.com.** Check the unticked items below with Hemant.
> Item 1 (reminder emails) is built; it still needs the one-time setup above.

## Must discuss before going live
1. [x] **Reminder & follow-up emails (2–20).** Built: `google-apps-script/reminders.gs` + `emails.gs`
   (`REMINDERS-SETUP.md`). Before launch: paste the three script files, run setupReminders, fill in the
   Settings tab, check with showSchedule / previewAllEmails, and publish a new version.

## Must be done before going live
2. [x] **Connect the free form to Google Sheets.** Follow `google-apps-script/SETUP.md`, then put the
   web-app link in `FORM_ENDPOINT` at the top of `fve/index.html`. Until then the form is in test mode.
3. [x] **Confirmation email sender:** Google Workspace. The script sends from `support@hemantsajwan.com`
   (`FROM_ADDRESS` setting) if that is the sheet owner or a "Send mail as" alias.
4. [x] **Paid registrations to the sheet + confirmation email and WhatsApp after payment.** Done and tested:
   Razorpay → Pabbly workflow "Razorpay → bootcamp sheet" (New Builder) → script (`google-apps-script/PAID-SETUP.md`).
   **Done at launch (27 Oct 2026):** in that workflow deleted the Filter step (email = hemantishere@rediffmail.com), and switch the old
   classic workflow "06_2DAY_PAID_BOOTCAMP_FLOW (whitelabel)" OFF, so buyers get one confirmation, not two.
   **Each week:** update `PAID_BATCH` in the script together with the paid page's dates.
5. [x] **Razorpay redirect after payment:** `https://cisspaccelerator.com/thank-you/` (after the DNS switch, item 11)
6. [x] **Thank-you page Step 1 / Step 2 text** promises an email and a WhatsApp message. Both are now sent
   for free and paid registrations.
7. [ ] **Real dates and times** in the `EDIT EACH WEEK` block at the top of both landing pages.
8. [x] **WhatsApp confirmation** via Meta WhatsApp Cloud API (Hemant's own WhatsApp Business number,
   approved template). Needs access token, phone number ID, template name.
   Done for free registrations (template `bootcamp_registration`). Replies: Pabbly Connect workflow
   "WhatsApp replies" saves each reply to the *WhatsApp replies* tab and sends a free auto-reply.
9. [ ] **Before cancelling the whitelabel:** add Hemant's own payment method in WhatsApp Manager →
   Payment settings, then remove the whitelabel's access to the WhatsApp account (don't delete or
   re-register the number).
10. [ ] **Business portfolio admins:** former ad-agency people still have full control. Remove them
   (needs one of them to approve), and add a trusted second admin.
11. [x] **Web address: move cisspaccelerator.com to GitHub Pages** (DNS is at Namecheap → Advanced DNS).
   Decided: the whole domain moves; the whitelabel is retired. The `CNAME` file is in the repo.
   After item 12: GitHub repo → Settings → Pages → Custom domain `cisspaccelerator.com`. Then in Namecheap:
   delete the A record `@` → `3.146.153.124`; add four A records `@` → `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153`, `185.199.111.153`; change CNAME `www` → `hemant-sajwan.github.io.`
   When GitHub shows the certificate is ready, tick **Enforce HTTPS**.
   Keep: CAA records, CNAMEs `wa`, `www.wa`, `zoom`, `www.zoom`, the mail SPF record, and the
   `facebook-domain-verification` TXT record (added 27 Oct 2026 so Meta verification survives the move).
12. [x] **Merge the draft branch into `main`** (via pull request) so GitHub Pages publishes the pages.

## Open questions / nice to have
- [x] Facebook Pixel + Google Tag Manager on all three pages (same IDs as the live site).
- [ ] Track paid sign-ups as "Purchase" (INR 97) instead of "Lead".
- [ ] Day 2 intro line mentions Day 1 topics. Suggested replacement is in the chat history.
- [ ] Q&A wording now that "live" has been removed.
- [ ] Legal text review: refund time limit, "State of India", US-specific terms (DMCA, SSN).
- [ ] Testimonial 1 (LinkedIn): name partly visible behind the red marks. Consider trimming the top.
- [x] Free page for the morning (Mon–Tue) batch at `/fvm/`. Fill the **morning** row of the Settings tab and run showSchedule.

# Paid registrations: Razorpay → Pabbly → Google Sheet

When someone pays on the Razorpay page, Razorpay tells Pabbly straight away. Pabbly passes the
buyer's name, email, phone and payment ID to the Google Sheet script, which:

1. adds a row to the paid batch tab (the `PAID_BATCH_KEY` row of the Settings tab, now **evening**) with **Paid/Free? = PAID**,
2. sends the confirmation email, and
3. sends the WhatsApp confirmation.

The same payment arriving twice (Pabbly or Razorpay retrying) is recorded only once.

## 1. Script (once)
1. Paste the latest `registrations.gs` into Apps Script and **Save**.
2. Run **makePaidSecret**. The log shows a long secret, already saved in Script Properties as
   `PAID_SECRET`. Copy it for step 2. It works like a password between Pabbly and the script.
3. Run **setupTabs**. It adds the **Paid/Free?** and **Payment ID** columns, and fills **FREE** in for existing rows.
4. Run **testPaidRegistration**. It adds a test row marked PAID, emails you, and sends WhatsApp to your test number.
5. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.**

## 2. Pabbly: the existing Razorpay workflow
Add one step at the end: **API by Pabbly → Execute API Request**
- **Method:** POST
- **URL:** the web app link (the same one used in `FORM_ENDPOINT` on the free page)
- **Payload type:** JSON (or Form data/URL-encoded)
- **Fields:**

| Key | Value (pick from the Razorpay trigger) |
|---|---|
| `source` | type `razorpay` |
| `secret` | paste the secret from step 1.2 |
| `name` | the buyer's name |
| `email` | the buyer's email |
| `phone` | the buyer's phone / contact |
| `payment_id` | the payment ID (starts with `pay_`) |

**Until launch**, put a **Filter by Pabbly** step before it (email *exactly matches* your own email),
so only your test payments use the new flow. **At launch:** delete that filter and remove the
whitelabel step, so buyers get one confirmation, not two.

## 3. Each week
The paid batch's dates and time come from its row in the **Settings** tab (see `REMINDERS-SETUP.md`).
Update that row together with the paid page's `EDIT EACH WEEK` block.

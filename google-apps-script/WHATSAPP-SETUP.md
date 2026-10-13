# WhatsApp confirmation message: setup

The Google Sheet script sends each free registration a WhatsApp message from **your own WhatsApp
Business number** through Meta's WhatsApp Cloud API. No whitelabel or Pabbly is involved.
Your whitelabel keeps working as before; nothing here disconnects it.

You need three things from Meta: an **approved message template**, an **access token**, and your
**phone number ID**. About 30 minutes, plus waiting for the template approval.

> **Never paste the access token into a chat, an email or the website.** It goes only into the
> script's private settings (step 5). Anyone who has it can send messages from your number.

## 1. Check that the number is in *your* Meta business
1. Open **business.facebook.com** and pick your business.
2. Go to **WhatsApp Manager** (business.facebook.com/wa/manage).
3. Your number should be listed under **Phone numbers**.
   - Listed → continue.
   - Not listed (the whitelabel owns the WhatsApp account) → stop here and tell Claude.

## 2. The message template
WhatsApp only lets businesses start a conversation with an approved template.

**Already have an approved confirmation template** (e.g. made through the whitelabel)?
It is in **WhatsApp Manager → Message templates**. Note its **name**, **language** and what each
`{{1}}`, `{{2}}`… stands for, and skip to step 3.

Otherwise create one: **Message templates → Create template**
- **Category:** Utility (a confirmation of something the person did). Keep it free of sales wording,
  or Meta switches it to Marketing, which costs more.
- **Name:** `bootcamp_registration` • **Language:** English
- **Body:** your text, using `{{1}}` = first name, `{{2}}` = dates, `{{3}}` = time.
  Add sample values when asked (e.g. Hemant / 14th & 15th Oct 2026 / 7:30 PM IST).
- Submit. Approval usually takes minutes, sometimes up to a day.

## 3. Create an app (the "key holder")
1. Open **developers.facebook.com → My Apps → Create app**.
2. Choose **Other → Business**, give it a name (e.g. *Bootcamp sheet*), and connect it to your
   business portfolio.
3. On the app page, **Add product → WhatsApp → Set up**, and pick your business when asked.
   If Meta asks you to **register, migrate or verify the number again, stop and tell Claude.**
   The number is already registered, so this shouldn't be needed.

## 4. Get a permanent access token and the phone number ID
1. **business.facebook.com → Settings → Users → System users → Add**.
   Name *bootcamp-sheet*, role **Admin**.
2. Click it, then **Assign assets**:
   - **Apps:** your new app, with full control.
   - **WhatsApp accounts:** your WhatsApp account, with full control.
3. Click **Generate new token**. Pick your app, set the expiry to **Never**, and tick
   `whatsapp_business_messaging` and `whatsapp_business_management`. **Copy the token**. It is shown only once.
4. **Phone number ID:** after adding `WHATSAPP_TOKEN` (step 5), run **findPhoneNumberId** in the
   script. The log lists your number with its Phone number ID (a long number, *not* your phone number).

## 5. Put the keys in the script (privately)
1. In your spreadsheet, open **Extensions → Apps Script** and click **⚙️ Project Settings** on the left.
2. Scroll to **Script Properties → Add script property**, then add two:
   - `WHATSAPP_TOKEN` → the token from step 4.3
   - `WHATSAPP_PHONE_NUMBER_ID` → the ID from step 4.4
3. Click **Save script properties**.

## 6. Match the template and test
1. In the script's **SETTINGS** block, check:
   - `WHATSAPP_TEMPLATE`: the template name, exactly.
   - `WHATSAPP_LANGUAGE`: `"en"` for English, or `"en_US"` if the template says English (US).
   - `WHATSAPP_PARAMS`: what fills `{{1}}`, `{{2}}`… in order.
   - `WHATSAPP_TEST_NUMBER`: your own number with country code.
2. **Save**, select **testWhatsApp** next to **Run**, then click **Run**. Google asks for one new
   permission ("connect to an external service"); allow it.
3. The log shows **Sent** (check your phone) or **NOT sent** with Meta's reason. Send Claude
   that reason *without* the token.
4. Publish: **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.

## Good to know
- **Cost:** Meta charges per template message, billed to the payment method on your WhatsApp
  account (**WhatsApp Manager → Payment settings**). Check that one is there. If the whitelabel
  bills you for messages through its own credit line, ask them how messages sent by your app are billed.
- **Sheet status:** the Status column shows `· WhatsApp sent` or `· WhatsApp NOT sent`.
  The email still goes out if WhatsApp fails.
- **Turn off:** set `SEND_WHATSAPP: false`, or delete the two script properties.
- Paid-page entries get no WhatsApp message until payment confirmation is set up (same as the email).

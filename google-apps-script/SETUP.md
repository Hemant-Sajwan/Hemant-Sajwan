# Connect the registration form to your Google Sheet

About 10 minutes. You only do this once. Nothing here affects Pabbly or your existing tabs.

## 1. Open the script editor in your spreadsheet
1. Open the Google Sheet where you collect leads.
2. In the menu, click **Extensions → Apps Script**. A new tab opens with a code editor.
3. Name the project at the top left, e.g. **Bootcamp registrations**.

## 2. Paste the script
1. In the editor, select everything in the `Code.gs` file and delete it.
2. Open `registrations.gs` (sent to you with these steps, also in the `google-apps-script` folder of the repository), copy **all** of it, and paste it in.
3. Optional: in the **SETTINGS** block near the top, change the sender name, reply-to address, email subject or add a Zoom link.
4. Click the **Save** icon (💾).

## 3. Test it (sends one sample email to you only)
1. In the toolbar, pick **testSetup** in the function dropdown (next to **Run**).
2. Click **Run**.
3. Google asks for permission the first time:
   - Click **Review permissions** and choose your Google account.
   - You'll see **"Google hasn't verified this app"**. This is normal for your own private script. Click **Advanced → Go to Bootcamp registrations (unsafe)** → **Allow**.
4. Check your spreadsheet: a new tab **Bootcamp Registrations** with blue headings should appear.
5. Check your inbox: you should receive a sample confirmation email.

## 4. Publish it as a web app
1. Click **Deploy → New deployment** (top right).
2. Click the ⚙️ next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** Bootcamp form
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**. This lets the website send entries; it does **not** let anyone see your sheet.
4. Click **Deploy** and copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfy..../exec`
5. Send that link to Claude. It goes into `FORM_ENDPOINT` at the top of both landing pages.

## Good to know
- **Changing the script later:** after editing, go to **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The link stays the same.
- **Email limits:** about 100 emails a day on a free Gmail account, 1,500 on Google Workspace. If the limit is reached, the row still saves and shows "email NOT sent".
- **Paid page:** entries are saved as **Payment pending** and get no email until payment is set up.
- **Privacy:** entries go straight from the website to your own Google account. No other service is involved.

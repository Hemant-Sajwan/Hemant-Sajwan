# CISSP Accelerator — Landing Page

A polished, responsive, single-page rebuild of the CISSP Accelerator (Domain 1 Bootcamp) landing page for Hemant Sajwan. Static HTML/CSS/JS — no build step, no framework. Deploys anywhere (GitHub Pages, Netlify, any static host).

## Files
- `index.html` — page markup & copy
- `styles.css` — all styling (design tokens at the top of the file)
- `script.js` — registration link, scroll reveal, sticky header
- `assets/` — put local images here if you later replace the hosted ones

## Editing the essentials (all in one place each)

**Registration / checkout link** — `script.js`, top of the file:
```js
var REGISTRATION_URL = "https://your-checkout-link";
```
Every "Register" button on the page (and the mobile sticky bar) uses it automatically. Until set, buttons just scroll to the final CTA.

**Date / time / price** — search `index.html` for:
- `23`  → the workshop date (appears in the hero card and final CTA)
- `7:30 PM IST` → the time
- `price-now` / `price-strike` → the price (`₹97` and struck-through `₹2999`)

## Running the three variants
The reference site has three variants that share this exact structure and differ only in date / time / price:
| Variant | Date | Time | Price |
|---|---|---|---|
| Paid (this build) | 23–24 Sep 2026, Wed–Thu | 7:30 PM IST | ₹2999 → ₹97 |
| Free | 21–22 Sep 2026, Mon–Tue | 11 AM IST | FREE |
| Free bootcamp | 23–24 Sep 2026, Wed–Thu | 7:30 PM IST / 6 PM GST | FREE |

To produce a variant, copy the folder and change only those three values.

## Images
Images currently reference the existing hosted assets (from the live funnel), so nothing was re-created. To make the page fully self-contained, download each into `assets/` and swap the `src`/`url()` — the layout is unchanged either way.

## Content note
Copy, testimonials, curriculum, mentor bio, mistakes, bonuses and FAQ are kept faithful to the reference pages. Only grammar, spacing, repetition and minor wording were polished (e.g. a stray "3-day" corrected to "2-day").

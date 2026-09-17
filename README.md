# CISSP Accelerator — Landing Pages (Hemant Sajwan)

Faithful clones of the existing cisspaccelerator.com funnel, rebuilt as clean static HTML/CSS/JS. Three campaign variations that share one design so they feel like the same website. No build step needed to deploy — GitHub Pages serves the HTML directly.

## Routes / variations
| Variation | Route | Clone of | Date | Time | Price / CTA |
|---|---|---|---|---|---|
| **1 — Paid ₹97** | `/` (index.html) | cisspaccelerator.com/ | 23–24 Sep 2026 (Wed–Thu) | 7:30 PM IST | ₹2999 → **₹97** |
| **2 — Free** | `/free/` | cisspaccelerator.com/free | 21–22 Sep 2026 (Mon–Tue) | 11 AM IST + Sydney/NZ/UAE | **FREE** |
| **3 — Free bootcamp** | `/free-bootcamp/` | cisspaccelerator.com/free-bootcamp | 23–24 Sep (Wed–Thu) | 7:30 PM IST / 6 PM GST | **FREE** |

Live once pushed:
- `https://hemant-sajwan.github.io/Hemant-Sajwan/`
- `https://hemant-sajwan.github.io/Hemant-Sajwan/free/`
- `https://hemant-sajwan.github.io/Hemant-Sajwan/free-bootcamp/`

## Files
- `index.html`, `free/index.html`, `free-bootcamp/index.html` — the three pages (generated)
- `styles.css` — shared stylesheet (blue #004AAD + gold #FFD401 theme)
- `script.js` — shared script (registration link, scroll reveal)
- `build.py` — generator: content lives here once and fills all three pages
- `assets/` — put local images here if you later replace the hosted ones

## Editing
Content is identical across all three pages, so **edit copy in `build.py`** (the `DAY1`, `TESTIMONIALS`, `FAQ`, etc. lists) and per-variant date/time/price in the `VARIANTS` dict, then run:

```bash
python build.py
```

This regenerates the three HTML files. (You can also hand-edit the HTML directly if you prefer — the generator is a convenience, not a requirement for hosting.)

## Registration link
Each page sets `window.REGISTRATION_URL` near the top of its HTML (default `#register`, which scrolls to the final CTA). Set it to the live checkout link (paid) / registration link (free) — one value per page — or change the default in `build.py` and rebuild. Every "Register" button on that page then points to it.

## Video
The intro video is the same Vimeo embed used on the original site (`player.vimeo.com/video/1146180123`), placed right after the hero as on the original. Swap the `VIMEO` URL in `build.py` to change it.

## Content note
Copy, testimonials, curriculum, mentor bio, mistakes, bonuses and FAQ are kept faithful to the reference pages. Only a stray "3-day" was corrected to "2-day".

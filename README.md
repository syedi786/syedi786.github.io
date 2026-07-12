# Syed Altaf Hussain — Portfolio Website

Cinematic dark portfolio: scroll-driven GSAP animations, pinned film-strip work section,
Meta Ads performance case-study page. Pure HTML/CSS/JS — no build step.

## Run it

Just open `index.html` in a browser (double-click), or serve the folder:

```
python -m http.server 8000
```

## What to edit before sending to clients

| What | Where |
|---|---|
| **Meta Ads numbers (IMPORTANT — currently sample data)** | `js/ads.js` → `ADS_DATA` object at the top, plus the three `data-count` tiles in `index.html` (results section) and four in `meta-ads.html`, and the funnel numbers in `meta-ads.html` |
| Work images / reels | `index.html` — the three `<article class="frame">` blocks (marked with `<!-- REPLACE -->`). Swap the `picsum.photos` URLs for your own stills, or wrap in links to your reels |
| Hero background + inline pill image | `index.html` hero section (`picsum.photos` URLs) |
| Client names / logos | `index.html` → `clients__track` spans (listed twice for the loop) |
| Testimonial quote | `index.html` → the `<blockquote>` (marked `<!-- EDIT -->`) |
| Social links | `index.html` footer (`Instagram / YouTube / LinkedIn` hrefs) |
| Email | Search `altafsyed2002@gmail.com` if you want a different contact |

When client screenshots arrive: crop them clean, drop them into an `img/` folder,
and swap the picsum URLs for local paths like `img/client1.jpg`.

## Deploy (free)

- **Netlify**: drag the folder onto https://app.netlify.com/drop
- **Vercel / GitHub Pages** also work — it's a static site.

## Chart colors

Spend `#5e96dc` / Revenue `#bb8c26` — validated for colorblind safety and contrast
on the dark surface. If you change them, keep gold = revenue (it matches the brand accent).

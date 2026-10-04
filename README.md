# SIGNAL — Air, Water & Sound Pollution

> Know your surroundings. Understand pollution. Take action.

SIGNAL is a single-page, front-end-only website that turns air, water, and noise
pollution into something a visitor can actually search, read, and act on — instead
of a wall of static text. It grew out of a Continuous Evaluation Project on
pollution awareness and was built out into a full interactive site: look up a
city or locality, see a plain-language pollution snapshot, log everyday actions,
report what you see on the ground, and watch a simple points system track it all.

No backend, no database, no build step — it's plain HTML, CSS, and JavaScript,
designed to run straight from the file system or from GitHub Pages.

---

## Features

**Know your area**
- 🔍 **Check Pollution in Your Area** — type a city/town/locality and get an
  AQI, PM2.5/PM10, water, and noise snapshot with a plain-language explanation
  of what it means for your day
- 🌍 **AQI Around Cities** — at-a-glance cards for major Indian cities, with a
  "view more" expansion
- 📍 **Google Map of India** — an embedded map (no API key required) with
  color-coded pins you can tap to pull up a city's reading and jump straight
  into the report form with the location pre-filled
- 📍 **Pollution hotspot zone field** — an illustrative block-by-block view for
  whichever area you've searched

**Understand pollution**
- 🌫️ / 💧 / 🔊 Deep-dive tabs for **Air**, **Water**, and **Sound** pollution —
  causes, prevention, current research notes, a plain-language water-quality
  indicator glossary (pH, turbidity, BOD, COD, TDS, and more), and a decibel
  reference chart with designated "silence zones"
- ❤️ A **Pollution & Health** section connecting each front to what it actually
  does to the body, with a clear "this isn't medical advice" note

**Take action**
- 🔎 **Search the Field Index** — type literally anything you did ("burning
  plastic," "car horn," "cooking oil down the sink") and get the cause and
  prevention tips for it, with a one-tap "log this fix"
- 📢 **Report Pollution** and 🚦 **Report a Traffic Violation** — mock reporting
  flows that generate a reference ID and a Submitted → Under review → Resolved
  status, with a **⋯ reports panel** that lists everything logged so far
  (seeded with sample reports so it's never empty)
- 💡 **Share an Idea** — a simple community-idea submission form
- 🏆 **Pollution Fighter points** — logging actions, filing reports, sharing
  ideas, and joining clean-ups all earn points, with tiers (Beginner → Eco
  Helper → Green Guardian → Pollution Fighter), badges, and a sample
  leaderboard
- 🌱 A rotating **One-Minute Green Tips** ticker

All location/city data, the Pollution Fighter leaderboard, and the hotspot
field are clearly labeled **demo data** — there's no live AQI/water/noise feed
wired in, but the code is structured so a real API could be dropped in behind
`CITY_DB` and `fetchAreaData()`-style functions in `script.js` without touching
the UI.

Points, streaks, logged actions, and submitted reports are saved to the
visitor's own browser via `localStorage` (with an automatic in-memory
fallback if storage is unavailable) — nothing leaves the browser, and nothing
needs a server.

---

## Technologies used

- **HTML5** — single-page, semantic structure
- **CSS3** — custom properties (design tokens), Grid & Flexbox layout, scroll
  reveal animation, no framework
- **Vanilla JavaScript (ES6+)** — no build step, no dependencies
- **Google Fonts** — Space Grotesk, Inter, JetBrains Mono, Cormorant Garamond
- **Google Maps Embed** — the India map picker (embed URL only, no API key
  or billing account needed)
- **Web Storage API** (`localStorage`) — client-side persistence for points,
  streaks, and reports, with a graceful in-memory fallback

No package manager, bundler, or framework is involved — every file here is
served as-is.

---

## Project structure

```
signal-pollution-index/
├── index.html      # Page structure/markup
├── style.css        # All styling (design tokens, layout, components, animation)
├── script.js         # All interactivity (search, points/streak system, forms,
│                      #  map pins, reports feed, particle canvas, tabs, etc.)
└── README.md
```

---

## How to run it locally

Because it's plain static files, you have two options:

**Option 1 — just open it**
Double-click `index.html` (or open it with your browser's File ▸ Open). Almost
everything works this way; a couple of browsers restrict `localStorage` for
pages opened directly from disk (`file://`), in which case the points/streak
system quietly falls back to in-memory storage for that session instead of
persisting.

**Option 2 — serve it locally (recommended)**
From inside the project folder:

```bash
# Python 3
python3 -m http.server 8000

# or Node (no install needed)
npx serve .
```

Then open `http://localhost:8000` in your browser.

---

## Deploying with GitHub Pages

1. Push this folder's contents to a GitHub repository (the three files should
   sit at the **root** of the repo, or in whichever folder you point Pages at).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick the branch (usually `main`) and the folder (`/root` if these files are
   at the top level).
5. Save — GitHub will publish the site at:
   `https://<your-username>.github.io/<repository-name>/`

No build step or workflow file is required since there's nothing to compile.

---

## Notes for anyone extending this

- All "live" numbers (city AQI, water/noise readings, the leaderboard) are
  demo data generated in `script.js` — search for the comment blocks marked
  `DEMO DATA` to find exactly where to wire in a real API.
- The Google Map pins are positioned at approximate percentage coordinates
  over the embedded map, not real GPS coordinates — a production version
  would use the Google Maps JavaScript API with a key to place and read pins
  precisely.
- Reports, points, and streaks all live in `localStorage` under keys prefixed
  `sig_` — clearing site data in the browser resets them.

# AquaFarm — Smart Irrigation Management Dashboard

A professional, front-end demonstration dashboard for agricultural irrigation monitoring and control. It presents a complete farm operations view — live-looking sensor readings, irrigation control, smart recommendations, analytics, alerts and settings — driven entirely by a **simulated sensor engine** running in the browser.

| | |
| --- | --- |
| **Brand** | AquaFarm |
| **Descriptor** | Smart Irrigation Management |
| **Tagline** | Technology for smarter and more efficient irrigation. |
| **Operator (demonstration user)** | Ravi Kumar — Farm Manager |
| **Version** | 1.0 |
| **Release date** | 18 September 2026 |
| **Type** | Front-end dashboard, single page, no backend |
| **Stack** | HTML5 · CSS3 · vanilla JavaScript (ES5-compatible) · Bootstrap 5.3.3 · Chart.js 4.4.7 · Font Awesome 6.7.2 · Inter |

---

## 1. Important: This Is a Simulation

This project is a **demonstration dashboard**. It contains **no hardware integration, no IoT gateway, no backend, no database and no external API calls**.

* All sensor readings — soil moisture, temperature, humidity, tank level, flow rate — are **generated in the browser** by a simulated engine.
* The weather panel is **simulated**. The recommendation card is **demonstration guidance derived from simulated data**; it is not an agronomic or AI prediction and must not be used to make real irrigation decisions.
* The "water saved" statistic is a **demonstration figure**.
* Every simulated surface is labelled in the interface, and the recommendation card carries an explicit disclaimer.

The application is honest about what it is: it demonstrates the interface, the interactions, the rule engine and the data flows that a real connected system would use.

---

## 2. How to Run It

### Option A — open the file (simplest)

1. Locate the project folder `irrigation-dashboard/`.
2. Double-click **`index.html`** (or right-click → *Open with* → your browser).

That is all. The dashboard loads and works fully from the local file system — no server, no build step, no installation, no internet connection. Every library, font and image is bundled inside the folder.

### Option B — serve it locally (recommended for a close-to-production check)

From inside the project folder, run any static server and open the printed URL:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

### Option C — host it

Upload the whole folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, or a plain nginx/Apache document root). There is no build command and no output directory to configure — the folder is the site.

### Tested browsers

Chrome, Edge, Firefox and Safari (current versions), plus mobile Safari (iOS) and Chrome (Android). Target viewports: **360 px, 390 px, 834 px, 1280 px, 1440 px**.

---

## 3. Quick Tour (5 minutes)

| Step | What to do | What it demonstrates |
| --- | --- | --- |
| 1 | Open `index.html` and watch the KPI cards for a few seconds | Live sensor simulation: values drift, "Last updated" advances |
| 2 | Click **Turn Irrigation ON** | Pump starts, status badge changes, water line appears on the tank, a toast confirms it |
| 3 | Watch the **Water Tank** card and the **Statistic** cards | The tank level drops and "Water used today" rises with the session |
| 4 | Click **Turn Irrigation OFF** | Session closes: the activity table gains a completed row with real minutes and litres |
| 5 | On the recommendation card, click **Start Irrigation** | Irrigation is started for the recommended field and duration |
| 6 | In **Irrigation**, switch mode to **Automatic** | The rule engine starts the pump by itself when the average moisture falls below the threshold |
| 7 | In **Irrigation Schedule**, create a task for the current minute | The task runs automatically on the next poll and is marked Completed |
| 8 | In **Analytics**, switch the soil chart to **7 Days** and **30 Days** | Charts rebuild from the documented series; the summary strip recalculates |
| 9 | In **Settings**, set the threshold to 45 % and save | Recommendation escalates, the chart reference line moves, alerts follow |
| 10 | Reload the page | Your settings, schedules, alerts, activity, tank level and counters are restored |

---

## 4. Project Structure

```text
irrigation-dashboard/
├── index.html                  # the entire dashboard: header, 8 sections, footer, dialogs
├── style.css                   # design tokens + all component styles (documented sections)
├── script.js                   # application: state, simulation, rules, rendering, events
├── README.md                   # this file
├── favicon.png                 # brand mark
├── manifest.webmanifest        # PWA metadata (name, icons, theme colour)
├── robots.txt                  # crawl policy + sitemap declaration
├── sitemap.xml                 # single-URL sitemap
└── assets/
    ├── images/                 # optimised photography, icons and the social preview image
    └── vendor/                 # pinned third-party libraries (no CDN needed at runtime)
        ├── bootstrap/          # Bootstrap 5.3.3 (CSS + bundle JS)
        ├── chartjs/            # Chart.js 4.4.7 (UMD)
        ├── fontawesome/        # Font Awesome 6.7.2 CSS
        ├── webfonts/           # Font Awesome woff2/ttf files
        └── fonts/              # Inter (latin, 400 / 500 / 600 / 700)
```

**Deliverable size:** ~3.2 MB total on disk (1.36 MB of that is the critical first-load payload). Development-time folders used while building the project — test scripts and image-staging folders — are **not** part of the shipped folder.

---

## 5. Feature Map

### 5.1 Navigation and shell

* Sticky header with brand mark, wordmark and descriptor "Smart Irrigation Management".
* Primary navigation: **Dashboard · Fields · Irrigation · Analytics · Alerts · Settings**, with scroll-spy highlighting the active section.
* Notification bell with an unread badge and a dropdown of the latest alerts (each item links to the Alerts section).
* Profile chip (**Ravi Kumar — Farm Manager, avatar "RK"**) with a menu of configuration actions only. There is no sign-in and no fake "sign out".
* Mobile hamburger with a slide-in panel, backdrop and `Esc`/link/backdrop dismissal.
* Skip-to-content link as the first focusable element.
* Sticky mobile action bar: pump state, soil-moisture hint, **Refresh Data** and **Start / Stop**.
* Footer with brand, tagline, navigation, simulated-data note, legal links and copyright.

### 5.2 Dashboard

| Block | Content |
| --- | --- |
| Welcome banner | Time-aware greeting, "Smart Irrigation Management", live-simulation and demonstration pills, last-updated line, **Refresh Data**, **Turn Irrigation ON / OFF** |
| KPI cards | Soil moisture **42 % — Optimal**; temperature **28 °C — Normal**; humidity **64 % — Good**; water tank **76 % — Sufficient (3,800 of 5,000 L)** with a level indicator |
| Statistic cards | Total farm area **7 Acres**; water used today **1,240 L**; irrigation sessions **6**; water saved **18 %** |
| Soil moisture chart | Line chart with the 24-hour series (12 AM 54 %, 4 AM 51 %, 8 AM 48 %, 12 PM 43 %, 4 PM 40 %, 8 PM 42 %), a threshold reference line, and a **Last 24 Hours / 7 Days / 30 Days** selector that rebuilds the series |
| Water usage chart | Bar chart of the week (**Mon 1,200 · Tue 950 · Wed 1,400 · Thu 1,100 · Fri 850 · Sat 1,300 · Sun 900 L**), weekly total **7,700 L**, "**12 % less than previous week**", daily average and highest day |
| Farm health score | Circular gauge **82 / 100** with sub-scores Soil 85, Water Availability 78, Irrigation Efficiency 84, Crop 82 |
| Weather | **28 °C, Partly Cloudy**, humidity 64 %, wind 12 km/h, rain chance 20 %, forecast Morning 26 °C / Afternoon 30 °C / Evening 27 °C, marked simulated, refreshable |
| Sensor network | Per-node readings with signal levels, a data source line and a Refresh action; driven by the same simulation |

### 5.3 Irrigation

| Block | Behaviour |
| --- | --- |
| Pump control | Large switch (keyboard-operable, `role="switch"`), status badge OFF / ON / Automatic, target-field selector (locked while running), runtime timer, flow rate 30 L/min, session water, and a rule-engine status line |
| Irrigation mode | Segmented control: **Manual · Automatic · Scheduled**, each with contextual help text |
| Smart recommendation | Recommended duration and water volume, reasoning that names the field, crop, current moisture, threshold and target band, **Start Irrigation** and **Ignore** actions, and a visible disclaimer that it is demonstration guidance from simulated data |
| Water tank | Animated vertical tank at the live level (76 %, 3,800 / 5,000 L), draw rate while pumping, estimate of supply remaining, and a text description for assistive technology |
| Irrigation schedule | Form (field, date, time, duration 1–180 min, mode) with full validation; list of pending and completed tasks with **Start now** and **Cancel**; tasks run automatically when due and are marked Completed |

### 5.4 Analytics detail

* Period selector drives the soil chart (24 h = 6 points, 7 days = 7 points, 30 days = 30 points) with a live summary of current / lowest / highest / change / threshold.
* Water chart recalculates its totals, delta chip and daily average whenever the tank, units or readings change.
* Per-field 24-hour charts inside the field dialog.
* All charts resize with the viewport and remain readable on phones.

### 5.5 Fields and crops

* Three field cards — **Field A: Rice, 2.5 acres, 42 %, Healthy, Not Required**; **Field B: Tomato, 1.5 acres, 28 %, Needs Water, Recommended**; **Field C: Cotton, 3 acres, 51 %, Healthy, Not Required** — each with photography, four facts, a health tag and **View Details**.
* Field dialog: image, stage, area, sensor id, recommended range, current moisture, a 24-hour chart, and actions (**Start / Stop irrigation**, **Schedule irrigation**).
* Crop management cards for Rice (Vegetative, 40–60 %, 42 % current, Optimal), Tomato (Flowering, 35–55 %, 28 %, Needs water) and Cotton (Boll development, 40–60 %, 51 %, Optimal).

### 5.6 Alerts

* Alert list with severity chips (**Critical · Warning · Success · Info**), title, description, field and time meta, per-item **Mark read** / **Dismiss**, a filter (All / Unread / Critical / Warning), severity counts, and **Mark all read**.
* Bell dropdown and the header badge share one unread count.
* Alert rules panel documenting the four live rules and the currently configured threshold.
* Low soil moisture (Field B), water tank below 30 %, irrigation completed and sensor-outage notices all raise real alerts driven by state.

### 5.7 Settings

* **Irrigation threshold** (number 15–60 % with a paired slider, default 30 %), **Water tank capacity** (1,000–20,000 L, default 5,000), **Units** (Metric / Imperial), **Automatic irrigation** toggle, **Notifications** toggle.
* **Save Settings** writes to `localStorage` and re-renders every dependent surface instantly; **Reset to defaults** restores the documented defaults; a "Saved HH:MM" stamp confirms the write.
* **Data & Simulation** panel: simulation speed (2 / 5 / 10 s), pause/resume, sensor-outage switch, session counters (ticks, updates, last updated, next update) and the data-source statement.
* **Stored Data** panel: what is saved, how many records, **Export data (JSON)** and **Clear saved data** (two-step confirmation).

### 5.8 Help and legal

* Help steps explaining the operating model.
* FAQ accordion covering simulation, persistence, units, pump behaviour, exports and support routing.
* Support contact block (details marked **To Be Decided** — see §12).
* Privacy Policy, Terms & Conditions and Cookie Preferences dialogs that accurately describe a product with no accounts, no trackers and no network calls.

### 5.9 Interaction inventory (all implemented)

Refresh Data · pump on/off · mode change · recommendation start · recommendation ignore · alert mark read · alert dismiss · mark all read · alert filter · activity field filter · activity status filter · activity search · chart period switch · field details · field/crop action buttons · settings save · settings reset · units switch · notifications switch · automatic-irrigation switch · simulation speed · simulation pause/resume · sensor outage simulation · schedule create · schedule start-now · schedule cancel · data export · clear saved data · weather refresh · mobile navigation · scroll-spy · legal dialogs · toast notifications.

---

## 6. Simulation and Rules Reference

### 6.1 Live sensor simulation

| Parameter | Behaviour per tick |
| --- | --- |
| Soil moisture (per field) | Drifts down **0.05 – 0.22 %** when idle; rises **0.28 – 0.50 %** while that field is being irrigated; clamped to 12 – 82 % |
| Farm soil moisture | Average of the three fields (illustrative aggregate) |
| Temperature | ± 0.25 – 0.28 °C, clamped to 16 – 41 °C |
| Humidity | ± 0.9 %, clamped to 32 – 92 % |
| Water tank | Drops by **30 L/min × tick interval (± 10 %)** while the pump runs; clamped at 0 % |
| Water used today | Increases by the same litres while the pump runs |
| Cadence | Every 2, 5 (default) or 10 seconds; pauses when the browser tab is hidden; can be paused manually |

### 6.2 Rule engine

| Rule | Condition | Result |
| --- | --- | --- |
| Low soil moisture | A field's moisture is below the threshold | Critical alert for that field, once per key with a 5-minute cooldown |
| Water tank low | Tank below 30 % | Warning alert (Critical below 15 %) |
| Irrigation completed | A session ends (manual, scheduled or automatic) | Activity row completed with measured water, success alert, session counter incremented |
| Automatic irrigation | Mode = Automatic, pump idle, average moisture < threshold | Pump starts for the **driest field** with a 25-minute plan |
| Automatic stop | Mode = Automatic, average moisture ≥ threshold + 4 % | Pump stops (hysteresis prevents rapid cycling) |
| Scheduled session | A pending task's start time has arrived and the pump is idle | Session starts; the task is marked Completed when the planned duration elapses or the tank runs out |
| Tank safety | Tank reaches 0 (≤ 1 % while pumping) | Pump stops automatically; the attempt is blocked with an explanatory message |

### 6.3 Recommendation model

```text
needed            = moisture < threshold + 20
urgent            = moisture < threshold
minutes           = clamp(round((threshold + 20 - moisture) × 2.25), 8, 60)
water estimate    = minutes × 17.8 litres
```

With the default calibration (**42 % moisture, 30 % threshold**) the card reads **18 minutes / 320 L** — the value specified in the brief. Raising the threshold to 45 % produces **52 minutes / 926 L**, which is why thresholds visibly change the recommendation.

### 6.4 Farm health score

Four weighted components computed from live values: soil moisture balance against the threshold, tank availability against capacity, irrigation efficiency from recent water use, and crop condition from field health bands. With the default demonstration data the score is **82 / 100** (Soil 85, Water Availability 78, Irrigation Efficiency 84, Crop 82).

---

## 7. Data and Persistence

Everything is stored in the browser's `localStorage` under versioned keys. There is no server, no cookie and no tracking.

| Key | Contents |
| --- | --- |
| `aquafarm.settings.v1` | Threshold, automatic irrigation, notifications, tank capacity, units |
| `aquafarm.alerts.v1` | Alert records (severity, title, text, field, time, read state), newest first |
| `aquafarm.activity.v1` | Irrigation activity records (field, time, duration, water, mode, status) |
| `aquafarm.schedules.v1` | Scheduled tasks (field, date-time, duration, mode, status) |
| `aquafarm.pump.v1` | Selected mode and target field |
| `aquafarm.counters.v1` | Sessions today, water saved %, previous-week litres, tank level, water used today |
| `aquafarm.prefs.v1` | Simulation speed preference |

**Notes**

* A pump session is intentionally **not** restored as "running" after a reload — the interface never claims irrigation is running when no live session exists behind it.
* Settings, schedules, alerts, activity and counters **are** restored, so a refresh does not lose operational context.
* **Export data (JSON)** downloads a complete snapshot. Import is not implemented in this version.
* **Clear saved data** removes all keys after a two-step confirmation and then rebuilds the demonstration dataset, so the dashboard is never empty.
* If storage is unavailable (private mode, blocked site data), the dashboard still works, falls back to defaults and shows a warning.
* Two tabs share storage but do not live-sync; each tab reads on load. Live cross-tab sync is a known limitation.

---

## 8. Accessibility

| Requirement | Status |
| --- | --- |
| Accessibility audit (`axe-core`, WCAG 2.1 A/AA + best practice) | **0 violations** |
| Colour contrast | Text over photographs measured by pixel luminance: hero title 14.18:1, hero subtitle 11.32:1, updated line 10.38:1, weather temperature 5.04:1, weather condition 6.61:1; all UI pairs ≥ 4.5:1 |
| Keyboard operation | Every control reachable and operable; visible focus rings; dialog focus handling and `Esc` support; skip link |
| Semantics | One `h1`, sequential headings, landmark regions, `caption` on the activity table, `scope` on headers |
| Forms | Every input has a persistent visible label, one label element per control, `aria-describedby` helper text, and `role="alert"` error messages |
| Custom controls | `role="switch"` + `aria-checked` on switches, `aria-pressed` on the mode control, `role="progressbar"` + `aria-valuenow` on levels, `aria-hidden` on decorative icons |
| Status without colour | Every status carries text (and often an icon), never colour alone |
| Live regions | Toasts and the alert list are polite live regions; the outage state uses `role="alert"` |
| Motion | `prefers-reduced-motion` disables animation |
| Charts | Summary text accompanies every chart so data is available without reading the canvas |

---

## 9. Performance

| Metric | Value |
| --- | --- |
| Initial critical payload | **≈ 1,362 KB** (within the 1.5 MB budget) |
| Runtime network requests | **0** — all libraries, fonts and images are local |
| Failed requests | **0** |
| Console errors / page errors | **0** |
| Total project size | ≈ 3.2 MB on disk, including all images and both font families |
| Image optimisation | Hero 1920×1080 (308 KB), section images 1200×675, thumbnails 400×300, social image 1200×630 — progressive JPEG, no visible artefacts |
| Technique | Deferred scripts, preloaded hero, lazy images with explicit dimensions, `update("none")` for live chart ticks, text-node updates instead of DOM rebuilds, bounded record lists, visibility-aware timers, no scroll listeners |

---

## 10. Testing Evidence

The build was tested in a real headless Chrome instance driven by Puppeteer against `file://…/index.html`, with console, page-error and request listeners active for the entire run. The scripts live in the repository root (`test/`) and are development-only; they are not shipped inside the project folder.

| Check | Command | Result |
| --- | --- | --- |
| Browser smoke test — load, KPIs, charts, pump toggle, activity rows | `node test/smoke.js` | Pass — 42 % / 28 °C / 64 % / 76 % rendered; pump ON → OFF; 0 errors |
| Full interaction matrix (settings save / invalid / reset, schedule create / invalid, alert read / dismiss / mark-all, filters, search, units, chart ranges, field dialog start, outage on/off, export, reload persistence) | `node test/full.js` | Pass — every assertion met; 0 console errors; 0 page errors; 0 failed requests |
| Long flows — sensor outage and recovery, a real 6-second pump session with flow-rate validation, a scheduled session running to completion, automatic mode starting the pump at a raised threshold | `node test/flows.js` | Pass — 6 s run ≈ 5 L at 30 L/min; scheduled Field C session completed with 32 L (pump auto-released, sessions 6 → 7); automatic mode started the pump with rule text "(41 % < 60 %)"; 0 errors |
| Accessibility audit | `node test/a11y.js` | **0 violations**, 58 passes (remaining incomplete contrast items are gradient/pseudo-element contexts, each verified by pixel measurement) |
| Contrast measurement under text over photography | `node test/contrast2.js` | Hero 14.18:1 / 11.32:1 / 10.38:1; weather 5.04:1 and 6.61:1 |
| Responsive capture + overflow measurement at 1440 / 1280 / 834 / 390 / 360 px | `node test/shots.js` | No page overflow at any width; the mobile activity table scrolls inside its own 661 px container by design; no control is covered by the sticky bar |
| Diagnostics — lazy image loading, icon font rendering, sticky-bar overlap, field/crop image intrinsic sizes | `node test/diag.js`, `node test/verify2.js` | All icons render from the vendored font; every image loads at its expected width; no overlay covers a control |
| Persistence and storage parity | `node test/debug.js` | Alert DOM count matches stored count before and after reload; outage state restores correctly |
| JavaScript syntax | `node --check script.js` | Clean |

**Recorded for the record:** recommendation calibration 18 min / 320 L at 30 % threshold → 52 min / 926 L at 45 % threshold; invalid threshold 90 blocked with an inline error and "Not saved"; schedule validation returned two errors for an empty form; unread alerts 3 → 0 after **Mark all read**; search "Field B" returned 3 rows and "zzz" returned the empty state; chart ranges produced 7 and 30 data points; unit switching converted the tank to 3,797 gal, the weekly total to 2,034.1 and activity rows to 0.8 gal.

---

## 11. Content and Licensing

### 11.1 Photography and imagery

All photographs are used under public-domain, CC0 or CC BY-SA licences. Attribution:

| File | Source and credit | Licence |
| --- | --- | --- |
| `hero-field.jpg` | "A lush green rice paddy field…" — **Shubham Patil** (wordpress.org/photos/photo/339686d3c4/) | CC0 |
| `field-rice.jpg` | Rice paddy — **Basile Morin** (Wikimedia Commons, curid 93886653) | CC BY-SA 4.0 |
| `field-tomato.jpg` | "Harvest (20130920-OC-LSC-0300)" — **USDAgov** | Public domain |
| `field-cotton.jpg` | "Cotton boll" — **rawpixel** (image 6041852) | CC0 |
| `weather-sky.jpg` | Sky above fields — **Da Chakrapan** (wordpress.org/photos/photo/97263ef34d/) | CC0 |
| `pump-control.jpg` | "Seidenstricker Farms — Reservoir / Irrigation (20130920-OC-LSC-0668)" — **USDAgov** | Public domain |
| `thumb-rice.jpg`, `thumb-tomato.jpg`, `thumb-cotton.jpg` | Cropped from the corresponding field photographs above | Same as source |
| `og-image.jpg` | Composed for this project from the hero photograph with typography overlaid | Derived; base image CC0 |

**Note on `field-rice.jpg`:** CC BY-SA 4.0 requires attribution (given above) and share-alike for derivative works. If the project is relicensed or the image is modified and redistributed commercially, review this licence obligation or replace the image with a CC0/public-domain alternative.

Icons are from **Font Awesome Free** (brand icons and solid/regular styles), fonts from **Inter** (SIL Open Font License), and the brand mark, favicons and PWA icons were created for this project.

### 11.2 Written content

All interface copy — headings, labels, helper text, empty-state messages, FAQ answers, help steps and the legal dialogs — was written for this project. No statistics, testimonials, clients or performance claims were invented: the figures shown are the specified demonstration values, and business details that were not supplied are marked **To Be Decided**.

---

## 12. To Be Decided (owner input required)

These items were intentionally left unresolved rather than invented:

| Item | Where it appears |
| --- | --- |
| Production domain name | Canonical URL, `sitemap.xml`, Open Graph `og:url` |
| Support email and phone number | Help section, footer contact, legal dialogs |
| Registered address and legal entity | Privacy Policy and Terms & Conditions |
| Hosting provider and analytics decision | Deployment; privacy statement if a third party is added |
| Real farm, crop or field data to replace the demonstration dataset | Content finality |
| Whether to add a hosted 404 page and/or a PWA service worker | Deployment scope |

---

## 13. Known Limitations

1. **Simulated data only** — no hardware, gateway or backend; values are generated in the browser.
2. **Single-device storage** — records live in this browser profile; there is no cross-device or multi-user sync, and clearing site data removes them.
3. **No import** — data can be exported as JSON, but restoring from that file is not implemented in this version.
4. **No live cross-tab sync** — two open tabs share storage but each reads on load.
5. **Session state is not restored** — a reload during a pump run ends the session (safety-first demo behaviour).
6. **Weather is simulated** — it does not come from a weather service.
7. **Bounded history** — 80 activity records and 40 alerts are retained, newest first.
8. **Legal dialogs are product-accurate but not legally reviewed** — have them checked before any commercial publication, and fill in the To-Be-Decided details.

---

## 14. Documentation Set

The project documentation accompanies this README:

| Document | Purpose |
| --- | --- |
| `PRD.md` | Product requirements: goals, users, functional specification, data model, acceptance criteria |
| `design.md` | Design system: brand, colour, typography, components, layouts, responsive rules, motion, accessibility |
| `architecture.md` | Technical architecture: system design, layers, data flow, storage schema, security, deployment |
| `phases.md` | Phased development roadmap with testing checkpoints and completion criteria per phase |
| `README.md` | This file: how to run, feature map, simulation reference, evidence, credits |

---

## 15. Copyright

© 2026 AquaFarm. Interface, code and written content produced for this project. Photography and libraries remain the property of their respective owners and are used under the licences stated in §11.

For questions about the demonstration, start with the **Help** section inside the dashboard.

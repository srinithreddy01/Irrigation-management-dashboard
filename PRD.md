# AquaFarm — Smart Irrigation Management Dashboard
## Product Requirements Document (PRD)

| Field | Value |
| --- | --- |
| Product name | AquaFarm — Smart Irrigation Management Dashboard |
| Document | PRD.md |
| Version | 1.0 |
| Status | Approved for implementation |
| Last updated | 18 September 2026 |
| Delivery type | Single-page, browser-run frontend application (HTML5, CSS3, vanilla JavaScript) |
| Primary audience | Workshop demonstration, farm managers, agricultural technology evaluators |
| Companion documents | `design.md`, `architecture.md`, `phases.md`, `irrigation-dashboard/README.md` |

---

## 1. Project Overview

AquaFarm is a modern, responsive web dashboard for **smart agricultural irrigation management**. It gives a farmer or farm manager a single screen that answers five questions in order:

1. **Monitor** — What is happening in my fields right now?
2. **Analyse** — What has been happening over the last hours, days and weeks?
3. **Recommend** — Should I irrigate, and for how long?
4. **Control** — Start or stop the irrigation pump safely.
5. **Save water** — How much water is being used, and how can less be used?

The dashboard displays soil moisture, temperature, humidity, water tank level, water consumption, irrigation pump status, crop information, field conditions, irrigation recommendations, recent irrigation activity, alerts and notifications.

The product is delivered as a **frontend demonstration application**. All sensor readings, weather values, water usage figures and recommendations are **simulated in the browser**. No hardware, server, database, API key or paid service is required, and the application runs by opening `index.html` directly in a browser.

### 1.1 Delivered surface (single page, eight sections)

| Section (route anchor) | Purpose |
| --- | --- |
| `#overview` — Dashboard | Greeting, live simulation status, last-updated stamp, refresh action, four KPI cards, four farm statistics |
| `#irrigation-control` — Irrigation | Pump control, target field selection, irrigation mode, flow and session metrics, smart recommendation, animated water tank |
| `#activity` — Irrigation Schedule & Activity | Schedule form, upcoming/recent schedule list, filterable and searchable activity table |
| `#fields` — Field Monitoring & Crop Management | Per-field cards with imagery and status, per-crop cards with target bands |
| `#analytics` — Analytics | 24-hour / 7-day / 30-day soil moisture chart, 7-day water usage chart, weekly summary, farm health score, weather panel |
| `#alerts` — Alerts & Notifications | Active alert list with severity and read state, alert rule policy, toast preference, sensor network status |
| `#settings` — Settings | Threshold, automatic irrigation, notifications, tank capacity, measurement units, simulation controls, stored data summary, export and reset |
| `#help` — Help & Support | Five-step operating model, FAQ accordion, support contact block |

---

## 2. Project Vision

> **A farm control room that a farmer can understand in five seconds and trust with the pump.**

The dashboard must feel like a real commercial agricultural monitoring platform — not a student mock-up and not a generic admin template. It communicates a single narrative: **Monitor → Analyse → Recommend → Control → Save Water**, using professional field imagery, restrained green agricultural branding, clear data hierarchy and visible, honest labelling of simulated data.

The interface is designed for the reality of farm use: bright outdoor light, one-handed mobile operation, and a user who is an expert in farming but not in software.

---

## 3. Business Objective

| # | Objective | How the PRD delivers it |
| --- | --- | --- |
| BO-1 | Demonstrate a complete smart-irrigation monitoring and control concept without hardware cost | Browser-only simulation engine (`sensorTick`) drives every reading, chart and alert |
| BO-2 | Show measurable water-saving value | Water usage analytics, weekly comparison ("12% less than previous week"), water-saved statistic, schedules and thresholds |
| BO-3 | Provide a credible demo for AI web development workshops | Production-grade UI/UX, documented architecture, automated test evidence, zero console errors |
| BO-4 | Reduce the time from field data to a decision | Recommendation card with duration and water estimate; automatic mode rule engine |
| BO-5 | Be deployable with zero infrastructure | Static files served from any host; no backend, no secrets, no API keys |

**Business facts not supplied by the project owner** (support phone, support email, registered address, legal entity, analytics provider) are marked **To Be Decided** and are implemented as clearly labelled demonstration placeholders until confirmed. See §44.

---

## 4. Problem Statement

Farmers and farm managers face four recurring problems:

| Problem | Consequence | Dashboard response |
| --- | --- | --- |
| Soil moisture and tank level are only visible by walking the fields | Irrigation is late or unnecessary trips are made | Live KPI cards, per-field moisture, tank gauge, sensor network status |
| Irrigation decisions are made from habit rather than thresholds | Over-watering wastes water and power; under-watering stresses crops | Configurable soil-moisture threshold, crop target bands, rule-based recommendation |
| Water consumption is invisible until the bill arrives | No feedback loop for saving water | Water usage chart, weekly total, daily average, trend versus previous week |
| Pump state is unknown from a distance | Pump runs unattended, or stops unnoticed | Pump status, runtime counter, session water, start/stop toasts, activity log |

---

## 5. Goals

### 5.1 In scope (goals)

| ID | Goal | Success indicator |
| --- | --- | --- |
| G-1 | Deliver a complete single-page irrigation dashboard that opens from the file system | `index.html` renders fully with no server |
| G-2 | Simulate live IoT sensor data realistically and continuously | Values update every 2/5/10 s with realistic drift, never jumping wildly |
| G-3 | Provide real, working pump control with visible consequences | Toggle changes status, flow reading, session water, tank level, activity log, alerts |
| G-4 | Implement the three irrigation modes with distinct behaviour | Manual, Automatic (threshold rule) and Scheduled (due task execution) |
| G-5 | Provide rule-based irrigation recommendation with duration and water estimate | Recommendation card shows duration, litres and Start/Ignore actions |
| G-6 | Provide analytics that change with live data | Two Chart.js charts with range switching and live last-point updates |
| G-7 | Persist user configuration and records in the browser | Settings, schedules, alerts, activity, pump mode survive refresh |
| G-8 | Communicate status without relying on colour | Every status has an icon **and** a text label |
| G-9 | Be fully responsive and usable on mobile | Desktop multi-column, tablet two-column, mobile single-column, sticky mobile action bar |
| G-10 | Be accessible to WCAG 2.1 AA | Automated audit reports zero violations |
| G-11 | Ship with zero console errors and no dead controls | Automated browser test suite passes |
| G-12 | Present all simulated data honestly | Every simulated area is labelled; recommendations carry a disclaimer |

### 5.2 Out of scope (goals we explicitly do not claim)

| ID | Non-goal | Reason |
| --- | --- | --- |
| NG-1 | Connecting to physical IoT sensors, PLCs or irrigation controllers | Project is a frontend demonstration |
| NG-2 | Real weather API integration | Simulated weather is required instead |
| NG-3 | User accounts, login, signup, roles or permissions | No authentication or backend is required |
| NG-4 | Server-side database persistence | Storage is browser-local (`localStorage`) |
| NG-5 | Online payment, subscriptions or billing | Not part of the product |
| NG-6 | Machine-learned or agronomic prediction | Recommendation is a transparent rule, explicitly disclaimed |
| NG-7 | Satellite imagery, drone integration, GIS maps | Not requested |
| NG-8 | Multi-farm / multi-tenant management | Single demonstration farm ("Ravi Kumar", 7 acres) is the scope |
| NG-9 | Content authoring, CMS, blog | Not applicable to a dashboard |
| NG-10 | Native mobile applications | Responsive web only |
| NG-11 | Reactive SPA frameworks (React/Vue/Angular), Next.js, Supabase, TypeScript tooling | The project owner explicitly requires HTML5, CSS3 and vanilla JavaScript only |

---

## 6. Goals vs Non-Goals Summary for Decision Makers

* **We will** simulate, monitor, analyse, recommend, control and record — for one demonstration farm.
* **We will not** claim real sensor accuracy, real agronomic advice, or real water savings.
* **We will not** add functionality beyond the supplied requirements; unused assets and dead controls are defects.

---

## 7. Target Users

| User | Description | Primary need | Device |
| --- | --- | --- | --- |
| Farm owner / manager | Runs the farm, decides when to irrigate | One-screen status and pump control | Mobile in field, desktop at office |
| Farm operator / worker | Executes irrigation as instructed | Clear instruction: which field, how long | Mobile |
| Agronomy advisor | Reviews trend, water use and crop condition | Charts, history table, health score | Tablet, desktop |
| Workshop participant / evaluator | Assesses the product concept | Visual credibility, working interactivity | Desktop, projector |
| Water resource auditor | Checks consumption and efficiency | Water usage chart, weekly comparison, export | Desktop |

---

## 8. User Personas

### Persona 1 — Ravi Kumar, Farm Manager (primary, in-product user)

* Age 42; manages 7 acres across three fields (Rice 2.5 ac, Tomato 1.5 ac, Cotton 3 ac).
* Comfortable with smartphones, not with spreadsheets or dashboards.
* Starts his day early; checks the farm from the house before walking out.
* **Goals:** know which field needs water, start the pump without walking to it, avoid wasting water and power.
* **Frustrations:** dashboards full of jargon; numbers with no clear "so what"; controls that do not visibly do anything.
* **Success quote:** "It told me Field B is dry, gave me 18 minutes and 320 litres, and the pump started. That is all I needed."
* **Product implications:** plain language, no emojis, clear status labels, big tap targets, immediate feedback after every action, mobile sticky action bar.

### Persona 2 — Sunita Reddy, Farm Operator (secondary)

* Executes watering instructions on shift; works one-handed in sunlight.
* **Goals:** know the exact field and duration; confirm that the pump actually started.
* **Frustrations:** tiny text, ambiguous status.
* **Product implications:** high-contrast status badges, large pump switch, toast confirmation, sticky mobile controls.

### Persona 3 — Dr. Anil Verma, Agronomy Advisor (secondary)

* Visits weekly; reviews moisture trend, crop stage and water efficiency.
* **Goals:** see 24-hour, 7-day and 30-day moisture behaviour; compare consumption week over week.
* **Frustrations:** charts that cannot be re-scaled; no export.
* **Product implications:** range selector on the moisture chart, weekly summary facts, JSON export, farm health breakdown.

### Persona 4 — Priya, Workshop Evaluator (tertiary)

* Judges whether a team can build a production-quality product with basic web technology.
* **Goals:** test every button, look for dead controls, check mobile rendering, inspect console.
* **Product implications:** every control has a real implementation path, no console errors, documented test evidence, responsive at 360 px and above.

---

## 9. User Roles

The application is a **single-user, unauthenticated demonstration**. There are no accounts, no sessions and no server-side authorisation. Role definitions are therefore product roles, not security roles.

| Role | Definition | Capabilities in this build |
| --- | --- | --- |
| Farm Manager (Ravi Kumar) | Default and only in-product user, shown in the header profile | Full access to every section, pump control, settings, schedules, export, reset |
| Farm Operator | Person operating the pump in the field | Uses the same interface; sticky mobile controls and pump switch are the primary tools |
| Agronomy Advisor | Reviewer of data | Read-oriented use of Analytics, Activity, Fields and export |
| Workshop Evaluator | Assesses the product | Unlimited interaction with the demonstration, including reset |

**Authorisation requirements**

* No login screen, no password, no account creation, no role-based access control in this build (see NG-3).
* No admin dashboard, no CRUD over a database, no user management (see NG-1, NG-4).
* "Admin-like" local configuration is handled by the in-product **Settings** section and is intentionally available to the single user.
* **Future role model (only if a backend is later approved):** Farmer/Farm Manager (full control), Operator (control only, no settings), Advisor (read-only) — documented in `architecture.md` §9.4 so a later phase can map product roles to real permissions without renaming anything.

---

## 10. User Journeys

### 10.1 Morning check (primary journey)

1. Ravi opens the dashboard on his phone from a bookmark.
2. The hero shows "Good Morning, Ravi — Here's the current status of your farm" with **Last updated: Just now** and a **Refresh Data** button.
3. Four cards answer the four priority questions in order: **Soil Moisture 42% (Optimal) → Temperature 28 °C (Normal) → Humidity 64% (Good) → Water Tank 76% (Sufficient)**.
4. He scrolls to **Irrigation Control**; the pump status badge reads **OFF**.
5. The **Smart Irrigation Recommendation** card tells him the selected field's moisture, the target band, a recommended duration and estimated water.
6. He taps **Start Irrigation**. The pump badge becomes **ON**, a green toast confirms "Irrigation Started — Pump has been turned ON for Field A.", the flow reading becomes 30 L/min, session water begins counting, and the tank percentage starts dropping.
7. He stops the pump after the run; a completion toast and a "Irrigation completed" alert are recorded, and the session appears in **Recent Irrigation Activity** as Completed.

### 10.2 Threshold change journey

1. Ravi scrolls to **Settings** and moves the **Soil Moisture Threshold** slider to 45%.
2. He taps **Save Settings**; a toast confirms "Your irrigation settings have been updated." and a "Saved HH:MM" stamp appears.
3. Immediately, the kicker card status changes to **Monitor/Low**, the recommendation switches to "Irrigation required", the chart threshold line moves, and the alert rules section shows the new threshold.
4. He refreshes the page: the 45% threshold is still applied.

### 10.3 Scheduling journey

1. In **Irrigation Schedule**, he selects Field B, tomorrow's date, 06:30, duration 25 minutes and mode Scheduled, then taps **Schedule Irrigation**.
2. The task appears in **Upcoming & Recent Schedules** reading "Tomorrow — 06:30 AM, Field B — Tomato, Duration: 25 minutes, Mode: Scheduled, Scheduled".
3. At the due time (or immediately via **Start now**), the pump starts in Scheduled mode with a planned duration, and the task is marked Completed when the planned duration elapses.

### 10.4 Exception journey (sensor outage)

1. Ravi enables **Simulate sensor outage** in Settings.
2. Every KPI shows `--`, the status tags read **No data**, the sensor network panel shows **Offline**, field cards are replaced by a "Field data unavailable" state, and the hero indicator reads "Sensor simulation paused (outage)".
3. If the pump was running, it stops automatically with an explanatory toast, because no trustworthy moisture data is available.
4. Turning the outage off restores readings and raises a "Sensor feed restored" alert.

### 10.5 Review journey (advisor)

1. Dr. Verma opens **Analytics**, switches the period selector between **Last 24 Hours / Last 7 Days / Last 30 Days**, and reads the summary strip (current average, lowest, highest, change over period, threshold).
2. He reviews the **Water Usage** bar chart with the weekly total, the "12% less than previous week" delta, daily average, highest day and previous-week total.
3. He checks the **Farm Health Score** ring and its four sub-scores, then filters **Recent Irrigation Activity** by field and status and searches for a date.
4. He exports the dataset with **Export demo data (JSON)** for his notes.

---

## 11. User Stories

Stories are grouped by theme. `Priority` uses MoSCoW. Every story below is implemented in this build.

### 11.1 Monitoring

| ID | Story | Priority | Acceptance criteria (summary) |
| --- | --- | --- | --- |
| US-01 | As a farm manager, I want to see soil moisture, temperature, humidity and tank level at a glance, so that I know the farm state in seconds | Must | Four KPI cards show value, unit, progress indicator and text status |
| US-02 | As a farm manager, I want to know when the data was last refreshed, so that I can trust it | Must | "Last updated" shows relative time and updates every second; "Just now" after refresh |
| US-03 | As a farm manager, I want a one-tap refresh, so that I can pull the latest readings | Must | Refresh Data shows a loading state, then a "Sensor Updated" toast |
| US-04 | As a farm manager, I want to see each field separately, so that I can act on the right one | Must | Three field cards with crop, area, moisture, target band, health, irrigation advice, sensor id, image, View Details |
| US-05 | As a farm manager, I want to see sensor health, so that I know when data is missing | Should | Sensor Network panel lists AF-01/02/03 with Online / Offline / Irrigating states |
| US-06 | As a farm manager, I want live simulation indicated clearly, so that I never mistake demo data for real readings | Must | "Live Sensor Simulation" pill plus "Demonstration data" pill in the hero |

### 11.2 Control

| ID | Story | Priority | Acceptance criteria (summary) |
| --- | --- | --- | --- |
| US-07 | As a farm manager, I want one large switch to turn irrigation on and off, so that I can control the pump quickly | Must | Switch toggles `aria-checked`, label flips, status badge flips, toast fires, activity row is created |
| US-08 | As a farm manager, I want to choose which field is irrigated, so that water goes where it is needed | Must | Target field dropdown lists all fields with crop and area; disabled while the pump runs |
| US-09 | As a farm manager, I want manual, automatic and scheduled modes, so that the farm matches my working style | Must | Segmented control switches mode; each mode has its own documented behaviour and help text |
| US-10 | As a farm manager, I want automatic mode to react to dry soil, so that crops are not stressed | Must | With automatic mode and the auto toggle enabled, moisture below threshold starts the pump; recovery above threshold + 4% stops it |
| US-11 | As a farm manager, I want to see flow rate and water used in the current session | Must | Flow shows 30 L/min while running and 0 when idle; session litres accumulate |
| US-12 | As a farm manager, I want the tank level to fall while watering, so that I can see consumption | Must | Tank percentage and volume decrease while the pump runs and stop when it stops |
| US-13 | As a farm manager, I want safety behaviour, so that the pump never runs the tank dry | Should | At empty tank the pump cannot start and an alert is raised; if the tank empties during a session the pump stops with a toast |

### 11.3 Recommendation

| ID | Story | Priority | Acceptance criteria (summary) |
| --- | --- | --- | --- |
| US-14 | As a farm manager, I want an irrigation recommendation with reasoning, so that I can decide quickly | Must | Card states field, crop, current moisture, threshold, target band, driest-field note |
| US-15 | As a farm manager, I want the recommended duration and water estimate, so that I can plan | Must | Duration (1–60 min) and litres derived from moisture gap; default calibration 18 minutes / 320 L |
| US-16 | As a farm manager, I want to start irrigation straight from the recommendation | Must | Start Irrigation starts the pump for the recommended field and planned duration |
| US-17 | As a farm manager, I want to dismiss advice I disagree with | Must | Ignore hides the card; it returns if moisture changes materially |
| US-18 | As a farm manager, I want honesty about the advice | Must | Persistent disclaimer: demonstration rule, not agronomic or AI prediction |

### 11.4 Analytics

| ID | Story | Priority | Acceptance criteria (summary) |
| --- | --- | --- | --- |
| US-19 | As an advisor, I want soil moisture over 24 hours, 7 days and 30 days | Must | Line chart with threshold reference line; range selector changes series and summary |
| US-20 | As an advisor, I want weekly water consumption | Must | Bar chart (Mon–Sun) with weekly total and daily average |
| US-21 | As an advisor, I want the week compared with the previous week | Must | Delta chip shows "12% less than previous week" (data-driven calculation) |
| US-22 | As a farm manager, I want an overall farm health score | Should | Ring score 0–100 with four sub-scores and accessible progress bars |
| US-23 | As a farm manager, I want current weather and today's forecast | Should | Condition, temperature, humidity, wind, rain chance, morning/afternoon/evening temperatures, planning note |
| US-24 | As an advisor, I want to export the data | Could | JSON download containing settings, sensors, fields, pump, alerts, activity, schedules, counters |

### 11.5 Records and alerts

| ID | Story | Priority | Acceptance criteria (summary) |
| --- | --- | --- | --- |
| US-25 | As a farm manager, I want a log of irrigation activity | Must | Table with Date, Field, Duration, Water Used, Mode, Status; running sessions update on completion |
| US-26 | As a farm manager, I want to filter and search the log | Should | Field filter, status filter, text search, record count, "No matching records" empty state |
| US-27 | As a farm manager, I want to create an irrigation schedule | Must | Form with field, date, time, duration, mode; validated; saved; shown in a list |
| US-28 | As a farm manager, I want to cancel or run a schedule now | Should | Cancel removes the task; Start now runs it immediately and marks it Completed |
| US-29 | As a farm manager, I want alerts for dry soil, low tank, completion and outage | Must | Alerts raised with severity critical / warning / success / information |
| US-30 | As a farm manager, I want to mark alerts read or dismiss them | Must | Mark read, Mark all as read, Dismiss; unread count on the bell and nav |
| US-31 | As a farm manager, I want to see notifications in a panel | Should | Bell opens a panel listing the five most recent alerts, each opening the alert centre |

### 11.6 Configuration and platform

| ID | Story | Priority | Acceptance criteria (summary) |
| --- | --- | --- | --- |
| US-32 | As a farm manager, I want to set the moisture threshold | Must | Slider 15–60% synced with a number input; validated both ways |
| US-33 | As a farm manager, I want to set tank capacity | Must | Number input 1,000–20,000 L; litre displays recompute |
| US-34 | As a farm manager, I want metric or imperial units | Should | Metric (°C, L, km/h) and Imperial (°F, gal, mph) switch all displayed units and values |
| US-35 | As a farm manager, I want toggles for automatic irrigation and notifications | Must | Both persist; automatic toggle gates the auto rule; notifications toggle suppresses non-error toasts |
| US-36 | As a farm manager, I want to control the simulation, so that I can demonstrate or inspect | Should | Speed 2/5/10 s, pause live updates, simulate outage |
| US-37 | As a farm manager, I want my settings to survive a refresh | Must | `localStorage` persistence verified after reload |
| US-38 | As a farm manager, I want to reset the demonstration | Should | Two-step confirmation, then all stored data cleared and demonstration data restored |
| US-39 | As a user, I want the dashboard on any device | Must | Verified at 360, 390, 834, 1280 and 1440 px with no horizontal overflow |
| US-40 | As a keyboard or screen-reader user, I want to operate everything | Must | Semantic landmarks, skip link, visible focus, ARIA states, live regions |
| US-41 | As a privacy-conscious user, I want to know what is stored and where | Should | Stored Data panel, Privacy Policy, Terms & Conditions, Cookie Preferences dialogs |

---

## 12. Complete Website Structure

```text
AquaFarm — Smart Irrigation Management Dashboard  (single page application shell)
│
├── Header (sticky)
│   ├── Brand: AquaFarm / Smart Irrigation Management
│   ├── Primary navigation: Dashboard · Fields · Irrigation · Analytics · Alerts · Settings
│   ├── Notification bell (dropdown panel, unread badge)
│   ├── User profile: RK avatar, "Ravi Kumar", "Farm Manager" (menu: settings, analytics,
│   │   alerts, export demo data, reset dashboard data)
│   └── Hamburger toggle (mobile / tablet)
│
├── 1. Dashboard  (#overview)
│   ├── Hero: greeting, subtitle, live-simulation pills, last updated, Refresh Data, Turn Irrigation ON/OFF
│   ├── Farm Overview: Soil Moisture · Temperature · Humidity · Water Tank (value, unit, progress, status)
│   ├── Farm Statistics: Total Farm Area · Water Used Today · Irrigation Sessions · Water Saved
│   └── (Empty/demo note: figures are simulated)
│
├── 2. Irrigation  (#irrigation-control)
│   ├── Irrigation Pump card
│   │   ├── Pump status badge (ON / OFF)
│   │   ├── Irrigation target field selector
│   │   ├── Large pump switch (role="switch")
│   │   ├── Runtime / idle status line
│   │   ├── Irrigation mode segmented control (Manual · Automatic · Scheduled)
│   │   ├── Flow rate, session water, rule-engine status
│   │   └── Pump control photograph
│   ├── Smart Irrigation Recommendation (headline, reasoning, duration, water estimate,
│   │   Start Irrigation / Ignore, disclaimer)
│   └── Water Tank (animated vertical tank, percentage, litres, capacity, draw rate, supply estimate)
│
├── 3. Irrigation Schedule & Activity  (#activity)
│   ├── Irrigation Schedule form (field, date, time, duration, mode, Schedule Irrigation, Clear)
│   ├── Upcoming & Recent Schedules list (day, time, field, duration, mode, status, Start now, Cancel)
│   └── Recent Irrigation Activity table (Date, Field, Duration, Water Used, Mode, Status)
│       ├── Filters: field · status · search
│       └── Empty states: no history · no matching records
│
├── 4. Fields  (#fields)
│   ├── Field Monitoring: field cards (image, crop badge, health badge, irrigation badge,
│   │   area, moisture, target range, sensor, status, View Details)
│   │   └── Field details dialog: image, four key facts, per-field 24-hour moisture chart,
│   │       actions (irrigate now / stop, schedule irrigation)
│   └── Crop Management: crop cards (crop, growing stage, field, recommended moisture,
│       current moisture, irrigation status)
│
├── 5. Analytics  (#analytics)
│   ├── Soil Moisture Monitoring (line chart, period selector, summary strip)
│   ├── Water Usage (bar chart, weekly total, delta vs previous week, daily average,
│   │   highest day, previous week)
│   ├── Farm Health Score (ring + Soil Condition, Water Availability, Irrigation Efficiency,
│   │   Crop Condition)
│   └── Weather Information (now panel, humidity, wind, rain chance, condition,
│       today's forecast, planning note, Update Weather)
│
├── 6. Alerts  (#alerts)
│   ├── Active Alerts (severity icon + label, title, description, time, field, Mark read, Dismiss)
│   │   └── Filter: all · unread · critical · warning · information; Mark all read
│   ├── Alert Rules (four documented rules with current threshold)
│   ├── Toast notifications toggle
│   └── Sensor Network (node list + outage error state + Refresh now)
│
├── 7. Settings  (#settings)
│   ├── Irrigation Settings form (threshold slider + number, tank capacity, units,
│   │   automatic irrigation switch, Save Settings, Reset to Defaults, saved stamp)
│   ├── Data & Simulation (update speed, pause live updates, simulate outage,
│   │   updates this session, next update, data source)
│   └── Stored Data (settings/alerts/activity/schedules/session counts, Export JSON,
│       Clear saved data, privacy note)
│
├── 8. Help  (#help)
│   ├── How this dashboard works (Monitor → Analyse → Recommend → Control → Save water)
│   ├── Frequently asked (four questions)
│   └── Support Contact (email, phone, address — To Be Decided, support hours)
│
├── Footer
│   ├── Brand, tagline, footer navigation (Dashboard · Analytics · Settings · Help)
│   ├── Simulated-data note
│   ├── Privacy Policy · Terms & Conditions · Cookie Preferences (dialogs)
│   └── Copyright line (© 2026 AquaFarm)
│
├── Sticky mobile action bar (pump status + soil hint + Refresh + Start/Stop Pump)
├── Toast region (success / error / warning / info)
├── Dialogs: Field details · Privacy Policy · Terms & Conditions · Cookie Preferences
├── System pages: custom 404 behaviour documented in §34
└── Metadata: title, description, canonical, Open Graph, Twitter card, favicon, manifest,
    robots.txt, sitemap.xml, structured data (WebApplication)
```

---

## 13. Navigation Structure

### 13.1 Primary navigation (single-level, anchor based)

| Order | Label | Icon | Target | Scroll-spy id |
| --- | --- | --- | --- | --- |
| 1 | Dashboard | `fa-gauge-high` | `#overview` | `overview` |
| 2 | Fields | `fa-map` | `#fields` | `fields` |
| 3 | Irrigation | `fa-faucet-drip` | `#irrigation-control` | `irrigation-control` |
| 4 | Analytics | `fa-chart-line` | `#analytics` | `analytics` |
| 5 | Alerts | `fa-triangle-exclamation` | `#alerts` | `alerts` |
| 6 | Settings | `fa-gear` | `#settings` | `settings` |

### 13.2 Navigation behaviour

* **Sticky header** remains visible while scrolling; the active link is highlighted by IntersectionObserver scroll-spy (`rootMargin: -45% 0px -50% 0px`).
* **Unread alert badge** appears beside the Alerts label and on the bell button; it shows a count capped at "9+".
* **Anchor offsets** keep section headings clear of the sticky header (`scroll-margin-top`).
* **Mobile / tablet (≤ 899.98 px):** the navigation collapses behind a hamburger button that animates into a close icon; the menu is announced with `aria-expanded`, closes on link activation, backdrop click or `Esc`, and traps nothing (it is a disclosure panel, not a modal).
* **Skip link** ("Skip to dashboard content") is the first focusable element.
* **Footer navigation** provides Dashboard, Analytics, Settings and Help.
* **Profile menu** provides Irrigation settings, Water usage analytics, Alerts & notifications, Export demo data (JSON), Reset dashboard data.

---

## 14. Page-by-Page Requirements

Because the product is a single page, each section is documented as a page-equivalent with its own requirements.

### 14.1 Dashboard (`#overview`)

**Purpose:** answer "what is happening right now" in under five seconds.
**Users:** farm manager, operator.
**Inputs:** simulated sensor values; current time; pump state; settings (units).
**Behaviour:** loads with a short skeleton/loading treatment, then renders KPI values; sensor tick refreshes values and progress bars; Refresh Data triggers an immediate tick with a loading state; greeting changes with the time of day.
**Output:** four KPI cards, four statistic cards, hero status block.
**Content rules:** no emojis; units always shown; status text always accompanies colour; "Demonstration data" is always visible.

### 14.2 Irrigation (`#irrigation-control`)

**Purpose:** control the pump and understand water movement.
**Inputs:** pump switch, target field, mode, recommendation actions, tank state, settings.
**Behaviour:** starting the pump changes badge, runtime clock, flow rate, session water, tank level, activity record and alerts; the target selector is locked while running; automatic mode evaluates the threshold rule on every tick; scheduled mode executes due tasks; the tank drains at exactly the configured flow rate and stops when idle; the recommendation card reflects the selected field.
**Output:** pump state, runtime, flow, session water, rule status, recommendation, tank visual and facts.
**Edge cases:** empty tank blocks start; outage blocks start; tank emptying mid-session stops the pump.

### 14.3 Irrigation Schedule & Activity (`#activity`)

**Purpose:** plan future irrigation and review what happened.
**Inputs:** schedule form fields; activity filters.
**Behaviour:** inline validation before saving; success toast and list entry on save; duplicate schedule for the same field and minute is rejected; due tasks start the pump in Scheduled mode; running sessions update their activity row to Completed with actual duration and water; filters and search re-render the table with a correct empty state.
**Output:** schedule list (up to all upcoming tasks plus the three most recent completed), activity table, record counts.

### 14.4 Fields (`#fields`)

**Purpose:** per-field and per-crop decision support.
**Inputs:** field records, sensor readings, health rules.
**Behaviour:** cards render from the field dataset; View Details opens a dialog with the field image, four facts, a 24-hour moisture line chart with a threshold reference line, and direct actions (start/stop irrigation, schedule); crop cards compare current moisture with the crop's recommended band and state a recommendation.
**Output:** three field cards, three crop cards, field dialog.

### 14.5 Analytics (`#analytics`)

**Purpose:** trend and efficiency analysis.
**Inputs:** moisture history series, weekly water series, health model, weather simulation.
**Behaviour:** charts render after libraries load (loading overlay then hidden); the moisture chart's final point tracks the live average; period selector rebuilds the series and summary; units change rescales the water axis labels; health score recomputes from live values; weather can be refreshed with a loading state.
**Output:** two charts with summaries, health ring with four sub-scores, weather panel.

### 14.6 Alerts (`#alerts`)

**Purpose:** surface everything that needs attention and nothing that does not.
**Inputs:** alert engine events, read state, filter, notification preference.
**Behaviour:** alerts are raised with a severity, a title, a description, a time and an optional field; duplicate unread alerts of the same key are suppressed and repeated keys are rate-limited (5 minutes); Mark read, Mark all as read and Dismiss are all persisted; the bell panel and nav badge stay in sync.
**Output:** alert list, alert rule policy, sensor network status, toast preference.

### 14.7 Settings (`#settings`)

**Purpose:** configure the dashboard for this farm and this browser.
**Inputs:** threshold (15–60%), tank capacity (1,000–20,000 L), units, automatic irrigation, notifications, simulation speed, pause, outage.
**Behaviour:** validation with inline errors and a "Not saved" state; saving applies changes instantly across every section (labels, values, charts, rules) and writes to `localStorage`; resetting restores documented defaults; simulation controls change cadence immediately; storage summary shows what is saved.
**Output:** saved stamp, updated dashboard, storage panel.

### 14.8 Help (`#help`)

**Purpose:** explain the product without support dependency.
**Inputs:** static content, contact block, FAQ accordion.
**Behaviour:** accordion panels open and close accessibly (`aria-expanded`, `aria-controls`).
**Output:** five-step model, four FAQs, contact details (address To Be Decided).

---

## 15. Functional Requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| FR-01 | The application must run from the file system by opening `index.html` | Automated browser test loads the page from `file://` |
| FR-02 | All sensor values must be generated in the browser; no network calls to data services | No external requests; vendored libraries |
| FR-03 | Sensor values must update at the selected interval (2 / 5 / 10 s) with realistic drift | Update counter and last-updated labels advance; deltas stay within documented ranges |
| FR-04 | Soil moisture must fall slowly when idle and rise while irrigating the field | Observed in test: idle ≈ −0.05…−0.22 %/tick; irrigating ≈ +0.28…+0.50 %/tick |
| FR-05 | Tank level must fall only while the pump runs, at the displayed flow rate | 30 L/min ⇒ with a 5 s tick, ≈ 2.5 L per tick; percentage derived from capacity |
| FR-06 | The pump must start and stop with immediate visual feedback | Badge, switch, runtime, flow, tank, activity row, toast all change within one interaction |
| FR-07 | Automatic mode must start the pump below the threshold and stop it on recovery | Verified in automated test with the threshold temporarily set to 60% |
| FR-08 | Scheduled tasks must execute when due | Verified: a schedule created for the current minute started the pump within the 15 s polling interval |
| FR-09 | Recommendation must be calculated from the selected field's moisture, not a fixed sentence | Changing the target field or threshold changes the headline and the numbers |
| FR-10 | All user configuration and records must persist across reloads | Verified by reload comparison: settings, alerts, activity, schedules, pump mode, tank level, water used today |
| FR-11 | Unit preference must convert every displayed value | Imperial shows °F, gal, mph; metric shows °C, L, km/h; chart axis labels update |
| FR-12 | Export must produce a valid JSON download | Download triggered; file written to disk during automated test |
| FR-13 | Reset must require confirmation and restore the demonstration state | Second click within 5 s performs the reset |
| FR-14 | Filters and searches must never leave a stale or inconsistent table | Record count matches visible rows; empty state appears when nothing matches |
| FR-15 | Every alert action must be persisted and reflected in the bell and nav badge | Read count falls to zero after "Mark all as read"; dismissal removes the row |

---

## 16. Feature Requirements

Each major feature is documented with purpose, user, inputs, expected behaviour, output and acceptance criteria, as required.

### 16.1 Feature: Live sensor simulation ("Sensor gateway")

* **Purpose:** make the dashboard behave like a live IoT system without hardware.
* **User:** all users (primary: farm manager).
* **Inputs:** simulation interval (2/5/10 s), pause flag, outage flag, current field moistures, pump state, tank state, settings.
* **Expected behaviour:** every tick adjusts field moisture, average moisture, temperature, humidity and (only while pumping) tank level and water used today; the update counter and "next update" countdown advance; `sensor.tick` is recorded in the analytics buffer; pausing stops ticks; an outage freezes readings and switches all data surfaces to "no data" states.
* **Output:** updated KPIs, charts, tank, fields, crops, health score, weather, sensors, recommendation and rule status.
* **Acceptance criteria:**
  1. Values change every 2/5/10 s depending on the selected speed.
  2. Changes are gradual and within the documented ranges; no wild jumps.
  3. Pausing live updates freezes the values and shows "Paused" in the countdown.
  4. Outage replaces values with `--` and shows the offline states.
  5. Zero console errors during 10 consecutive ticks.
* **Implementation:** `sensorTick()`, `startSimulation()`, `stopSimulation()`, `renderSimFacts()`, `setOutage()`.

### 16.2 Feature: Pump control

* **Purpose:** let the user start and stop irrigation with confidence.
* **User:** farm manager, operator.
* **Inputs:** pump switch click, quick hero button, sticky mobile button, recommendation Start, field dialog action, schedule execution, tank state, outage state.
* **Expected behaviour:** starting requires a non-empty tank, an online sensor feed and an idle pump; on start a `Running` activity row is created, an "Irrigation started" info alert is raised, a success toast fires and the flow/tank/session metrics begin; stopping finalises the row (duration, water used, status Completed or Stopped), raises a completion alert, updates the session counter and refreshes all derived surfaces.
* **Output:** pump badge, switch state, runtime line, flow rate, session water, tank level, activity row, alert, toast.
* **Acceptance criteria:** every entry point produces the same state; the running row uses actual elapsed minutes and measured water; no button is disabled without a visible reason.

### 16.3 Feature: Irrigation modes

* **Purpose:** match the tool to how the farm actually works.
* **Inputs:** segmented control selection; automatic-irrigation toggle; schedule mode field.
* **Expected behaviour:**

| Mode | Rule |
| --- | --- |
| Manual | Pump changes state only from a user action |
| Automatic | If automatic irrigation is enabled and average moisture < threshold, start the pump for the driest field (25-minute plan); stop when average moisture ≥ threshold + 4% |
| Scheduled | Due schedule tasks start the pump with the planned duration; the session ends automatically at the planned duration |

* **Output:** active mode chip, contextual help text, rule status line, activity rows tagged with the mode, mode badges in the table.
* **Acceptance criteria:** the selected mode persists across reloads; mode changes are recorded in analytics; automatic mode never double-starts an already running pump.

### 16.4 Feature: Smart irrigation recommendation

* **Purpose:** convert readings into an action with a number attached.
* **User:** farm manager.
* **Inputs:** selected target field's moisture, threshold, crop target band, driest-field comparison, rain chance.
* **Expected behaviour:** when moisture is below `threshold + 20`, show a recommendation; escalate the headline to "Irrigation required" below the threshold itself; compute duration as `clamp(round((threshold + 20 − moisture) × 2.25), 8, 60)` minutes and water as `duration × 17.8 L`; include the target band and a rain note when rain chance ≥ 60%; when moisture is high, hide the actions and state that moisture is sufficient; provide Start Irrigation and Ignore.
* **Output:** headline, reasoning paragraph, duration, water estimate, action buttons, disclaimer.
* **Acceptance criteria:** default calibration yields **18 minutes / 320 litres** at 42% moisture with a 30% threshold; if the threshold is raised to 45%, the recommendation escalates and the numbers change; the disclaimer is always visible when a recommendation is shown.

### 16.5 Feature: Water tank visualisation

* **Purpose:** make consumption physical and obvious.
* **Inputs:** tank percentage, tank capacity, pump state, draw rate.
* **Expected behaviour:** the animated water column height equals the percentage; the tick marks at 25/50/75% remain visible; while pumping, the surface animation speeds up and the draw rate shows the active flow; the facts list shows capacity, draw rate and estimated supply left; status text changes with level (Sufficient / Adequate / Low / Critical).
* **Output:** tank, percentage, litres, status, facts.
* **Acceptance criteria:** at 76% of 5,000 L the readout shows 3,800 L; the level visibly falls during a pump session; the aria label states the level for screen readers.

### 16.6 Feature: Analytics charts

* **Purpose:** show trends that single values cannot.
* **Inputs:** simulated history series, threshold, units, live average.
* **Expected behaviour:** the moisture line chart plots 6 points (24 h), 7 points (7 d) or 30 points (30 d) with a dashed threshold reference line and a summary (current average, lowest, highest, change, threshold); the water bar chart plots Mon–Sun with the weekly total, delta versus previous week, daily average and highest day; both resize responsively; animations are disabled for users who prefer reduced motion; the last moisture point tracks live data.
* **Output:** two charts plus summaries.
* **Acceptance criteria:** switching the period updates both the series and the summary; imperial units rescale the water axis; charts render at 360 px width without overflow.

### 16.7 Feature: Farm health score

* **Purpose:** summarise complex state in one number.
* **Inputs:** field moistures and target bands, tank level, water-saved percentage, crop health states.
* **Expected behaviour:** soil condition is the mean of per-field band-based scores; water availability is derived from tank level; irrigation efficiency is derived from the water-saved percentage; crop condition maps healthy/monitor/needs-water to 100/80/55; the overall value is their mean; the ring stroke colour is green ≥ 80, amber ≥ 65, red below.
* **Output:** ring score, four labelled sub-scores with progress bars, methodology note.
* **Acceptance criteria:** changing the threshold or tank level changes the score; sub-scores are announced with progressbar roles.

### 16.8 Feature: Irrigation scheduling

* **Purpose:** plan irrigation ahead of time.
* **Inputs:** field, date, time, duration, mode.
* **Expected behaviour:** validation blocks empty or past selections, invalid durations and duplicates; a valid entry is saved to storage, added to the activity log as Scheduled, and listed; due tasks start the pump; tasks can be started immediately or cancelled; a skipped task (pump busy or outage) raises a warning toast and is still marked completed so it cannot loop.
* **Output:** schedule list, activity row, toasts, stored schedules.
* **Acceptance criteria:** the list shows weekday-aware labels ("Today", "Tomorrow", else date); planned sessions end automatically; schedules persist across reloads.

### 16.9 Feature: Alerts and notifications

* **Purpose:** draw attention to what needs action.
* **Inputs:** rule engine events, read state, filter, notification preference.
* **Expected behaviour:** four severities; keyed de-duplication with a 5-minute cooldown; mark read, mark all read and dismiss; the bell panel lists the five most recent alerts and opens the alert centre; non-error toasts respect the notifications toggle; error toasts always show.
* **Output:** alert list, bell panel, nav badge, toasts.
* **Acceptance criteria:** unread count matches the visible unread alerts; read alerts remain readable (no opacity trick that harms contrast); dismissing shows a confirmation toast.

### 16.10 Feature: Activity log with filters

* **Purpose:** an auditable record of every irrigation event.
* **Inputs:** activity rows, field filter, status filter, search text.
* **Expected behaviour:** rows render newest-first with badges for mode and status; the record count reflects the filtered set; horizontal scrolling on small screens or card transformation depending on viewport; empty states explain what is missing.
* **Output:** table, count chip, empty states.

### 16.11 Feature: Settings and persistence

* **Purpose:** make the dashboard fit the farm, and remember it.
* **Inputs:** all settings controls, save, reset, simulation controls.
* **Expected behaviour:** validation with inline messages; save applies instantly and writes to storage; reset restores defaults; the storage panel summarises what is saved; blocked storage degrades gracefully with a warning toast instead of failing.
* **Output:** saved stamp, updated dashboard, storage summary.

### 16.12 Feature: Data portability and reset

* **Purpose:** let the user take their data out and start clean.
* **Inputs:** export buttons, reset buttons (two-step).
* **Expected behaviour:** export builds a JSON payload of all simulated data and triggers a download with a dated filename; reset clears every storage key, restores defaults and the seeded demonstration dataset, re-renders and explains the outcome.
* **Output:** downloaded JSON, reset dashboard.

### 16.13 Feature: Responsive navigation and shells

* **Purpose:** work on any device, including one-handed use in a field.
* **Expected behaviour:** ≥ 1200 px full navigation with profile meta; 900–1199 px compact navigation; ≤ 899.98 px hamburger disclosure; ≤ 991.98 px sticky mobile action bar with pump status, soil hint, Refresh and Start/Stop Pump; content padding accounts for the action bar so nothing is hidden.
* **Output:** working navigation and control shells at every breakpoint.

### 16.14 Feature: Legal and privacy dialogs

* **Purpose:** be explicit about a demo that stores data locally.
* **Expected behaviour:** Privacy Policy, Terms & Conditions and Cookie Preferences open as dialogs from the footer; the cookie dialog explains that no cookies are set and states the local-storage position; the privacy statement aligns with what the code actually does.
* **Output:** three dialogs with accurate content.

---

## 17. Forms and Form Fields

### 17.1 Irrigation Schedule form (`#scheduleForm`)

| Field | Control | Validation | Required | Notes |
| --- | --- | --- | --- | --- |
| Select Field | `select` | Must be a known field id | Yes | Options list field name, crop and area |
| Select Date | `input[type=date]` | Required; must parse; must not be more than 1 minute in the past; no duplicate schedule for the same field and minute | Yes | `min` set to today; inline error explains duplicates |
| Select Time | `input[type=time]` | Required; combined with date must be valid | Yes | Default 06:30 |
| Duration (minutes) | `input[type=number]` | Integer 1–180 | Yes | Default 20; help text states the range |
| Irrigation Mode | `select` | Manual / Automatic / Scheduled | Yes | Default Scheduled |
| Submit | button | Loading state while saving | — | "Schedule Irrigation" |
| Clear | reset | Clears errors and restores defaults | — | "Clear" |

### 17.2 Irrigation Settings form (`#settingsForm`)

| Field | Control | Validation | Required | Notes |
| --- | --- | --- | --- | --- |
| Soil Moisture Threshold (%) | range slider + number input, synced | 15–60 inclusive | Yes | Default 30; drives the rule engine, chart line and alert policy text |
| Water Tank Capacity (L) | number | 1,000–20,000, step 100 | Yes | Default 5,000; litre displays recompute |
| Measurement Units | select | metric / imperial | Yes | Default metric; converts displayed values only |
| Automatic Irrigation | switch | — | No | Default off; gates the automatic rule |
| Notifications | switch (alert policy panel) | — | No | Default on; suppresses non-error toasts when off |
| Save Settings | submit | Blocks saving while invalid; sets "Not saved" state | — | Success toast "Settings Saved" |
| Reset to Defaults | button | — | — | Restores documented defaults |

### 17.3 Simulation controls (`#settings` → Data & Simulation)

| Field | Control | Options | Notes |
| --- | --- | --- | --- |
| Sensor update speed | select | Fast 2 s / Normal 5 s / Slow 10 s | Applies immediately; persisted |
| Live sensor updates | switch | on / off | Pauses and resumes ticks |
| Simulate sensor outage | switch | on / off | Drives all "no data" states; documented recovery |
| Toast notifications | switch (alert panel) | on / off | Mirrors the notifications setting |

### 17.4 Filters and search (non-persistent, UI state)

| Control | Location | Effect |
| --- | --- | --- |
| Field filter | Activity | Restricts rows by field |
| Status filter | Activity | Restricts rows by Completed / Running / Scheduled / Stopped |
| Search | Activity | Matches field, crop, mode, status or date label; debounced 180 ms |
| Alert filter | Alerts | All / unread / critical / warning / information |
| Period selector | Analytics | 24 h / 7 d / 30 d moisture series |

### 17.5 Form UX requirements (all forms)

* Labels are always visible (no placeholder-only labelling).
* Required fields are marked with a visible asterisk and `required` semantics.
* Errors appear under the field, in text, with an icon — never colour alone.
* Invalid submission moves focus to the first invalid control.
* Submit buttons show a loading state and are not double-submit capable.
* Success is confirmed by a toast and, where relevant, a timestamp.
* `novalidate` is used so that custom, consistent error messaging is shown instead of native bubbles.

---

## 18. CTA Requirements

| # | Call to action | Location | Behaviour | Priority |
| --- | --- | --- | --- | --- |
| CTA-1 | **Refresh Data** | Hero (above the fold) | Immediate sensor tick with loading state and toast | Primary |
| CTA-2 | **Turn Irrigation ON/OFF** | Hero | Toggles the pump (mirrors the main switch) | Secondary |
| CTA-3 | **Start/Stop Pump** | Sticky mobile action bar | Same pump control, reachable one-handed | Primary (mobile) |
| CTA-4 | **Refresh** | Sticky mobile action bar | Immediate sensor refresh | Secondary (mobile) |
| CTA-5 | **Turn Irrigation ON/OFF** | Irrigation Control card | Main pump switch | Primary |
| CTA-6 | **Start Irrigation** | Recommendation card | Starts irrigation for the recommended field and duration | Primary |
| CTA-7 | **Ignore** | Recommendation card | Dismisses the recommendation until moisture changes | Tertiary |
| CTA-8 | **Schedule Irrigation** | Schedule form | Validates, saves and lists the task | Primary |
| CTA-9 | **Start now / Cancel** | Schedule list | Runs or removes a task | Secondary / Tertiary |
| CTA-10 | **View Details** | Field cards | Opens the field dialog | Secondary |
| CTA-11 | **Irrigate this field now / Schedule irrigation** | Field dialog | Field-scoped actions | Primary / Secondary |
| CTA-12 | **Save Settings / Reset to Defaults** | Settings | Applies or restores configuration | Primary / Secondary |
| CTA-13 | **Update Weather** | Weather panel | Refreshes simulated weather | Tertiary |
| CTA-14 | **Mark read / Mark all as read / Dismiss** | Alerts | Alert state management | Secondary |
| CTA-15 | **Export JSON / Clear saved data** | Profile menu + settings | Data portability and reset | Tertiary |

**CTA placement rules:** the four priority controls (Refresh, Pump, Recommendation Start, Mobile Start/Stop) are always within one screen height of the top or pinned; no CTA is duplicated in a section where it would be ambiguous; every CTA has a visible state change.

---

## 19. Admin Requirements

AquaFarm is a **single-user, unauthenticated frontend application**. There is no separate admin dashboard, no user management and no server-side CRUD (see NG-3, NG-4). To avoid inventing scope, the PRD resolves "admin" as follows:

| Requirement | Resolution in this project |
| --- | --- |
| Admin authentication | Not applicable — no accounts exist. There is no login form, and none may be added without an approved scope change. |
| Admin authorisation / protected routes | Not applicable — the application has no server routes. |
| Admin dashboard | Not applicable as a separate application. The **Settings** section plus the **Data & Simulation** panel constitute the local administration surface for the single user. |
| Admin statistics | The "Farm Statistics" strip (total area, water used today, sessions, water saved) is the only statistics surface, and it is driven by real session state — not hard-coded numbers presented as live. |
| CRUD | There is no database. The only persistent entities are local records, and they genuinely support create (schedules, activity), read (lists, tables, export), update (alert read state, activity completion, settings) and delete (cancel schedule, dismiss alert, clear saved data). |
| Loading / empty / error / success states | Required everywhere and implemented (see §30–§33). |
| Logout / session management | Not applicable. Profile actions are configuration actions only (export, reset), never fake "sign out" controls. |

### 19.1 Local administration requirements (what the Settings section must do)

* Persist configuration in `localStorage` and restore it on load.
* Apply changes immediately to every dependent surface without a page reload.
* Validate all inputs (threshold, tank capacity) with visible errors.
* Provide reset with confirmation.
* Provide export of the complete simulated dataset.
* Display exactly what is stored and where, with a link to the privacy statement.
* Never present a control that has no effect.

### 19.2 If a real admin dashboard is later approved

The following are documented in `architecture.md` §9.4 so a future phase can extend without renaming anything: role model (Farm Manager / Operator / Advisor), protected routes, Supabase Auth with email verification, RLS policies per table, audit logging of control actions, and an admin CRUD surface for fields, crops, thresholds and schedules.

---

## 20. Content Management Requirements

| Requirement | Resolution |
| --- | --- |
| CMS or authoring UI | Not required and not built (no CMS is in scope) |
| Editable content entities | Field records (name, crop, stage, area, target band, sensor id, image), crop target bands, alert rule thresholds, settings |
| How field content is managed today | Field records live in the `state.fields` dataset in `script.js`; they are ordinary data objects, so adding a field means adding one object plus its two images |
| How settings content is managed today | Through the Settings section; persisted per browser |
| How alert policy content is managed | The policy text and thresholds are rendered from settings (`#policyThreshold`) so documentation and behaviour can never drift |
| Images | Delivered as optimised JPEG/PNG assets with descriptive `alt` text; replacing an image requires no code change as long as the filename is kept |
| Text content | All product copy is static, emoji-free, and written in plain language; legal text is in the three footer dialogs |
| Content change without a developer | Settings changes require no developer; new fields or new crops require a developer (documented as a known limitation) |
| Not permitted | "Content editing" screens that do not persist, and menus that promise functionality that does not exist |

---

## 21. Search / Filter Requirements

| Surface | Control | Behaviour | Empty state |
| --- | --- | --- | --- |
| Recent Irrigation Activity | Field filter | Filters rows by field id | "No matching records" with guidance |
| Recent Irrigation Activity | Status filter | Filters rows by Completed / Running / Scheduled / Stopped | "No matching records" |
| Recent Irrigation Activity | Search box | Debounced (180 ms) match against field name, crop, mode, status and date label; case-insensitive | "No matching records" |
| Alerts | Filter (all / unread / severity) | Filters alert rows; severity-specific empty copy | "No alerts", "No unread alerts", or "No <severity> alerts" |
| Analytics | Period selector | Rebuilds the moisture series and its summary | Not applicable (always has data) |
| Field list | Not required | Three fields are always visible; no search needed at this scale | Covered by the field-data-unavailable state |

Requirements: filters never crash on zero results; the visible record count always matches the rendered rows; filters reset to their defaults on a full data reset; search input has an accessible label; filtering does not mutate stored data.

---

## 22. Authentication Requirements

**Requirement: none. This is a deliberate non-goal (NG-3).**

* No login, signup, password, OTP, magic link, API token or session is implemented or required.
* The profile area in the header is a **display and configuration** element (name, role, avatar initials, menu actions). It must never offer fake authentication controls such as a non-functional "Sign out".
* If authentication is later approved, the following apply and are pre-documented in `architecture.md` §8: email/password or OTP sign-in, email verification, session fixation protection, secure `HttpOnly` cookies at the server layer, password reset with time-limited single-use tokens, sign-in rate limiting and lockout, and multi-factor authentication for privileged roles only.
* Until then, the honest statement — "no account, no server, everything stays in your browser" — appears in the Privacy Policy, the cookie dialog, the stored-data panel and the README.

---

## 23. Authorization / RBAC

**Requirement: no authorisation layer exists in this build.**

| Concern | Position |
| --- | --- |
| Protected routes | None (no server routes) |
| Role checks in code | None, and none may be simulated |
| Data access boundaries | The browser's own origin; nothing is shared between devices |
| Sensitive data | None collected: no names beyond the demonstration persona, no contacts, no credentials, no location data |
| Least privilege | Applied in the negative sense — no capability is granted that the product does not need (no network access, no third-party scripts, no camera/location/microphone permissions) |
| Future RBAC (if approved) | Farm Manager (full), Operator (control only), Advisor (read-only), with policies documented per table in `architecture.md` §9.4 and enforced server-side — never by hiding UI alone |

---

## 24. Database Requirements

**Requirement: no server database.** The persistence layer is browser `localStorage`, treated as the product's data store and specified with the same rigour as a schema.

### 24.1 Store inventory (the "tables")

| Store key | Entity | Purpose | Shape |
| --- | --- | --- | --- |
| `aquafarm.settings.v1` | Settings | User configuration | Object: `threshold`, `autoIrrigation`, `notifications`, `tankCapacity`, `units` |
| `aquafarm.alerts.v1` | Alerts | Alert centre records | Array of `{ id, severity, title, text, fieldId, key, at, read }` |
| `aquafarm.activity.v1` | Activity | Irrigation session records | Array of `{ id, at, fieldId, durationMin, waterL, mode, status }` |
| `aquafarm.schedules.v1` | Schedules | Planned irrigation tasks | Array of `{ id, fieldId, at, durationMin, mode, status, createdAt }` |
| `aquafarm.pump.v1` | Pump | Last pump configuration | Object: `{ mode, fieldId }` |
| `aquafarm.counters.v1` | Counters | Live counters that must survive a reload | Object: `{ sessionsToday, waterSavedPercent, previousWeekLitres, tankPercent, waterUsedToday }` |
| `aquafarm.prefs.v1` | Preferences | Simulation cadence | Object: `{ intervalMs }` |

### 24.2 Relationships

* `alerts.fieldId` → `fields[].id` (nullable; a sensor event has no single field)
* `activity.fieldId` → `fields[].id` (required)
* `schedules.fieldId` → `fields[].id` (required)
* `pump.fieldId` → `fields[].id` (required)
* `fields[]` is the read-only reference dataset embedded in the application (not stored), because field definitions are content, not user data.

### 24.3 Constraints and integrity rules

| Rule | Enforcement |
| --- | --- |
| `threshold` ∈ [15, 60] | Form validation before save; rule engine tolerates any value defensively |
| `tankCapacity` ∈ [1000, 20000] | Form validation before save |
| `units` ∈ {metric, imperial} | Select control; unknown values fall back to metric |
| `severity` ∈ {critical, warning, success, info} | Alert factory coerces unknown severities to `info` |
| `status` ∈ {Completed, Running, Scheduled, Stopped} | Activity factory and status badging |
| Duration ∈ [1, 180] minutes for schedules | Form validation |
| No duplicate schedule for the same field and minute | Duplicate check in schedule validation |
| Activity is bounded | Maximum 80 records retained (newest first) |
| Alerts are bounded | Maximum 40 records retained (newest first) |
| No duplicate unread alert with the same key | Alert factory de-duplication |
| Alert re-raise cooldown | 5 minutes per key |
| Corrupt or missing storage | Safe fallback to defaults; a warning toast is shown if storage is unavailable |
| Versioned keys (`v1`) | Allows future migrations without destroying user data silently |

### 24.4 Indexes / access patterns

| Access pattern | Source | Expected frequency |
| --- | --- | --- |
| Read settings on load | `aquafarm.settings.v1` | Once per page load |
| Read + rewrite on settings change | `aquafarm.settings.v1` | Per save |
| Read alerts on load; rewrite on read/dismiss/raise | `aquafarm.alerts.v1` | Per alert action |
| Read activity on load; rewrite on session events | `aquafarm.activity.v1` | Per session start/stop/schedule |
| Read schedules on load; rewrite on create/cancel/run | `aquafarm.schedules.v1` | Per schedule action |
| Read counters on load; rewrite on each sensor tick while pumping | `aquafarm.counters.v1` | Every tick while running |

### 24.5 RLS / access rules analogue

There is no server and therefore no Row Level Security. The equivalent guarantees required of the implementation are:

1. **Single-origin isolation** — storage is readable only by this page on this browser profile.
2. **No cross-site exposure** — the application sets no cookies and exposes nothing to other origins.
3. **Sanitised rendering** — every stored string is escaped before insertion into the DOM, so a manipulated storage payload cannot inject markup or script.
4. **Validated input before write** — nothing invalid is persisted (see §24.3).
5. **User-controlled deletion** — "Clear saved data" removes every key in one action, and the cookie dialog exposes an explicit local-storage switch.

### 24.6 Verification requirement (adapted "Supabase must be verified" rule)

Written files, types or code do not prove persistence. Persistence is accepted only when observed:

1. Write settings → **reload the page** → confirm the same values are applied.
2. Create a schedule → reload → confirm the task is listed.
3. Mark an alert read / dismiss → reload → confirm the state survived.
4. Run a pump session → reload → confirm the activity row, water used today and tank level survived.
5. Clear saved data → reload → confirm defaults are restored and no stale entity remains.
6. Simulate blocked/failed storage (private mode) → confirm the dashboard still works and warns the user.

Step 4 and step 1 were executed in the automated browser test suite for this release; the results are recorded in `phases.md` (Phase 8) and `irrigation-dashboard/README.md`.

---

## 25. SEO Requirements

| Requirement | Implementation |
| --- | --- |
| Unique, descriptive title | `AquaFarm \| Smart Irrigation Management Dashboard` |
| Meta description (~150–160 characters) | Names the product and lists the monitored parameters |
| Keywords | Relevant technology and domain terms only |
| Canonical URL | Declared (domain to be confirmed — placeholder domain used) |
| Robots directive | `index, follow` |
| Theme colour | `#0F4C3A` |
| Language | `lang="en"` with `en-IN` locale in Open Graph |
| Structured data | `WebApplication` JSON-LD with name, category, description, feature list, and a zero-price offer |
| Semantic HTML | One `h1`, sequential `h2`/`h3`, `header`/`nav`/`main`/`section`/`article`/`footer` landmarks, table with `caption` |
| Descriptive image `alt` text | Every image (see §40) |
| Heading hierarchy | Section headings are `h2`; card titles `h3`; no skipped levels |
| Mobile-friendly | Responsive; viewport meta with `viewport-fit=cover` |
| Fast, crawlable static output | Single HTML file with deferred scripts |
| Sitemap and robots | Present (see §42, §43) |
| Social preview | Open Graph and Twitter card with a generated 1200×630 image (see §44) |
| No keyword stuffing or hidden text | Enforced; all content is visible product copy |
| Not applicable | Blog/article schema, breadcrumbs, hreflang (single language, single page) |

---

## 26. Accessibility Requirements

**Target: WCAG 2.1 Level AA.**

| # | Requirement | Implementation |
| --- | --- | --- |
| A-1 | Semantic structure | `header`, `nav`, `main`, `section`, `article`, `footer`, `table` with `caption`, `form` with `fieldset`-like grouping |
| A-2 | One `h1` | Hero greeting is the only `h1`; all other headings are hierarchical |
| A-3 | Skip link | "Skip to dashboard content" is the first focusable element |
| A-4 | Keyboard operability | Every control is a native `button`, `a`, `input` or `select`; the pump switch is a `button[role=switch]` with `aria-checked` |
| A-5 | Visible focus | `:focus-visible` outline (2 px, 2 px offset) using the brand focus colour; never removed |
| A-6 | Name, role, value | Labels on all inputs; `aria-current`-style active nav styling; switches expose `aria-checked`; progress bars expose `aria-valuenow` |
| A-7 | Live regions | Toast region (`aria-live="polite"`), alert list (`aria-live="polite"`), save state, chart loaders (`role="status"`) |
| A-8 | Status not by colour alone | Severity icons + text labels; status tags include text; badges pair icon and label |
| A-9 | Contrast | Body text, metadata and status text meet 4.5:1; large text meets 3:1; text over photographs verified by pixel measurement (hero ≈ 10–14:1, weather overlay ≈ 5:1 and 6.6:1) |
| A-10 | Reduced motion | `prefers-reduced-motion` disables chart animation and long transitions |
| A-11 | Text scaling | Layout tolerates 200% zoom without loss of content or horizontal scrolling of the page shell |
| A-12 | Touch targets | Primary controls are ≥ 42 px tall; the pump switch is ≥ 40 px tall with a large hit area |
| A-13 | Images | Meaningful `alt` on content images; `aria-hidden` on decorative icons and glyphs |
| A-14 | Charts | Canvas elements carry `role="img"` with descriptive `aria-label`; data is also available in text summaries |
| A-15 | Tables | Header cells use `scope="col"`; small screens switch to labelled cards so no cell loses its label |
| A-16 | Dialogs | Bootstrap modals with labelled titles, `Esc` to close, focus returned to the trigger |
| A-17 | No time limits on user actions | Toast auto-dismissal does not remove information from the page (all events are also recorded in Alerts/Activity) |
| A-18 | Automated audit | `axe-core` (WCAG 2.1 A/AA + best practice) reports **0 violations** |

---

## 27. Responsive Requirements

| Breakpoint | Width | Layout behaviour |
| --- | --- | --- |
| Small phone | 360 px | Single column, KPI cards stacked, tank centred, condensed CTA labels, footer stacked |
| Phone | 390–575 px | Single column, sticky action bar visible, filters full width, table → labelled cards |
| Large phone / small tablet | 576–767 px | Two-column KPI and statistic cards, schedule action labels visible |
| Tablet | 768–899 px | Two-column grids, hamburger navigation, charts full width |
| Small laptop | 900–1199 px | Full navigation without profile meta, two-column main grids |
| Laptop | 1200–1399 px | Full navigation, two-column analytics with side-by-side cards |
| Desktop | ≥ 1400 px | Full multi-column dashboard (max content width 1320 px) |

Requirements: **no horizontal overflow of the page** at any width (verified by automated measurement at 360, 390, 834, 1280 and 1440 px); charts resize with their containers; tables either scroll horizontally or transform into cards with visible labels; the sticky mobile action bar never covers a control; images use `object-fit` so aspect ratios never break layout; text wraps without clipping.

---

## 28. Performance Requirements

| Metric | Target | Achieved (measured) |
| --- | --- | --- |
| Initial critical payload (HTML, CSS, app JS, vendor CSS/JS, two fonts, hero image) | ≤ 1.5 MB | **≈ 1.36 MB** |
| Page weight including all lazy images and icons | ≤ 3.5 MB | ≈ 2.8 MB |
| Third-party network requests at runtime | 0 | **0** (all libraries vendored locally) |
| Time to interactive on a local file load | < 2 s | ≈ 0.3–0.6 s (init after a 260 ms skeleton window) |
| Sensor tick cost | < 16 ms | Only affected nodes are re-rendered; charts update without animation (`update("none")`) |
| Long tasks | None over 50 ms | No synchronous loops over large datasets (maximum 80 activity rows, 40 alerts) |
| Image budget | Hero ≤ 350 KB; section images ≤ 300 KB; thumbs ≤ 70 KB; OG ≤ 150 KB | Hero 308 KB, fields 76–284 KB, thumbs 18–40 KB, OG 146 KB |
| Layout stability | No cumulative layout shift from images | Width/height attributes set on every image; hero image preloaded |
| Idle cost | 1 s clock timer + one simulation timer + one 15 s schedule timer only | Confirmed (timers stopped when the tab is hidden) |
| Battery/CPU courtesy | Simulation pauses when the tab is hidden | `visibilitychange` handling |

Requirements: no CDN dependency at runtime; fonts limited to two Inter weights preloaded through CSS `font-display: swap`; Font Awesome loaded as woff2 with ttf fallback; `defer` on all scripts; the single application script avoids layout thrash by re-rendering text nodes rather than rebuilding the DOM on every tick (only dynamic lists are rebuilt).

---

## 29. Security Requirements

Threat model: a static application with no server, no accounts and no secrets. The realistic risks are DOM injection through manipulated storage, misleading security theatre, and dependency tampering.

| # | Requirement | Implementation |
| --- | --- | --- |
| SEC-1 | No secrets in client code | No API keys, tokens or credentials exist anywhere in the project (verified by search) |
| SEC-2 | No server, no attack surface for server vulnerabilities | Static files only |
| SEC-3 | Prevent DOM-based XSS | All dynamic strings pass through `escapeHtml()` or are set with `textContent`; no `innerHTML` receives unescaped user data; no `eval`, no `Function`, no inline event handlers |
| SEC-4 | Storage integrity | Values are validated on write and defensively read with fallbacks; malformed JSON cannot break the app |
| SEC-5 | Safe by default numerics | All computed numeric values pass through `clamp()` and finite checks; `formatNumber` renders `--` for non-finite values |
| SEC-6 | Export safety | Export builds JSON with `JSON.stringify` (no string concatenation) and downloads via a temporary object URL that is revoked |
| SEC-7 | No third-party trackers, no cookies | Zero external requests; no cookies set; privacy statement matches behaviour |
| SEC-8 | Dependency provenance | Libraries are pinned to exact versions (Bootstrap 5.3.3, Chart.js 4.4.7, Font Awesome 6.7.2, Inter 5.1.0) and vendored under `assets/vendor/`; updates are a deliberate, reviewed action with a re-run of the test suite |
| SEC-9 | Transport security (when hosted) | Serve over HTTPS only; add HSTS at the host; keep the application free of mixed content |
| SEC-10 | Content Security Policy (recommended when hosted) | Deliver `Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'` as a response header (`'unsafe-inline'` for styles accommodates the inline SVG data URI and Bootstrap; it is not needed for scripts) |
| SEC-11 | Clickjacking | `frame-ancestors 'none'` / `X-Frame-Options: DENY` at the host (note: the in-app preview iframes the page, so this applies to hosting only) |
| SEC-12 | Least privilege | No browser permissions requested (no geolocation, camera, microphone, notifications API, clipboard write) |
| SEC-13 | Error privacy | User-facing errors are generic and actionable; no stack traces are rendered; internal errors are caught and degraded |
| SEC-14 | Rate limiting (client-side) | Alert cooldown and de-duplication prevent notification spam; toasts are capped at three visible items |
| SEC-15 | Destructive action protection | "Clear saved data" requires a second confirmation click within 5 seconds |
| SEC-16 | Honest security claims | No lock icons, "secure login" or encryption claims are displayed in a product that has no accounts |
| SEC-17 | Accessibility as security of access | Any future route protection must be enforced server-side if a backend is added; hiding UI is never treated as a security control |

---

## 30. Loading States

| Surface | Loading treatment |
| --- | --- |
| Initial page | Values render from a skeleton/short load state (260 ms window) with a shimmer class removed on completion |
| Refresh Data / Refresh (mobile) | Button enters a loading state with a spinning icon; a thin indeterminate progress bar appears under the header; resolution produces a toast |
| Update Weather | Button loading state for ~0.7 s, then refreshed values |
| Charts | Full-card overlay with spinner and text ("Loading soil moisture history" / "Loading water usage"); hidden after the first render |
| Chart range change | Overlay reappears briefly with "Updating soil moisture history" |
| Schedule submit | Button loading state while the record is written |
| Save Settings | Button loading state, then a "Saved HH:MM" stamp |
| Pump switch | Busy ring animation on the switch while the state change is applied |
| Field dialog chart | Chart is created after the modal's `shown` event (avoids zero-size canvases); the modal itself uses Bootstrap's transition |
| KPI values on outage | `--` with a neutral "No data" status tag instead of a spinner (spinners would imply data is coming) |

Requirement: every wait longer than ~300 ms must show progress, and no loading indicator may remain visible after content is present.

---

## 31. Empty States

| Surface | Condition | Message |
| --- | --- | --- |
| Upcoming & Recent Schedules | No schedules | "No irrigation scheduled — Use the schedule form to plan the next irrigation session for one of your fields." |
| Alerts | No alerts | "No alerts — Nothing needs your attention right now. New alerts appear here when a simulated threshold is crossed." |
| Alerts | Filter = unread | "No unread alerts — Every alert has been reviewed." |
| Alerts | Filter = severity | "No <severity> alerts — No alerts of this severity have been raised in this session." |
| Activity | No records at all | "No irrigation history — Irrigation sessions you start or schedule will appear here with duration, water used and mode." |
| Activity | Filters match nothing | "No matching records — No irrigation activity matches the current filters. Try clearing the search or selecting another field." |
| Sensor feed | Outage enabled | "No sensor data available — Try refreshing the dashboard to receive the latest simulated readings." with a Refresh now action |
| Fields | Outage enabled | "Field data unavailable — Field records could not be loaded. Try refreshing the dashboard…" with a Retry action |
| Notification panel | No alerts | "No notifications yet." |

Requirements: empty states are friendly, explain why the area is empty, and always offer the next step; they never blame the user and never show a raw error.

---

## 32. Error States

| Scenario | Detection | User-facing behaviour | Data integrity |
| --- | --- | --- | --- |
| Local storage unavailable (private mode) | Probe write on load | Warning toast: "Your browser blocked local storage…" plus an explanatory note; the dashboard stays fully usable | No write attempted; defaults used |
| Corrupt stored JSON | Parse failure | Silent fallback to defaults | Bad value is not rewritten until the user saves |
| Validation error (settings) | Range checks | Inline message under the field, `is-invalid` styling, focus moved to the field, save state reads "Not saved", error toast | Nothing is written |
| Validation error (schedule) | Field checks + duplicate check | Inline messages with specific text (including "A schedule already exists for this field at the same time."), focus moved to the first invalid field, error toast | Nothing is written |
| Pump start blocked — tank empty | Tank ≤ 2% | Error toast "Tank empty…", critical alert "Water tank empty" | No session created |
| Pump start blocked — sensor outage | Outage flag | Error toast "Cannot start irrigation — The sensor gateway is offline…" | No session created |
| Tank empties mid-session | Tick check | Pump stops, error toast "Tank empty — Irrigation stopped automatically…" | Session closed with the water actually used |
| Sensor feed offline | Outage flag | KPIs `--`, "No data" tags, offline chip, empty states, live pill reads "Sensor simulation paused (outage)" | Last known values are retained in memory but not displayed as current |
| Scheduled task cannot run | Pump busy or outage | Warning toast "Scheduled irrigation skipped…" | Task is marked completed so it cannot loop |
| Charts unavailable (library missing) | `typeof Chart === "undefined"` | Chart area shows an explanatory message; the rest of the dashboard continues to work | No impact |
| Export blocked by the browser | Exception on download | Error toast "Export failed — The browser blocked the download. Try again from a different browser." | No data loss |
| Invalid or stale anchor / unknown section | Browser default | Page stays on the current section (no blank screen) | No impact |
| Invalid date for a field chart | Guarded history builder | Series still generated from a deterministic seed | No impact |

**Error message rules:** plain language, say what happened and what to do next, never expose stack traces, SQL, file paths or library internals, and always pair the message with a visible state change on the affected control.

---

## 33. Success States

| Action | Success signal |
| --- | --- |
| Refresh Data | Toast "Sensor Updated — Latest sensor readings received."; "Last updated: Just now"; update counter increments |
| Start irrigation | Toast "Irrigation Started — Pump has been turned ON for Field A."; badge flips to ON; activity row appears as Running; info alert recorded |
| Stop irrigation | Toast "Irrigation Completed/Stopped"; row becomes Completed with duration and litres; session counter increments; success alert recorded |
| Automatic trigger | Toast "Automatic irrigation triggered — Field B dropped below the 30% threshold." |
| Save settings | Toast "Settings Saved — Your irrigation settings have been updated." plus a "Saved HH:MM" stamp next to the heading |
| Reset settings | Toast "Settings reset — Irrigation settings are back to their default values." |
| Schedule created | Toast "Irrigation scheduled — Field B on 19 Sep 2026, 06:30 am for 25 minutes."; task appears in the list |
| Schedule cancelled | Toast "Schedule removed — The scheduled irrigation task has been cancelled." |
| Schedule ran | Toast "Scheduled irrigation started — Field C irrigation started for 1 minute." |
| Alert marked read / all read | Toast "All alerts marked as read — 3 alerts updated." where applicable; bell badge clears |
| Alert dismissed | Toast "Alert dismissed — The notification has been removed from your alert centre." |
| Recommendation dismissed | Toast "Recommendation dismissed — The suggestion was hidden. It will return if soil moisture drops further." |
| Weather updated | Toast "Weather updated — Simulated weather for your location has been refreshed." |
| Data exported | Toast "Export ready — Your simulated dashboard data has been downloaded as JSON." |
| Data reset | Toast "Dashboard reset — All saved data was cleared and the demonstration data was restored." |
| Live updates resumed | Toast "Live updates resumed — Simulated sensor readings are updating again." |

Requirement: success feedback is always visible, always specific (names the field, the duration or the count) and never blocks the next action.

---

## 34. Custom 404 Page

The product ships as a single HTML document, so a server 404 is normally raised by the host, not by the application. Two behaviours are therefore required and specified:

### 34.1 In-application behaviour

* A link to an anchor that does not exist must **never** produce a blank page or an error. The browser keeps the current view, and the navigation still functions.
* Script requests for unknown DOM targets must be guarded (`if (!node) { return; }`), and none of them may throw. This is enforced by the "zero console errors" acceptance criterion.
* If a user opens the page with a hash that matches no section (for example `index.html#reports`), the dashboard loads normally at the top; a future enhancement may add an inline "Section not found" notice, which is documented as an optional item and not a requirement of this release.

### 34.2 Hosting behaviour (required when deployed)

* The hosting configuration must serve a **custom 404 page** rather than a raw host error. Requirements for that page:
  * Same brand header, footer and typography as the dashboard.
  * A clear headline: "Page not found".
  * Plain-language explanation and no technical detail.
  * Primary action: "Back to dashboard" (returns to the dashboard root); secondary action: "Go to Analytics".
  * `noindex` metadata so the error page is not indexed.
  * Accessible: correct heading order, focus on the heading, keyboard operable actions.
* Deliverable: a `404.html` file using the same CSS and assets, added during the deployment phase (`phases.md`, Phase 9). Because it is not part of the requested file set for this release, it is specified here and created at deployment time; the demo build documents the requirement and provides the in-application guarantees above.

### 34.3 Acceptance criteria

1. No navigation path produces a blank screen or console error.
2. Invalid anchors keep the dashboard usable.
3. When hosted, unknown URLs return the branded 404 page with HTTP 404 status and `noindex`.

---

## 35. Thank-You Page

**Requirement: not applicable as a routed page; the confirmation requirement is satisfied by design.**

* The product has **no public-facing forms** (no contact, enquiry, newsletter or checkout form), so a "thank-you page" has no flow to terminate. Inventing one would add a page the project does not need.
* What the submission flows *do* need is a clear, accessible confirmation, which is implemented as **success states and toasts** for every write action (settings, schedule creation, alert handling, export, reset) plus persistent record changes in the schedule list, activity table and alert centre (see §33).
* If a public enquiry form is later approved, the required pattern is pre-documented in `phases.md` (Phase 3/9) and `architecture.md` §18: inline validation → submission with loading state → server-side validation and storage → success page or in-page confirmation with a reference id → confirmation notification → optional thank-you redirect that is kept out of the sitemap and marked `noindex`.

---

## 36. Privacy Policy Requirements

| Requirement | Implementation |
| --- | --- |
| Accessible from every screen | Footer link on every viewport, opening a dialog |
| Plain-language summary | "The dashboard does not require an account and does not transmit personal information to a server." |
| What is processed | Explicit list: irrigation settings, schedules, activity records, alert read states, exported files |
| Where it is stored | Browser `localStorage`; the dialog names it and links the switch that controls it |
| Simulated data disclosure | States clearly that moisture, temperature, humidity, tank, consumption and weather values are simulated and describe no real field |
| Analytics disclosure | States that anonymous interaction events are kept in memory for the session only, with no cookies and no third-party trackers |
| User control | Points to **Clear saved data**; the cookie dialog exposes the explicit local-storage switch |
| Cookies | States that no cookies are set |
| Contact | A demonstration address, labelled as such |
| Last updated | Date shown at the top of the policy |
| Accuracy | The text must always match the code; if storage keys or behaviour change, the policy is updated in the same change |
| Open items | Legal entity name, registered address, grievance officer and data-protection contact: **To Be Decided** |

---

## 37. Terms & Conditions Requirements

| Requirement | Implementation |
| --- | --- |
| Accessible from every screen | Footer link opening a dialog |
| Demonstration purpose | Explicit: all readings, weather, consumption, recommendations and scores are simulated |
| No agronomic advice | Explicit: the recommendation follows a simple threshold rule and must not be used for real irrigation decisions |
| Acceptable use | Evaluation, teaching and demonstration permitted; presenting simulated readings as real measurements is not |
| Availability and warranty | Provided "as is", no warranty, values may change without notice |
| Intellectual property | Interface, code and content belong to the project owners; photographs are credited under their licences |
| Liability | No liability for crop loss, water usage or other damages arising from reliance on simulated data |
| User data | Cross-referenced to the Privacy Policy; states that nothing is stored on a server |
| Governing law / jurisdiction | **To Be Decided** (no jurisdiction supplied) |
| Last updated | Date shown at the top |
| Presentation | Scrollable, readable dialog, semantic headings, keyboard dismissible |

---

## 38. Cookie Requirements

| Requirement | Position |
| --- | --- |
| Does the application set cookies? | No. Cookie consent is therefore **not legally required** for this build. |
| Is a consent banner required? | No. A banner would be misleading because there is nothing to consent to. |
| What is provided instead | A **Cookie Preferences** dialog in the footer that (a) states no cookies are set, (b) explains the local-storage position honestly, and (c) provides a working switch for local dashboard storage |
| Behaviour of that switch | Off: all keys are cleared, storage is disabled and a warning toast explains that nothing further will be remembered. On: storage is re-enabled (from the next write) and a success toast confirms |
| What must never happen | A fake "Accept cookies" banner that does nothing, or claiming to store cookies when none exist |
| Third-party cookies/trackers | None. No analytics vendor, no advertising pixel, no social embed |
| If cookies are introduced later | A real consent mechanism with granular categories and a persisted choice is required before any non-essential cookie is set (documented in `phases.md` Phase 9) |
| Honesty requirement | The cookie dialog, the Privacy Policy and the README must all carry the same statement |

---

## 39. Analytics Requirements

Requirements balance the instruction to include analytics with the ban on paid APIs, API keys and external trackers.

| # | Requirement | Implementation |
| --- | --- | --- |
| AN-1 | Record meaningful interaction events | `track(event, payload)` records: `app.load`, `sensor.tick`, `pump.start`, `pump.stop`, `mode.change`, `recommendation.ignore`, `settings.save`, `settings.reset`, `settings.notifications`, `schedule.create`, `schedule.cancel`, `schedule.run`, `alert.mark_read`, `alert.mark_all_read`, `alert.dismiss`, `chart.range_change`, `field.details_open`, `weather.refresh`, `simulation.outage`, `data.export`, `data.reset` |
| AN-2 | Keep the buffer bounded | Maximum 300 events, oldest discarded first |
| AN-3 | Keep it in memory | No network transmission at all |
| AN-4 | Provide a programmatic summary | `window.AquaFarmAnalytics.summary()` returns event counts |
| AN-5 | Never affect performance | Event recording is a single array push |
| AN-6 | Never collect personal data | No identifiers, no device fingerprints, no location, no keystroke capture |
| AN-7 | Disclose honestly | The Privacy Policy describes the in-memory session log and states that no cookies or third-party trackers are used |
| AN-8 | Support a future provider | If the owner later selects a provider (Google Analytics 4, Plausible, Simple Analytics, **To Be Decided**), the event names above are the recommended naming convention, and the change must add a real consent gate plus a policy update in the same release |
| AN-9 | Verify | Confirm in the browser console that `AquaFarmAnalytics.summary()` returns counts that increase after user actions |

---

## 40. Image Optimization Requirements

| # | Requirement | Implementation |
| --- | --- | --- |
| IM-1 | Only relevant, professional agricultural imagery | Field, crop, pump-control and weather photographs; no cartoons, no stock filler, no emojis as visuals |
| IM-2 | Every image must carry descriptive `alt` text | Content images have specific alt text; decorative icons are `aria-hidden` |
| IM-3 | Correct export sizes | Hero 1920×1080; section images 1200×675; field thumbs 400×300; OG 1200×630; icons 192/512 |
| IM-4 | Compression | Progressive JPEG, quality 76–84, chroma subsampling 4:2:0 for photographs; PNG only for icons |
| IM-5 | Byte budgets | Hero 308 KB; rich field image 284 KB; light field image 76 KB; thumbs 18–40 KB; OG 146 KB; total image payload 1.4 MB |
| IM-6 | Layout stability | Every tag declares `width` and `height`; `object-fit: cover` with intentional `object-position` |
| IM-7 | Lazy loading | All non-hero images use `loading="lazy"` and `decoding="async"`; the hero is `fetchpriority="high"` and preloaded |
| IM-8 | No image used as text | All text is real text |
| IM-9 | Licensing | Every photograph is public domain or CC0/CC BY-SA with attribution recorded in the project README |
| IM-10 | Optimisation must not destroy quality | Images were cropped to intentional focal points and colour-corrected lightly; no visible compression artefacts at display size |
| IM-11 | No runtime transformation services | No external image CDN or hotlinking |
| IM-12 | Favicon and social image | Brand mark exported at 1:1 (favicon, apple-touch-icon, PWA icons) and a generated 1200×630 Open Graph image with the product name and value line |

---

## 41. Metadata Requirements

| Metadata | Value / rule |
| --- | --- |
| `<title>` | `AquaFarm \| Smart Irrigation Management Dashboard` |
| `description` | Names the product, the monitored parameters and the purpose of the dashboard |
| `keywords` | Domain terms only, no repetition stuffing |
| `author` | AquaFarm |
| `robots` | `index, follow` |
| `canonical` | Absolute URL (domain **To Be Decided**; placeholder used in the build) |
| `viewport` | `width=device-width, initial-scale=1, viewport-fit=cover` |
| `theme-color` | `#0F4C3A` |
| `color-scheme` | `light` |
| Icons | `favicon.png` (PNG), `apple-touch-icon.png`, PWA `icon-192`, `icon-512` |
| Manifest | `manifest.webmanifest` with name, short name, description, start URL, standalone display, theme/background colour and maskable icons |
| Open Graph | See §44 |
| Twitter card | `summary_large_image` with title, description and the OG image |
| Structured data | `WebApplication` JSON-LD |
| Per-section metadata | Not applicable (single document); section headings carry the semantics instead |
| Rule | Metadata must describe the product accurately and must never promise functionality the build does not have |

---

## 42. Sitemap Requirements

* A `sitemap.xml` is present at the project root.
* It contains exactly one URL — the dashboard root — with `lastmod`, `changefreq: weekly` and `priority: 1.0`.
* The `loc` value uses the production domain (**To Be Decided**; placeholder currently).
* `noindex` pages (including the future hosted 404 page) must never be listed.
* The sitemap must be regenerated whenever the canonical domain is confirmed.
* Validation requirement: the file must be well-formed XML and fetchable at `/sitemap.xml`.

---

## 43. Robots.txt Requirements

* `robots.txt` is present at the project root.
* Required content:

```text
User-agent: *
Allow: /

# Block internal export and demo helper files from indexing
Disallow: /*.json$

Sitemap: https://aquafarm.example.com/sitemap.xml
```

* Rules: allow crawling of the dashboard; keep JSON payloads out of the index; declare the sitemap; never block CSS, JavaScript, fonts or images (they must remain crawlable for rendering); update the sitemap URL when the domain is confirmed.
* Verification: fetch `/robots.txt` after deployment and confirm 200 with `text/plain`.

---

## 44. Open Graph Requirements

| Property | Value |
| --- | --- |
| `og:type` | `website` |
| `og:site_name` | AquaFarm |
| `og:title` | `AquaFarm \| Smart Irrigation Management Dashboard` |
| `og:description` | "Monitor soil moisture, control the irrigation pump, analyse water usage and schedule irrigation from one responsive dashboard." |
| `og:url` | Canonical URL (domain To Be Decided) |
| `og:image` | `assets/images/og-image.jpg` — 1200×630, generated from a licensed field photograph with a dark gradient, the product name, the value line "Monitor | Analyze | Recommend | Control | Save Water" and a two-line summary |
| `og:image:width` / `height` | 1200 × 630 (declared so platforms render the large card without downloading twice) |
| `og:image:alt` | "AquaFarm smart irrigation management dashboard preview" |
| `og:locale` | `en_IN` |
| `twitter:card` | `summary_large_image` |
| `twitter:title` / `description` / `image` | Mirrors the Open Graph values |
| Requirements | Text must remain legible when the image is scaled to a 320 px-wide thumbnail (verified by downscaling); no emojis; the image must not be a screenshot of unpopulated UI; the image path must be absolute in production |

**Verification requirement:** after deployment, validate with the platform debuggers (Open Graph / X card preview) and confirm the image renders without being re-fetched (declared dimensions) and without truncation.

---

## 45. Acceptance Criteria

Release is accepted only when every item below is demonstrably true.

### 45.1 Functional

1. `index.html` opens from the file system with no server and no external network access.
2. All eight sections render with the content specified in §14.
3. Sensor values update every 2/5/10 s according to the setting, with realistic drift; the "next update" countdown is accurate.
4. Refresh Data and the mobile Refresh produce an immediate update with a loading state and a toast.
5. The pump starts and stops from all six entry points (switch, hero, mobile bar, recommendation, field dialog, schedule) with identical resulting state.
6. Manual, Automatic and Scheduled modes each behave exactly as specified in §16.3, and the selected mode persists.
7. The tank level falls only while the pump runs, at the displayed flow rate, and the tank cannot be driven below empty.
8. The recommendation reflects the selected field, threshold and crop band; the default calibration yields 18 minutes / 320 litres at 42% moisture with a 30% threshold.
9. Both charts render correctly and respond to the period selector, unit change and live data.
10. The farm health score and its four sub-scores recompute from live values.
11. Scheduling validates input, rejects duplicates, persists, lists, executes when due, and closes sessions at the planned duration.
12. The activity table filters and searches correctly, with the record count matching the visible rows.
13. Alerts raise with correct severities, de-duplicate, persist read/dismissed state, and drive both the bell panel and nav badge.
14. Settings validate, save, apply instantly, persist, and reset correctly.
15. Export produces a valid JSON file; reset restores the demonstration state after a two-step confirmation.

### 45.2 Quality

16. Zero console errors and zero uncaught exceptions during an automated interaction run covering every control.
17. Zero failed requests and zero external network requests at runtime.
18. No horizontal page overflow at 360, 390, 834, 1280 and 1440 px; no element covered by the sticky action bar; no control with zero width.
19. All images render (no broken images), with declared dimensions and correct alt text.
20. `axe-core` reports zero WCAG 2.1 AA violations; text over photographs meets contrast requirements when measured from pixels.
21. Keyboard operation reaches every control in a logical order with a visible focus indicator; dialogs close with `Esc`.
22. Reduced-motion preference disables chart animation and long transitions.
23. No emojis anywhere in the interface, and no icon replaced by an emoji.
24. Every displayed unit is correct for the selected measurement system, including the degree symbol for temperature.

### 45.3 Content and honesty

25. Every simulated surface is labelled as simulated (hero pills, recommendation disclaimer, weather subtitle, activity subtitle, privacy/terms/cookie content, README).
26. No invented business facts: unsupplied details are marked **To Be Decided** and implemented as labelled demonstration placeholders.
27. No fake controls, fake statistics, fake CRUD or placeholder production functionality.
28. Documentation (`PRD.md`, `design.md`, `architecture.md`, `phases.md`, `README.md`) matches the shipped code, including store keys, function names and default values.

---

## 46. Success Metrics

Metrics are defined for a demonstration product; production metrics are marked as future work.

### 46.1 Product demonstration metrics (measurable now)

| Metric | Target | Measurement |
| --- | --- | --- |
| Time to understand farm state | ≤ 5 s | Any KPI card and the pump badge are visible without scrolling |
| Time to start irrigation | ≤ 2 interactions | Hero button or sticky mobile button |
| Console errors | 0 | Automated run |
| Accessibility violations (axe) | 0 | Automated audit |
| Broken or missing images | 0 | Automated check |
| Response time of any single interaction | ≤ 1 s to visible feedback | Toast/state change on every action |
| Mobile usability | Fully usable at 360 px | Automated responsive capture + manual review |
| Data persistence reliability | 100% of verified reload checks | Automated reload comparison |
| Documentation-to-code agreement | 100% of referenced identifiers exist | Manual review against `architecture.md` §29 |

### 46.2 Workshop evaluation metrics (qualitative, collected by the organisers)

| Metric | Target |
| --- | --- |
| "Looks like a commercial product" rating | ≥ 4 / 5 |
| "I could operate this from the field on my phone" rating | ≥ 4 / 5 |
| "The recommendation is understandable" rating | ≥ 4 / 5 |
| Facilitator checklist completion | 100% of the demo script executed without an error |

### 46.3 Water-efficiency metrics (only meaningful with real sensors — future work)

| Metric | Definition | Status |
| --- | --- | --- |
| Water saved per week | (Baseline usage − actual usage) / baseline | Requires real data — the 18% "Water Saved" figure is a simulated demonstration value |
| Irrigation events triggered by threshold | Automatic-mode sessions / total sessions | Available in the analytics event log as `pump.start` with `automatic: true` |
| Recommendation acceptance rate | Starts from the recommendation card / recommendations shown | Derivable from `pump.start` following a recommendation render |
| Tank utilisation | Litres drawn / litres available per cycle | Derivable from session records |
| Schedule adherence | Completed scheduled sessions / scheduled sessions | Derivable from the schedule list |

> All simulation-based numbers must continue to be labelled as simulated wherever they are shown.

---

## 47. Definition of Done

A work item is done only when **all** of the following are true:

| # | Criterion |
| --- | --- |
| 1 | Behaviour is implemented exactly as specified in this PRD, with no silent deviation. |
| 2 | The feature was run in a browser immediately after implementation and observed to work (`IMPLEMENT → RUN → TEST → FIX → RE-RUN`). |
| 3 | The relevant acceptance criteria (§45) pass. |
| 4 | Existing features were re-tested after the change to prove nothing regressed. |
| 5 | No new console errors, warnings or failed requests were introduced. |
| 6 | Keyboard operation, focus visibility and screen-reader labelling are correct for the new controls. |
| 7 | Contrast is verified (including over images and gradients where applicable). |
| 8 | Loading, empty, error and success states exist for the new surface. |
| 9 | Layout is verified at 360 px, 834 px and 1440 px with no overflow and no covered controls. |
| 10 | No emojis were introduced; icons are professional and decorative icons are hidden from assistive technology. |
| 11 | Persistence (if applicable) was verified across an actual page reload. |
| 12 | Documentation was updated in the same change: this PRD, `design.md`, `architecture.md`, `phases.md` and the README where the change affects structure, data, storage keys or component names. |
| 13 | No invented business fact, statistic, testimonial, partner or certification was added. |
| 14 | No fake control, fake statistic or placeholder production behaviour was added. |
| 15 | Unused code, styles and assets introduced by the change were removed. |

---

## 48. Final Product Checklist

### 48.1 Structure and content

- [x] Single-page dashboard with eight sections and a sticky header
- [x] Navigation: Dashboard, Fields, Irrigation, Analytics, Alerts, Settings (+ footer and profile menus)
- [x] Hero with greeting, live-simulation pills, last updated, Refresh Data
- [x] Farm Overview: soil moisture, temperature, humidity, water tank
- [x] Farm Statistics: total area, water used today, sessions, water saved
- [x] Irrigation Control: pump switch, status, target field, modes, flow, session water, rule status
- [x] Smart Irrigation Recommendation with duration, water estimate, Start/Ignore and disclaimer
- [x] Animated water tank with percentage, litres, capacity, draw rate and supply estimate
- [x] Irrigation Schedule form with validation and a task list
- [x] Recent Irrigation Activity table with filters, search and status/mode badges
- [x] Field Monitoring cards with imagery, health, irrigation advice and View Details dialog
- [x] Crop Management cards with growing stage, field, band, current moisture, status
- [x] Soil moisture chart with 24 h / 7 d / 30 d selector and summary
- [x] Water usage bar chart with weekly total, comparison and facts
- [x] Farm health score ring with four sub-scores
- [x] Weather panel with current conditions and today's forecast
- [x] Alerts with severity, read state, dismissal, filter and mark-all-read
- [x] Sensor network panel with outage handling
- [x] Settings: threshold, automatic irrigation, notifications, tank capacity, units
- [x] Data & Simulation: speed, pause, outage, counters
- [x] Stored Data panel with export and clear
- [x] Help: five-step model, FAQ, support contact (address To Be Decided)
- [x] Footer with brand, navigation, legal links and copyright
- [x] Privacy Policy, Terms & Conditions, Cookie Preferences dialogs

### 48.2 Platform essentials

- [x] Custom 404 requirement documented and in-app guarantees met (§34)
- [x] Thank-you requirement resolved honestly (persistent confirmations instead of a routed page) (§35)
- [x] Meta title and meta description
- [x] CTA above the fold (Refresh Data, pump toggle)
- [x] Favicon, apple-touch-icon, PWA icons and manifest
- [x] `robots.txt`
- [x] `sitemap.xml`
- [x] Open Graph image and metadata
- [x] Alt text on every content image
- [x] Mobile breakpoints verified (360–1440 px)
- [x] Sticky mobile CTA bar with pump status and controls
- [x] Loading, empty, error and success states throughout
- [x] Cookie position stated honestly (no cookies set)
- [x] Analytics (in-memory event log with summary API)
- [x] Real contact information: **To Be Decided** (placeholders labelled)
- [x] Compressed, optimised images within documented budgets

### 48.3 Quality gates

- [x] Zero console errors and zero page errors in the automated run
- [x] Zero failed network requests; zero external requests at runtime
- [x] `axe-core`: zero violations (WCAG 2.1 A/AA + best practice)
- [x] Contrast verified for text over photographs by pixel measurement
- [x] No horizontal overflow at 360 / 390 / 834 / 1280 / 1440 px
- [x] No control hidden behind the sticky action bar
- [x] All images load and all lazy images resolve when scrolled into view
- [x] Persistence verified across reloads (settings, alerts, activity, schedules, counters)
- [x] Export verified (file written)
- [x] Reset verified with two-step confirmation
- [x] No emojis in the interface
- [x] All four documentation files and the README consistent with the implementation

### 48.4 Open items (To Be Decided)

| # | Item | Owner |
| --- | --- | --- |
| 1 | Production domain (needed for canonical URL, sitemap `loc`, OG `og:url`) | Project owner |
| 2 | Support email and phone | Project owner |
| 3 | Registered address and legal entity for the legal pages | Project owner |
| 4 | Analytics provider (or confirmation that the in-memory log is sufficient) | Project owner |
| 5 | Whether a hosted `404.html` and a PWA service worker are wanted | Project owner |
| 6 | Any real farm/crop/field data to replace the demonstration dataset | Project owner |

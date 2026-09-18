# AquaFarm — Smart Irrigation Management Dashboard
## Technical Architecture (architecture.md)

| Field | Value |
| --- | --- |
| Document | architecture.md |
| Version | 1.0 |
| Status | Implemented and verified |
| Last updated | 18 September 2026 |
| Implementation root | `irrigation-dashboard/` |
| Entry point | `irrigation-dashboard/index.html` |
| Technology | HTML5 · CSS3 · vanilla JavaScript (ES5-compatible) · Bootstrap 5.3.3 · Chart.js 4.4.7 · Font Awesome 6.7.2 · Inter |
| Companion documents | `PRD.md`, `design.md`, `phases.md`, `irrigation-dashboard/README.md` |

---

## 1. System Overview

AquaFarm is a **client-only, single-document web application**. It behaves like an IoT irrigation control room while running entirely inside a browser tab:

* A **simulated sensor gateway** (`sensorTick`) produces field readings on a timer.
* A **rule engine** (`evaluateRules`) turns readings into recommendations, alerts and automatic pump actions.
* A **control layer** (`startPump`, `stopPump`, `setMode`, `processDueSchedules`) changes state and updates every dependent surface.
* A **persistence layer** (`Store`) writes user configuration and records to `localStorage` so a refresh does not lose the operator's context.
* A **presentation layer** of pure render functions (`renderKpis`, `renderPump`, `renderTank`, `renderFields`, `renderCrops`, `renderActivity`, `renderSchedules`, `renderAlerts`, `renderHealth`, `renderWeather`, `renderSensors`, `renderRecommendation`) keeps the DOM in sync with state.
* A **visualisation layer** (Chart.js) draws two analytics charts plus per-field detail charts.
* An **analytics buffer** (`track` / `window.AquaFarmAnalytics`) records interaction events in memory for the session only.

Facts that define the system boundary:

| Property | Value |
| --- | --- |
| Server required | No |
| Network calls at runtime | **0** (all libraries vendored under `assets/vendor/`) |
| Accounts / sessions | None |
| Secrets / API keys | None |
| Database | None; browser `localStorage` is the persistence tier |
| Hardware / IoT integration | None by design (simulation only) |
| Hosting requirement | Any static host, or the local file system |

---

## 2. Architecture Overview

The application follows a **unidirectional state → render architecture** with an event-driven simulation loop:

```text
   ┌───────────────────────────────────────────────────────────────────────────┐
   │                            BROWSER (single document)                      │
   │                                                                           │
   │   ┌────────────────────────── EVENT SOURCES ──────────────────────────┐    │
   │   │  user interaction (click/input/submit)                            │    │
   │   │  simulation timer  ─ setInterval(sensorTick, 2s | 5s | 10s)       │    │
   │   │  clock timer       ─ setInterval(1s)   → relative timestamps      │    │
   │   │  schedule timer    ─ setInterval(15s)  → processDueSchedules()    │    │
   │   │  visibilitychange  ─ pause/resume simulation                      │    │
   │   └───────────────────────────────┬───────────────────────────────────┘    │
   │                                   │                                        │
   │                                   ▼                                        │
   │   ┌──────────────────────────── APPLICATION STATE ─────────────────────┐    │
   │   │  state.settings   state.fields[]   state.sensors                   │    │
   │   │  state.pump       state.alerts[]   state.activity[]                │    │
   │   │  state.schedules[] state.counters  state.simulation  state.ui       │    │
   │   └───────┬───────────────────────────┬────────────────────────────────┘    │
   │           │ mutate                    │ read                               │
   │           ▼                           ▼                                    │
   │   ┌─────────────┐            ┌──────────────────────────────────────────┐  │
   │   │  DOMAIN     │            │  RENDER LAYER (per-surface render fns)   │  │
   │   │  LOGIC      │            │  renderKpis · renderPump · renderTank ·  │  │
   │   │ sensorTick  │            │  renderFields · renderCrops ·            │  │
   │   │ evaluateRules│           │  renderActivity · renderSchedules ·      │  │
   │   │ start/stop  │            │  renderAlerts · renderBell ·             │  │
   │   │ Pump, setMode│           │  renderHealth · renderWeather ·          │  │
   │   │ submit/     │            │  renderSensors · renderRecommendation ·  │  │
   │   │ process     │            │  renderStats · renderStorageInfo ·       │  │
   │   │ Schedule    │            │  renderSoilSummary · renderWaterSummary  │  │
   │   └──────┬──────┘            └───────────────┬──────────────────────────┘  │
   │          │                                   │                             │
   │          ▼                                   ▼                             │
   │   ┌──────────────┐    ┌────────────────┐   ┌────────────────────────────┐  │
   │   │ PERSISTENCE  │    │ VISUALISATION  │   │ PRESENTATION               │  │
   │   │ Store.read/  │    │ Chart.js       │   │ DOM (semantic HTML +       │  │
   │   │ write/remove │    │ soilChart      │   │ ARIA) + CSS design tokens  │  │
   │   │ (localStorage│    │ waterChart     │   │ + Bootstrap grid/utility   │  │
   │   │  ×7 keys)    │    │ fieldDetail    │   │ + Font Awesome icons       │  │
   │   └──────────────┘    └────────────────┘   └────────────────────────────┘  │
   │                                                                           │
   │   ┌──────────────────────── SIDE CHANNELS ────────────────────────────┐    │
   │   │ toast()  → aria-live notifications                                │    │
   │   │ track()  → in-memory analytics buffer (window.AquaFarmAnalytics)  │    │
   │   └───────────────────────────────────────────────────────────────────┘    │
   └───────────────────────────────────────────────────────────────────────────┘
```

Key architectural decisions:

| # | Decision | Rationale |
| --- | --- | --- |
| AD-1 | Single document, section anchors instead of routes | The product is one dashboard; routing would add complexity with no user benefit |
| AD-2 | Global `state` object, pure render functions | Predictable: every mutation is followed by explicit renders, so no surface can drift |
| AD-3 | Timers, not request loops, for simulation | Deterministic cadence; pausing/hidden-tab behaviour is a one-line change |
| AD-4 | `localStorage` as the persistence tier | Meets the "no server" requirement while still surviving refresh |
| AD-5 | Vendored libraries | Zero network dependency; works from `file://` and fully offline |
| AD-6 | No framework | Explicitly required; the app is ~2,880 lines of readable ES5-compatible JavaScript |
| AD-7 | Deterministic seeded history | Historical charts look organic yet stay identical across reloads (no jitter in the story) |
| AD-8 | Escaping at the boundary (`escapeHtml`) | All dynamic strings are escaped before DOM insertion; `textContent` used where possible |

---

## 3. Architecture Diagram in Markdown

### 3.1 Runtime component diagram

```text
index.html
├── assets/vendor/bootstrap/bootstrap.min.css ......... grid, modal, dropdown, accordion, utilities
├── assets/css/icons.css .............................. @import → assets/vendor/fontawesome/all.min.css
├── style.css ......................................... design tokens + all component styles
├── assets/vendor/bootstrap/bootstrap.bundle.min.js ... Modal, Dropdown, Collapse (defer)
├── assets/vendor/chartjs/chart.umd.min.js ............ Chart.js UMD global `Chart` (defer)
└── script.js ......................................... IIFE application (defer)
    ├── 1  CONFIG                 (constants: flow rate, intervals, toast duration, seed)
    ├── 2  Utilities              ($, $$, clamp, round, formatNumber, escapeHtml, uid, relativeTime…)
    ├── 3  Store                  (localStorage read/write/remove/clearAll + availability probe)
    ├── 4  state                  (settings, fields, sensors, pump, alerts, activity, schedules, counters, simulation, ui, charts)
    ├── 5  Units                  (metric/imperial conversion + label application)
    ├── 6  Derived helpers        (fieldById, averageFieldMoisture, tankLitres, fieldHealth, statusText…)
    ├── 7  Toasts                 (toast → #toastRegion, aria-live polite)
    ├── 8  Analytics              (track + window.AquaFarmAnalytics)
    ├── 9  Alerts                 (addAlert, mark read, dismiss, markAllAlertsRead, renderAlerts, renderBell)
    ├── 10 Activity               (addActivity, renderActivity, filters)
    ├── 11 Pump + rule engine     (startPump, stopPump, togglePump, setMode, evaluateRules)
    ├── 12 Recommendation         (recommendationData, renderRecommendation)
    ├── 13 KPI/stat/tank/sensor renders
    ├── 14 Fields + crops + field dialog (renderFields, renderCrops, openFieldModal)
    ├── 15 Charts                 (chartOptions, buildSoilSeries, buildWaterSeries, initCharts, updates)
    ├── 16 Health score           (computeHealth, renderHealth)
    ├── 17 Weather                (renderWeather, refreshWeather)
    ├── 18 Simulation engine      (sensorTick, startSimulation, stopSimulation, refreshReadings, setOutage)
    ├── 19 Scheduling             (validateSchedule, submitSchedule, cancelSchedule, processDueSchedules)
    ├── 20 Settings               (loadSettingsIntoForm, validateSettings, saveSettings, resetSettings)
    ├── 21 Storage/export/reset   (renderStorageInfo, exportData, resetDemoData)
    ├── 22 Seed + restore         (seedDemonstrationData, restoreStoredState, persistPump, persistCounters)
    ├── 23 Routing/nav/scroll-spy (initNavigation, openMobileNav, closeMobileNav)
    ├── 24 Event wiring           (wireEvents — every listener in one auditable place)
    ├── 25 renderAll              (single entry point to refresh the whole UI)
    └── 26 init                   (skeleton → restore → seed → renderAll → charts → wire → timers)
```

### 3.2 Interaction sequence diagram (pump start)

```text
User            DOM event        Domain logic                 State                  Renders / side effects
  │                │                   │                        │                          │
  ├─ click ───────►│ #pumpToggle       │                        │                          │
  │                ├──────────────────►│ togglePump()           │                          │
  │                │                   ├───────────────────────►│ pump.on = true           │
  │                │                   │                        │ pump.fieldId, startedAt  │
  │                │                   ├── persistPump() ──────►│ localStorage pump key    │
  │                │                   ├── addActivity(Running) ►│ activity.unshift()       │
  │                │                   ├── addAlert(info) ─────►│ alerts.unshift()         │
  │                │                   ├── toast(success) ─────►│ #toastRegion (aria-live) │
  │                │                   └── render*() ──────────►│                          │
  │                │                                        renderPump, renderFields,      │
  │                │                                        renderActivity, renderAlerts,  │
  │                │                                        renderRecommendation,          │
  │                │                                        renderStorageInfo             │
  │◄─ visual ──────┤  badge ON, flow 30 L/min, session water counter starts                 │
  │                │                   │                        │                          │
  │ (every tick)   │  sensorTick() ───►│ tank −= 30 L/min × Δt   │ counters persisted       │
  │                │                   │ moisture[field] += gain │ KPIs/tank/charts updated │
```

### 3.3 Data flow at a glance

```text
simulation timer ─► sensorTick() ─┬─► state.fields[].moisture ─► averageFieldMoisture()
                                  ├─► state.sensors.{temperature,humidity,tankPercent,waterUsedToday}
                                  ├─► evaluateRules() ─┬─► alerts[] (low moisture, low tank)
                                  │                    ├─► recommendation (duration, litres)
                                  │                    └─► automatic pump start/stop
                                  └─► render* + chart live update + persistCounters()

user action ─► wireEvents listener ─► domain function ─► state mutation ─► persist*() ─► render*()
```

---

## 4. Technology Stack

| Layer | Technology | Version | Delivery |
| --- | --- | --- | --- |
| Markup | HTML5 (semantic, ARIA) | — | `index.html` (1,265 lines) |
| Styling | CSS3 custom properties, Flexbox, CSS Grid | — | `style.css` (1,810 lines) |
| Grid/utilities | Bootstrap (grid + Modal, Dropdown, Collapse, switch) | 5.3.3 | `assets/vendor/bootstrap/` |
| Behaviour | Vanilla JavaScript (ES5-compatible, IIFE, `"use strict"`) | ES5+ APIs (`Intl`, `IntersectionObserver`, `Blob`) | `script.js` (2,881 lines) |
| Charts | Chart.js (UMD) | 4.4.7 | `assets/vendor/chartjs/` |
| Icons | Font Awesome Free (solid + regular, woff2 with ttf fallback) | 6.7.2 | `assets/vendor/fontawesome/` + `assets/vendor/webfonts/` |
| Typography | Inter (latin subset, weights 400/500/600/700) | 5.1.0 package files | `assets/vendor/fonts/` |
| Persistence | Web Storage (`localStorage`) | — | 7 versioned keys |
| Data visualisation input | Deterministic pseudo-random generator (LCG, seed `20260918`) | — | `createRandom()` |
| Metadata/SEO | HTML metadata, JSON-LD, `sitemap.xml`, `robots.txt`, `manifest.webmanifest` | — | Project root |
| Tooling | Node.js (test harness only: Puppeteer, axe-core) | Node 20 | `test/` scripts (development-time only) |

**Explicitly not used** (and why): React/Vue/Angular (owner requirement), Next.js, TypeScript build tooling, Supabase, any backend, any CSS preprocessor, any bundler, any CDN at runtime, any analytics vendor, any paid API.

### 4.1 Forward-looking stack mapping (only if the owner later approves a rewrite)

The owner's preferred stack is documented here for a future phase, so that a rewrite can preserve behaviour file-by-file. **None of it exists in this delivery.**

| Preferred technology | How the current implementation maps to it |
| --- | --- |
| Next.js 15 App Router + React + TypeScript | `#overview` → `app/page.tsx`; each section → a route group (`/fields`, `/analytics`, `/alerts`, `/settings`) or a client component under `components/` |
| Tailwind CSS + shadcn/ui | Design tokens in `:root` map 1:1 to a Tailwind theme extension; cards/buttons/inputs/badges become shadcn primitives |
| Lucide icons | Font Awesome icon names map to Lucide equivalents (droplet, thermometer, waves, gauge, bell, settings…) |
| Framer Motion | Replace CSS transitions for panel/toast entry and the tank fill |
| Server Actions / API routes | `addActivity`, `addAlert`, `submitSchedule`, `saveSettings` become server actions backed by Postgres |
| Supabase Postgres + Auth + Storage | Local entity shapes (see §12) become tables; `localStorage` keys become rows; images move to Supabase Storage |
| Vercel + GitHub | Same deployment shape as §48–49 for the rewritten app |

---

## 5. Frontend Architecture

### 5.1 Layers

| Layer | Responsibility | Implementation |
| --- | --- | --- |
| Presentation shell | Static semantic structure for all eight sections | `index.html` |
| Design system | Tokens, components, responsive rules, motion | `style.css` (`:root` tokens, then components in documented order) |
| Application core | State, domain logic, simulation, persistence, rendering | `script.js` (24 documented sections + `init`) |
| Vendored platform | Grid, overlays, charts, icons, typography | `assets/vendor/` |
| Media | Optimised photography and brand marks | `assets/images/`, `favicon.png` |

### 5.2 Frontend patterns in use

| Pattern | Where | Note |
| --- | --- | --- |
| Module pattern (IIFE + `"use strict"`) | `script.js` | Prevents globals; only `window.AquaFarmAnalytics` is exported |
| Single state object | `state` | One place to inspect; no duplicated sources of truth |
| Explicit render functions | `render*()` | Each surface has exactly one render path, called after every mutation that affects it |
| Central event wiring | `wireEvents()` | All listeners registered in one auditable function; no inline handlers in HTML |
| Event delegation | Field cards, crop cards, alert list, schedule list, bell list | Handles dynamically created nodes without re-binding |
| Guarded DOM access | `setText`, `if (!node) return;` | Missing nodes never throw (supports the zero-console-error requirement) |
| Derived state | `recommendationData()`, `computeHealth()`, `fieldHealth()` | Computed, never stored — so it cannot go stale |
| Deterministic history | `createRandom(seed)`, `buildSoilSeries`, `buildWaterSeries`, `buildFieldHistory` | Charts are stable between reloads |
| Progressive enhancement guard | `if (typeof Chart === "undefined")` | Charts missing → explanatory message, rest of app unaffected |
| Non-blocking toasts | `.is-passive` after 1 s | Notifications never intercept clicks on controls beneath them |
| Visibility-aware timers | `visibilitychange` | Simulation pauses when the tab is hidden |

### 5.3 Frontend performance techniques

* Text-node updates (`setText`, `textContent`) instead of re-building DOM for high-frequency values.
* Only dynamic collections (activity rows, alert rows, schedule rows, field cards, crop cards) are rebuilt on change, and only when their data changes.
* Chart live updates use `update("none")` to skip animation during ticks.
* Images are lazy with explicit dimensions; the hero is preloaded.
* Scripts are `defer`, so parsing is never blocked.
* Timers are 1 s (clock), simulation interval, and 15 s (schedules) — nothing polls the network.

---

## 6. Backend Architecture

**There is no backend in this delivery.** The responsibilities that a backend would normally hold are either eliminated or replaced by client-side equivalents, and this substitution is deliberate and documented:

| Conventional backend responsibility | Status here | Client-side equivalent |
| --- | --- | --- |
| HTTP API | Not present | In-process function calls (`startPump`, `submitSchedule`, …) |
| Business rules | Present | `evaluateRules`, `recommendationData`, `computeHealth`, `validate*` |
| Data validation | Present | `validateSettings`, `validateSchedule` (+ defensive clamping everywhere) |
| Persistence | Present | `Store` (localStorage) |
| Scheduler / cron | Present | `processDueSchedules` on a 15 s interval |
| Notification delivery | Present | `toast()` + alerts list |
| Logging / audit trail | Present (session only) | `track()` analytics buffer + bounded activity/alerts stores |
| Authentication / authorisation | Not present (by design) | None — documented non-goal |
| Report generation | Present | `exportData()` JSON download |
| Secrets management | Not required | No secrets exist |

### 6.1 Why no backend was added

The project owner requires a demonstration that runs by opening an HTML file, with no login backend, no database, no IoT hardware, no paid APIs and no API keys. Adding a backend would contradict the requirement and introduce the very operational costs the project is meant to avoid.

### 6.2 If a backend is later approved

The same domain functions are already isolated and side-effect-scoped, so the migration path is: move `sensorTick` to a scheduled job or real ingestion, move `evaluateRules` to a service function, expose `POST /sessions`, `POST /schedules`, `PATCH /settings`, `GET /alerts`, `GET /activity` with Zod validation, and keep the client render layer unchanged by swapping the data source.

---

## 7. Database Architecture

**No server database exists.** The persistence tier is the Web Storage API with a versioned key scheme, treated as a schema and documented as such in `PRD.md` §24.

### 7.1 Storage engine characteristics

| Property | Value |
| --- | --- |
| API | `window.localStorage` |
| Scope | Origin + browser profile; not shared between devices or users |
| Durability | Survives reloads and browser restarts until cleared by the user or by the browser's storage eviction |
| Capacity | Typically ~5 MB per origin — the app stores only small records (largest store: 80 activity rows ≈ a few KB) |
| Concurrency | Single tab semantics per origin (two tabs share storage; the app re-reads on load only, so a second tab will not live-sync — documented limitation) |
| Availability | Can be blocked (private mode/settings); `Store.available` probes it and the UI degrades with a warning |
| Writes | JSON serialised objects under `aquafarm.*.v1` keys |
| Corruption handling | `JSON.parse` failures fall back to defaults silently; invalid values are never re-written until the user saves |

### 7.2 Key namespace and versioning

```text
aquafarm.settings.v1    →  { threshold, autoIrrigation, notifications, tankCapacity, units }
aquafarm.alerts.v1      →  [ { id, severity, title, text, fieldId, key, at, read } ]
aquafarm.activity.v1    →  [ { id, at, fieldId, durationMin, waterL, mode, status } ]
aquafarm.schedules.v1   →  [ { id, fieldId, at, durationMin, mode, status, createdAt } ]
aquafarm.pump.v1        →  { mode, fieldId }
aquafarm.counters.v1    →  { sessionsToday, waterSavedPercent, previousWeekLitres, tankPercent, waterUsedToday }
aquafarm.prefs.v1       →  { intervalMs }
```

The `.v1` suffix is an explicit migration hook: a future schema change writes `.v2` and migrates from `.v1` on load rather than destroying user data.

### 7.3 Reference data (not stored, embedded in code)

| Entity | Location | Why not stored |
| --- | --- | --- |
| `fields[]` (id, name, crop, stage, area, moisture, band, sensor, image, thumb) | `state.fields` in `script.js` | Field definitions are content, not user data; they also ship with matching imagery |

---

## 8. Authentication Architecture

**Not applicable — no authentication exists in this delivery** (documented non-goal NG-3 in `PRD.md`).

| Concern | Position | Enforcement |
| --- | --- | --- |
| Login / signup UI | Must not exist | No form, no button, no "sign in" copy anywhere |
| Passwords / OTP / tokens | Must not exist | No credential handling code |
| Session / cookie | Not used | The app sets no cookies and stores no session identifiers |
| "Sign out" | Must not be faked | The profile menu offers configuration actions only (settings, analytics, alerts, export, reset) |
| Identity shown | Cosmetic demonstration persona only | "Ravi Kumar / Farm Manager / RK" |

### 8.1 Future authentication design (pre-documented, not implemented)

If authentication is later approved (for example, to sync a real farm dataset), the design is:

| Requirement | Specification |
| --- | --- |
| Provider | Supabase Auth (email + password, optional OTP) |
| Verification | Email verification required before first session; unverified users cannot reach the dashboard |
| Password policy | Minimum 12 characters, breach-list check, no composition theatre |
| Login protection | Rate limit per IP + per account (e.g. 5 attempts / 15 min), progressive delays, lockout with self-service reset |
| Session | Server-issued, `HttpOnly; Secure; SameSite=Lax` cookies, rotation on privilege change, idle timeout (e.g. 12 h) with refresh-by-activity |
| Logout | Invalidates the refresh token server-side and clears the cookie |
| Password reset | Single-use, time-limited (≤ 30 min) token; all older tokens invalidated on use; notification to the account owner on reset |
| MFA | TOTP for privileged roles only (Farm Manager/Admin), with backup codes; not required for read-only advisor access |
| Roles | Farm Manager (full), Operator (control only), Advisor (read-only) — enforced server-side, never by hiding UI |
| Audit | Sign-in, sign-out, failed attempts, password reset and MFA changes written to an append-only audit table |

---

## 9. Authorization / RBAC

### 9.1 Authorisation architecture

**No authorisation layer exists** because there is no backend, no accounts and no protected data. The security-relevant guarantee in this build is the negative one: the application requests no browser capabilities (no geolocation, camera, microphone, notifications API or clipboard write) and exposes nothing beyond its own origin.

### 9.2 Product roles (non-security)

Roles exist only as product personas (`PRD.md` §9): Farm Manager (the in-product user), Operator, Agronomy Advisor, Workshop Evaluator. They share one UI and one data store; no capability is gated.

### 9.3 Capability matrix (as built)

| Capability | Farm Manager | Operator | Advisor | Evaluator |
| --- | --- | --- | --- | --- |
| View dashboard, fields, analytics, alerts | Yes | Yes | Yes | Yes |
| Control the pump, change mode, target field | Yes | Yes | No (not gated, but not their workflow) | Yes |
| Create/cancel schedules | Yes | Yes | No | Yes |
| Change settings (threshold, capacity, units) | Yes | No | No | Yes |
| Export data, reset demo | Yes | No | Yes (export) | Yes |

Because nothing is gated today, this matrix is documentation only — it becomes enforceable only with the backend described in §9.4.

### 9.4 Future server-side enforcement (pre-documented)

| Route (future) | Method | Allowed roles | Policy |
| --- | --- | --- | --- |
| `/api/fields` | GET | all authenticated | Return only the farm the user belongs to |
| `/api/sessions` | POST | Farm Manager, Operator | Insert irrigation session with `user_id`; RLS insert policy checks role |
| `/api/schedules` | POST / DELETE | Farm Manager, Operator | Owner-scoped delete |
| `/api/settings` | PATCH | Farm Manager only | Column-level update policy |
| `/api/alerts` | GET / PATCH (read) | all authenticated | Update limited to the `read` column |
| `/api/admin/*` | ALL | Farm Manager | Service-role only, never called from the browser |

Rules: least privilege (each role gets the minimum), RLS on every table, no service-role key in client code, and UI hiding is never treated as authorisation.

---

## 10. API Architecture

### 10.1 API surface in this delivery

There is **no HTTP API**. The application exposes exactly one global object for programmatic inspection:

```js
window.AquaFarmAnalytics = {
  events: [],                                  // array of { event, at, payload } (max 300)
  summary: function () { /* returns { eventName: count } */ }
};
```

Everything else is internal to the IIFE. This is intentional: an unpublished surface cannot be abused, and nothing in the app depends on it.

### 10.2 Internal function contracts (the "endpoints" of the application)

These are the documented entry points a future API would expose. Each is the single point of mutation for its concern.

| Function | Signature | Reads | Writes | Renders / effects |
| --- | --- | --- | --- | --- |
| `sensorTick(manual?)` | `(boolean)` | settings, pump, fields | fields[].moisture, sensors.*, simulation counters | KPIs, tank, pump, fields, crops, stats, health, weather, sensors, recommendation, charts, rules |
| `evaluateRules()` | `()` | settings.threshold, fields, sensors, pump | alerts[], pump (auto start/stop) | alerts, bell, recommendation |
| `startPump(opts)` | `{ fieldId?, mode?, plannedMinutes?, automatic? }` | tank, outage, fields | pump, activity (Running), alerts | pump, fields, activity, alerts, toasts, storage |
| `stopPump(reason)` | `"stopped" \| "completed"` | pump, elapsed time | pump, activity row, counters, alerts | pump, fields, activity, alerts, stats |
| `setMode(mode)` | `"Manual" \| "Automatic" \| "Scheduled"` | — | pump.mode | segmented control, help text, rules |
| `recommendationData()` | `()` → `{ needed, urgent, field, moisture, driest, minutes, litres }` | field moisture, threshold, rain chance | — | (pure) |
| `submitSchedule(event)` | `(Event)` | form inputs | schedules[], activity (Scheduled) | schedule list, activity, toasts |
| `processDueSchedules()` | `()` | schedules, pump, outage | schedules[].status, pump | schedule list, pump, toasts |
| `saveSettings(event)` | `(Event)` | form inputs | settings | every dependent render + charts + rules |
| `exportData()` | `()` | all state | (download) | toast |
| `resetDemoData(force?)` | `(boolean)` | — | all stores cleared + defaults + seed | full re-render + toast |
| `refreshReadings(opts)` | `{ button? }` | simulation flags | triggers `sensorTick(true)` | loading state, toast |
| `setOutage(active)` | `(boolean)` | — | simulation.outages | KPIs, fields, sensors, weather, alerts |

### 10.3 Future REST/Server-Action design (pre-documented)

```text
GET    /api/dashboard              → { sensors, fields, pump, alerts(unread), counters }
POST   /api/irrigation/start       → { fieldId, mode, plannedMinutes }   → session
POST   /api/irrigation/stop        → { sessionId, reason }               → session
PATCH  /api/irrigation/mode        → { mode }
GET    /api/fields                 → Field[]
GET    /api/activity?fieldId&status&q&page
POST   /api/schedules              → Schedule
DELETE /api/schedules/:id
GET    /api/alerts?filter=unread
PATCH  /api/alerts/:id             → { read: true }
GET    /api/settings               → Settings
PATCH  /api/settings               → Settings
GET    /api/analytics/soil?range=24h|7d|30d
GET    /api/analytics/water?days=7
```

Conventions for that future work: JSON only, Zod validation on every input, 200/201/400/401/403/404/409/429/500 status discipline, `{ error: { code, message } }` bodies that never leak internals, idempotency keys on control endpoints, and audit logging for every control action.

---

## 11. API Endpoints

**Delivered endpoints: none.** The application performs zero network requests at runtime — verified by an automated check that records failed and external requests (result: empty).

| Check | Method | Expected | Observed |
| --- | --- | --- | --- |
| External network requests during a full interaction run | Puppeteer request interception | 0 | **0** |
| Failed requests (404 fonts/images/scripts) | Same | 0 | **0** |
| Console errors / uncaught exceptions | Console + `pageerror` listeners | 0 | **0** |

If a backend is later added, the endpoint catalogue in §10.3 becomes the contract, and this section is replaced with real request/response documentation.

---

## 12. Database Tables

The `localStorage` stores, their columns, types, keys, nullability and constraints. (Field definitions are embedded content, not stored — see §7.3.)

### 12.1 `aquafarm.settings.v1` — settings

| Column | Type | Null | Default | Constraint |
| --- | --- | --- | --- | --- |
| `threshold` | number | No | 30 | 15–60 (validated on save; clamped defensively in logic) |
| `autoIrrigation` | boolean | No | false | — |
| `notifications` | boolean | No | true | Gates non-error toasts |
| `tankCapacity` | number (litres) | No | 5000 | 1,000–20,000 |
| `units` | string enum | No | `"metric"` | `metric` \| `imperial` |

### 12.2 `aquafarm.alerts.v1` — alerts[]

| Column | Type | Null | Constraint |
| --- | --- | --- | --- |
| `id` | string | No | Unique (`alert-<base36 time>-<random>`) |
| `severity` | string enum | No | `critical` \| `warning` \| `success` \| `info` (unknown coerced to `info`) |
| `title` | string | No | ≤ ~60 chars, rendered escaped |
| `text` | string | No | Rendered escaped |
| `fieldId` | string \| null | Yes | References `fields[].id` when present |
| `key` | string \| null | Yes | De-duplication key; unread duplicates suppressed; 5-minute re-raise cooldown |
| `at` | ISO string | No | Creation time |
| `read` | boolean | No | Read state |

Bounded at 40 records (newest first).

### 12.3 `aquafarm.activity.v1` — activity[]

| Column | Type | Null | Constraint |
| --- | --- | --- | --- |
| `id` | string | No | Unique |
| `at` | ISO string | No | Session start (updated to completion time when it finishes) |
| `fieldId` | string | No | References `fields[].id` |
| `durationMin` | number | No | ≥ 1 (actual elapsed minutes at completion; 0 while running) |
| `waterL` | number | No | ≥ 0 (measured during the session) |
| `mode` | string enum | No | `Manual` \| `Automatic` \| `Scheduled` |
| `status` | string enum | No | `Running` \| `Completed` \| `Stopped` \| `Scheduled` |

Bounded at 80 records (newest first).

### 12.4 `aquafarm.schedules.v1` — schedules[]

| Column | Type | Null | Constraint |
| --- | --- | --- | --- |
| `id` | string | No | Unique |
| `fieldId` | string | No | References `fields[].id` |
| `at` | ISO string | No | Must be in the future at creation; no duplicate field+minute |
| `durationMin` | number | No | 1–180 |
| `mode` | string enum | No | `Manual` \| `Automatic` \| `Scheduled` |
| `status` | string enum | No | `Scheduled` \| `Completed` |
| `createdAt` | ISO string | No | Creation time |

### 12.5 `aquafarm.pump.v1` — pump configuration

| Column | Type | Null | Default | Constraint |
| --- | --- | --- | --- | --- |
| `mode` | string enum | No | `"Manual"` | Manual \| Automatic \| Scheduled |
| `fieldId` | string | No | `"A"` | References `fields[].id` |

Only configuration is persisted — the running state is intentionally not restored on load, so a page refresh can never leave a pump "running" in the UI without a live session behind it.

### 12.6 `aquafarm.counters.v1` — live counters

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `sessionsToday` | number | No | 6 | Incremented on completed sessions |
| `waterSavedPercent` | number | No | 18 | Demonstration statistic |
| `previousWeekLitres` | number | No | 8750 | Denominator for the weekly comparison |
| `tankPercent` | number | No | 76 | Rounded to 2 dp; survives reload |
| `waterUsedToday` | number | No | 1240 | Litres; survives reload |

### 12.7 `aquafarm.prefs.v1` — preferences

| Column | Type | Null | Default | Constraint |
| --- | --- | --- | --- | --- |
| `intervalMs` | number | No | 5000 | 2000 \| 5000 \| 10000 |

### 12.8 Embedded reference dataset — `fields[]`

| Column | Type | Example | Notes |
| --- | --- | --- | --- |
| `id` | string | `"A"` | Primary key for records that reference a field |
| `name` | string | `"Field A"` | Display name |
| `crop` | string | `"Rice"` | Crop name |
| `stage` | string | `"Vegetative"` | Growing stage |
| `area` | number (acres) | 2.5 | Farm total = 7.0 |
| `moisture` | number (%) | 42 | Live value, mutated by ticks |
| `band` | [number, number] | `[40, 60]` | Recommended moisture range |
| `sensor` | string | `"AF-01"` | Sensor node id |
| `image` | path | `assets/images/field-rice.jpg` | Card image (1200×675) |
| `thumb` | path | `assets/images/thumb-rice.jpg` | Crop card thumbnail (400×300) |

---

## 13. Database Columns

Column-level detail, types and reasoning are consolidated in §12. Cross-cutting rules:

| Rule | Detail |
| --- | --- |
| Naming | `camelCase` for object properties; storage keys are `aquafarm.<entity>.v<n>` |
| Dates | ISO-8601 UTC strings (`new Date().toISOString()`), formatted for display with `Intl.DateTimeFormat("en-IN")` |
| Units in storage | Always metric (litres, °C, km/h, km); conversion happens at render time only |
| Numeric safety | `clamp()` on every computed number; `formatNumber` prints `--` for non-finite values |
| Strings | Never trust stored strings: every rendered value passes `escapeHtml` or `textContent` |
| Booleans | Explicit `true`/`false`; no truthy coercion of strings |
| Ids | `uid(prefix)` → `prefix-<base36 timestamp>-<5 random chars>`; stable and collision-resistant enough for a single browser |
| Bounded collections | `activity` ≤ 80, `alerts` ≤ 40; analytics ≤ 300 in memory |

---

## 14. Primary Keys

| Entity | Primary key | Scope | Generation |
| --- | --- | --- | --- |
| Settings | Singleton record (the store key itself) | One per browser | — |
| Counters | Singleton record | One per browser | — |
| Preferences | Singleton record | One per browser | — |
| Pump config | Singleton record | One per browser | — |
| Fields | `fields[].id` (`"A"`, `"B"`, `"C"`) | Application-wide | Static in code |
| Alerts | `alerts[].id` | Session + persisted | `uid("alert")` |
| Activity | `activity[].id` | Session + persisted | `uid("act")` |
| Schedules | `schedules[].id` | Session + persisted | `uid("sch")` |
| Analytics events | Array index (no key) | Session only | — |

Uniqueness is guaranteed by construction (timestamp + random suffix). All lookups use `Array.prototype.find`-style helpers (`fieldById`) rather than index assumptions, so ordering changes cannot break references.

---

## 15. Foreign Keys

| Child column | References | On missing reference | Enforced by |
| --- | --- | --- | --- |
| `alerts[].fieldId` (nullable) | `fields[].id` | Alert renders without a field line | `fieldById()` returns `null`; the render guards |
| `activity[].fieldId` | `fields[].id` | Row renders "Unknown" rather than throwing | Render guard |
| `schedules[].fieldId` | `fields[].id` | Schedule renders "Unknown field" | Render guard |
| `pump.fieldId` | `fields[].id` | Falls back to `state.fields[0]` (`pumpField()`) | Defensive fallback |

Because there is no relational engine, referential integrity is enforced defensively at read time. The future Postgres schema (if approved) uses real foreign keys with `ON DELETE SET NULL` for alerts and `ON DELETE CASCADE` for schedules/activity.

---

## 16. Relationships

```text
fields[] (1) ────< (0..n) activity[]          via activity.fieldId
fields[] (1) ────< (0..n) schedules[]         via schedules.fieldId
fields[] (1) ────< (0..n) alerts[]  (optional) via alerts.fieldId
fields[] (1) ────  (0..1) pump                via pump.fieldId  (the active irrigation target)
fields[] (1) ────  (1)    sensors snapshot    derived: sensors.soilMoisture = mean(fields[].moisture)
settings (1) ────  (n)    engine decisions    threshold drives rules, recommendation, chart line, alert policy
counters (1) ────  (1)    analytics summary   weekly total, previous week, savings
```

Cardinality notes:

* One field can have many activity records and many schedules.
* Exactly one field can be the pump's active target at a time.
* The farm-level `sensors.soilMoisture` is a derived aggregate (average), not an independent value — this is why the rule engine uses averages for the automatic decision and per-field values for alerts and recommendations.

---

## 17. Data Flow

### 17.1 Sensor data flow (continuous)

```text
setInterval(state.simulation.intervalMs)
        │
        ▼
sensorTick(manual)
 ├─ guard: outage? → return
 ├─ per field:  pump running on this field ? +0.28…+0.50 % : −0.05…−0.22 %   (clamped 12–82)
 ├─ sensors.soilMoisture = round(mean(fields[].moisture))
 ├─ sensors.temperature += −0.25…+0.28   (clamped 16–41)
 ├─ sensors.humidity    += −0.9…+0.9     (clamped 32–92)
 ├─ if pump running:
 │     litresPerTick = 30 L/min × (intervalMs / 60000) × jitter(0.9…1.1)
 │     tankPercent   −= litresPerTick / tankCapacity × 100
 │     pump.sessionWater += litresPerTick
 │     sensors.waterUsedToday += litresPerTick
 │     persistCounters()
 │     if tankPercent ≤ 1 → toast(error) + stopPump("stopped")
 ├─ simulation.updates++, lastUpdated = now, nextUpdateAt = now + intervalMs
 └─ render pass:  renderKpis · renderTank · renderPump · renderFields · renderCrops · renderStats ·
                  renderHealth · renderWeather · renderSensors · renderRecommendation · evaluateRules ·
                  updateChartsLive · updateLastUpdated · renderSimFacts · track("sensor.tick")
```

### 17.2 Rule evaluation flow

```text
evaluateRules()
 ├─ average = mean(fields[].moisture);  threshold = settings.threshold
 ├─ update rule status line  ("below threshold" | "sufficient")
 ├─ per field: if moisture < threshold → addAlert(critical, key=low-moisture-<id>)
 ├─ if tankPercent < 30 → addAlert(warning | critical below 15, key=tank-low | tank-critical)
 ├─ automatic mode?
 │    ├─ pump off && average < threshold          → toast(info) + startPump(driest, Automatic, 25 min)
 │    └─ pump on  && average ≥ threshold + 4 %    → stopPump("completed")   ← hysteresis
 ├─ planned session elapsed ≥ plannedMinutes      → stopPump("completed")
 └─ renderAlerts · renderBell · renderRecommendation · persistAlerts
```

### 17.3 UI interaction flow (generic)

```text
DOM event → wireEvents listener → validation (if input) → domain function → state mutation
          → persist*() → render*() → toast()/alert() (as applicable) → track()
```

---

## 18. Form Submission Flow

### 18.1 Schedule creation (the only multi-field submission)

```text
1  User fills: field, date, time, duration, mode
2  submit event → submitSchedule(event) → event.preventDefault()
3  validateSchedule()
     ├─ field selected?
     ├─ date + time parse to a real datetime?
     ├─ datetime not more than 60 s in the past?
     ├─ duration integer 1–180?
     ├─ mode selected?
     └─ no duplicate schedule for the same field within 60 s?
4  Invalid → mark .is-invalid, reveal .field__error with specific text, focus first invalid,
   toast(error, "Schedule not saved", "Please correct the highlighted fields and try again.")  → STOP
5  Valid   → submit button enters loading state (~500 ms)
6  Build record { id, fieldId, at (ISO), durationMin, mode, status: "Scheduled", createdAt }
7  state.schedules.push(record); persistSchedules()
8  addActivity({ … status: "Scheduled" }); renderActivity()
9  renderSchedules()  → task appears with "Today/Tomorrow/date + time" labels
10 toast(success, "Irrigation scheduled", "<Field> on <date time> for <n> minutes.")
11 Form reset → date = today, time = 06:30, duration = 20, field = Field B (demo-friendly default)
12 track("schedule.create", { fieldId, durationMin, mode })
13 renderStorageInfo()  → "Schedules: 1 saved"
```

### 18.2 Settings submission

```text
submit → saveSettings(event) → validateSettings()
   ├─ threshold 15–60 and not empty
   └─ tankCapacity 1,000–20,000 and not empty
invalid → inline errors + "Not saved" stamp + error toast + focus → STOP
valid   → button loading (~500 ms) → write settings to localStorage
        → applyUnitLabels() (rewrites every [data-unit] label)
        → re-render KPIs, tank, pump, stats, health, weather, fields, crops, activity,
          recommendation, schedules, storage info
        → updateWaterChart() + updateSoilChart(current range)   (axis + reference line)
        → evaluateRules()  (threshold change can immediately change recommendations/alerts)
        → "Saved HH:MM" stamp (cleared after 4 s)
        → toast(success, "Settings Saved", "Your irrigation settings have been updated.")
        → track("settings.save", { threshold, capacity, units, auto, notifications, unitsChanged })
```

### 18.3 Field dialog actions

```text
Field card / crop card → openFieldModal(fieldId)
  ├─ build content (image, 4 facts, 24 h chart, note)
  ├─ footer actions: Start/Stop irrigation, Schedule irrigation, Close
  ├─ bootstrap.Modal.getOrCreateInstance(...).show()
  └─ on "shown" → create the field chart (canvas has real dimensions by then)

footer action → data-modal-action
  ├─ "start"    → startPump({ fieldId, plannedMinutes: moisture < threshold ? 25 : 15 }) → hide modal
  ├─ "stop"     → stopPump("stopped") → hide modal
  └─ "schedule" → hide modal → preselect field in the schedule form → jump to #activity → focus time
```

---

## 19. Admin Data Flow

There is no admin backend; the closest equivalent is the local configuration flow, which is fully specified so it can be re-implemented server-side later.

```text
Settings section (local administration surface)
  ├─ read:  Store.read("aquafarm.settings.v1") on load → applyUnitLabels + loadSettingsIntoForm
  ├─ write: validated form → Store.write → immediate global re-render (no page reload)
  ├─ read:  simulation preferences → Store.read("aquafarm.prefs.v1") → interval applied at startup
  ├─ write: simulation controls → Store.write + timer restart
  ├─ read:  storage summary → Store reads + in-memory counts → renderStorageInfo()
  ├─ export: all state → JSON blob → object URL → download → revoke
  └─ reset: two-step confirm → Store.clearAll() → defaults restored → seedDemonstrationData()
            → renderAll() → toast(success)

Current session state (not administrative)
  ├─ pump config → persistPump() writes { mode, fieldId }
  └─ counters    → persistCounters() writes on every tick while pumping and on session completion
```

Audit trail: every administrative action calls `track()` with a payload (`settings.save`, `settings.reset`, `settings.notifications`, `simulation.outage`, `data.export`, `data.reset`), giving an in-session audit trail that a future server-side audit log can mirror.

---

## 20. Image / File Upload Flow

**No uploads exist in this delivery.** There is no file input, no camera capture, no drag-and-drop upload and no server storage. This is deliberate: upload requires a backend (or Supabase Storage in the preferred stack) and would introduce the very dependency the project forbids.

What exists instead:

| Requirement | Implementation |
| --- | --- |
| Images used by fields | Static, pre-optimised assets referenced by path in the field dataset |
| Changing a field image | Replace the file (keep the filename) or update the `image`/`thumb` paths in `state.fields` |
| User-generated files | Only the exported JSON, produced with a Blob and a temporary object URL that is revoked after download |
| Upload safety (future) | Documented below |

Future upload flow (pre-documented, not implemented): client-side type and size validation (JPEG/PNG/WebP ≤ 5 MB) → presigned upload to Supabase Storage → server-side MIME sniffing and re-encoding → EXIF stripping → thumbnail generation → derived record update → RLS policy limiting writes to the owning farm → virus scanning where supported → never trust the client-reported MIME type.

---

## 21. Storage Architecture

```text
BROWSER STORAGE (origin-scoped, ~5 MB quota, JSON values)
├── aquafarm.settings.v1     ← read on load, written on save/reset/notification change
├── aquafarm.alerts.v1       ← read on load, written on raise/read/dismiss/mark-all
├── aquafarm.activity.v1     ← read on load, written on session start/stop/schedule
├── aquafarm.schedules.v1    ← read on load, written on create/cancel/run
├── aquafarm.pump.v1         ← read on load, written on mode/target change
├── aquafarm.counters.v1     ← read on load, written every tick while pumping and on completion
└── aquafarm.prefs.v1        ← read on load, written on simulation speed change
```

| Concern | Handling |
| --- | --- |
| Availability probe | `Store.available` performs a write/remove probe of `__aquafarm_probe__` at startup |
| Failure mode | Blocked storage → warning toast, defaults used, application still fully functional |
| Quota exceeded | Write attempted inside `try/catch` with an explanatory error toast (practically unreachable at these payload sizes) |
| Corruption | Parse failures return the caller's fallback |
| Versioning | `.v1` suffix per key for future migration |
| Privacy | No personal data, no identifiers, no cross-site access; documented in the Privacy Policy and the Cookie Preferences dialog |
| Clearing | "Clear saved data" (two-step) removes all seven keys; the cookie dialog toggles storage availability |
| Dual-tab behaviour | Each tab reads on load; writes are last-writer-wins. Live cross-tab sync is a documented limitation (a `storage` event listener is the small future improvement) |

---

## 22. SEO Architecture

```text
index.html <head>
├── <title>            AquaFarm | Smart Irrigation Management Dashboard
├── description        product + monitored parameters + purpose (~155 chars)
├── keywords           domain terms only
├── robots             index, follow
├── canonical          absolute production URL (domain TBD)
├── theme-color        #0F4C3A        color-scheme: light
├── viewport           width=device-width, initial-scale=1, viewport-fit=cover
├── Open Graph         type, site_name, title, description, url, image (1200×630 + dimensions + alt), locale
├── Twitter card       summary_large_image (+ title, description, image)
├── icons              favicon.png, apple-touch-icon, manifest icons
├── manifest           manifest.webmanifest (name, short_name, start_url, standalone, theme, maskable icons)
└── JSON-LD            WebApplication { name, applicationCategory, operatingSystem, description,
                                        offers(0 INR), featureList[] }
```

On-page structure: one `h1`, sequential `h2`/`h3` headings, semantic landmarks, descriptive `alt` text, a real table with a `caption`, no hidden text, and content that matches the metadata (no claims beyond the demonstration scope).

Crawlability assets: `robots.txt` (allow all, disallow `*.json`, declare the sitemap) and `sitemap.xml` (single URL with `lastmod`, `changefreq`, `priority`).

Verification: after deployment, validate Open Graph and the Twitter card with the platform debuggers, fetch `/robots.txt` (200, `text/plain`), fetch `/sitemap.xml` (well-formed XML, absolute URLs), and check the JSON-LD in the Rich Results test.

---

## 23. Security Architecture

```text
THREAT MODEL — static client application, no server, no accounts, no secrets
├── Injection (DOM-based XSS through manipulated localStorage)  → escapeHtml + textContent
├── Dependency tampering (vendored libraries)                   → pinned versions + vendored files + review on update
├── Data exfiltration                                           → zero network requests, no trackers, no cookies
├── Privilege misuse                                            → no privileges exist; no browser permissions requested
├── Resource exhaustion                                         → bounded collections, capped toast stack, alert cooldowns
├── Social engineering ("fake security")                        → no login or lock claims anywhere in the UI
└── Transport (hosting only)                                    → HTTPS + HSTS + CSP + frame-ancestors

DEFENCE IN DEPTH
1  No server              → no server-side attack surface
2  No secrets             → nothing to leak
3  Output encoding        → escapeHtml()/textContent for every dynamic string
4  Input validation       → range checks + clamping + finite guards on every numeric path
5  Least privilege        → no browser permissions, no network egress, no third-party scripts
6  Dependency control     → exact versions, vendored, no runtime CDN
7  Honest UI              → states only what the application does
8  Content Security Policy → recommended response header for hosting (see §42)
```

---

## 24. Validation

| Layer | Mechanism | Examples |
| --- | --- | --- |
| HTML constraints | `required`, `min`, `max`, `step`, `type` | Schedule date/time/duration; threshold input 15–60 |
| JavaScript form validation | `validateSettings()`, `validateSchedule()` | Range checks, past-date check, duplicate check, mode presence |
| Category validation | Enum guards | `setMode` rejects unknown modes; `addAlert` coerces unknown severities to `info` |
| Range validation | `clamp(value, min, max)` | Field moisture 12–82, temperature 16–41, humidity 32–92, tank 0–100, progress 0–100 |
| Finite-value validation | `formatNumber` returns `--` for `NaN`/`Infinity` | Any KPI or summary that receives a bad number |
| Referential validation | `fieldById()` + render guards | Missing field on an activity row or schedule |
| Duplicate validation | Minute-window comparison | Two schedules for the same field at the same time |
| State validation | Startup guards | Missing/renamed DOM nodes never throw (`setText`, `if (!node) return;`) |
| Storage validation | Type checks on read | `Array.isArray` for lists, `typeof === "object"` for objects, `typeof === "number"` for counters |
| Input sanitisation | `escapeHtml` on every rendered user-visible string | Alert titles/text, field names, search feedback |

Rule: validation is never merely visual. A value that fails validation is not written to state or storage, and the UI explains the failure in plain language.

---

## 25. Error Handling

| Category | Detection | Handling | User sees |
| --- | --- | --- | --- |
| Storage unavailable | Startup probe fails | `Store.available = false`; reads return fallbacks; writes skipped | Warning toast + explanatory note |
| Storage quota/corruption | `try/catch` on write / parse | Swallow, keep app state authoritative | Error toast on write failure; silent fallback on read |
| Validation failure | `validate*()` | Abort before mutation; focus the first invalid control | Inline message + error toast |
| Domain block (empty tank, outage) | Precondition checks in `startPump` | Abort before mutation; optionally raise an alert | Error toast with the reason |
| Library missing (`Chart`) | `typeof Chart === "undefined"` | Show an explanatory message in the chart card | "Charts could not be loaded…" |
| Chart canvas missing / zero size | Guarded chart creation after modal `shown` | Skip creation | Nothing broken; data still in text |
| Unknown mode / severity | Enum guards | Fall back to the last valid value or `info` | Nothing (silent correction) |
| Missing DOM node | `if (!node) return;` | Skip the render step | Nothing |
| Non-finite numeric result | `formatNumber` guard | Print `--` | `--` instead of `NaN` |
| Export blocked | `try/catch` around Blob/download | Inform the user | Error toast with a next step |
| Scheduled task cannot run | Preconditions in `processDueSchedules` | Mark the task completed so it cannot loop; warn | Warning toast |
| Timer drift after tab sleep | `nextUpdateAt` recomputed from `Date.now()` on each tick | Self-correcting | Accurate countdown |
| Unexpected exception | Global safety: no uncaught errors observed in testing; risky operations are wrapped | Degrade the affected surface only | Generic, actionable message |

**Message security rules:** never expose stack traces, library names, file paths, SQL or storage internals to the user; log nothing containing user data; keep the phrasing specific to the product ("The simulated sensor gateway is offline"), and always pair an error with what to do next.

---

## 26. Logging

| Type | Where | Retention | Content |
| --- | --- | --- | --- |
| Interaction events | `analytics.events` (memory) | Session only, max 300 | `{ event, at, payload }`; payloads hold ids, counts, modes, ranges — never personal data |
| Alerts | `state.alerts` + `aquafarm.alerts.v1` | Until dismissed/cleared, max 40 | Severity, title, description, field, time, read state |
| Activity records | `state.activity` + `aquafarm.activity.v1` | Until cleared, max 80 | Field, duration, water, mode, status, time |
| Schedule records | `state.schedules` + `aquafarm.schedules.v1` | Until completed/cancelled | Field, time, duration, mode, status |
| Console | Browser console | — | **Zero errors/warnings** by acceptance criterion; `console.error` is never used for user-facing flows |

Event catalogue (all names stable and usable by a future analytics provider):

```text
app.load            sensor.tick         pump.start          pump.stop
mode.change         recommendation.ignore
schedule.create     schedule.cancel     schedule.run
alert.mark_read     alert.dismiss       alert.mark_all_read
settings.save       settings.reset      settings.notifications
simulation.outage   weather.refresh     chart.range_change
field.details_open  data.export         data.reset
```

Query interface: `window.AquaFarmAnalytics.summary()` returns `{ eventName: count }` for verification during demos.

---

## 27. Monitoring

| Signal | How it is observed today | What "healthy" looks like |
| --- | --- | --- |
| Uncaught errors | Automated run with `pageerror` + console listeners | 0 errors |
| Failed requests | Automated `requestfailed` listener | 0 |
| External requests | Request interception | 0 |
| Sensor loop liveness | "Updates this session" counter and the "next update" countdown | Counter increments at the configured cadence |
| Data freshness | "Last updated: x" label, refreshed every second | Never older than one interval (± 1 s) |
| Timer health | Recovery on `visibilitychange` (tab hidden → simulation paused, visible → resumed) | No drift after sleep |
| Storage health | Stored Data panel + startup probe | Counts match the visible records |
| Rule-engine health | Rule status line and the Alert Rules panel | Text matches the current threshold |
| Accessibility health | `axe-core` audit in the test suite | 0 violations |
| Responsive health | Automated screenshots + overflow measurement at 5 widths | No horizontal overflow, no covered controls |

Future (with a backend): error reporting service with source maps, uptime checks on the dashboard URL, real-time alerting on pump-control failures, and dashboards for session/water metrics.

---

## 28. Environment Variables

**None exist, and none are permitted in the client deliverable.** There is no build step, so no `.env` file is read at runtime; any secret placed in the front end would be public by definition.

| Variable | Status | Note |
| --- | --- | --- |
| All API keys / tokens | Not present | The product integrates with nothing |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Not present | No Supabase project exists for this delivery |
| Analytics property id | Not present | In-memory analytics only |
| Domain/canonical base URL | Hard-coded placeholder | Replace `https://aquafarm.example.com/` in `index.html`, `sitemap.xml` and `robots.txt` when the domain is confirmed |

Future (if a backend is approved): `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in client scope; `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` and any mail keys strictly server-side; `.env.local` git-ignored; production values set in the host's environment settings; rotation documented; **the service-role key must never reach the browser bundle** — enforced by keeping it out of any `NEXT_PUBLIC_*` name and out of client components.

---

## 29. Project Folder Structure

```text
irrigation-dashboard/
├── index.html                       # single document: all eight sections, metadata, dialogs
├── style.css                        # design tokens + component styles (25 documented sections)
├── script.js                        # application (24 sections + init, ~2,880 lines)
├── favicon.png                      # brand mark (256×256 source, used at 16/32)
├── manifest.webmanifest             # PWA metadata and maskable icons
├── robots.txt                       # crawl policy + sitemap declaration
├── sitemap.xml                      # single-URL sitemap
├── README.md                        # how to run, feature map, test evidence, image credits
└── assets/
    ├── css/
    │   └── icons.css                # icon layer: imports the vendored Font Awesome stylesheet
    ├── images/
    │   ├── hero-field.jpg           # 1920×1080 hero photograph
    │   ├── field-rice.jpg           # 1200×675 Field A
    │   ├── field-tomato.jpg         # 1200×675 Field B
    │   ├── field-cotton.jpg         # 1200×675 Field C
    │   ├── thumb-rice.jpg           # 400×300 crop thumbnail
    │   ├── thumb-tomato.jpg         # 400×300 crop thumbnail
    │   ├── thumb-cotton.jpg         # 400×300 crop thumbnail
    │   ├── weather-sky.jpg          # 1200×675 weather panel
    │   ├── pump-control.jpg         # 1200×675 irrigation control
    │   ├── og-image.jpg             # 1200×630 social preview
    │   ├── apple-touch-icon.png     # 180×180
    │   ├── icon-192.png             # PWA
    │   └── icon-512.png             # PWA (also maskable)
    └── vendor/                      # all third-party code, pinned and local
        ├── bootstrap/
        │   ├── bootstrap.min.css    # 5.3.3
        │   └── bootstrap.bundle.min.js
        ├── chartjs/
        │   └── chart.umd.min.js     # 4.4.7
        ├── fontawesome/
        │   └── all.min.css          # 6.7.2 (resolves ../webfonts/)
        ├── webfonts/                # fa-solid-900, fa-regular-400, fa-brands-400, fa-v4compatibility
        └── fonts/                   # inter-latin-400/500/600/700-normal.woff2
```

Repository root (workspace) additionally contains the documentation set:

```text
/ (workspace root)
├── PRD.md                # product requirements
├── design.md             # UI/UX and design specification
├── architecture.md       # this document
└── phases.md             # step-by-step development roadmap
```

Development artefacts (not part of the deliverable): the `test/` scripts and `image-search/`/`tmp_img/` staging folders used to source and verify imagery. These are excluded from the shipped project folder.

---

## 30. Component Structure

Components are CSS classes plus render functions; there is no component runtime. The mapping below is the contract between markup, styles and behaviour.

| Component (CSS) | Render function / markup source | Key ARIA |
| --- | --- | --- |
| `.app-header`, `.main-nav`, `.hamburger`, `.nav-backdrop` | Static markup + `initNavigation()` | `aria-expanded`, `aria-controls`, `aria-label` |
| `.brand`, `.brand__mark` | Static inline SVG | `aria-hidden` on the mark |
| `.profile` + `.profile-menu` | Static + Bootstrap dropdown | `aria-haspopup`, `aria-expanded` |
| `.icon-btn` (bell) + `.panel-dropdown` | Static + `renderBell()` | `aria-label="Notifications"` |
| `.hero` + `.hero__body` | Static + `setText` for greeting/last updated | `h1`, `aria-labelledby` |
| `.kpi-card` + `.progress-track` | `renderKpis()` | `role="progressbar"` + `aria-valuenow` |
| `.stat-card` | `renderStats()` | — |
| `.control-card` + `.pump-switch` + `.segmented` | `renderPump()`, `setMode()` | `role="switch"`, `aria-checked`, `aria-pressed` |
| `.recommendation` | `renderRecommendation()` | `aria-labelledby` |
| `.tank-card`, `.tank__water` | `renderTank()` | `role="img"` + `.sr-only` description |
| `.schedule-list`, `.schedule-item` | `renderSchedules()` | `role="list"`, hidden when empty |
| `.data-table` (+ `--cards` on mobile) | `renderActivity()` | `scope="col"`, `caption`, `data-label` cells |
| `.field-card` | `renderFields()` + `openFieldModal()` | `aria-labelledby`, delegated buttons |
| `.crop-card` | `renderCrops()` | `aria-labelledby` |
| `.chart-card`, `.chart-loader`, `.chart-summary` | `initCharts()`, `renderSoilSummary()`, `renderWaterSummary()` | `role="status"` loader, `role="img"` canvas |
| `.health-card`, `.health-ring`, `.score-list` | `renderHealth()` | `role="img"` + progressbar bars |
| `.weather-card`, `.forecast` | `renderWeather()`, `refreshWeather()` | `dl` semantics |
| `.alert-list`, `.alert-item`, `.severity-chip` | `renderAlerts()` | `aria-live="polite"` on the list |
| `.sensor-list`, `.error-state` | `renderSensors()`, `setOutage()` | `role="alert"` on the error state |
| Forms: `.field`, `.form-label`, `.form-control`, `.form-select`, `.form-range`, `.form-check` | Static markup + `validate*()` | `required`, `aria-describedby`, `role="alert"` errors |
| `.toggle-row` | Static markup | One label per input |
| `.empty-state` | Inline markup + render toggles | Hidden when populated |
| `.toast-item`, `.toast-region` | `toast()` | `aria-live="polite"`, capped at 3 |
| `.modal` (field, privacy, terms, cookies) | Static + `openFieldModal()` | labelled titles, `Esc`, focus return |
| `.mobile-actionbar` | Static + `renderPump()` | `aria-label` region |

Component rules: every component renders from state; no component holds its own copy of data; a component that cannot render (missing node) is skipped rather than throwing.

---

## 31. Route Structure

There is no router. Navigation is anchor-based, with scroll-spy for the active state.

| Route (fragment) | Section | `scroll-margin-top` | Notes |
| --- | --- | --- | --- |
| `/` (no fragment) | Top of document | — | Default entry |
| `#overview` | Dashboard | header + 8 px | Nav item 1 |
| `#irrigation-control` | Irrigation | header + 8 px | Nav item 3 |
| `#activity` | Irrigation Schedule & Activity | header + 8 px | Not in the primary nav; linked from the field dialog and profile menu |
| `#fields` | Fields | header + 8 px | Nav item 2 |
| `#analytics` | Analytics | header + 8 px | Nav item 4 |
| `#alerts` | Alerts | header + 8 px | Nav item 5 |
| `#settings` | Settings | header + 8 px | Nav item 6 |
| `#help` | Help & Support | header + 8 px | Footer link only |
| Unknown fragment | No-op | — | The dashboard stays usable; documented in `PRD.md` §34 |

Behavioural requirements: clicking a nav link closes the mobile panel, updates the URL fragment, and smooth-scrolls (instantly under reduced motion); the back button restores the previous fragment; deep links (`index.html#analytics`) land on the right section because sections are real elements with ids.

---

## 32. Admin Route Structure

**None.** There are no `/admin`, `/dashboard/settings` or role-gated routes, because there is no server, no session and no account model (see §8, §9). Administration happens inline in `#settings`.

Future route structure (pre-documented if a backend is approved):

```text
/(public)                → the dashboard (read + control)
/admin/login             → sign-in (public, rate limited, no indexing)
/admin                   → overview (Farm Manager only)
/admin/fields            → CRUD over fields and crops
/admin/schedules         → schedule management across fields
/admin/alerts            → alert history and acknowledgement
/admin/users             → user and role management (Farm Manager only)
/admin/audit             → append-only audit log
```

All admin routes require a server-validated session and are protected by middleware, never by client-side checks alone; none are listed in the sitemap; all are `noindex` and `Disallow`ed in `robots.txt`.

---

## 33. Middleware

**None in this delivery** — a static site with no server has no middleware pipeline. The equivalent cross-cutting behaviour is implemented in three places:

| Cross-cutting concern | Where it is enforced today |
| --- | --- |
| Output escaping (anti-XSS) | `escapeHtml()` at every dynamic string insertion; `textContent` elsewhere |
| Numeric safety | `clamp()` / finite checks at every computation |
| State guarding | `Store` (storage), `fieldById`/`pumpField` (references), `if (!node) return;` (DOM) |
| Access control | Not applicable (no protected resources) |
| Security headers | Must be applied by the hosting layer (see §42) |
| Cache policy | Hosting layer (`Cache-Control`) for static assets |

Future (Next.js) middleware responsibilities, pre-documented: session refresh on every request, redirect unauthenticated users from `/admin/*`, set security headers (`CSP`, `HSTS`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`), enforce locale and canonical redirects, and rate-limit control endpoints.

---

## 34. Supabase Configuration

**Supabase is not used in this delivery.** No project, no connection string, no SDK, no keys. This is required by the project owner's technology constraints for this build.

To make the "Supabase must be verified, not assumed" rule meaningful, the *storage* equivalent was verified instead, and the Supabase plan is documented for a future phase:

### 34.1 Verification performed for the substitute persistence layer

| Verification step | Method | Result |
| --- | --- | --- |
| Writes actually land | Save settings, then read `aquafarm.settings.v1` in the browser | Present, expected shape |
| Reads after reload | Reload the page and compare rendered values | Settings, alerts, activity, schedules, counters restored |
| Relationships hold | Create a schedule for Field B, reload, verify it still points at Field B | Correct |
| Deletes work | Cancel a schedule, dismiss an alert, clear saved data | Records removed; empty states shown |
| Unauthorised/blocked storage | Private-mode simulation (probe failure path) | Application still works; warning toast shown |
| Data integrity on write | Invalid threshold/tank values | Rejected before write; nothing persisted |

**Rule:** code that exists but was never executed does not count as verified. Persistence claims in this document are backed by the automated checks listed in `phases.md` (Phase 8) and reproduced in the project README.

### 34.2 Future Supabase configuration (pre-documented)

| Concern | Specification |
| --- | --- |
| Project | One project per environment (development, production) |
| Schema | Tables: `farms`, `fields`, `crops`, `sensor_readings`, `irrigation_sessions`, `schedules`, `alerts`, `settings`, `audit_log` |
| Auth | Supabase Auth, email verification, optional OTP, TOTP for privileged roles |
| Storage | Bucket `field-images` with a per-farm path and RLS policies scoped by farm membership |
| RLS | Enabled on every table; policies by `farm_id` membership and role (`owner`, `operator`, `viewer`) |
| Keys | `anon` key client-side only; `service_role` strictly server-side, never in the browser |
| Migrations | SQL migrations committed to the repository; applied via CLI; verified by querying `information_schema` |
| Realtime | Optional subscription on `alerts` and `irrigation_sessions` for multi-device sync |
| Verification protocol | Create → apply migration → confirm tables exist → confirm columns and types → confirm FKs and indexes → confirm RLS is enabled → confirm each policy with positive and negative tests (as each role) → confirm the client connection → run INSERT/SELECT/UPDATE/DELETE tests with a rollback → verify the UI reflects each change |

**Prohibited substitutions:** local JSON files, mock data, in-memory arrays or hard-coded records must never stand in for Supabase once a real backend is in scope for a future phase.

---

## 35. Row Level Security

**Not applicable today** (no Postgres, no accounts). The client-side analogues of the RLS guarantees are:

| RLS guarantee | Client-side equivalent | Verified by |
| --- | --- | --- |
| Data is scoped to its owner | Storage is origin- and profile-scoped; nothing is transmitted | Privacy Policy + no network calls |
| Only validated data is written | `validateSettings` / `validateSchedule` gate every write | Automated invalid-input tests |
| Stored data cannot be used to attack the UI | `escapeHtml` + `textContent` on every render | `axe` + code review |
| Users can delete their data | "Clear saved data" (two-step) removes all keys | Automated reset test |
| Least privilege | No browser permissions requested; no cross-origin reads | Permission-free implementation |

Future Postgres RLS (pre-documented, to be written as real SQL when a backend is approved):

```sql
-- illustrative policy shape (not present in this delivery)
alter table irrigation_sessions enable row level security;

create policy "members read own farm sessions"
  on irrigation_sessions for select
  using (farm_id in (select farm_id from farm_members where user_id = auth.uid()));

create policy "operators insert sessions"
  on irrigation_sessions for insert
  with check (
    farm_id in (select farm_id from farm_members
                where user_id = auth.uid() and role in ('owner','operator'))
  );
```

Rules for that phase: RLS enabled on every table; `select`, `insert`, `update`, `delete` policies written separately; negative tests (as the wrong role) mandatory; service-role usage restricted to server-only code paths.

---

## 36. API Security

Delivered API surface: none (§10–11).

Security requirements that still apply to this build:

| Requirement | Implementation |
| --- | --- |
| No secrets in the bundle | Verified by search; none exist |
| No network egress | Verified by request interception (0 external requests) |
| No third-party scripts | All libraries vendored and pinned |
| No data at rest beyond the browser | Nothing leaves the device |
| Input validation before any write | See §24 |
| Output encoding | See §23 |
| Rate limiting of notifications | Alert cooldown (5 min per key) + toast stack cap (3) |
| Destructive-action protection | Two-step confirmation for reset |
| Error privacy | See §25 |

Future API security requirements (pre-documented): authentication on every endpoint, server-side authorization on every mutation, Zod schema validation, idempotency keys for control endpoints, request size limits, per-user and per-IP rate limits, structured error responses without internals, audit logging of control actions, and CORS restricted to the application origin.

---

## 37. Rate Limiting

| Vector | Limit | Mechanism |
| --- | --- | --- |
| Duplicate alerts (same key) | Suppressed while an unread alert with that key exists | `addAlert` de-duplication |
| Repeated alert of the same key | One raise per 5 minutes | `alertCooldowns` map (300,000 ms) |
| Visible toasts | Maximum 3 (oldest removed as new ones arrive) | `toast()` stack management |
| Toast pointer capture | Toasts stop intercepting clicks after 1 second | `.is-passive` class |
| Pump start attempts | Naturally bounded: each start must be preceded by a stop; no unbounded loop exists | State machine |
| Scheduled tasks | Each task is marked completed when it runs, so it cannot fire repeatedly | `processDueSchedules` |
| Sensor timer | Exactly one interval exists; starting a new simulation clears the previous timer | `startSimulation` clears before setting |
| Storage writes | Bounded: full-state writes on discrete actions + counters per tick while pumping | `persist*()` design |

Future server-side limits: sign-in attempts per account/IP, password reset requests, control endpoint calls per user, and export generation per hour — with 429 responses and `Retry-After` headers.

---

## 38. XSS Protection

| Vector | Mitigation |
| --- | --- |
| Stored strings rendered into the DOM | `escapeHtml()` escapes `& < > " '`; used for every field name, alert title/text, schedule text and search feedback |
| Plain text insertion | `setText()` uses `textContent`, which cannot execute markup |
| HTML built by string concatenation | Only with values already escaped; no user-controlled string reaches `innerHTML` unescaped |
| `innerHTML` usage inventory | Render functions that rebuild lists (activity rows, alert rows, schedule rows, field cards, crop cards, bell items, health bars, chart summaries, modal bodies, empty-state copy). Every interpolated dynamic value is escaped; static templates contain no user data |
| URL injection | No user-supplied URLs are rendered; all `href`s are fixed (`#fragment`, `mailto:`, `tel:`) |
| Attribute injection | Attribute values that interpolate data are escaped (for example `aria-label` and `title` strings) |
| Event-handler injection | No inline `on*` attributes exist in the markup; all behaviour is bound in `wireEvents()` |
| `eval` / `Function` / `setTimeout("string")` | Not used anywhere (verified by search) |
| Third-party script risk | No third-party scripts are loaded at runtime; vendored libraries are pinned |
| SVG injection | The only SVG is static inline brand artwork; no dynamic SVG content |
| JSON in the DOM | Only a static JSON-LD block with no user data |

Verification: `axe-core` (0 violations), a code search for `eval(`/`new Function`/inline handlers (0 results), and a manual review of every `innerHTML` site before release.

---

## 39. CSRF Protection

**Not applicable** — there are no server-rendered forms, no state-changing HTTP endpoints, no cookies and no cross-site session context. A CSRF attack requires a server that trusts an ambient credential; neither exists here.

Related client-side hygiene that is enforced:

* No cross-site requests are possible because the app never fetches anything.
* Navigation targets are fragments or `mailto:`/`tel:` only.
* The export download is generated locally and cannot be triggered by a third party.

Future (if a backend is added): `SameSite=Lax` cookies, double-submit CSRF tokens for state-changing requests (or a proof-of-possession/auth header pattern), `Origin`/`Referer` validation on mutations, and rejecting non-`POST/PATCH/DELETE` semantics for state changes.

---

## 40. SQL Injection Protection

**Not applicable** — there is no SQL, no database driver and no query construction in the client. The comparable risk (string-built queries) cannot occur.

Future (with Postgres/Supabase): parameterised queries only, no string concatenation into SQL, the Supabase client's query builder in place of manual SQL, RLS as the second layer, and server-side input validation so that an injection attempt never reaches the database. Dashboard/BI queries run read-only with least privilege.

---

## 41. CORS

**Not applicable** — the application makes no cross-origin requests, so no CORS policy is exercised. The packaged build has no `fetch`, `XMLHttpRequest` or `EventSource` usage at all (verified by search).

Future: allow only the application origin for API routes; avoid wildcard origins when credentials are used; allow only required methods and headers; use `Vary: Origin`; and never rely on CORS as an authorization mechanism.

---

## 42. Content Security Policy

The recommended production CSP for this build (delivered as a **response header** by the host; note that a `<meta http-equiv>` CSP cannot express `frame-ancestors`):

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'none';
  form-action 'none';
  base-uri 'none';
  frame-ancestors 'none';
  object-src 'none';
  upgrade-insecure-requests
```

| Directive | Reason |
| --- | --- |
| `default-src 'self'` | Everything is local; nothing else is needed |
| `script-src 'self'` | No inline scripts (see note) and no third-party scripts |
| `style-src 'self' 'unsafe-inline'` | Required by Bootstrap's utility patterns, inline `style="width:"`/`style="height:"` used by progress bars, the tank fill and health bars, and the inline SVG data-URI select chevron |
| `img-src 'self' data:` | Local images plus the `data:` URI used for the select chevron |
| `font-src 'self'` | Inter and Font Awesome are vendored |
| `connect-src 'none'` | No network calls exist; blocks accidental future egress |
| `form-action 'none'` | No form posts to a server |
| `base-uri 'none'` | Prevents `<base>` hijacking |
| `frame-ancestors 'none'` | Anti-clickjacking for hosted deployment (**not** applied in the in-app preview, which frames the page) |

Additional recommended headers: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()`.

**CSP hardening note:** the only inline script in the document is a static `application/ld+json` block (structured data, not executable JavaScript). If a stricter `script-src` is required in future, move the JSON-LD into a separate file or hash it; no executable inline script exists today.

Verification: after deployment, confirm the headers with a header-inspection tool, then reload the dashboard and check the console for CSP violations (expected: none).

---

## 43. Secure Authentication

**Not applicable in this delivery** (§8). The requirements below are recorded as the standard the future implementation must meet, not as claims about this build.

| Requirement | Standard |
| --- | --- |
| Password storage | Managed by the auth provider (bcrypt/argon2 class); never implemented by hand |
| Transport | HTTPS only; HSTS enabled; no credential over plaintext |
| Credential handling | Never logged, never echoed, never stored in `localStorage` |
| Brute force | Per-account and per-IP rate limiting, progressive delay, temporary lockout, CAPTCHA only as a last resort |
| Enumeration resistance | Identical responses and timings for unknown-account and wrong-password cases |
| Verification | Email verification before first privileged action |
| Reset | Single-use, time-limited tokens; invalidate all outstanding tokens on success; notify the owner |
| MFA | TOTP for privileged roles, with backup codes; enforced at sign-in, verified server-side |
| Session | `HttpOnly; Secure; SameSite` cookies, rotation on privilege change, idle and absolute timeouts |
| Logout | Server-side token revocation, not just a client-side state reset |
| Auditing | Sign-in, failure, reset, MFA change and role change events appended to an audit log |

---

## 44. Session Management

**No sessions exist.** The application keeps no session state beyond the in-page `state` object and the local records documented in §12; refreshing the page re-reads configuration but never re-creates a "live" pump session (a deliberate safety choice: the UI never claims irrigation is running when no session object exists).

| Concern | This build | Future |
| --- | --- | --- |
| Session identity | None | Server-issued session tied to a verified account |
| Session lifetime | Not applicable | Idle timeout (e.g. 12 h) + absolute timeout (e.g. 7 days), refreshed by activity |
| Storage of session data | None (no cookies, no tokens) | `HttpOnly` cookie only |
| Fixation/hijacking protection | Not applicable | Rotate the session id on sign-in and privilege change; bind to a same-site context; invalidate on password change |
| Concurrent tabs | Storage read on load; last writer wins | Realtime subscription or polling with conflict resolution |
| Sign-out | Not applicable and not faked | Server-side revocation, cookie cleared, local caches purged |
| Idle behaviour | Simulation pauses when the tab is hidden (battery/CPU courtesy) | Same, plus session expiry notice before forced sign-out |

---

## 45. Password Reset

**Not applicable** — no passwords exist (§8). Future requirements (recorded so the standard is not lost):

1. Request via email address; always respond with the same neutral confirmation to prevent account enumeration.
2. Generate a cryptographically random, single-use token; store only its hash; expire in ≤ 30 minutes.
3. Invalidate all previously issued reset tokens for that account when a new one is created.
4. On success: invalidate the token, invalidate all active sessions, require re-authentication, and send a "password changed" notification.
5. Rate-limit reset requests per account and per IP; log every attempt.
6. Never reveal whether an email exists; never include the token in a URL that leaks via `Referer` (send via POST or a fragment, and use `Referrer-Policy`).

---

## 46. MFA (Where Required)

**Not applicable in this delivery.** The requirement is recorded for the future phase, scoped to privileged roles only:

| Aspect | Specification |
| --- | --- |
| Method | TOTP (RFC 6238) via an authenticator app; SMS only as a fallback with explicit risk acceptance |
| Scope | Farm Manager / administrator accounts; optional for operators; not required for read-only advisors |
| Enrolment | Mandatory prompt on first privileged sign-in; cannot be skipped by hiding UI |
| Backup | 10 single-use recovery codes, hashed at rest, displayed once |
| Enforcement | Verified server-side on session elevation; a session that has not satisfied MFA cannot perform privileged actions |
| Recovery | Administrator-assisted reset with identity verification and an audit entry |
| Rate limiting | TOTP attempts limited; lockout after repeated failures |
| Honesty | No "2-step verification" claim may appear in the UI until it is actually enforced |

---

## 47. Deployment Architecture

```text
                 ┌────────────────────────────────────────────┐
   Author ──git─►│  GitHub repository (irrigation-dashboard/) │
                 └───────────────┬────────────────────────────┘
                                 │ push / pull request → CI checks
                                 ▼
                 ┌────────────────────────────────────────────┐
                 │  Static host (any of):                     │
                 │   • Netlify / Vercel / Cloudflare Pages    │
                 │   • GitHub Pages                           │
                 │   • any web server (nginx/Apache)          │
                 │   • or simply: open index.html locally     │
                 └───────────────┬────────────────────────────┘
                                 │ HTTPS
                                 ▼
                 ┌────────────────────────────────────────────┐
                 │  Browser                                    │
                 │   index.html + style.css + script.js        │
                 │   + assets/vendor/* (pinned)                │
                 │   + assets/images/* (pre-optimised)         │
                 │   → 0 network calls at runtime              │
                 └────────────────────────────────────────────┘
```

Deployment requirements:

| Requirement | Detail |
| --- | --- |
| Static hosting only | The build output is the folder itself; no build step exists |
| HTTPS | Mandatory when hosted (enables HSTS and prevents mixed-content blocking) |
| Caching | Long-lived cache for `assets/**` (versioned by filename or query), short cache for `index.html` |
| Compression | Gzip/Brotli for HTML, CSS, JS and JSON; images are already compressed |
| Security headers | As specified in §42 |
| 404 handling | Hosted custom 404 page per `PRD.md` §34 |
| Domain and TLS | Custom domain with automated certificate provisioning and renewal |
| Root files | `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `favicon.png` must be reachable at the site root |
| Canonical URLs | Update the placeholder domain in `index.html`, `sitemap.xml` and `robots.txt` before launch |
| Rollback | Keep the previous deployment available; static hosts support instant rollback |

---

## 48. Vercel Deployment

Vercel hosts static output natively, so this project deploys as-is (no framework preset, no build command, output = the `irrigation-dashboard` folder).

| Setting | Value |
| --- | --- |
| Framework preset | Other / None (static) |
| Root directory | `irrigation-dashboard` |
| Build command | *(empty)* |
| Output directory | `.` (the folder itself) |
| Install command | *(empty)* — there are no dependencies |
| Node version | Not required at runtime |
| Environment variables | None |
| Production branch | `main` |
| Preview deployments | Every pull request (useful for reviewing design changes before merge) |
| Custom domain | `aquafarm.<domain>` once confirmed (**To Be Decided**) |
| Headers | Add via `vercel.json` (CSP, HSTS, nosniff, referrer policy, permissions policy, cache-control) |
| Redirects | `http → https` (automatic), optional `www → apex` (or the reverse) |
| Analytics | Platform analytics only if the owner approves and the privacy statement is updated in the same change |

Reference `vercel.json` for the header layer:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; upgrade-insecure-requests" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), camera=(), microphone=(), payment=()" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

Post-deployment verification: load the production URL and confirm zero console errors and zero failed requests; check the response headers; verify `/robots.txt` and `/sitemap.xml`; run the Open Graph validator; test on a real phone; verify the dashboard fully offline after first load (it needs no network at all).

---

## 49. Git / GitHub Workflow

| Aspect | Rule |
| --- | --- |
| Repository layout | Documentation at the repository root; the application in `irrigation-dashboard/` |
| Branches | `main` (deployable) ← feature branches (`feat/…`, `fix/…`, `chore/…`, `docs/…`) |
| Commit style | Conventional Commits (`feat: add threshold slider`, `fix: prevent toast from blocking controls`, `docs: update PRD acceptance criteria`) |
| Commit hygiene | One logical change per commit; no generated artefacts, no temporary staging folders, no `node_modules` |
| `.gitignore` | `node_modules/`, `test/downloads/`, temporary image-staging folders, OS/editor files |
| Pull requests | Require a description of the change, the test evidence (which checks were run and their output), and screenshots for visual changes |
| Review checklist | Behaviour matches the PRD; no console errors; accessibility unchanged or improved; responsive checked; documentation updated |
| Protected branch | `main` requires a passing review; direct pushes discouraged once collaborators join |
| Tags/releases | Tag releases (`v1.0.0`) with a changelog entry describing user-visible changes |
| Secrets | No secrets exist to commit; if a backend is added, keys live in the host's environment settings, and `.env*` is ignored |
| Documentation synchronisation | Any change to behaviour, storage keys, component names or defaults updates `PRD.md`, `design.md`, `architecture.md`, `phases.md` and the README **in the same pull request** |

---

## 50. Backup / Recovery Considerations

| Concern | Approach |
| --- | --- |
| Source code | Git history on GitHub is the backup; each release is a tagged commit |
| Browser-stored data | The user can export a full JSON snapshot at any time (profile menu or Settings). This is the user-facing backup mechanism |
| Restoring user data | There is no import in this release (documented limitation). Recovery means re-entering settings; the demonstration data rebuilds automatically |
| Automatic clearing | Browsers may evict storage (for example "clear site data"); the app tolerates it — it starts from defaults and reseeds the demonstration dataset |
| Reset behaviour | "Clear saved data" is deliberate and confirmed twice; after reset the demonstration dataset is restored so the dashboard is never empty |
| Asset recovery | Images, fonts and libraries are committed to the repository, so a hosting outage does not lose the build |
| Configuration recovery | Settings defaults are documented in `PRD.md` §17.2 and `design.md` §45, so a lost configuration can be recreated exactly |
| Future server backups | Daily automated database backups with point-in-time recovery, verified by a restore drill quarterly; object storage versioning for images; documented RPO/RTO (**To Be Decided** with the hosting plan) |

---

## 51. Scalability

Scalability is bounded by the product's nature (one farm, one browser). The architecture still avoids the growth traps:

| Dimension | Current | Headroom / future |
| --- | --- | --- |
| Fields | 3 | Adding fields is data-only; the UI uses responsive grids, and the rule engine iterates the array |
| Sensor cadence | 2/5/10 s | Interval is a single state value; faster cadences can be added without touching render logic |
| Records | 80 activity / 40 alerts | Bounded by design to protect storage and rendering; pagination or archived summaries would be the next step |
| Charts | 6 / 7 / 30 points | Series builders accept any range; moving to server aggregation is a data-source swap |
| Storage size | A few KB | ~5 MB quota; current usage is negligible |
| Users | 1 per browser | No shared state exists to content for; multi-user requires the backend phase |
| Rendering cost | Bounded, per-surface | Each render touches only its own subtree; adding surfaces does not add global re-render cost |
| Backend (future) | Not present | Horizontal scaling with stateless API instances, Postgres connection pooling, read replicas for analytics, incremental sensor ingestion, and time-series partitioning for `sensor_readings` |

Anti-goals for scale: no speculative abstractions, no premature microservices, no client-side aggregation of unbounded datasets.

---

## 52. Performance Optimisation

| Technique | Where |
| --- | --- |
| No network requests at runtime | All libraries vendored |
| Deferred scripts | `defer` on Bootstrap, Chart.js and the application script |
| Hero image preload + high fetch priority | `<link rel="preload">` and `fetchpriority="high"` |
| Lazy images with explicit dimensions | `loading="lazy"`, `decoding="async"`, `width`/`height` |
| Progressive JPEG with tuned quality | Hero q76, rich field image q76, thumbs q76–78, OG q84 |
| Two font weights up front | Inter 400/600 in CSS; 500/700 also vendored (no external requests) |
| woff2 first, ttf fallback | `@font-face` source order |
| Chart updates without animation during ticks | `chart.update("none")` on live updates |
| Text-node updates for high-frequency values | `setText` instead of DOM rebuilds |
| Bounded collections | 80 activity, 40 alerts, 300 analytics events |
| Single interval per concern | One simulation timer, one clock timer, one schedule timer; no timer leaks (`stopSimulation` before restart) |
| Visibility-aware pausing | Simulation stops when the tab is hidden |
| Passive listeners not needed; no scroll handlers | Scroll-spy uses `IntersectionObserver` instead of scroll events |
| No layout thrash | Renders batch reads/writes per surface; no forced synchronous layout in loops |
| Reduced motion respected | Animation disabled for users who prefer it (also reduces CPU) |
| Accessibility-preserving compression | Images optimised to documented budgets without visible artefacts |

Targets versus measured: see `PRD.md` §28 (initial critical payload ≈ 1.36 MB against a 1.5 MB target; zero runtime requests; no console errors).

---

## 53. Testing Architecture

Testing is a first-class part of the delivery, and it is **continuous by design**: implement → run → test → fix → re-run → verify existing features → continue. Nothing is deferred to the end (see `phases.md` §"Continuous Development Loop").

### 53.1 Test layers

| Layer | Tooling | What it proves |
| --- | --- | --- |
| Syntax/static | `node --check script.js` | No parse errors in the application script |
| Static analysis (manual review) | Code search (for example for `eval(`, inline handlers, `innerHTML` sites) | No injection sinks, no dead handlers |
| Structural/functional E2E | Puppeteer driven against `file://…/index.html` | Real browser behaviour: every control, every flow, state changes, persistence |
| Regression flows | Puppeteer scripts per flow (pump, schedule, outage, automatic mode, expiry) | Previously working behaviour still works after each change |
| Accessibility | `axe-core` in the browser (WCAG 2.1 A/AA + best practice) | Zero violations; ARIA validity; labels; list semantics |
| Contrast (pixel-level) | Screenshot + luminance maths on the rendered page | Text over photographs meets contrast requirements |
| Responsive | Automated viewports (360/390/834/1280/1440) with full-page capture + overflow measurement | No horizontal overflow; no covered controls; correct layouts |
| Visual review | Human review of captured screenshots at multiple widths | Spacing, hierarchy, imagery and Chinese-whisker issues the automated pass cannot judge |
| Network hygiene | Request interception | Zero external requests; zero failed requests |
| Performance sanity | Payload measurement, timer review, animation review | Documented budgets met |

### 53.2 Executed checks for this release

| Check | Result |
| --- | --- |
| Browser smoke test (load, KPIs, charts, pump toggle, activity rows, no errors) | Pass — 0 console errors, 0 page errors, 0 failed requests |
| Full interaction test (settings save/invalid/reset, schedule create/invalid, alert read/dismiss/mark-all, filters, search, units switch, range switch, field dialog start, outage on/off, export, reload persistence) | Pass — every assertion as expected |
| Extended flow test (53-step sequence including a real scheduled session completing and automatic mode starting the pump) | Pass — 0 console errors, 0 page errors |
| `axe-core` accessibility audit | Pass — **0 violations** (only "needs review" items of the gradient/pseudo-element kind, each verified by pixel measurement) |
| Contrast measurement under hero and weather text | Pass — hero 10–14:1; weather 5.0:1 and 6.6:1 |
| Responsive capture at 5 widths | Pass — no horizontal overflow anywhere; the activity table scrolls inside its own container on phones |
| Persistence across reload | Pass — settings, alerts, activity, schedules, pump mode, tank level and water used today all restored |
| Lazy images resolved on scroll | Pass — every field and crop image loaded with the expected intrinsic width |
| Emoji scan of HTML/CSS/JS | Pass — none present |

### 53.3 Test script inventory (development-time, not shipped in the project folder)

| Script | Purpose |
| --- | --- |
| `test/smoke.js` | Load, render, pump toggle, sensor ticks, error capture |
| `test/full.js` | End-to-end interaction matrix with a JSON result report |
| `test/flows.js` | Long-running flows: scheduled session completion, automatic mode, flow-rate consistency |
| `test/a11y.js` | `axe-core` audit with violation grouping |
| `test/contrast.js` | Reports each failing contrast pair with its computed ratio |
| `test/quotes.js`, `test/verify2.js`, `test/diag.js` | Targeted diagnostics (DOM measurement, image loading, sticky-bar overlap) |
| `test/shots.js` | Multi-viewport full-page capture + overflow detection |

### 53.4 Definition of a passing change

1. `node --check script.js` passes.
2. The smoke test shows zero console/page errors.
3. The affected flow test passes.
4. A regression run of the main flows passes.
5. `axe-core` reports zero violations.
6. Responsive capture shows no overflow and no covered controls at 360/834/1440 px.
7. Documentation is updated in the same change.
8. No known error is left in the codebase — errors are fixed immediately, never accumulated.

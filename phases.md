# AquaFarm — Smart Irrigation Management Dashboard
## Development Roadmap (phases.md)

| Field | Value |
| --- | --- |
| Document | phases.md |
| Version | 1.0 |
| Last updated | 18 September 2026 |
| Delivery | `irrigation-dashboard/` (HTML5 · CSS3 · vanilla JavaScript · Bootstrap · Chart.js · Font Awesome) |
| Status of phases 1–9 | **Complete and verified** (evidence recorded per phase) |
| Status of phase 10 | Launch checklist ready; post-launch items and **To Be Decided** business details remain with the project owner |
| Companion documents | `PRD.md`, `design.md`, `architecture.md`, `irrigation-dashboard/README.md` |

---

## How to Use This Document

This roadmap is written to be executed **in order**, by a human developer or an AI coding agent, with testing built into every phase. Each phase contains:

* **Objective** — why the phase exists.
* **Tasks** — the work to perform.
* **Subtasks** — the granular steps.
* **Dependencies** — what must be true before starting.
* **Expected Output** — the artefacts the phase produces.
* **Testing Checkpoint** — the tests that must be run **during** the phase (not afterwards).
* **Completion Criteria** — the conditions that must be demonstrably true to move on.

---

## Non-Negotiable Delivery Rules

These rules apply to every phase.

### R1 — Continuous development loop (never build everything and test at the end)

```text
     ┌──────────────────────────────────────────────────────────────┐
     │  IMPLEMENT → RUN → TEST → IDENTIFY → FIX → RE-RUN → RE-TEST  │
     │         → VERIFY EXISTING FEATURES → CONTINUE                │
     └──────────────────────────────────────────────────────────────┘
```

For every page or major feature:

| Step | Action |
| --- | --- |
| **A. Inspect** | Understand the existing implementation before changing it. Read the relevant HTML, CSS and JS sections. Never assume existing code works because it exists. |
| **B. Implement** | Implement the smallest correct change that satisfies the requirement. |
| **C. Test immediately** | Open the page in a real browser, exercise the new behaviour, and record the result. |
| **D. Fix** | On failure: find the root cause (not the symptom), fix it, re-run the test, and confirm the fix. Then re-test neighbouring features to prove nothing regressed. |
| **E. Continue** | Move on only when the feature passes and no known error remains. |

**Never accumulate known errors.** A red console, a broken control or a failed assertion is fixed before the next task begins.

### R2 — Verification means observed behaviour

Code that exists but was never executed does not count as done. Specifically:

* A `localStorage` write is "done" only after a **reload** proves the value was restored.
* A chart is "done" only when it renders with real data in a browser.
* A form is "done" only when both the invalid and valid paths were executed.
* An accessible control is "done" only when it was operated by keyboard.
* A responsive layout is "done" only when it was rendered at 360 px, 834 px and 1440 px.

### R3 — No fake functionality

Never ship fake statistics, hard-coded records presented as live data, non-functional buttons, forms that do not persist, fake authentication, fake API responses, or placeholder production behaviour. Every control must have a real implementation path and a visible state change.

### R4 — Honest simulation

Every simulated surface must be labelled as simulated (hero pills, recommendation disclaimer, weather subtitle, activity subtitle, legal text, README). No simulated number may be presented as a real measurement.

### R5 — No emojis, professional imagery only

No emojis anywhere in the UI, and icons are never replaced by emoji glyphs. Only relevant, high-quality, properly licensed imagery is used.

### R6 — Documentation stays synchronised

A change to behaviour, storage keys, component names or defaults updates `PRD.md`, `design.md`, `architecture.md`, `phases.md` and the README **in the same change**.

### R7 — Preserve approved frontend

Once a design is approved, do not redesign or rebuild it. Modify frontend code only where a change is genuinely required (integration, data, validation, states, functionality).

---

## Phase Overview

| Phase | Name | Status | Key output |
| --- | --- | --- | --- |
| 1 | Project Planning & Setup | Complete | Repository, folder structure, tooling decisions, pinned libraries |
| 2 | Design & UI System | Complete | Design tokens, typography, colour, component library, responsive system |
| 3 | Page & Section Development | Complete | Eight working sections, header, footer, navigation, dialogs |
| 4 | Data Layer & Simulation Engine | Complete | Deterministic simulation, rule engine, storage schema, seeded dataset |
| 5 | Interactive Features & Control | Complete | Pump control, modes, recommendation, tank, scheduling, alerts |
| 6 | Content & Media | Complete | Final copy, photography, iconography, table/empty-state content |
| 7 | SEO, Accessibility & Performance | Complete | Metadata, sitemap, robots, OG image, WCAG AA, payload budgets |
| 8 | Testing & Hardening | Complete | Automated test suite, accessibility audit, responsive matrix, error handling |
| 9 | Deployment Readiness | Complete | Hosting configuration, headers, caching, 404 specification |
| 10 | Launch & Post-Launch | In progress | Launch checklist, verification, monitoring, maintenance plan |

---

# PHASE 1 — Project Planning & Setup

### Objective

Establish a correct, reproducible foundation: agree the requirements, fix the technology choices, create the repository and folder structure, pin the libraries, and make the first "hello dashboard" render in a browser.

### Tasks

**1.1 Requirements finalisation**

* Read the project brief end to end; extract every explicit requirement into a checklist (monitored parameters, controls, charts, states, simulation rules, responsiveness, accessibility, "no fake functionality" constraints).
* Confirm the delivery constraints: runs by opening `index.html`; no login, no database, no IoT hardware, no paid API, no API keys.
* Record anything the owner did not supply as **To Be Decided** rather than inventing it (support contacts, address, legal entity, domain, analytics provider).
* Define scope boundaries explicitly (in scope / out of scope) so later phases do not drift.

**1.2 Project initialisation**

* Create the project folder (`irrigation-dashboard/`) with the agreed structure.
* Create `index.html`, `style.css`, `script.js`, `assets/images/`, `assets/vendor/`.
* Add a `README.md` skeleton (run instructions, structure, credits section).

**1.3 Git / GitHub setup**

* Initialise the repository; add a `.gitignore` (editor/OS files; development-only folders such as test downloads and image-staging directories).
* Create `main` and confirm the first commit contains the folder structure only.
* Adopt Conventional Commits and a branch naming convention.

**1.4 Library selection and pinning**

* Choose the exact library versions: Bootstrap 5.3.3, Chart.js 4.4.7, Font Awesome 6.7.2, Inter (fontsource files).
* Vendor them under `assets/vendor/` so the product has **zero runtime network dependency**.
* Record the versions in the README and architecture document.

**1.5 Browser and device target definition**

* Target evergreen Chrome, Edge, Firefox and Safari, plus mobile Safari and Chrome for Android.
* Define the test viewports: 360, 390, 834, 1280, 1440 px.

### Subtasks

1. Write the requirements checklist as a living document (it becomes the acceptance criteria in the PRD).
2. Create the folder structure and empty files; verify they open without errors.
3. Add `favicon`, `manifest.webmanifest`, `robots.txt`, `sitemap.xml` placeholders.
4. Verify every vendored file loads locally (no 404s) by opening the page and reading the console.
5. Commit with a message such as `chore: scaffold irrigation dashboard project`.

### Dependencies

None. This is the entry phase.

### Expected Output

* Repository with the agreed folder structure.
* Pinned, vendored libraries that load with zero network requests.
* Requirements checklist and scope boundary list.
* Documented browsers and viewports.

### Testing Checkpoint

| Test | Method | Pass condition |
| --- | --- | --- |
| Page loads locally | Open `index.html` from the file system | No blank screen, no console errors |
| Vendored assets resolve | Browser console + network panel | Zero 404s, zero external requests |
| Structure is committed | `git status` | Clean tree except intentionally ignored folders |

### Completion Criteria

1. The folder structure exists exactly as specified.
2. All libraries are vendored, pinned and loading locally.
3. The requirements checklist is complete and includes the "To Be Decided" register.
4. The repository has a meaningful first commit on `main`.

---

# PHASE 2 — Design & UI System

### Objective

Turn the approved design direction into a reusable system of tokens and components so every later section is built from the same parts, at the same rhythm, with consistent states.

### Tasks

**2.1 Brand setup**

* Implement the brand mark as an inline SVG (droplet over a leaf inside a rounded green tile) and reuse it for favicon, apple-touch-icon and PWA icons.
* Fix the wordmark ("AquaFarm") and the uppercase descriptor ("Smart Irrigation Management").
* Lock the tagline: "Technology for smarter and more efficient irrigation."

**2.2 Typography**

* Self-host Inter (400/500/600/700) with woff2 first and `font-display: swap`.
* Define the type scale: display 32 px, h2 20 px, h3 17 px, h4 15 px, body 15 px, small 13 px, micro 12 px, metric 36 px.
* Define line heights (1.2 tight, 1.35 snug, 1.6 body) and letter-spacing rules (tight for headings, `0.04–0.05em` for uppercase micro-labels).

**2.3 Colour system**

* Define all tokens in `:root`: brand greens 050–950, neutrals, beige family, semantic success/warning/danger/info with soft backgrounds, surfaces and text colours.
* Define the data-visualisation palette (soil line, threshold reference, water bars, progress gradients, health ring tones).
* Verify contrast for every text/background pairing; darken any token that fails 4.5:1.

**2.4 Spacing, radius and elevation**

* Define the 4 px spacing scale (`--sp-1` … `--sp-9`).
* Define radii (6 / 8 / 12 / 16 / 20 / pill) and shadows (`--sh-xs` … `--sh-lg`, plus a focus shadow).
* Document the rule that radius grows with surface size and elevation implies interactivity.

**2.5 Component library**

* Buttons: primary, primary stop-state, ghost, subtle, danger-outline, hero-ghost, compact, block, loading, disabled.
* Cards: KPI, statistic, control, recommendation, tank, field, crop, chart, health, weather, alert, sensor, legal/help.
* Status: tags (five tones, three sizes), severity chips, mode badges, status badges, count chips, nav badge.
* Forms: label/helper/error stack, text/number/date/time inputs, select with an inline SVG chevron, range slider paired with a number input, switches (plain and large), toggle rows, form actions.
* Navigation shells: header, brand, nav links, icon button with badge, profile chip, hamburger, mobile disclosure panel, backdrop.
* Feedback: toasts (four types), loading overlays/spinners, skeleton shimmer, empty states, error states, indeterminate progress bar.
* Overlays: modal shell, dropdown panels (notification, profile), accordion.

**2.6 Responsive system**

* Declare the breakpoint set: ≤374.98 / ≤575.98 / ≤767.98 / ≤899.98 / ≤991.98 / ≤1199.98 / ≥1400.
* Define the layout rules per breakpoint (single column, 2-up cards, multi-column grids, sticky mobile action bar, hamburger).
* Define the touch-target minimum (42 px) and the mobile action-bar reservation (body padding).

### Subtasks

1. Write `style.css` in documented sections (fonts → tokens → base → layout → components → utilities → responsive → motion/print).
2. Implement `:focus-visible` globally and a focus shadow for form controls.
3. Implement `prefers-reduced-motion` handling at the end of the stylesheet.
4. Build a temporary style-proof page (not shipped) that renders every component in every state, and review it visually.
5. Remove the temporary proof page once the real sections exist.

### Dependencies

Phase 1 complete (structure, vendored fonts, pinned Bootstrap).

### Expected Output

* `style.css` with tokens and components, fully documented by section.
* A component inventory that matches `design.md`.
* Verified colour contrast for every token pairing.

### Testing Checkpoint

| Test | Method | Pass condition |
| --- | --- | --- |
| Tokens applied consistently | Inspect computed styles on sample components | No hard-coded colours outside `:root` (except documented chart colours) |
| Component states exist | Toggle hover/focus/disabled/loading on each component | Every state visually distinct and documented |
| Focus is always visible | Tab through the proof page | Focus ring visible on every interactive element |
| Contrast | Computed ratios for each text/background pair | ≥ 4.5:1 normal text, ≥ 3:1 large text |
| Responsive tokens | Render the proof page at 360/834/1440 px | No overflow, no clipped text |

### Completion Criteria

1. Every colour, space, radius, shadow and font size used anywhere in the product comes from a token.
2. All component states in `design.md` §27–32 are implemented.
3. Contrast passes at the token level.
4. Reduced motion and focus visibility are implemented before any section is built.

---

# PHASE 3 — Page & Section Development

### Objective

Build the complete single-page experience: header, all eight sections, footer, dialogs and the mobile shells — using only the components from Phase 2 and no placeholder controls.

### Tasks

**3.1 Header and navigation**

* Sticky header with brand, six nav links, notification bell, profile chip and hamburger.
* Mobile disclosure panel with backdrop; closes on link activation, backdrop click and `Esc`.
* Scroll-spy (`IntersectionObserver`) maintaining exactly one active link; anchor offsets via `scroll-margin-top`.
* Skip link as the first focusable element.

**3.2 Dashboard section (`#overview`)**

* Hero with time-aware greeting, subtitle, live-simulation and demonstration pills, last-updated line, Refresh Data and Turn Irrigation ON/OFF.
* Four KPI cards (soil moisture, temperature, humidity, water tank) with icon tiles, status tags, values, units, progress tracks and hint lines.
* Four statistic cards (total farm area, water used today, irrigation sessions, water saved).

**3.3 Irrigation section (`#irrigation-control`)**

* Pump card: status badge, target-field selector, large switch, runtime line, segmented mode control, flow rate, session water, rule-engine status, control photograph.
* Recommendation card: headline, reasoning, duration, water estimate, actions, disclaimer.
* Water tank card: animated vertical tank with ticks, percentage, litres, capacity, draw rate and supply estimate.

**3.4 Schedule and activity section (`#activity`)**

* Schedule form (field, date, time, duration, mode) with the standard form UX.
* Schedule list with day/time/field/duration/mode/status and actions.
* Activity table with the six required columns, badges, filters, search and empty states.
* Mobile table-to-card transformation using `data-label`.

**3.5 Fields section (`#fields`)**

* Three field cards with imagery, overlay badges, 2×2 facts, health tag and View Details.
* Field dialog with image, four key facts, a per-field 24-hour chart and direct actions.
* Crop management cards with stage, field, recommended range, current moisture and status.

**3.6 Analytics section (`#analytics`)**

* Soil moisture chart card with period selector, loader, canvas and summary strip.
* Water usage chart card with weekly total, delta chip, daily average, highest day and previous week.
* Farm health score card with the ring and four sub-scores.
* Weather card with the current panel, facts, forecast and planning note.

**3.7 Alerts section (`#alerts`)**

* Alert list with severity, title, chip, description, meta and actions; filter; mark-all-read.
* Alert rules panel with the four documented rules and the live threshold.
* Sensor network panel with node rows and an outage error state.

**3.8 Settings section (`#settings`)**

* Irrigation settings form (threshold slider + number, tank capacity, units, automatic irrigation switch) with save, reset and a saved stamp.
* Data & Simulation panel (speed, pause, outage, session counters, next update, data source).
* Stored Data panel with the storage summary, export and clear actions.

**3.9 Help section (`#help`)**

* Five-step operating model, FAQ accordion, support contact block with the address marked **To Be Decided**.

**3.10 Footer, dialogs and mobile shells**

* Footer with brand, tagline, navigation, simulated-data note, legal links and copyright.
* Privacy Policy, Terms & Conditions and Cookie Preferences dialogs with accurate content.
* Sticky mobile action bar (pump status, soil hint, Refresh, Start/Stop).
* Toast region as a polite live region.

### Subtasks

1. Write semantic markup first (headings, landmarks, lists, tables), then attach classes.
2. Wire each section to a render function from Phase 4/5; do not leave hard-coded values in place.
3. Add `aria-labelledby` and `ARIA` state attributes as each control is created.
4. Verify keyboard order section by section as it is built.
5. Check each section at 360 px as soon as it exists (never leave responsiveness to the end).

### Dependencies

Phase 2 complete (tokens and components); Phase 4 data layer available for real values (sections may be built with static markup first, then bound).

### Expected Output

* Complete `index.html` with all eight sections, header, footer, dialogs and shells.
* Every control present, labelled and reachable by keyboard.
* No hard-coded production values: everything renders from state.

### Testing Checkpoint

| Test | Method | Pass condition |
| --- | --- | --- |
| As-built review per section | Open the page after each section | Layout correct, no overflow, no console errors |
| Keyboard walk-through | Tab through each section | Logical order, visible focus, no traps |
| Landmarks and headings | Accessibility tree inspection | One `h1`, sequential headings, labelled sections |
| Responsive check per section | 360 px and 1440 px after each section | No horizontal scrolling, no clipped text |
| Empty-state presence | Remove data (outage/filters) | Documented empty state appears with guidance |

### Completion Criteria

1. All eight sections render with the exact content specified in `PRD.md` §12–14.
2. Every interactive element has hover, focus, active and disabled states where applicable.
3. No section depends on a hard-coded value; all values bind to state.
4. Navigation, dialogs and the mobile shell work at every breakpoint.

---

# PHASE 4 — Data Layer & Simulation Engine

### Objective

Build the data model, the deterministic simulation, the rule engine and the persistence layer so the dashboard behaves like a live system without any hardware or server.

### Tasks

**4.1 State model**

* Define `state` with `settings`, `fields[]`, `sensors`, `pump`, `alerts[]`, `activity[]`, `schedules[]`, `counters`, `simulation`, `ui` and `charts`.
* Seed the reference dataset: Field A (Rice, 2.5 ac, 40–60%, AF-01, 42%), Field B (Tomato, 1.5 ac, 35–55%, AF-02, 28%), Field C (Cotton, 3 ac, 40–60%, AF-03, 51%), farm total 7 acres.
* Seed demonstration values matching the brief: temperature 28 °C, humidity 64%, tank 76% of 5,000 L (3,800 L), water used today 1,240 L, sessions 6, water saved 18%, weekly water series totalling 7,700 L, previous week 8,750 L.

**4.2 Persistence layer**

* Implement `Store` with an availability probe, safe reads with fallbacks, guarded writes and a full clear.
* Define the seven versioned keys (`aquafarm.settings.v1`, `alerts`, `activity`, `schedules`, `pump`, `counters`, `prefs`).
* Implement `restoreStoredState()`, `persistAlerts()`, `persistActivity()`, `persistSchedules()`, `persistPump()`, `persistCounters()`.
* Seed demonstration data only when a store is empty (`seedDemonstrationData()`), so first run looks complete but user data is never overwritten.

**4.3 Simulation engine**

* Implement `sensorTick(manual)` with realistic drift: moisture −0.05…−0.22 %/tick when idle and +0.28…+0.50 %/tick while irrigating; temperature ±0.25–0.28; humidity ±0.9; tank draw equal to the configured flow (30 L/min × interval) with ±10 % jitter.
* Implement interval control (2 / 5 / 10 s), pause, resume, and outage handling.
* Implement timer hygiene: clear before setting, and pause the simulation while the tab is hidden.
* Implement `initializeHistory()` and deterministic series builders (`buildSoilSeries`, `buildWaterSeries`, `buildFieldHistory`) using a seeded LCG so charts are stable across reloads.

**4.4 Rule engine**

* Implement `evaluateRules()`: threshold comparison, per-field low-moisture alerts, tank alerts (< 30 % warning, < 15 % critical), automatic start below threshold for the driest field, automatic stop at threshold + 4 % (hysteresis), and planned-session completion.
* Implement `recommendationData()`: escalation at the threshold, duration `clamp(round((threshold + 20 − moisture) × 2.25), 8, 60)` minutes, water `duration × 17.8 L`, rain note above 60 % chance, driest-field comparison.
* Implement `computeHealth()` with the four sub-scores and documented weightings.

### Subtasks

1. Write the model and seeds first, then the tick, then the rules, testing each in isolation.
2. Verify storage key names against `architecture.md` §12 in the same commit.
3. Verify the default recommendation calibration: at 42 % moisture with a 30 % threshold the card must read **18 minutes / 320 L**.
4. Verify counts: the weekly water series must total exactly 7,700 L; the farm total must be exactly 7 acres.
5. Confirm that corrupt or missing storage never throws.

### Dependencies

Phase 3 markup exists (render functions need targets); Phase 2 tokens are irrelevant here.

### Expected Output

* `script.js` sections 1–12, 16, 18, 22 implemented.
* A working simulation that updates KPIs, tank, fields, charts and rules without user interaction.
* Persistence that survives reloads.

### Testing Checkpoint

| Test | Method | Pass condition |
| --- | --- | --- |
| Tick realism | Watch values across ≥ 10 ticks at each interval | Gradual, bounded changes; no `NaN`; no wild jumps |
| Tank–flow agreement | Run the pump for ~6 s at 5 s ticks | ≈ 2.5 L per tick (30 L/min), session water and "water used today" both increase consistently |
| Rule engine | Lower the threshold high, then restore | Recommendation escalates; alerts raise once; automatic mode starts the pump below threshold |
| Recommendation calibration | Default settings | 18 minutes / 320 L |
| Persistence round-trip | Change settings, run a session, reload | Settings, counters, tank level, activity and alerts restored |
| Storage failure path | Simulate blocked storage | App still works; warning shown; no crash |
| Determinism | Reload twice, compare chart series | Identical historical series |

### Completion Criteria

1. All values on the dashboard come from state — no hard-coded numbers remain in markup.
2. The simulation produces realistic, bounded drift at every supported interval.
3. The rule engine implements every documented rule, including hysteresis and safety stops.
4. Persistence round-trips for all seven keys and degrades gracefully when storage is unavailable.
5. The default demonstration data matches the brief exactly.

---

# PHASE 5 — Interactive Features & Control

### Objective

Make every control real: pump control, three irrigation modes, scheduling with execution, alert lifecycle, filtering, settings application, export and reset — each with loading, empty, error and success states.

### Tasks

**5.1 Pump control**

* Implement `startPump` (preconditions: tank not empty, sensor feed online, pump idle) and `stopPump` (finalise the activity row with real elapsed minutes and measured litres).
* Mirror the control in four places (switch, hero, mobile bar, field dialog) with identical behaviour and announcements.
* Lock the target-field selector while running, with an explanatory title.

**5.2 Irrigation modes**

* Manual: pump changes only on user action.
* Automatic: start on threshold breach (driest field, 25-minute plan), stop at threshold + 4 %.
* Scheduled: run due tasks with a planned duration; mark tasks completed; never loop a task.
* Implement `setMode()` with contextual help text and an accurate rule-status line.

**5.3 Recommendation actions**

* Start Irrigation → start the pump for the recommended field and duration.
* Ignore → hide the card; return it when moisture changes materially.

**5.4 Water tank behaviour**

* Animate the water column to the live percentage; raise the wave animation speed while pumping; show flow, draw rate and estimated supply left.

**5.5 Scheduling**

* Implement `validateSchedule()` (field, real datetime, not in the past, duration 1–180, mode, duplicate within a minute) with inline errors and focus management.
* Implement `submitSchedule()`, `cancelSchedule()`, `startScheduleNow()` and `processDueSchedules()` (15 s poll).
* Build the schedule list with "Today / Tomorrow / date" labels and start-now/cancel actions.

**5.6 Alerts lifecycle**

* Implement `addAlert` with de-duplication and a 5-minute cooldown, mark read, mark all read, dismiss, and severity filters.
* Implement the bell panel and the nav badge, both driven by the same unread count.

**5.7 Activity log interactions**

* Field filter, status filter and debounced search, with a record count and distinct empty states.

**5.8 Settings application**

* `validateSettings()`, `saveSettings()`, `resetSettings()`, unit switching across every `[data-unit]` label, and an instant global re-render after each save.

**5.9 Data portability and reset**

* `exportData()` producing a dated JSON file; `resetDemoData()` with two-step confirmation, storage clear, reseed and full re-render.

**5.10 Simulation controls**

* On-screen speed selector, pause/resume, and the outage switch with its complete "no data" behaviour and recovery alert.

### Subtasks

1. Implement one control at a time and test it immediately (do not batch).
2. After each control, re-test the previously finished controls (regression).
3. Verify every toast message names the object it changed.
4. Verify that every write action persists before moving on.

### Dependencies

Phase 4 complete (state, rules, storage) and Phase 3 markup for the controls.

### Expected Output

* Interaction layer (`wireEvents`, domain functions) complete.
* All 14 required interactions from the brief implemented and observable.
* Loading, empty, error and success states on every interactive surface.

### Testing Checkpoint

| Test | Method | Pass condition |
| --- | --- | --- |
| Pump start/stop from all entry points | Click each control | Identical resulting state; activity row appears then completes with real minutes/litres |
| Automatic mode | Set threshold high with automatic enabled | Pump starts for the driest field; stops after recovery; rule text matches |
| Scheduled execution | Create a task for the current minute | Pump starts within 15 s; marks the task completed; session ends at the planned duration |
| Startup block | Set tank to 0 % (or run it down) | Start blocked with an error toast and a critical alert |
| Outage behaviour | Toggle the outage on/off | KPIs show `--`, empty states appear, pump stops safely, recovery alert and toast appear |
| Alert lifecycle | Raise, read, mark all read, dismiss, filter | Counts and badges always match the visible list |
| Filters and search | Apply field/status/search combinations | Record count matches rows; empty state appears when nothing matches |
| Settings effects | Change threshold, capacity and units, then save | Every dependent surface updates without a reload |
| Export | Click export | Valid JSON downloads with a dated filename |
| Reset | Click reset twice within 5 s | All storage cleared; defaults and demonstration data restored |
| Regression sweep | Re-run the pump, schedule and alert tests after each major addition | No previously working behaviour broken |

### Completion Criteria

1. All 14 briefed interactions work end to end.
2. Every control produces a visible, specific state change and a matching notification.
3. No control is decorative; no form fails to persist.
4. Regression tests pass after the final change of the phase.

---

# PHASE 6 — Content & Media

### Objective

Replace all working copy and imagery with final, professional content: real agricultural photography, precise labels, honest disclaimers, and content for every state (including empty and error states).

### Tasks

**6.1 Content entry**

* Finalise all headings, labels, helper text, button labels and status strings — sentence case, no emojis, no jargon.
* Write the reasoning text for the recommendation card so it always names the field, crop, current moisture, threshold and target band.
* Write the alert rule descriptions, FAQ answers, help steps and legal content.
* Write empty-state and error-state copy for every surface (see `design.md` §34–35).

**6.2 Image sourcing and optimisation**

* Source imagery that matches the section purpose: irrigated rows (hero), rice paddy (Field A), tomato rows (Field B), cotton boll (Field C), irrigation pump control (Irrigation), sky above fields (weather).
* Verify licences (public domain, CC0 or CC BY-SA) and record title, author, licence and source for every image in the README.
* Crop to intentional focal points and export: hero 1920×1080, section images 1200×675, thumbs 400×300, OG 1200×630, icons 1:1.
* Compress to budget (hero ≤ 350 KB, section ≤ 300 KB, thumbs ≤ 70 KB, OG ≤ 150 KB) with progressive JPEG and no visible artefacts.
* Write specific `alt` text for every image.

**6.3 Brand and social assets**

* Export favicon, apple-touch-icon and PWA icons (192/512, maskable).
* Generate the Open Graph image (1200×630) with the product name, the value line and a dark gradient over licensed photography; verify legibility at thumbnail scale.

**6.4 Iconography review**

* Confirm every icon comes from Font Awesome and that the meaning mapping in `design.md` §39 is respected.
* Confirm no icon carries meaning alone in a status context (icon + text everywhere).
* Confirm decorative icons are `aria-hidden`.

**6.5 Content audit**

* Search the entire project for placeholder text, "Lorem", "TBD" outside the approved To-Be-Decided register, and any emoji.
* Confirm every simulated surface is labelled.

### Subtasks

1. Build a staging folder for candidate images; record metadata as they are evaluated.
2. Reject any candidate with watermarks, artefacts, wrong subject or poor quality.
3. Regenerate images from source at the final crop rather than resizing twice.
4. Re-run the interface after each asset swap to confirm nothing broke visually.

### Dependencies

Phases 3–5 complete (final surfaces exist, so copy length and image ratios are known).

### Expected Output

* Final copy across all eight sections, dialogs and states.
* Final optimised image set with documented credits.
* Brand assets and OG image.

### Testing Checkpoint

| Test | Method | Pass condition |
| --- | --- | --- |
| Image load and ratio | Browser inspection at 360/834/1440 px | Every image loads, correct ratio, no distortion |
| Payload budget | Sum the shipped bytes | Within documented budgets (initial ≤ 1.5 MB) |
| Alt text presence | Search for `<img` without `alt` | None missing |
| Emoji scan | Search HTML/CSS/JS for emoji code points | Zero results |
| Copy accuracy | Compare against the requirements checklist | Every briefed label and statement present |
| Credit completeness | README review | Every used image is credited with title, author and licence |

### Completion Criteria

1. All imagery is relevant, professional, licensed, optimised and credited.
2. No placeholder copy, no emoji, no invented business facts (unsupplied details are marked To Be Decided).
3. Every empty, error, loading and success state has final copy.

---

# PHASE 7 — SEO, Accessibility & Performance

### Objective

Make the dashboard findable, usable by everyone, and fast: complete metadata and crawlability assets, WCAG 2.1 AA compliance, and measured performance budgets.

### Tasks

**7.1 Metadata**

* Title, description, keywords, author, robots, canonical, viewport, theme colour, colour scheme.
* Open Graph (type, site name, title, description, URL, image + dimensions + alt, locale) and Twitter card.
* `WebApplication` JSON-LD with the feature list.

**7.2 Crawlability assets**

* `robots.txt`: allow all, disallow `*.json`, declare the sitemap.
* `sitemap.xml`: single URL with `lastmod`, `changefreq`, `priority`; absolute URLs.
* `manifest.webmanifest`: name, short name, description, start URL, standalone, theme/background colours, maskable icons.

**7.3 Accessibility**

* Verify the heading hierarchy, landmarks and one-`h1` rule.
* Verify every input has a persistent label and exactly one label element.
* Verify ARIA: switches (`aria-checked`), segmented controls (`aria-pressed`), progress bars (`aria-valuenow`), live regions, `role="group"` where `aria-labelledby` is used on generic containers, and hidden empty lists.
* Verify keyboard operation across navigation, forms, dialogs, tables and charts.
* Verify contrast for every text/background pair, then verify text over photographs by pixel measurement.
* Verify reduced-motion behaviour and status-without-colour.

**7.4 Performance**

* Confirm zero runtime network requests and zero failed requests.
* Confirm `defer` on scripts, hero preload, lazy loading and explicit image dimensions.
* Measure the initial critical payload and the total page weight against budget.
* Review timers and animations for CPU courtesy (visibility pausing, no animation during live chart updates).

### Subtasks

1. Run the accessibility audit, group the findings, fix, and re-run until clean.
2. For every "needs review" contrast item (gradient/pseudo-element/image backgrounds), measure the rendered pixels instead of trusting the checker.
3. Re-run the audit after the fixes — never assume a fix worked.
4. Capture before/after payload numbers for the record.

### Dependencies

Phases 3–6 complete (final markup, copy and assets).

### Expected Output

* Complete metadata and crawlability files.
* Zero accessibility violations with documented manual verification of the ambiguous cases.
* Measured performance numbers within budget.

### Testing Checkpoint

| Test | Method | Pass condition |
| --- | --- | --- |
| Accessibility audit | `axe-core` with WCAG 2.1 A/AA + best practice | **0 violations** |
| Contrast under text on images | Hide the text, screenshot, compute luminance contrast | ≥ 4.5:1 (or ≥ 3:1 for large text) |
| Keyboard-only operation | Operate the whole dashboard without a mouse | Every control reachable and operable; focus always visible |
| Reduced motion | Emulate the preference | Charts and long transitions stop animating |
| Metadata validity | Inspect the rendered document and structured data | All required tags present; JSON-LD parses |
| Crawlability files | Fetch `robots.txt` and `sitemap.xml` from the server root | Both return the expected content with correct status codes |
| Network hygiene | Request interception during a full interaction run | 0 external requests, 0 failed requests |
| Payload | Sum shipped bytes for the critical path | Within the documented budget |

### Completion Criteria

1. `axe-core` reports zero violations and every "needs review" item is manually verified and documented.
2. Metadata, sitemap, robots and manifest are complete and consistent with the product.
3. Measured payload meets the documented budgets.
4. Keyboard, reduced-motion and non-colour status requirements are satisfied.

---

# PHASE 8 — Testing & Hardening

### Objective

Prove the product works as a whole, under failure conditions, on every target viewport, and after repeated changes — then fix everything found. This phase formalises continuous testing into a repeatable suite.

### Tasks

**8.1 Automated test suite**

* Write Puppeteer scripts that drive the real page from `file://`: smoke test, full interaction matrix, long-flow tests (scheduled completion, automatic mode, flow-rate consistency), accessibility audit, contrast measurement, responsive capture, and targeted diagnostics.

**8.2 Functional testing**

* Exercise every form (valid and invalid), every filter, every toggle, every dialog action and every table interaction.
* Verify persistence across reloads for every stored entity.
* Verify export and reset, including the two-step confirmation.

**8.3 Resilience testing**

* Storage blocked, storage corrupt, tank empty, sensor outage, scheduled task while busy, chart library missing, export blocked.
* Confirm safe, plain-language messaging and that no stack trace, internal identifier or stale "running" state is ever shown.

**8.4 Responsive and cross-browser testing**

* Automated captures at 360, 390, 834, 1280 and 1440 px; measurement of horizontal overflow and of controls covered by the sticky bar.
* Manual review of the captures for hierarchy, spacing and touch ergonomics.
* Real-device spot checks (at least one iOS and one Android browser) before launch.

**8.5 Accessibility re-verification**

* Re-run the audit after hardening; re-check keyboard flow for controls added or changed.

**8.6 Performance re-verification**

* Re-measure payload, timers and animation behaviour after the final changes.

**8.7 Regression discipline**

* Maintain a regression set (pump, schedule, alert, settings, persistence) and run it after every change in this phase.

### Subtasks

1. Fix defects at the root cause; re-run the failing test; then re-run the regression set.
2. Record the exact command and the observed result for every check in the README.
3. Classify any accepted limitation explicitly (for example no cross-tab live sync) rather than leaving it silent.

### Dependencies

Phase 7 complete.

### Expected Output

* A repeatable test suite and a recorded evidence table.
* Zero console errors, zero failed requests, zero accessibility violations, zero overflow defects.
* A documented list of accepted limitations.

### Testing Checkpoint

| Test | Method | Pass condition |
| --- | --- | --- |
| Smoke | Load and interact briefly | 0 console errors, 0 page errors, 0 failed requests |
| Full interaction matrix | Automated script covering all controls | Every assertion passes |
| Long flows | Scheduled session to completion; automatic start; 6-second flow check | Session closes with real values; pump starts automatically; litres match the flow rate |
| Persistence | Change → reload → compare | All entities restored |
| Resilience | Trigger each failure path | Correct, safe, actionable messaging; no stale states |
| Responsive | 5 viewports + overflow measurement | No page overflow; no covered controls; charts resize |
| Accessibility | `axe-core` | 0 violations |
| Regression | Re-run the core flows after the final fix | No regressions |

### Completion Criteria

1. The full suite passes on the final code with the results recorded.
2. Every failure found in this phase is fixed and re-tested.
3. Accepted limitations are documented with a rationale.
4. The product is stable enough that a stranger can operate every control without encountering an error.

---

# PHASE 9 — Deployment Readiness

### Objective

Prepare the static package for hosting: configuration, headers, caching, domain placeholders, the custom 404 page and a final pre-launch validation pass.

### Tasks

**9.1 Production package**

* Confirm the shipped folder contains only production files (no test scripts, no staging images, no development notes).
* Confirm the root files (`robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `favicon.png`) are present at the site root.

**9.2 Hosting configuration**

* Static hosting with no build step; document the framework preset (none), root directory, empty build/install commands.
* Cache policy: long-lived immutable caching for `assets/**`, short caching for `index.html`.
* Compression enabled for HTML/CSS/JS.

**9.3 Security headers**

* Deliver the Content Security Policy, HSTS, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` from the hosting layer (a meta tag cannot express `frame-ancestors`).

**9.4 Domain and TLS**

* Configure the custom domain (final value **To Be Decided**), provision TLS, force HTTPS, and decide the `www` policy.
* Replace the placeholder domain in `index.html` (canonical, Open Graph, Twitter), `sitemap.xml` and `robots.txt` in one change.

**9.5 Custom 404 page**

* Create a branded `404.html` using the same header, footer and tokens, with a clear headline, plain-language explanation, "Back to dashboard" and "Go to Analytics" actions, `noindex`, and correct heading order. Configure the host to serve it for unknown paths.

**9.6 Final content and SEO pass**

* Re-check titles, descriptions, canonical, OG image and structured data against the live URLs.
* Re-verify `robots.txt` and `sitemap.xml` over HTTP.
* Re-run the Open Graph validator and the social card preview.

**9.7 Final security and privacy pass**

* Confirm no secrets, no external requests, no cookies, no trackers.
* Confirm the legal dialogs describe exactly what the deployed product does (including the placeholder contact details).

### Subtasks

1. Deploy to a preview environment first, run the full test suite against the preview URL, then promote to production.
2. Test the production URL on a real phone over a mobile network.
3. Confirm the dashboard works fully offline after first load (it needs no network at all).

### Dependencies

Phase 8 complete; domain and hosting account available from the owner.

### Expected Output

* A deployed, HTTPS production dashboard with correct headers, caching and a branded 404 page.
* Verification records for SEO, security and performance on the live URL.

### Testing Checkpoint

| Test | Method | Pass condition |
| --- | --- | --- |
| Live smoke test | Open the production URL and operate the main controls | Identical behaviour to local; 0 console errors |
| Headers | Header inspection tool | CSP, HSTS, nosniff, referrer and permissions policies present |
| 404 page | Request an unknown path | Branded 404 with working recovery links and a 404 status |
| SEO | `/robots.txt`, `/sitemap.xml`, structured data, OG validators | All valid and pointing at the live domain |
| Performance | Live payload and load measurement | Within budget over the network |
| Mobile | Real device check | Usable, readable in daylight, controls reachable |
| Offline | Disconnect and reload after first load | Dashboard still fully functions |

### Completion Criteria

1. Production deployment is live over HTTPS with all headers applied.
2. Unknown paths return the branded 404 page.
3. SEO assets validate against the live domain.
4. Live behaviour matches the tested local behaviour exactly.
5. No secrets, cookies or third-party requests exist in the deployed artefact.

---

# PHASE 10 — Launch & Post-Launch

### Objective

Release the dashboard, confirm it behaves correctly in the hands of real users, and put a maintenance loop in place.

### Tasks

**10.1 Final QA**

* Walk the complete demo script (10 steps from the PRD) on desktop, tablet and mobile.
* Confirm every CTA, form, chart, alert action, dialog and navigation path.
* Confirm the empty, error, loading and success states one final time.

**10.2 Content verification**

* Verify all labels, units, defaults and the six default statistics (7 acres, 1,240 L, 6 sessions, 18 %, 76 % tank, 28 °C).
* Verify the recommendation calibration on screen (18 minutes / 320 L at the default threshold).
* Verify every simulated-data label and disclaimer is present and visible.

**10.3 Analytics verification**

* Confirm `window.AquaFarmAnalytics.summary()` returns increasing counts after user actions.
* Confirm no external analytics request is made and no cookie is set.
* Confirm the privacy statement matches actual behaviour.

**10.4 Backup**

* Confirm the release is tagged in Git.
* Confirm the user-facing export produces a complete JSON snapshot.
* Document the restore path (re-enter settings; demonstration data reseeds automatically).

**10.5 Monitoring**

* Define the monitoring checklist: console errors, failed requests, data-freshness label, timer health after tab sleep, storage health on the Stored Data panel.
* If the product is shared widely, add an uptime check on the URL (owner decision).

**10.6 Launch checklist**

* [ ] Production URL resolves over HTTPS and loads with zero console errors.
* [ ] All root assets reachable (`robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `favicon.png`).
* [ ] Open Graph and Twitter previews render correctly.
* [ ] 404 page works.
* [ ] Accessibility audit clean on the live build.
* [ ] Responsive behaviour verified on real devices.
* [ ] All legal dialogs reviewed and accurate.
* [ ] To-Be-Decided items listed and assigned to the owner.
* [ ] Release tagged and documented.

**10.7 Post-launch maintenance**

* Establish a review cadence (for example monthly): re-run the test suite, re-run the accessibility audit, verify the payload budget, review library versions, and re-run the responsive matrix.
* Keep the documentation synchronised with every change (R6).
* Maintain a change log of user-visible changes per release.
* Re-verify persistence after any change to storage keys or record shapes.
* Re-assess the To-Be-Decided register (domain, contacts, legal details, analytics, 404/PWA decisions, real farm data).

### Subtasks

1. Publish the release notes (what changed, what to verify, known limitations).
2. Record the final test evidence table in the README.
3. Schedule the first post-launch review and assign an owner.

### Dependencies

Phase 9 complete and the owner has confirmed the domain, support contacts and legal details (or agreed to keep them marked To Be Decided).

### Expected Output

* A launched product with a verified demo path.
* A monitoring and maintenance routine with named owners.
* Documented open items and a release record.

### Testing Checkpoint

| Test | Method | Pass condition |
| --- | --- | --- |
| Demo script | Execute the 10-step walkthrough on three devices | Every step works without error |
| Content | Compare on-screen values with the specification | Exact match |
| Analytics | Console check of `AquaFarmAnalytics.summary()` | Counts increase; no external calls |
| Persistence and backup | Change settings and a schedule, reload, export | restored and export contains the records |
| Regression | Re-run the core flow set | No regression |
| Accessibility and responsive | Final live audit and device review | 0 violations; no layout defects |

### Completion Criteria

1. The full demo script passes on desktop, tablet and mobile.
2. Content, calibration, statics and disclaimers match the PRD exactly.
3. Analytics, persistence, export and reset are verified in production.
4. The launch checklist is complete (or items are explicitly deferred with an owner).
5. Monitoring and maintenance responsibilities are documented.

---

## Continuous Verification Protocol (applies to every phase)

This is the project's adaptation of the rule that "code existing is not the same as code verified".

| # | Rule |
| --- | --- |
| 1 | A feature is verified only after it was **executed in a real browser** and its effect was observed. |
| 2 | Persistence is verified only after a **page reload** shows the stored value restored. |
| 3 | A rule change is verified by observing the **user-visible consequence** (recommendation text, chart line, alert, pump action), not by reading the code. |
| 4 | Calculations are verified against **hard-coded expectations** (18 minutes / 320 L; 7,700 L weekly; 7 acres; 3,800 L at 76 %). |
| 5 | Safety behaviours are verified by **attempting the unsafe action** (start with an empty tank, start during an outage). |
| 6 | Accessibility is verified by **operating the control by keyboard**, not by inspecting attributes. |
| 7 | Responsive behaviour is verified by **rendering the viewport** and measuring overflow, not by reading media queries. |
| 8 | Every fix is verified by re-running the failing test **and** the neighbouring regression tests. |
| 9 | No known error is carried into the next task; failures are fixed immediately. |
| 10 | Evidence (command + observed result) is recorded for every checkpoint and kept with the project documentation. |

### Mock-data prohibition

The following must never be used to stand in for real implementation:

* Local JSON files pretending to be a database
* Mock or in-memory data standing in for persisted records
* Hard-coded records presented as live data
* Fake API responses
* Fake statistics on cards that claim to be live
* Buttons or forms that do not change state

If a future phase introduces a real backend (Supabase/Postgres), the same rule applies with greater force: the tables must actually exist in the project, the migrations must actually be applied, the RLS policies must actually be verified with positive and negative tests, and the client must be connected to the real instance — verified by performing INSERT/SELECT/UPDATE/DELETE and observing the change in the running UI. Until that phase is approved, the browser-local persistence described in `architecture.md` §12–13 is the product's real data layer and is verified as such.

---

## Phase 10 Open Items (owner decisions required)

| # | Item | Blocks | Owner |
| --- | --- | --- | --- |
| 1 | Production domain name | Canonical URL, sitemap `loc`, Open Graph `og:url`, 404 deployment | Project owner |
| 2 | Support email and phone | Help section contact block | Project owner |
| 3 | Registered address and legal entity | Privacy Policy and Terms dialogs | Project owner |
| 4 | Analytics provider (or approval to keep the in-memory event log) | Privacy Policy if a third party is added | Project owner |
| 5 | Whether to add the hosted `404.html` and/or a PWA service worker | Deployment scope | Project owner |
| 6 | Real farm, crop or field data to replace the demonstration dataset | Content finality | Project owner |
| 7 | Optional future backend (Supabase/Next.js) for multi-device sync | A separate, explicitly approved phase | Project owner |

---

## Definition of Done (project level)

The project is done when all of the following are true:

1. `index.html` opens and works from the file system **and** from a hosted HTTPS URL.
2. Every requirement in the brief and every acceptance criterion in `PRD.md` §45 is satisfied and demonstrated.
3. Every reported issue is fixed and re-tested; no known error remains.
4. Zero console errors, zero page errors, zero failed requests and zero external requests.
5. Accessibility: zero audit violations, keyboard-operable, contrast verified including over photographs.
6. Responsive: verified at 360, 390, 834, 1280 and 1440 px with no overflow and no covered controls.
7. Professional, licensed, optimised imagery; no emojis anywhere.
8. No fake functionality; every control changes real state and persists where it should.
9. All simulated data is labelled, and all disclaimers are present.
10. `PRD.md`, `design.md`, `architecture.md`, `phases.md` and `README.md` match the shipped code.
11. The test suite passes on the final build, and the evidence is recorded.
12. Unsupplied business details are marked **To Be Decided**, never invented.

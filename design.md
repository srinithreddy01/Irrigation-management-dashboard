# AquaFarm — Smart Irrigation Management Dashboard
## UI/UX and Design Specification (design.md)

| Field | Value |
| --- | --- |
| Document | design.md |
| Version | 1.0 |
| Status | Implemented |
| Last updated | 18 September 2026 |
| Source of truth | `irrigation-dashboard/style.css`, `index.html` |
| Companion documents | `PRD.md`, `architecture.md`, `phases.md` |

> **Design rule that overrides everything else:** no emojis in the interface, in any state, including copy, toasts, empty states and dialogs. Icons are from Font Awesome 6 Free (solid/regular). Icon glyphs are never used as a substitute for a word where a label is required by accessibility rules.

---

## 1. Design Philosophy

| Principle | What it means in this product |
| --- | --- |
| **Five-second comprehension** | The four numbers that matter (soil moisture, pump status, tank level, recommendation) are legible without scrolling; nothing decorative competes with them. |
| **Agriculture first, software second** | The interface borrows the visual language of the field — deep green, growth, water, soil, daylight — rather than the grey-blue of generic admin templates. |
| **Honest simulation** | Simulated data is labelled at every level: hero pills, disclaimers, subtitles and legal text. Design must never make a demo look like real telemetry. |
| **Calm by default, urgent by exception** | The base palette is quiet; colour intensity is reserved for state (running pump, low water, alerts). |
| **One primary action per area** | Each card has at most one filled primary button; everything else is ghost or subtle. |
| **Physical feedback** | Controls that change the world (pump switch, tank, charts) visibly move when they change. |
| **Farmer-proof, not developer-pretty** | Large targets, plain labels, no jargon, works in sunlight, works one-handed. |
| **Restrained motion** | Motion explains change (fill, count, fade) and never delays work; it is disabled for reduced-motion users. |

---

## 2. Brand Direction

| Element | Decision |
| --- | --- |
| Brand name | **AquaFarm** |
| Descriptor | **Smart Irrigation Management** (uppercase micro-subtitle under the wordmark) |
| Brand idea | "Technology for smarter and more efficient irrigation." |
| Personality | Trustworthy, grounded, precise, modern, quietly confident |
| Tone of voice | Plain, factual, second person ("your farm"), no hype, no exclamation marks, no emojis |
| Brand mark | Rounded-square green tile containing a droplet with a leaf base (inline SVG, also used for favicon and PWA icons) |
| Value line | **Monitor → Analyse → Recommend → Control → Save Water** |
| Photography direction | Real agricultural photography: irrigated crop rows, paddy, tomato, cotton, pump controls, field weather. Daylight, natural colour, no heavy filters, no people staring at camera, no cartoons. |

---

## 3. Visual Style

* **Layout:** card-based dashboard on a very light green-grey canvas (`#F6F8F6`); one primary hero surface; generous internal padding.
* **Surfaces:** white cards with a 1 px neutral border and a soft, low-spread shadow; no neumorphism, no glass panels over content, no gradients behind data.
* **Corners:** moderately rounded (12 px controls, 16 px cards, 20 px hero) — friendly but not toy-like.
* **Typography:** Inter only, tight display sizes with generous line height in body text; uppercase micro-labels with wide letter-spacing for metadata.
* **Colour usage:** green is structural (brand, success, water); amber and red appear only as state; blue is reserved for "information" and secondary metrics (temperature/humidity accents).
* **Iconography:** Font Awesome regular for passive affordances (bell), solid for active meaning (droplet, faucet, leaf, gauge).
* **Imagery:** used where it carries meaning (hero context, field identity, pump control, weather) and never as background noise behind text without a scrim.
* **What we deliberately avoid:** emoji, decorative illustrations, purple/indigo "AI" gradients, glassmorphism, dark mode by default, animated backgrounds, bouncy motion, more than two font weights above the fold.

---

## 4. Colour System

Colours are defined once as CSS custom properties in `:root` and consumed by name; no component invents its own hex value.

### 4.1 Brand greens

| Token | Hex | Use |
| --- | --- | --- |
| `--green-950` | `#07281E` | Deepest scrim base |
| `--green-900` | `#0B3B2E` | Footer background, chart tooltip background |
| `--green-800` | `#0F4C3A` | Brand tile, primary button hover, headings accent |
| `--green-700` | `#14624A` | Primary button base, links, icons |
| `--green-600` | `#1B7F5B` | Focus ring, chart primary line, pump-on track |
| `--green-500` | `#22996B` | Section heading bar, health ring fill |
| `--green-400` | `#4FB98B` | Tank fill top, borders on hover |
| `--green-300` | `#8DE0AC` | Live dot, status on dark surfaces |
| `--green-200` | `#C3ECD5` | Recommendation card border |
| `--green-100` | `#E4F3EA` | Active nav background, icon tiles |
| `--green-050` | `#F1F8F4` | Subtle section tint, chart fill |

### 4.2 Neutrals, beige and surfaces

| Token | Hex | Use |
| --- | --- | --- |
| `--beige-100` | `#FAF7F0` | Reserved warm surface (documented, available for future soil/earth accents) |
| `--beige-200` | `#F3EDE1` | Reserved |
| `--beige-300` | `#E6DCC8` | Reserved |
| `--gray-900` | `#1B2321` | Primary heading text |
| `--gray-800` | `#2B3634` | Emphasis text |
| `--gray-700` | `#3E4A47` | Body text |
| `--gray-600` | `#5A6763` | Secondary text, chart axis titles |
| `--gray-500` | `#5E6965` | Metadata text (darkened for AA contrast) |
| `--gray-400` | `#9AA5A1` | Placeholder text, decorative icon default |
| `--gray-300` | `#C9D2CE` | Strong borders, switch off state |
| `--gray-200` | `#DFE4E1` | Default border |
| `--gray-100` | `#EFF2F0` | Progress track, chip background |
| `--gray-050` | `#F7F9F8` | Sunken surface |
| Page background | `#F6F8F6` | Canvas |

### 4.3 Semantic state colours

| State | Text/border colour | Soft background | Used by |
| --- | --- | --- | --- |
| Success | `#1E8A5A` / text `#146B45` | `#E2F3EA` | Healthy field, sufficient tank, completed, positive delta |
| Warning | `#B87A0F` / text `#8A5A08` | `#FBF1DC` | Monitor, low tank, needs water (advisory), manual mode badge |
| Danger | `#B4443B` / text `#8F352D` | `#FBE9E7` | Critical alert, below threshold, stop-pump state |
| Information | `#2C6C97` / text `#23577C` | `#E6F0F7` | Running session, sensor info, imperial-neutral context |

### 4.4 Data-visualisation palette

| Series | Colour | Notes |
| --- | --- | --- |
| Soil moisture line | `#1B7F5B`, fill `rgba(34,153,107,0.16)` | Primary series |
| Threshold reference line | `#B87A0F`, dashed `6,4` | Never confused with data |
| Water usage bars | `#2E8B62`, hover `#1B7F5B`, radius 6 px | Single-series bar chart |
| Moisture progress fill | Gradient `#4E9BC4 → #2C6C97` | Blue-cool to distinguish from brand green |
| Temperature progress fill | Gradient `#E0A165 → #C2663F` | Warm |
| Humidity progress fill | Gradient `#74AAC6 → #356E92` | Cool |
| Tank fill | Gradient `#5FC08F → #1B7F5B` | Green = water available |
| Health ring | `#1B7F5B` ≥ 80, `#D9A32E` ≥ 65, `#B4443B` below | Mirrors severity semantics |

Contrast rule: every combination of text colour and background used in the UI meets 4.5:1 (normal text) or 3:1 (large text). Text placed over photographs is protected by a computed scrim, and the result is verified by pixel measurement, not by assumption.

---

## 5. Typography

| Property | Value |
| --- | --- |
| Family | **Inter** (vendored woff2, latin subset, weights 400/500/600/700, `font-display: swap`) |
| Fallback stack | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| Numerals | Tabular alignment for metrics and tables (`font-variant-numeric: tabular-nums` where alignment matters) |
| Heading letter-spacing | Tight (`-0.01em`, `-0.02em` for hero and metrics) |
| Micro-label letter-spacing | Wide (`0.04em`–`0.05em`) with uppercase |
| Body line-height | 1.6 (`--lh-body`) |
| Snug line-height | 1.35 for subtitles and metadata |
| Tight line-height | 1.2 for headings |
| Maximum measure | 68ch for explanatory paragraphs, 52–56ch for hero copy |

Rationale: Inter is a UI-first typeface with a tall x-height that stays legible on phones in daylight and at the small sizes used for metadata; a single family keeps the payload small (two weights loaded up front, two deferred).

---

## 6. Font Sizes

| Token | Size | Applied to |
| --- | --- | --- |
| `--fs-display` | 2rem (32 px) | Hero greeting (desktop) |
| `--fs-h1` | 1.75rem | (reserved, hero mobile uses 1.625–1.75rem) |
| `--fs-h2` | 1.25rem (20 px) | Section headings, modal titles |
| `--fs-h3` | 1.0625rem (17 px) | Card titles, field card titles, KPI metric labels |
| `--fs-h4` | 0.9375rem (15 px) | Alert titles, crop names, forecast temperatures |
| `--fs-body` | 0.9375rem (15 px) | Body copy, table cells, inputs |
| `--fs-sm` | 0.8125rem (13 px) | Subtitles, labels, buttons, metadata |
| `--fs-xs` | 0.75rem (12 px) | Helper text, chips, timestamps, badge text |
| `--fs-metric` | 2.25rem (36 px) | KPI values (tank readout uses the same scale) |
| Statistic value | 1.5rem (24 px) | Farm statistics strip |
| Table header | 0.75rem uppercase | Column labels |
| Minimum size anywhere | 0.5625rem (9 px) only inside the decorative tank tick marks | Never used for content |

Mobile adjustments: hero drops to 1.625rem, `--fs-metric` to 1.875rem, statistic values to 1.25rem, section headings to 1.125rem.

---

## 7. Font Weights

| Weight | Token | Usage |
| --- | --- | --- |
| 400 Regular | `--fw-regular` | Body copy, table cells, helper text |
| 500 Medium | `--fw-medium` | Labels, nav links, subtle emphasis, compact buttons |
| 600 Semibold | `--fw-semibold` | Headings, card titles, buttons, status text, values |
| 700 Bold | `--fw-bold` | Hero greeting, metric values, section numerals, uppercase micro-labels |

Rule: never bold more than one element in a line of body text; weight is used to rank information, and colour is used to classify it.

---

## 8. Spacing System

A 4 px base scale, expressed as tokens and used everywhere (no ad-hoc margins).

| Token | Value | Typical use |
| --- | --- | --- |
| `--sp-1` | 4 px | Inline gaps, icon-to-text in dense chips |
| `--sp-2` | 8 px | Chip padding, tight stacks, badge gaps |
| `--sp-3` | 12 px | Button internal gaps, list item gaps, form row gaps |
| `--sp-4` | 16 px | Card padding on small screens, grid gutters |
| `--sp-5` | 20 px | Card padding (default), section heading bottom margin |
| `--sp-6` | 24 px | Hero body padding, stack between major blocks |
| `--sp-7` | 32 px | Section vertical padding (top), hero padding on desktop |
| `--sp-8` | 40 px | Section separation, spacer sections |
| `--sp-9` | 56 px | Reserved for large hero/footer breathing room |

Layout rhythm: section padding `40px / 32px` on desktop and `32px / 24px` on mobile; cards are separated by a uniform 16 px gutter (`g-3`) and 24 px on large screens (`g-lg-4`). Vertical rhythm inside cards: title → 4 px → subtitle → 16–20 px → content → 20 px → footer/divider.

---

## 9. Border Radius

| Token | Value | Applied to |
| --- | --- | --- |
| `--r-xs` | 6 px | Ticks, small chips, focus ring on tiny targets |
| `--r-sm` | 8 px | Inputs, buttons, icon buttons, forecast items, segmented control |
| `--r-md` | 12 px | Card inner panels, alert rows, tank body, dropdowns, modals' inner blocks |
| `--r-lg` | 16 px | Cards, modal surface |
| `--r-xl` | 20 px | Hero surface |
| `--r-pill` | 999 px | Status tags, pills, progress tracks, switch track, avatar |

Rule: the radius grows with the size of the surface; a nested element never has a larger radius than its parent.

---

## 10. Shadows

| Token | Value | Applied to |
| --- | --- | --- |
| `--sh-xs` | `0 1px 2px rgba(14,40,30,0.05)` | Primary buttons, small chips |
| `--sh-sm` | `0 1px 3px rgba(14,40,30,0.07), 0 1px 2px rgba(14,40,30,0.04)` | Cards at rest |
| `--sh-md` | `0 6px 16px rgba(14,40,30,0.08)` | Cards on hover, hero surface |
| `--sh-lg` | `0 14px 36px rgba(14,40,30,0.12)` | Dropdown panels, modals, toasts |
| `--sh-focus` | `0 0 0 3px rgba(34,153,107,0.28)` | Focus ring on form controls |

Rules: shadows are green-tinted (never pure black) to match the brand; elevation implies interactivity (only hoverable surfaces rise); no shadow exceeds 36 px blur; the sticky header uses blur + border instead of a heavy shadow.

---

## 11. Buttons

| Variant | Base | Hover | Active | Disabled | Use |
| --- | --- | --- | --- | --- | --- |
| Primary | bg `--green-700`, white text, `--green-700` border | bg/border `--green-800` | bg `--green-900`, translateY(1px) | 55% opacity, no shadow, `not-allowed` | Start/save/schedule/refresh |
| Primary `.is-on` | bg `--danger` (stop state) | darker danger | — | — | Pump stop state across all shells |
| Ghost | white bg, `--gray-700` text, `--gray-300` border | `--green-050` bg, `--green-800` text, `--green-400` border | — | 55% opacity | Secondary actions: Clear, Cancel, Update Weather, Mark read |
| Subtle | `--green-050` bg, `--green-800` text | `--green-100` bg | — | — | View Details on cards |
| Danger (outline) | white bg, danger text, `#EBC8C4` border | `--danger-soft` bg | — | — | Destructive row actions (cancel schedule) |
| Hero ghost | translucent white (`rgba(255,255,255,0.10)`) over the hero image | `rgba(255,255,255,0.20)` | — | — | Turn Irrigation ON/OFF in the hero |

Geometry: height 42 px (36 px compact), horizontal padding 18 px (13 px compact), radius 8 px, font 13 px semibold, icon 0.875em with an 8 px gap. Buttons are `inline-flex`, never wrap their label, and always show a text label (icon-only buttons use an `aria-label`).

Button states: `is-loading` disables pointer events, dims to 85% and spins the leading icon; `.is-disabled`/`:disabled` is visually distinct and cursor-blocked. No button in the product is decorative.

---

## 12. Cards

Anatomy: `padding: 20px`, white surface, 1 px `--border`, radius 16 px, `--sh-sm`, hover `--sh-md`.

| Card type | Distinctive treatment |
| --- | --- |
| KPI card | Icon tile (42 px, soft tinted background per metric), status tag top-right, uppercase label, 36 px metric, progress track, hint line |
| Statistic card | Small icon tile (34 px), 24 px value, 12 px label — compact and dense |
| Control card | Header with status badge, target field selector, big switch panel, 2×2 metrics grid, footer image |
| Recommendation card | Light green gradient (`--green-050 → white`), green border, icon tile, headline, reasoning, 2-up metric panel, actions, dashed-top disclaimer |
| Tank card | Split layout: animated tank left, large percentage + facts right |
| Field card | Edge-to-edge image with overlay badges and field name plate, body with 2×2 facts, footer with health tag and View Details |
| Crop card | 76 px thumbnail, name, 2×2 facts, status tag + link |
| Chart card | Header with inline control (period selector), chart canvas, summary strip separated by a top border |
| Health card | Ring + four labelled progress bars + methodology note |
| Weather card | Image overlay panel + facts list + forecast row + planning note |
| Alert policy card | Four rule rows with severity tiles + notification toggle |
| Sensor card | Node list with status tags and an error state when offline |
| Legal/help cards | Prose-oriented, generous spacing, step numerals or accordion |

Card rules: cards never nest more than one level; a card has one `h3` title; cards in a row stretch to equal height only when their content is comparable (`card--fit` opts out for prose/forms); media always bleeds to the card edge with matching bottom radius.

---

## 13. Forms

* Single-column stacks by default; two-column rows only on ≥ 992 px.
* Vertical rhythm: label (13 px, medium) → 6 px → control → 6 px → helper text (12 px) → error (12 px, danger).
* Required fields show a red asterisk that is `aria-hidden` (the `required` attribute carries the semantics).
* Helper text explains the rule (`Between 1 and 180 minutes.`), not the format.
* Errors are inline, specific and icon-prefixed; the first invalid control receives focus on submit.
* `novalidate` is set on forms so native bubbles never appear — messaging is consistent across browsers.
* Danger states: red border plus a pale red field tint, never colour alone.
* Sticky or floating submit bars are **not** used (an earlier sticky actions bar was removed because it covered inputs on short screens).
* Success feedback: a toast plus an inline "Saved HH:MM" stamp next to the section heading.
* Form width is capped for readability; number inputs use `step` and range inputs are paired with a number field for precision.

---

## 14. Inputs

| Control | Height | Border | Radius | Focus | Notes |
| --- | --- | --- | --- | --- | --- |
| Text / number / date / time | 42 px (36 px compact) | 1 px `--border-strong`, white bg | 8 px | border `--green-600` + `--sh-focus` | Padding 9–12 px, 13 px text |
| Search | 36 px | as above | 8 px | as above | Has a persistent `<label>` ("Search") |
| Range slider | 20 px track hit area | 6 px track, `--gray-200` | pill track | thumb ring on focus | Paired with a number input, both stay in sync |
| Switch | 40 × 22 px (46 × 26 px large) | 1 px border | pill | `--sh-focus` | Off: `--gray-200`; On: `--green-600`; label always present |
| Native select | 42 px | chevron drawn as an inline SVG data URI | 8 px | as above | Long option text ellipsises, never wraps |
| Placeholder | — | — | — | — | Used only for the search hint; never as a label |

Disabled controls use `--gray-100` backgrounds and a `not-allowed` cursor, and are only disabled when the reason is visible (for example the target-field selector while the pump runs, with a tooltip explaining why).

---

## 15. Dropdowns

* **Select elements** (target field, period, filters, units, speed): native controls for platform-correct behaviour on mobile, styled to match inputs. Options list field name, crop and area so the choice is unambiguous.
* **Menu panels** (notification bell, profile menu): 320 px minimum width, radius 12 px, `--sh-lg`, header row with a title and a text action, scrollable body (max 320 px tall), footer row with a link; items are 40 px tall with a 16 px icon gutter.
* **Notification panel items:** severity tile, title, one-line summary, relative time; read items have a muted surface (never opacity on text).
* **Profile menu:** signed-in identity header, three navigation items, divider, then export and reset actions.
* Behaviour: click to open, outside click or `Esc` to close, `aria-expanded` maintained by Bootstrap's dropdown, focus returns to the trigger.

---

## 16. Navigation

* Six text-plus-icon links in a single row, 40 px tall, radius 8 px.
* Default: `--gray-700` text with `--gray-400` icons; hover: `--green-050` background, `--green-800` text, `--green-600` icon.
* Active (`is-active`): `--green-100` background, `--green-900` semibold text, `--green-600` icon — plus a 3 px inset green bar on mobile.
* Scroll-spy keeps exactly one link active; the Alerts link carries an unread badge.
* Mobile (≤ 899.98 px): the row becomes a full-width disclosure panel below the header, animated with a 12 px rise and fade, with a dimming backdrop; links are 48 px tall for touch; the panel closes on selection, backdrop click or `Esc`.
* Keyboard: standard tab order, visible focus, skip link first.

---

## 17. Header

* Sticky, `z-index: 1030`, 68 px tall, translucent white (`rgba(255,255,255,0.94)`) with a 10 px backdrop blur and a 1 px bottom border; no heavy shadow.
* Three zones: brand (mark + wordmark + uppercase descriptor), navigation (centred-left), actions (bell, profile, hamburger).
* Brand mark: 40 px rounded-square inline SVG (droplet over a leaf) — the same artwork as the favicon, so the tab and the app match.
* Wordmark: 18 px bold, `--green-900`, `-0.015em` tracking; descriptor 11 px uppercase `--gray-500` (hidden below 1200 px to protect the wordmark).
* Bell: 42 px icon button with a red dot when unread and a count chip capped at "9+".
* Profile chip: avatar (34 px circle, `RK`, `--green-700`), name 13 px semibold, role 12 px muted, chevron; collapses to avatar-only under 900 px.
* A thin indeterminate progress bar appears directly under the header during a data refresh.
* Scroll behaviour: the header stays; anchor targets respect `scroll-margin-top` so headings are never hidden.

---

## 18. Footer

* Deep green surface (`--green-900`), light text, 40 px vertical padding, three columns on desktop and a single stack on mobile.
* Column 1: brand mark, "AquaFarm — Smart Irrigation Management", tagline "Technology for smarter and more efficient irrigation."
* Column 2: navigation — Dashboard, Analytics, Settings, Help.
* Column 3: simulated-data note, legal links (Privacy Policy · Terms & Conditions · Cookie Preferences) and "© 2026 AquaFarm. All rights reserved."
* Legal links open dialogs; there are no external links in the footer (no invented social accounts).
* Contrast: body text `#A9C4B7` on `#0B3B2E` (≥ 4.5:1); links brighten on hover.

---

## 19. Hero Section

* Full-width rounded surface (radius 20 px) with a licensed field photograph, `object-position: center 62%` so the crop rows read as rows rather than sky.
* Two scrim layers: a vertical gradient for global legibility and a horizontal gradient that darkens the left third where the text sits, plus one additional left-biased radial scrim behind the text block. Measured result: **10–14:1** contrast for the greeting, subtitle and timestamp.
* Content order: status pills → `h1` greeting → subtitle → (divider) → last updated + sensor source | Refresh Data + Turn Irrigation ON/OFF.
* The two CTAs sit above the fold on every breakpoint and stack full-width on phones.
* The greeting is time-aware ("Good Morning/Afternoon/Evening"), personal ("Ravi"), and never uses an emoji.
* Hero is the only place where white text on photography is used; every other surface uses solid colours.

---

## 20. CTA Sections

| CTA cluster | Placement | Visual treatment |
| --- | --- | --- |
| Refresh + Pump toggle | Hero, right side (stacks on mobile) | Primary filled + hero-ghost outline |
| Pump switch + mode | Irrigation Control card centre | Large switch panel on a sunken surface — the biggest interactive target in the product |
| Recommendation actions | Recommendation card, below the metrics | Primary "Start Irrigation" + ghost "Ignore" |
| Schedule submit + Clear | Schedule form footer | Primary + ghost |
| Alerts bulk action | Alerts card header | Ghost compact |
| Settings save + reset | Settings form footer | Primary + ghost |
| Mobile sticky bar | Bottom, all mobile viewports | Compact status + two compact buttons (icon-only under 576 px with accessible labels) |

Rules: no more than one filled primary button per card; destructive actions are never primary except the pump stop state (where stopping is the safe action); CTA text is a verb phrase of two to three words.

---

## 21. Page Layouts

* Single document, eight vertically stacked sections, each with a left green accent bar in its heading.
* Container: max width 1320 px, centred, 20 px side padding (16 px on mobile).
* Section rhythm: 40 px top padding, 32 px bottom; the hero section uses 24 px top.
* Grid: Bootstrap 12-column with `g-3` gutters (16 px) and `g-lg-4` (24 px) on large screens.
* Column patterns actually used:
  * KPI row: `12 / 6 / 3` (mobile / small+ / xl)
  * Statistics row: `6 / 3`
  * Irrigation: `7 / 5` on xl, stacked below
  * Schedule + activity: `5 / 7` on xl
  * Fields and crops: `12 / 6 / 4`
  * Analytics: `7 / 5` then `5 / 7` for visual alternation
  * Alerts: `7 / 5`
  * Settings: `8 / 4`
  * Help: `7 / 5`

---

## 22. Section Layouts

| Section | Layout logic |
| --- | --- |
| Dashboard | Hero (full width) → 4 KPI cards → 4 statistic cards |
| Irrigation | Two columns: control card on the left (wider), and a right stack of recommendation + tank |
| Schedule & Activity | Form on the left, list above table on the right; the table spans the right column so long rows stay readable |
| Fields | 3 field cards, then a spaced heading and 3 crop cards |
| Analytics | Row 1: moisture chart (7) + water chart (5). Row 2: health score (5) + weather (7) |
| Alerts | Alert list (7) + right stack of alert rules and sensor network (5) |
| Settings | Form (8) + right stack of simulation and storage panels (4) |
| Help | Steps card (7) + right stack of FAQ and contact (5) |

Every section has: an `h2` heading with an accent bar, optional one-line intro (only where the content needs framing), and a clear bottom boundary (spacing, not rules).

---

## 23. Mobile Layout

* Single column everywhere; KPI cards stack with 12 px gaps; statistics stay 2-up for quick scanning.
* Hero: 16 px padding, 26 px greeting, full-width buttons, pills wrap to two lines.
* Pump switch panel: switch and label stack vertically; the label grows to 15 px; the switch remains the largest target.
* Tank: vertical layout with the illustration centred, readout below, facts left-aligned.
* Activity table: converts to labelled cards (`data-label` rendered as a small uppercase label beside each value) so no cell loses context.
* Schedule items: stack vertically with the action row moved below the text.
* Alerts: severity tile above the body; action buttons in one row beneath.
* Charts: full width, 260–300 px tall, axis labels thinned automatically by Chart.js.
* Filters: full-width rows, buttons wrap.
* Sticky action bar: pump status chip + soil hint on the left, Refresh + Start/Stop on the right; body padding reserves 78 px so nothing is hidden.
* Touch targets: 42 px minimum; the sticky bar buttons remain 36 px high with 8 px separation.

---

## 24. Tablet Layout

* Two-column card grids (KPI 2-up, fields 2-up, crops 2-up).
* Navigation collapses to the hamburger at ≤ 899.98 px; the sticky mobile bar appears at ≤ 991.98 px.
* Charts take the full content width, stacked (moisture, then water, then health, then weather).
* Forms use two-column rows at ≥ 576 px (date/time and duration/mode pairs).
* Field dialogs use the large modal size with a full-width chart and three footer actions.

---

## 25. Desktop Layout

* Full navigation with icons and labels; profile chip shows name and role.
* Multi-column dashboard: 4-up KPIs, 4-up statistics, 7/5 primary grids, 7/5 and 5/7 analytics rows.
* Charts render at 300–340 px height with a summary strip of three metrics beneath.
* Tables show full rows with sticky header cells inside the scroll container.
* Hover states are available and used (card elevation, row tint, nav tint); focus states remain visible for keyboard users.
* Maximum content width 1320 px keeps line lengths comfortable on ultra-wide monitors.

---

## 26. Responsive Breakpoints

| Name | Range | Key changes |
| --- | --- | --- |
| Small phone | ≤ 374.98 px | Hero 1.4rem; segmented control goes full width |
| Phone | ≤ 575.98 px | KPI 1-up; statistics 2-up; field facts 1-up; crop thumb fixed 64 px; tank centred; sticky buttons icon-only |
| Large phone / small tablet | 576–767.98 px | KPI 2-up; schedule action labels appear; two-column form rows |
| Tablet | 768–899.98 px | 2-up card grids; single-column control grid; weather stacks |
| Small laptop | 900–1199.98 px | Full navigation returns; profile meta hidden; two-column page grids |
| Laptop | 1200–1399.98 px | Full navigation typography; brand descriptor visible again |
| Desktop | ≥ 1400 px | Maximum multi-column layout |

Breakpoint rules: layout changes between breakpoints, never within one; the mobile action bar and hamburger have non-overlapping ranges (hamburger ≤ 899.98 px, action bar ≤ 991.98 px) so every viewport has a working control shell; charts and images are fluid and never fixed-width; no layout relies on hover.

---

## 27. Components

| Component | Elements | States implemented |
| --- | --- | --- |
| Brand | Mark (SVG), wordmark, descriptor | Default, hover (link colour) |
| Nav link | Icon + label (+ badge) | Default, hover, active, focus |
| Icon button (bell) | Icon, dot, count chip | Default, hover, unread, focus |
| Profile chip | Avatar, name, role, chevron | Default, hover, expanded |
| Hamburger | Three bars | Collapsed, expanded (bars animate to an X) |
| Pill | Dot + text (live), icon + text (demo) | Live, paused/muted |
| Status tag | Dot + text, five tones, three sizes | Success, warning, danger, info, neutral |
| Severity chip | Uppercase label with tone | Four severities |
| Badge (status/mode) | Icon + text or text only | Completed, Running, Scheduled, Stopped; Manual, Automatic, Scheduled |
| KPI card | Icon tile, status, label, value, unit, progress, hint | Live, stale (outage) |
| Statistic card | Icon tile, value, unit, label | Default |
| Progress track | Track + gradient fill | Moisture, temperature, humidity, tank |
| Pump switch | Track, thumb, label | Off, on, hover, busy ring, focus |
| Segmented control | Three buttons | Default, hover, active, focus |
| Metric inline | Value + unit | Default, running (flow > 0) |
| Recommendation | Icon, headline, reasoning, metrics, actions, disclaimer | Recommended, required (escalated), sufficient, dismissed |
| Water tank | Gauge, water column, ticks, base, readout, facts | Idle, flowing, low, critical |
| Schedule item | When, body, status, actions | Scheduled, completed |
| Data table | Header, rows, badges, numeric cells | Default, hover row, stacked cards on mobile |
| Field card | Image overlay, badges, facts, footer | Healthy, needs water, monitor; irrigating |
| Crop card | Thumbnail, facts, status | Optimal, low, high |
| Chart card | Header control, canvas, loader, summary | Loading, ready, empty (library missing) |
| Health ring | Track, value arc, score, unit, sub-bars | Green/amber/red thresholds |
| Weather panel | Image overlay, facts, forecast, note | Default, refreshing, outage |
| Alert row | Severity tile, title, chip, text, meta, actions | Unread, read, four severities |
| Sensor row | Node name, status tag | Online, irrigating, offline |
| Toggle row | Label, help, switch | On, off, disabled |
| Toast | Icon, title, text, close | Success, error, warning, info; entering, passive, leaving |
| Modal | Header, subtitle, body, footer | Default, scrolling, close by Esc |
| Empty state | Icon disc, title, text, optional action | Schedules, alerts (3 variants), activity (2), fields, sensors |
| Error state | Icon disc, title, text, retry action | Sensor outage |
| Skeleton / loader | Shimmer block, spinner overlay | Initial load, chart load, range change |

---

## 28. Component States

Universal state contract:

| State | Requirement |
| --- | --- |
| Default | Fully legible with no interaction |
| Hover | Background or border shift with a short transition; never the only affordance for an action |
| Focus-visible | 2 px outline in `--green-600` at 2 px offset (or the shared focus ring on form controls) |
| Active/pressed | 1 px downward translation or a darker shade |
| Selected/current | Persistent background + weight change (nav, segmented control, filters) |
| Disabled | 55% opacity, `not-allowed` cursor, and the reason is discoverable (tooltip or helper text) |
| Loading | Spinner, animated icon or overlay; interaction blocked only while truly busy |
| Success | Green tone + text label (never colour alone) |
| Warning | Amber tone + label |
| Error | Red tone + inline message; focus moved to the field |
| Empty | Distinct empty-state block with an explanation and a next step |
| Read/dismissed | Muted surface and lighter title weight (never reduced opacity on text) |

---

## 29. Hover States

| Element | Hover change | Transition |
| --- | --- | --- |
| Card | `--sh-sm → --sh-md` | 200 ms |
| Primary button | Background `#14624A → #0F4C3A` | 130 ms |
| Ghost button | Background → `--green-050`, border → `--green-400` | 130 ms |
| Nav link | Background → `--green-050`, icon → `--green-600` | 130 ms |
| Table row | Background → `--green-050` | 130 ms |
| Alert row | Background → `--gray-050` | 130 ms |
| Schedule item | Background → white, left border → `--green-600` | 130 ms |
| Chart point | Radius 0 → 5 px with a dark green tooltip | Chart-managed |
| Icon button | Background → `--green-050`, border → `--green-300` | 130 ms |
| Pump switch | Track darkens one step | 200 ms |
| Segmented option | Text → `--green-800`, background → translucent white | 130 ms |

Hover is never required to complete a task (all actions are click- or keyboard-triggered).

---

## 30. Focus States

* Global rule: `:focus-visible { outline: 2px solid #1B7F5B; outline-offset: 2px; border-radius: 6px; }`
* Form controls keep the ring and add `box-shadow: 0 0 0 3px rgba(34,153,107,0.28)` plus a `--green-600` border.
* Range thumb shows a ring on focus; switch and checkbox show the shared focus shadow.
* The skip link moves from `top: -100px` to `top: 0` on focus, revealing a dark green bar.
* Chart canvases are not focusable (they are images with labels); the surrounding data is available as text.
* Focus is never removed, and focus order follows the visual order in every section.
* Modals: focus is moved into the dialog on open (Bootstrap), returns to the trigger on close, and `Esc` closes.

---

## 31. Active States

* Nav link: `--green-100` background, `--green-900` semibold text, `--green-600` icon; mobile adds a 3 px inset left bar.
* Segmented control: white pill with shadow, `--green-900` semibold text, `aria-pressed="true"`.
* Filter selects show the chosen value in the control; the record count chip reflects the filtered set.
* Pump switch on state: `--green-600` track, thumb translated 36 px, label flips to "Turn Irrigation OFF", and every mirrored control (hero, mobile bar, dialog) shows "Stop".
* Tables: the running session is highlighted with an info status badge and remains in the table until completed.
* Alerts: unread rows carry an "Unread" chip and a stronger title weight; read rows carry none.

---

## 32. Disabled States

| Control | When disabled | Visual | Explanation shown |
| --- | --- | --- | --- |
| Target field selector | While the pump runs | Grey background, `not-allowed` cursor | `title` explains "Stop the pump before changing the target field" |
| Submit buttons | During an in-flight save | 85% opacity + spinner, pointer events off | Button label carries a verb ("Saving…" is implied by the spinner) |
| Start Irrigation | When moisture is sufficient | Hidden rather than disabled | The card states moisture is sufficient |
| Simulation speed | Never | — | — |
| Switch controls | Never | — | All switches are always operable |

Rule: disabled is used only when an action is temporarily impossible **and** the reason is visible. Capabilities are never removed silently.

---

## 33. Loading States

| Surface | Treatment | Duration |
| --- | --- | --- |
| Page init | 260 ms skeleton window, values render together; loading overlay removed without a flash | < 0.5 s |
| Refresh buttons | Spinning rotate icon + heading indeterminate bar | ~0.6 s |
| Chart first render | Card overlay with spinner and label ("Loading soil moisture history") | Until first paint |
| Chart range change | Overlay re-shown with "Updating soil moisture history" | ~0.35 s |
| Update Weather | Spinning icon, values refresh | ~0.7 s |
| Save settings / schedule | Button spinner | ~0.5 s |
| Pump switch | Animated ring around the track | ~0.4 s |

Rules: loading indicators never appear for actions that are instant; values are never partially updated (a render pass updates a whole surface); and every loading state has a visible end state.

---

## 34. Empty States

Composition: an icon disc (46 px, white with border), a short title (15 px semibold), one to two lines of explanation (13 px, max 46ch), and an optional action button. Dashed 1 px border, `--gray-050` surface, 32 px padding, centred.

| Empty state | Title | Message | Action |
| --- | --- | --- | --- |
| Schedules | No irrigation scheduled | Use the schedule form to plan the next irrigation session for one of your fields. | — (form is adjacent) |
| Activity (no data) | No irrigation history | Irrigation sessions you start or schedule will appear here with duration, water used and mode. | — |
| Activity (filtered) | No matching records | No irrigation activity matches the current filters. Try clearing the search or selecting another field. | — |
| Alerts (all) | No alerts | Nothing needs your attention right now. New alerts appear here when a simulated threshold is crossed. | — |
| Alerts (unread) | No unread alerts | Every alert has been reviewed. | — |
| Alerts (severity) | No <severity> alerts | No alerts of this severity have been raised in this session. | — |
| Fields (outage) | Field data unavailable | Field records could not be loaded. Try refreshing the dashboard to receive the latest simulated readings. | Retry |
| Sensors (outage) | No sensor data available | Try refreshing the dashboard to receive the latest simulated readings. | Refresh now |
| Notification panel | No notifications yet | — | — |

Rules: empty states never blame the user, never show a spinner, always state what will appear there, and are announced politely where the region is dynamic.

---

## 35. Error States

* **Inline field error:** danger text with an icon glyph (via CSS `::before` on `.field__error`), placed directly under the control; the control receives a red border and pale tint. The first error is focused on submit.
* **Block error state:** same composition as an empty state but with a danger-tinted border/surface and a retry action (used for the sensor outage).
* **Toast error:** danger left border, danger icon, title + explanation; errors are shown even when the notifications switch is off.
* **Global error copy rules:** say what happened, say what to do, name the object ("The simulated sensor gateway is offline"), never expose stack traces, file names, library names or storage internals.
* **Prevention over messaging:** the empty-tank start and outage start are blocked before state changes, so a "failure" never leaves the UI in an ambiguous state.
* **Error tone:** the danger palette is desaturated (`#B4443B` on `#FBE9E7`) so a warning reads as serious without alarming the user in a farm context.

---

## 36. Animations

| Animation | Definition | Applied to |
| --- | --- | --- |
| `spin` | 360° rotation, 800–900 ms linear | Button icons while loading, spinners |
| `pulse` | Expanding ring, 2000 ms infinite | Live simulation dot |
| `wave` | Water surface translate/scale, 3200 ms (1500 ms while flowing) | Tank water surface |
| `shimmer` | Background position sweep, 1400 ms | Skeleton blocks |
| `toast-in` | Fade + 12 px rise + 0.98 scale, 240 ms | Toasts entering |
| `toast-out` | Fade + 16 px slide, 200 ms | Toasts leaving |
| `indeterminate` | Translate + scale sweep, 1200 ms | Header progress bar |
| Progress fill | Width transition, 600 ms cubic-bezier(0.2, 0.7, 0.3, 1) | KPI progress tracks |
| Tank fill | Height transition, 900 ms same curve | Water column |
| Health ring | `stroke-dashoffset` transition, 900 ms | Score arc |
| Score bars | Width transition, 800 ms | Health sub-scores |
| Card elevation | Box-shadow, 200 ms | Hover on interactive cards |
| Chart draw | Chart.js default 600 ms, disabled for reduced motion | Both charts |
| Counters / values | Text swap only (no count-up animation) so numbers are readable immediately | KPIs, session water |

Motion rules: no animation exceeds 900 ms except ambient loops (pulse, wave) which are decorative and low-contrast; nothing animates continuously in the user's peripheral vision except the small live dot and the tank surface; all of it is disabled under `prefers-reduced-motion`.

---

## 37. Page Transitions

Single-document application, so transitions are section-level and immediate:

* **Section navigation:** smooth-scroll (`scroll-behavior: smooth`) with `scroll-margin-top` compensation for the sticky header; under reduced motion this becomes an instant jump.
* **No route transitions, no full-page fades.** A fade between sections would delay information access and is explicitly avoided.
* **Reveal behaviour:** content is present at load; there is no scroll-triggered reveal animation on data surfaces (scrolling must never be required to see a value that a farmer needs).
* **Mobile navigation:** the panel rises 12 px and fades in over 200 ms; the backdrop fades in with it.
* **Modals:** Bootstrap's fade, then content appears; the field dialog creates its chart *after* the `shown` event so the canvas has real dimensions.
* **Toasts:** enter from the bottom-right (or bottom on mobile), stack upward, and leave to the right; the stack is capped at three.

---

## 38. Image Guidelines

| Rule | Detail |
| --- | --- |
| Subject relevance | Field imagery for fields (rice paddy, tomato rows, cotton boll), pump control hardware for irrigation, sky/landscape for weather, irrigated rows for the hero |
| Quality | Licensed photographs only (public domain, CC0, CC BY-SA with attribution in the README); no watermarks, no lens artefacts, no distorted crops |
| No cartoons or illustrations | Photography only; the brand mark is the single vector graphic |
| No emoji as imagery | Enforced product-wide |
| Cropping | Cropped to intentional focal points: hero 16:9 on the crop rows, field cards 16:9 with the horizon high, thumbs 4:3 centred on the plant |
| Aspect ratios | Hero 1920×1080, section images 1200×675, thumbs 400×300, OG 1200×630, icons 1:1 |
| Encoding | Progressive JPEG, quality 76–84, `subsampling=1` for photographs, `optimize=True`; PNG only for the brand mark icons |
| Budgets | Hero ≤ 350 KB (actual 308 KB), section images ≤ 300 KB (76–284 KB), thumbs ≤ 70 KB (18–40 KB), OG ≤ 150 KB (146 KB) |
| Loading | Hero preloaded with high fetch priority; all other images lazy with async decoding |
| Layout stability | Every `<img>` declares width and height; containers use `object-fit: cover` |
| Text over images | Only the hero and the weather panel, each with a computed scrim and verified contrast (hero ≈ 10–14:1; weather ≈ 5:1 and 6.6:1) |
| Alt text | Descriptive and specific: "Irrigated crop rows on a green farm field under an open sky"; decorative brand marks are `aria-hidden` |
| Consistency | One photographic treatment (natural daylight); no mixed filters or duotones |
| Provenance | Every used image is credited in `irrigation-dashboard/README.md` with title, author and licence |

---

## 39. Icon Guidelines

* Icon set: **Font Awesome 6 Free** (solid + regular), vendored locally as woff2 with a ttf fallback; no external icon requests.
* Sizing: 0.85–1.1em relative to the adjacent text; icon buttons are 42×42 px with a ~16 px glyph.
* Meaning mapping (fixed, never reused for a different concept):

| Concept | Icon |
| --- | --- |
| Dashboard | `fa-gauge-high` |
| Fields | `fa-map` |
| Irrigation | `fa-faucet-drip` |
| Analytics | `fa-chart-line` |
| Alerts | `fa-triangle-exclamation` |
| Settings | `fa-gear` |
| Soil moisture | `fa-droplet` |
| Temperature | `fa-temperature-half` |
| Humidity | `fa-water` |
| Water tank | `fa-glass-water` |
| Notifications | `fa-bell` (regular) |
| Sensor node | `fa-tower-broadcast` |
| Severity critical / warning / success / info | `fa-circle-exclamation` / `fa-triangle-exclamation` / `fa-circle-check` / `fa-circle-info` |
| Status Running | `fa-satellite-dish` |
| Schedule | `fa-calendar-plus`, `fa-clock`, `fa-calendar` |
| Export / reset / clear | `fa-file-arrow-down`, `fa-rotate-left`, `fa-trash-can` |

* Rules: icons never replace a required text label where the label carries meaning (status, mode and severity always pair icon + text); purely decorative icons are `aria-hidden="true"`; brand marks and illustrations are inline SVG with `aria-hidden` or a `role="img"` + title; no icon fonts are used as a substitute for images; icons never carry meaning alone in a chart legend.

---

## 40. Accessibility

Implementation summary (target WCAG 2.1 AA, verified with `axe-core`: **0 violations**):

* **Structure:** `header`, `nav`, `main`, eight `section`s, `article` per card, `footer`; one `h1`; sequential headings; a `table` with `caption` and `scope="col"` headers.
* **Skip link:** first focusable element, becomes visible on focus.
* **Keyboard:** all controls are native elements; the pump switch is `button[role=switch]` with `aria-checked`; segmented options use `aria-pressed`; `Esc` closes the mobile nav and modals; no keyboard trap anywhere.
* **Focus visibility:** global `:focus-visible` rule plus a focus ring on form controls; never suppressed.
* **Names and values:** every input has a persistent label; icon-only buttons carry `aria-label`; progress bars expose `aria-valuenow`/`min`/`max`; the tank carries a text alternative describing the level; charts carry `role="img"` and a descriptive `aria-label`, with the same information repeated in text summaries.
* **Live regions:** toast region, alert list, save state and chart loaders announce politely; alerts are not announced aggressively (no `assertive` interruptions).
* **Colour independence:** all statuses pair an icon and/or a word with colour; severities show both a coloured tile and the severity name; the read/unread distinction uses surface and weight, not opacity.
* **Contrast:** text tokens are tuned to ≥ 4.5:1; metadata was darkened specifically to pass (for example `--gray-500` was moved from `#77837F` to `#5E6965`); text over photographs is scrim-protected and measured from rendered pixels.
* **Reduced motion:** animations collapse to ~0 ms; the tank fill transition is removed; smooth scrolling becomes instant.
* **Zoom and text scaling:** layout is fluid to 200% zoom; no fixed pixel heights on text containers that would clip content.
* **Touch:** targets ≥ 42 px, with the primary pump control considerably larger.
* **Forms:** errors are text plus icon, positioned adjacent to the field, with the first invalid field focused; no colour-only error indication.
* **Media:** meaningful alt text on all content images; decorative marks hidden.
* **Consistency:** identical controls behave identically across all shells (the pump control appears in four places and announces the same state everywhere).

---

## 41. Visual Hierarchy

Four deliberate levels:

1. **Immediate (always visible without scrolling):** hero greeting and status pills, the four KPI values, pump status badge, primary CTAs.
2. **Decision support:** recommendation card, tank readout, field status badges, alerts with unread counts.
3. **Analysis:** both charts, health score, weekly water summary, activity table.
4. **Administration:** settings, simulation controls, legal dialogs, help content.

Within a card: status badge (top-right) → title → metric → supporting detail. Type size, weight and colour carry the hierarchy; borders and dividers are used sparingly (only between a card body and its footer/summary) so the interface stays calm.

---

## 42. Content Hierarchy

| Level | Content | Treatment |
| --- | --- | --- |
| Product | AquaFarm — Smart Irrigation Management | Wordmark + uppercase descriptor |
| Orientation | Greeting + purpose line + data freshness | Hero `h1` and subtitle |
| Section | Eight `h2` headings ("Farm Overview", "Irrigation Control", …) | 20 px semibold with an accent bar |
| Card | `h3` titles ("Irrigation Pump", "Smart Irrigation Recommendation", …) | 17 px semibold + 13 px subtitle |
| Item | Field names, crop names, alert titles | 15 px semibold |
| Detail | Labels and values (Area, Soil Moisture, Target Range, Sensor) | 12–13 px label + 15 px semibold value |
| Meta | Timestamps, units, helper text, disclaimers | 12 px, muted (`--gray-500`) |

Copy rules: sentence case for labels and buttons, no ALL CAPS except micro-labels, numbers always with units, no exclamation marks, no emojis, and no sentence longer than ~25 words in the primary surfaces.

---

## 43. CTA Placement

| Zone | CTAs | Rationale |
| --- | --- | --- |
| Hero (above the fold) | Refresh Data, Turn Irrigation ON/OFF | The two actions a farmer needs before anything else |
| Irrigation Control (primary workspace) | Big pump switch, target field, mode segmented control | Deliberately the largest target in the product |
| Recommendation card | Start Irrigation, Ignore | Convert advice into action in one tap |
| Schedule card | Schedule Irrigation, Clear | Completing planning work |
| Activity table | (Filters and search only) | Deliberately read-only: logs are not editable |
| Alerts | Mark read, Mark all as read, Dismiss | Triage without leaving the panel |
| Settings | Save Settings, Reset to Defaults | One clear commit point |
| Sticky mobile bar | Refresh, Start/Stop Pump (+ status) | One-handed operation while walking |

Placement rules: primary CTAs are top-left or right-aligned within their card footer; only one filled button per card; destructive actions (cancel schedule, clear saved data) require either a distinct style or a confirmation step; no CTA sits where it can be mistaken for a heading.

---

## 44. Form UX

* **One decision per row** on mobile; two related fields per row on tablet and above.
* **Labels above controls**, always visible, never placeholder-only.
* **Defaults are sensible:** date = today, time = 06:30, duration = 20, mode = Scheduled, field = the dry field (Field B) so demoing is a single tap.
* **Validation timing:** on submit (not while typing), then live-corrected once a field has been marked invalid; inputs clear their error as soon as the value becomes valid.
* **Validation messaging:** names the constraint and the range, not the code ("Duration must be between 1 and 180 minutes").
* **Duplicate protection:** the schedule form explicitly blocks two tasks for the same field at the same minute and explains why.
* **Range plus precision:** the threshold uses a slider paired with a number input so both quick adjustment and exact entry are possible.
* **Irreversible actions:** reset uses a two-step confirm ("Click the reset button again within 5 seconds") rather than a modal, because the action is local and quickly reconstructible.
* **Feedback loops:** every submit ends in either an inline error with focus management or a toast plus a persistent record change; no form ever "succeeds" silently.
* **Storage honesty:** forms state where data is stored ("Schedules are stored in this browser only.").
* **Accessibility:** `required`, `aria-describedby`, `role="alert"` on error paragraphs, and `aria-live` on save state.

---

## 45. Admin Dashboard UI

There is no separate admin application (see `PRD.md` §19). For this product the "admin" surface is the **Settings** section plus the **Data & Simulation** and **Stored Data** panels, and it must look and behave like a first-class part of the dashboard:

* **Layout:** 8/4 split on desktop — configuration form on the left, operational panels on the right; single column below 1200 px.
* **Form panel:** grouped rows with helper text, an inline saved stamp ("Saved 09:42") beside the heading, and a primary Save plus a ghost Reset.
* **Simulation panel:** speed selector, pause switch, outage switch, and a facts block (updates this session, next update countdown, data source "Simulated").
* **Storage panel:** a definition list showing exactly what is stored, plus Export JSON and Clear saved data.
* **Visual consistency:** the same card, label, switch and button components as the rest of the dashboard — administration is not a visually separate, lower-quality area.
* **Honesty:** no fake "user management", no fake audit log, no fake roles; the panels describe what the application really does.
* **States:** validation errors under the offending field, "Not saved" state on failure, success toast and stamp on save, and an explanatory warning if storage is blocked.

---

## 46. Admin Tables

The only tabular surface is **Recent Irrigation Activity**, and it is intentionally read-only (records are event-sourced from real sessions, never hand-edited).

* Sticky uppercase header row on a sunken background; 13 px body text; 12 px row padding.
* Columns: Date (medium weight, no-wrap), Field (icon + name), Duration (tabular numerals), Water Used (tabular numerals with unit), Mode (badge), Status (badge with icon).
* Row hover tint `--green-050`; the running session is identifiable by its info badge.
* Container: 1 px border, radius 12 px, horizontal scroll on narrow screens.
* Mobile: the table transforms into labelled cards — each cell keeps its column label via `data-label`, so a single-column view never loses meaning.
* Empty and filtered-empty states are separate and worded specifically (see §34).
* Filters sit in a wrapping row above the table: field select, status select, and a search input with a persistent label; the record count chip sits in the card header.
* Rules: no inline editing, no row actions that pretend to persist, no pagination theatre (the dataset is bounded at 80 records).

The **schedule list** plays the role of a manageable table: each row is a stacked surface with when/body/status/actions, and the only mutations (Start now, Cancel) really do change stored state.

---

## 47. Admin Forms

Administrative input is limited to the Settings form and the schedule form, and both follow the standard form UX (§44). Additional rules for administrative input:

* **Range safety:** threshold 15–60%; tank capacity 1,000–20,000 L. Values outside the range are rejected with a visible reason, and the rule engine is additionally defensive (clamping) so a bad value can never break the dashboard.
* **Immediate effect:** saving settings re-renders KPIs, tank, pump, stats, health, weather, fields, crops, activity, recommendation, schedules, storage summary and both charts — administration must never require a manual refresh to take effect.
* **Reversibility:** Reset to Defaults restores the documented defaults (`threshold 30`, `autoIrrigation false`, `notifications true`, `tankCapacity 5000`, `units metric`) in one action with a confirmation toast.
* **Traceability:** every administrative change is recorded in the in-memory analytics log (`settings.save`, `settings.reset`, `settings.notifications`, `simulation.outage`).
* **Accessibility:** switches and sliders are labelled and keyboard operable; the tab order follows the visual order; the save action is reachable by keyboard without traversing the entire page (the form is short by design).

---

## 48. Design Acceptance Checklist

- [x] Design tokens defined once and used everywhere (colour, spacing, radius, shadow, type)
- [x] Two type weights loaded up front; no third-party font requests at runtime
- [x] Card system consistent: same padding, radius, border and shadow across all eight sections
- [x] One filled primary action per card; ghost/subtle for secondary actions
- [x] Every interactive element has hover, focus, active and (where relevant) disabled, loading and success states
- [x] Status is never communicated by colour alone
- [x] Contrast verified for tokens and for text over photographs
- [x] Empty, error, loading and success states designed for every data surface
- [x] Responsive behaviour verified at 360, 390, 834, 1280 and 1440 px with no overflow
- [x] Mobile sticky action bar present and never covering controls
- [x] Charts styled to the brand palette with accessible labels and text summaries
- [x] Professional, licensed, optimised imagery only; no emojis anywhere
- [x] Motion restrained, purposeful and disabled under `prefers-reduced-motion`
- [x] Admin (settings) surfaces use the same visual language as the public surfaces
- [x] Design matches the shipped implementation: every token, component and state in this document exists in `style.css`

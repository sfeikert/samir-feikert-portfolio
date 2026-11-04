# Project Context & Design System: Samir Feikert Portfolio

This document defines the architecture, typography, and design rules for **Samir Feikert's** portfolio landing page — implemented as a 100% clean-room, legally safe codebase in pure JavaScript (Astro + React + Tailwind CSS).

---

## 1. Language, Layout & Interaction (`/`)

- **Language:** English across navigation, captions, and UI, with the German subtitle `Ausgebildeter Fotograf aus Düsseldorf` directly underneath the main name.
- **Top Header (`HeaderBar.jsx`):**
  - **Top Left:** Minimalist menu toggle (`×` / `≡`) + navigation items: **About** and **Exhibition** (currently intentional no-op placeholder buttons).
  - **Top Right:** Clean white space at the top of the page. After scrolling past `280px`, the **SAMIR FEIKERT** scroll wordmark smoothly fades in.
- **Architectural Intro Masthead (`DriftingGallery.jsx`):**
  - Left-aligned along the primary margin (`px-6 sm:px-8 lg:px-10`), positioned lower down from the header and close above the first horizontal photo strip: uppercase **SAMIR FEIKERT** headline in pure black with crisp subtitle `Ausgebildeter Fotograf aus Düsseldorf` directly underneath.
- **Continuous Drifting & Draggable Horizontal Rows (`DriftingGallery.jsx`):**
  - Full-viewport horizontal photography & motion strips (`0.35px/frame` delta-time normalized continuous glide, seamless infinite drag left/right with momentum).
  - Strict 4-column modular widths on desktop (`25vw` standard, `50vw` wide) with staggered vertical alignment (`top`, `middle`, `bottom`).
  - Subtle black hover veil (`rgba(0, 0, 0, 0.3)`) with white project title in the bottom-right corner.
- **Bottom-Center Next-Row Control & Legal-Only Footer (`MinimalFooter.jsx`):**
  - Crisp floating chevron (`⌄`) at bottom center to step smoothly between rows.
  - Ultra-minimal footer containing strictly the legally required items (`Imprint` and `Privacy Policy` under German § 5 DDG & GDPR).

---

## 2. Swiss Neo-Grotesque Typography & Monochrome Design Rules

- **Typefaces (Reference-Matched Stack + SIL OFL Metric Twins):**
  - **Display / Headlines (`"Univers", "Inter", "Helvetica Neue", sans-serif`):** Classic Swiss Neo-Grotesque uppercase display with clean `1.0` leading, `-0.015em` tracking, and `liga`/`clig` disabled.
  - **UI, Navigation & Captions (`"Untitled Sans", "Albert Sans", "Inter", sans-serif`):** Restrained, neutral neo-grotesque (`Regular 400` / `Medium 500`, `0.12px` tracking, `1.4` line-height) matching the reference agency typography without requiring proprietary font redistribution.
- **Design Rules:**
  - Strict `8px` spatial rhythm and `25vw` 4-column modular gallery alignment.
  - Pure rectangular geometry (`0px` border radius).
  - Strictly monochrome black-and-white palette (`#000000` primary ink, `#616161` muted grey, `#F5F5F5` neutral placeholder tint) on pure gallery white (`#FFFFFF`).

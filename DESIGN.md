# Repro Desk — Design

## Direction & Layout
- Purpose: a lead-gen landing page for a service that checks whether a paper's headline number reproduces. Mood: credible, calm, quietly optimistic, like a lab notebook kept by a careful colleague. Should not feel like a hype-y AI startup, neon or cute.
- Defining idea in the first screen: the oversized headline claim next to a photo of a researcher at a workstation, with a small floating "verdict chip" (mono number, e.g. `Reported 84.2 → Reproduced 83.9`) overlapping the photo frame.
- Reference: the supplied service-business baseline (white canvas, near-black ink, one butter-yellow accent, charcoal feature bands).
- Layout: max width 1320px, 24px gutters mobile / 40px desktop. Section spacing 96px desktop, 64px mobile. Card gap 24px.
- Order: Nav (wordmark, links, EN/中文 toggle, yellow CTA) → Hero (55/45 copy/photo) → Logo-style "fields we check" row → Three steps (white, 3-up cards) → Sample report (charcoal band, photo + report card) → Pricing (white, 3 cards: two free pilots + custom) → FAQ (accordion, 40/60 split) → Request form (charcoal band) → Footer.
- Breakpoints: <640 single column, hamburger nav; ≥768 two-up; ≥1024 three-up and side-by-side hero.
- Do: yellow only on primary CTAs, wordmark dot, and one "Recommended" badge. Dark text on yellow. Light/charcoal band alternation, never two charcoal bands adjacent.
- Don't: blue/purple gradients, glass, yellow text on white, second accent color, heavy outlines.

## Tokens
- Colors: canvas #FFFFFF; ink #110F0D (hsl 60 13% 6%); muted surface #F4F4F0; muted text #5A5850; border #E2E2DC; charcoal band #110F0D with card #1C1B17; accent butter #FBE7A1 (hsl 50 90% 80%) with ink text; success #2F7D4F; destructive #DC2626.
- Type: Roboto (sans) for display/body; Libre Caslon Text italic for one emphasized word in headings; Roboto Mono for numbers/IDs. Display 64/1.05 weight 500 tracking -0.02em (40px mobile); H2 40/1.15 500; H3 22/1.3 500; body 17/1.6 400; button 16 500; eyebrow 13px uppercase tracking 0.08em 500.
- Spacing: 4/8/12/16/24/32/48/64/96. Radii: cards 16px, hero image 24px, inputs 12px, buttons & chips pill.
- Elevation: cards shadow-sm at rest → shadow-lg on hover; border 1px #E2E2DC quiet. Sticky nav white with hairline once scrolled.

## Shared Patterns & States
- Button primary: yellow pill, 48px tall, ink text; hover darker yellow (hsl 50 90% 72%). Secondary: ghost text link with arrow. No scale on press, just a slight darkening.
- Card: white, 16px radius, 32px padding, shadow-sm; image frames scale 1.05 on hover.
- Eyebrow + H2 heading block used at the top of every section.
- Form: inputs 48px, 12px radius, quiet border, focus ring 2px ring color; inline error text below the field; button loading state shows "Sending…"; success replaces form with a confirmation card showing the request ID.
- Admin: table with status select per row, empty, loading, not-logged-in (login button), and forbidden states.
- Motion: GSAP, power2.out 0.6s; hero timeline, ScrollTrigger reveals, card batch stagger, stat count-up, light parallax on band photo. Content is visible by default (we animate from, never start hidden in CSS); reduced motion skips all motion.
- Accessibility: 44px targets, 2px focus-visible ring, labeled inputs, aria-label on icon buttons, aria-live on form status.

## Media
- Photography is essential (real people doing research work). Generated with image-generation:
  1. hero-researcher.jpg 4:5 — researcher at a desk with code and plotted charts, warm natural light. Hero right.
  2. report-bench.jpg 4:3 — close-up of a monitor showing training curves beside a notebook. Sample report band.
  3. team-review.jpg 16:9 — two people reviewing results together. Form band left column.
- No text overlaid on photos except the small verdict chip with its own solid background. No abstract gradient substitutes.

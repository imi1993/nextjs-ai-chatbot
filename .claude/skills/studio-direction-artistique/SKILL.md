---
name: studio-direction-artistique
description: Use when creating or changing Studio visuals, carousel slides, the PDF carousel, or the Studio UI styling (lib/studio/media/render.tsx, studio.css, fonts).
---

# Direction artistique du Studio

## Brand system
- Paper `#F4F0E8` (media) / `#f6f2ea` (UI), ink `#121110`, mute `#6E675C`, rule `#D9D0BF`.
- Accent per account: `perso` gold `#A8823A` / `#F0C782`, `reco` lavender `#5F68BE` / `#A4AEEB`. An account's media always uses its own accent.
- Type: **Cormorant** (serif, 500, italic for emphasis) for headlines, **Manrope** (500/700/800) for text and kickers. Kickers are uppercase with letter-spacing 0.2em.
- The feel is quiet luxury: generous margins, a single strong idea per image, no stock photos, no gradients on text, no more than two accent uses per image.

## Media rendering (satori via `next/og`)
- Format: 1080 x 1350 PNG (LinkedIn 4:5). Constants `MEDIA_WIDTH` / `MEDIA_HEIGHT` in `render.tsx`.
- Fonts are read from `lib/studio/media/fonts/*.ttf` and must stay listed in `outputFileTracingIncludes` in `next.config.ts`, or production renders fall back to nothing.
- satori limits to respect:
  - flexbox only (every multi-child `div` needs `display: 'flex'`); no grid, no `z-index`, no CSS variables.
  - Glyphs missing from the fonts (✓, arrows, emoji) make satori fetch a font and fail offline. Draw them as inline SVG (see the `Check` component).
  - Keep text short: satori does not shrink text; measure long titles against the 1080 px width minus margins.
- Carousel: `renderCarouselPdf` renders each slide as PNG and assembles a PDF with pdf-lib. LinkedIn shows PDFs as document carousels. Slide 1 is also used as the cover.
- Fonts check: Cormorant regular and italic were once swapped. If italics look upright, check the OS/2 `fsSelection` bit before renaming.

## Verify a visual change
1. Render samples with a small `.mts` script via `npx tsx` (top-level await needs `.mts`), writing PNGs to the scratchpad, never to the repo.
2. Look at every style (`raffine`, `sondage`) and every slide kind (cover, list, steps, benefits, cta) for both accounts.
3. Check long French words and accents (é, è, à, œ, «  ») render in both fonts.

## UI (studio.css)
- All classes start with `st-`. Tokens are CSS variables on `.studio`, with dark overrides under `.dark .studio`.
- Shell: sidebar navigation from 1024 px; below that a glass top bar and a bottom tab bar within thumb reach (with a solid fallback when `backdrop-filter` or transparency is unavailable).
- Icons come from `app/(studio)/studio/icons.tsx` (one 1.6-stroke line set); never use emoji or text glyphs as icons.
- One primary action per view (ink button). Gold is for accents and the proposal action, and statuses use the ok and warn tokens.
- Mobile first at 16 px gutter; no horizontal scroll; tap targets at least 44 px. Respect `prefers-reduced-motion`.

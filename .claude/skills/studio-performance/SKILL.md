---
name: studio-performance
description: Use when adding or changing Studio pages, server actions, queries or rendering, and before shipping any Studio change, to keep the app fast and premium.
---

# Performance du Studio

Target: every Studio page feels instant. Budget: **about 120 KB first-load JS per Studio route**, checked in the `next build` output. A change that pushes a route above 150 KB needs a reason.

## Rules
- **Server components by default.** Add `'use client'` only for interactivity (forms, optimistic buttons), and keep those components small.
- **Never block a page on slow work.** Claude generation, HeyGen polling and publishing run in server actions, in the cron, or in `after()` from `next/server` (as the Aujourd'hui page does with `runAutopilot({plan:false})`).
- **Parallelise independent work** with `Promise.all` (generation in `planUpcoming`, font loading, slide rendering). Cap fan-out (6 posts per run) to respect API limits.
- **Queries**: filter by `userId` and use the indexes on (userId, status) and (userId, scheduledAt). Select only the posts a page needs (by status or date range); never load the whole table.
- **Optimistic UI**: actions update the card immediately (the card disappears on Valider or Refuser), then revalidate. Every page has a `loading.tsx` skeleton.
- **Media**: fonts are loaded once per process (`fontsPromise`). Preview routes under `studio/media/[id]/[file]` are authenticated and send `Cache-Control: private, max-age=86400`; keep previews private.
- **Cron**: `maxDuration` is 300 s. Keep one run under that; split work across runs instead of raising it.
- **Fonts in the UI** come from `next/font` (`lib/studio/fonts.ts`), with no external font requests.

## Before shipping
1. `pnpm build`, then read the route table: Studio routes should be within budget.
2. Load `/studio`, `/studio/a-valider` and `/studio/calendrier` in the browser at phone width. No layout shift, and skeletons appear at once.
3. Check that no new client component imports server-only code (`lib/studio/*`, `lib/db/*`).

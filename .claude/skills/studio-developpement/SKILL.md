---
name: studio-developpement
description: Use when starting any work on this repository (the harmoniq ai Studio LinkedIn built on the Next.js chatbot template), to set up, run, test and ship changes the right way.
---

# Développer le Studio

The repository is the Vercel chatbot template turned into **Le Studio**, harmoniq ai's private LinkedIn studio. `/` redirects to `/studio`; the original chat lives at `/chat`.

## Map
- `app/(studio)/studio/`: pages Aujourd'hui, À valider and Calendrier, `actions.ts` (server actions), `post-card.tsx`, and `media/[id]/[file]` previews.
- `lib/studio/`: `brand.ts` (accounts, slots, brand prompt), `generate.ts` (Claude with a zod schema per kind), `plan.ts` (autopilot), `publish.ts`, `dates.ts`, `queries.ts`, and `media/` (render, heygen, assets, fonts).
- `lib/db/schema.ts`: table `StudioPost`. Migrations live in `lib/db/migrations`, named `00NN_studio_*`, with `meta/_journal.json` kept in sync.
- `app/api/cron/studio/route.ts` with `vercel.json` for the daily autopilot.
- Private mode: when `STUDIO_OWNER_EMAIL` is set, `middleware.ts` sends visitors to `/login` and registration accepts only that email.

## Run locally
1. You need Postgres. In a container where initdb refuses root, run it as a normal user with the data dir in your home and sockets in `/tmp`.
2. Set `POSTGRES_URL`, `AUTH_SECRET` and `STUDIO_OWNER_EMAIL` in `.env.local`. Never read or print someone else's `.env`.
3. `pnpm install`, `pnpm db:migrate`, `pnpm dev`, then register with the owner email.
4. Without `ANTHROPIC_API_KEY` or AI Gateway, generation fails; test rendering and publishing with mocks (see `studio-publication`).

## Conventions
- UI text is in French; code, comments and commits are in English.
- CSS classes use the `st-` prefix in `studio.css`.
- Times are always Europe/Paris through `lib/studio/dates.ts`.
- `server-only` is imported in every `lib/studio` module that touches secrets or the database.
- Schema change: edit `schema.ts`, run `pnpm db:generate`, rename the migration to `00NN_studio_<what>.sql`, and update `_journal.json` to match.
- Scratch scripts (`*.mts` tests, sample renders) go outside the repo. Do not commit `tsconfig.tsbuildinfo`.
- Kill dev servers by port or PID, never with `pkill -f` on a broad pattern (it can kill your own shell).

## Before every push
- `pnpm lint` and `npx tsc --noEmit` are clean.
- `pnpm build` succeeds (it runs the migrations first, so it needs `POSTGRES_URL`).
- Re-read the diff for leaked secrets or contact details: this repo is public.
- Related skills: `studio-voix-de-marque`, `studio-direction-artistique`, `studio-publication`, `studio-performance`.

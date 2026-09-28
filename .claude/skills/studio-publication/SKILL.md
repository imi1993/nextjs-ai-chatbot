---
name: studio-publication
description: Use when touching publishing, scheduling, the autopilot or media hosting (lib/studio/publish.ts, plan.ts, dates.ts, media/heygen.ts, media/assets.ts, app/api/cron/studio), or when debugging a post that did not go out.
---

# Publication et pilote automatique

## Flow
1. The daily Vercel cron (`vercel.json`, `0 5 * * *` UTC) calls `/api/cron/studio` with `Authorization: Bearer $CRON_SECRET`. It runs `runAutopilot` for the `STUDIO_OWNER_EMAIL` user.
2. `planUpcoming` fills the next 14 days of slots with `pending` posts (at most 6 per run, generated in parallel, avoiding recent titles).
3. Imene taps **Valider**: `approve` keeps the planned slot (or takes the next free one), starts the HeyGen video for a video post, then `trySchedule` sends it out.
4. The next autopilot runs start pending videos, poll HeyGen, reschedule posts whose slot has passed, and schedule ready posts.

Never schedule a post that is not `approved`.

## Slots
- Monday, Tuesday and Thursday at 8:30 **Europe/Paris**, computed with `Intl` in `lib/studio/dates.ts` (DST-safe; do not use fixed UTC offsets).
- Kind per slot (`kindForSlot`): Monday is a text post; Tuesday is a video (a visual when HeyGen is not configured); Thursday alternates carousel and visual by week parity.

## Channels
- **perso → Typefully v2**: `POST /v2/social-sets/{id}/drafts` with `platforms.linkedin.posts[{text, media_ids}]` and `publish_at`.
  - Media flow: `POST /media/upload` with `{file_name}` returns `{media_id, upload_url}`; then a raw `PUT` of the bytes; then poll `GET /media/{id}` until `ready`.
  - Limit: about 10 posts a month on the current plan, while 3 a week is about 13. `limitReached` stops at 10 and says so.
- **reco → Buffer GraphQL** (`https://api.buffer.com`): `createPost` with `schedulingType: automatic`, `mode: customScheduled` and `dueAt`. Assets are public URLs, so media goes to **Vercel Blob** first (`BLOB_READ_WRITE_TOKEN`). Without Blob, a media post throws a clear French error.
- **HeyGen v3**: `POST /v3/videos` with `X-Api-Key`, `avatar_id`, `voice_id`, `script`, `aspect_ratio: '4:5'`, `resolution: '1080p'`. Poll `GET /v3/videos/{id}`. Response parsing is defensive because the shape is not verified yet.

## Configuration (Vercel env, never in code or chat)
`STUDIO_OWNER_EMAIL`, `ANTHROPIC_API_KEY` (or AI Gateway), `ANTHROPIC_MODEL`, `TYPEFULLY_API_KEY`, `TYPEFULLY_SOCIAL_SET_ID`, `BUFFER_ACCESS_TOKEN`, `BUFFER_LINKEDIN_CHANNEL_ID`, `HEYGEN_API_KEY`, `HEYGEN_AVATAR_PORTRAIT_ID`, `HEYGEN_VOICE_ID`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`. Never read `.env`, never print a key.

## Testing without real calls
Mock `globalThis.fetch` in an `.mts` script run with `npx tsx`, set fake env values, import `schedulePost`, and assert the call sequence. Do not set `BLOB_READ_WRITE_TOKEN` in mocks unless Blob is mocked too: the Blob client retries and hangs. Keep these scripts in the scratchpad, never commit them.

## Debugging a post that did not go out
Check in order: status is `approved`; `publishError` on the row; `publishingConfigured(account)`; the monthly limit; for video, `media.video.status` and `error`; the cron logs in Vercel.

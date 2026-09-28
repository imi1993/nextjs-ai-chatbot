import 'server-only';

import type { StudioPost } from '../db/schema';
import { ACCOUNTS, type Account } from './brand';
import { dayKey, nextFreeSlot } from './dates';
import { type Kind, proposeContent } from './generate';
import { getTwinVideo, heygenConfigured, startTwinVideo } from './media/heygen';
import { schedulePost } from './publish';
import {
  createPost,
  listPostsBetween,
  listPostsByStatus,
  updatePost,
} from './queries';

const DAY = 24 * 3600 * 1000;
const MAX_NEW_PER_RUN = 6;

/** Tuesday is for video, every other Thursday for a carousel. */
export function kindForSlot(slot: Date): Kind {
  const weekday = new Date(`${dayKey(slot)}T12:00:00Z`).getUTCDay();
  if (weekday === 2) return heygenConfigured() ? 'video' : 'visual';
  if (weekday === 4) {
    const week = Math.floor(
      new Date(`${dayKey(slot)}T12:00:00Z`).getTime() / (7 * DAY),
    );
    return week % 2 === 0 ? 'carousel' : 'visual';
  }
  return 'post';
}

function activePosts(posts: Array<StudioPost>, account: Account) {
  return posts.filter((p) => p.account === account && p.status !== 'rejected');
}

/** Fills every free Monday, Tuesday and Thursday slot of the coming days. */
export async function planUpcoming(userId: string, days = 14) {
  const now = new Date();
  const posts = await listPostsBetween(
    userId,
    new Date(now.getTime() - 30 * DAY),
    new Date(now.getTime() + days * DAY),
  );
  const recentTitles = posts.map((p) => p.title).slice(-20);

  const wanted: Array<{ account: Account; slot: Date }> = [];
  for (const account of Object.keys(ACCOUNTS) as Array<Account>) {
    const taken = activePosts(posts, account).map((p) => p.scheduledAt as Date);
    for (;;) {
      const slot = nextFreeSlot(now, taken);
      if (!slot || slot.getTime() > now.getTime() + days * DAY) break;
      wanted.push({ account, slot });
      taken.push(slot);
    }
  }
  wanted.sort((a, b) => a.slot.getTime() - b.slot.getTime());

  const batch = wanted.slice(0, MAX_NEW_PER_RUN);
  const results = await Promise.allSettled(
    batch.map(async ({ account, slot }) => {
      const kind = kindForSlot(slot);
      const content = await proposeContent({
        account,
        kind,
        avoid: recentTitles,
      });
      return createPost({
        userId,
        account,
        kind,
        scheduledAt: slot,
        ...content,
      });
    }),
  );
  return {
    created: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
    remaining: wanted.length - batch.length,
  };
}

/** Approves a proposal: keeps its planned slot when still free, starts its video. */
export async function approve(userId: string, post: StudioPost) {
  const now = new Date();
  let scheduledAt = post.scheduledAt;
  if (!scheduledAt || scheduledAt.getTime() < now.getTime() + 15 * 60 * 1000) {
    const others = activePosts(
      await listPostsBetween(userId, now, new Date(now.getTime() + 120 * DAY)),
      post.account,
    ).filter((p) => p.id !== post.id);
    scheduledAt = nextFreeSlot(
      now,
      others.map((p) => p.scheduledAt as Date),
    );
  }
  await updatePost(userId, post.id, {
    status: 'approved',
    scheduledAt,
    publishError: null,
  });
  const approved = { ...post, status: 'approved' as const, scheduledAt };

  if (
    post.kind === 'video' &&
    post.media?.video &&
    !post.media.video.heygenId
  ) {
    if (!heygenConfigured()) {
      await updatePost(userId, post.id, {
        publishError:
          'Vidéo en attente : la clé HeyGen n’est pas encore configurée.',
      });
      return;
    }
    try {
      const heygenId = await startTwinVideo(
        post.media.video.script,
        post.title,
      );
      approved.media = {
        ...post.media,
        video: { ...post.media.video, heygenId, status: 'processing' },
      };
      await updatePost(userId, post.id, { media: approved.media });
    } catch (error) {
      await updatePost(userId, post.id, { publishError: message(error) });
      return;
    }
  }
  await trySchedule(userId, approved);
}

/** Sends an approved post to Typefully or Buffer once its media is ready. */
async function trySchedule(userId: string, post: StudioPost) {
  if (post.externalId || !post.scheduledAt) return;
  if (post.kind === 'video' && post.media?.video?.status !== 'completed')
    return;
  const limit = await limitReached(userId, post);
  if (limit) {
    await updatePost(userId, post.id, { publishError: limit });
    return;
  }
  try {
    const result = await schedulePost(post, post.scheduledAt);
    await updatePost(userId, post.id, {
      externalId: result?.externalId ?? null,
      publishError: null,
    });
  } catch (error) {
    await updatePost(userId, post.id, { publishError: message(error) });
  }
}

// Typefully plan: about 10 posts a month. Buffer free plan: 10 queued posts.
async function limitReached(userId: string, post: StudioPost) {
  const now = new Date();
  const sent = activePosts(
    await listPostsBetween(
      userId,
      new Date(now.getTime() - 40 * DAY),
      new Date(now.getTime() + 120 * DAY),
    ),
    post.account,
  ).filter((p) => p.externalId && p.id !== post.id);
  if (post.account === 'perso') {
    const month = dayKey(post.scheduledAt as Date).slice(0, 7);
    const count = sent.filter(
      (p) => dayKey(p.scheduledAt as Date).slice(0, 7) === month,
    ).length;
    return count >= 10
      ? 'Limite Typefully atteinte : 10 posts déjà programmés ce mois-ci.'
      : null;
  }
  const queued = sent.filter((p) => (p.scheduledAt as Date) > now).length;
  return queued >= 10
    ? 'File Buffer pleine : 10 posts sont déjà programmés.'
    : null;
}

/**
 * Background work, run by the daily cron and whenever the Studio opens:
 * checks videos being made, schedules approved posts whose media is ready,
 * then fills the coming free slots with new proposals.
 */
export async function runAutopilot(userId: string, { plan = true } = {}) {
  const approved = await listPostsByStatus(userId, 'approved');
  const now = new Date();
  for (const post of approved) {
    if (post.externalId) continue;
    let current = post;
    if (
      post.kind === 'video' &&
      post.media?.video &&
      !post.media.video.heygenId &&
      heygenConfigured()
    ) {
      await approve(userId, post);
      continue;
    }
    const video = post.media?.video;
    if (
      post.kind === 'video' &&
      video?.heygenId &&
      video.status === 'processing'
    ) {
      const state = await getTwinVideo(video.heygenId);
      if (state.status !== 'processing') {
        current = {
          ...post,
          media: { ...post.media, video: { ...video, ...state } },
        };
        await updatePost(userId, post.id, {
          media: current.media,
          publishError: state.error ? `HeyGen : ${state.error}` : null,
        });
      }
    }
    if (current.scheduledAt && current.scheduledAt < now) {
      const others = activePosts(approved, post.account).filter(
        (p) => p.id !== post.id,
      );
      current = {
        ...current,
        scheduledAt: nextFreeSlot(
          now,
          others.map((p) => p.scheduledAt as Date),
        ),
      };
      await updatePost(userId, post.id, { scheduledAt: current.scheduledAt });
    }
    await trySchedule(userId, current);
  }
  return plan ? planUpcoming(userId) : null;
}

function message(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

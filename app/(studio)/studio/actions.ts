'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import type { Account } from '@/lib/studio/brand';
import { dayKey, monthBounds, nextFreeSlot } from '@/lib/studio/dates';
import { proposePost } from '@/lib/studio/generate';
import { schedulePost } from '@/lib/studio/publish';
import {
  createPost,
  getPosts,
  listPostsBetween,
  updatePost,
} from '@/lib/studio/queries';

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/guest');
  return session.user.id;
}

function refresh() {
  revalidatePath('/studio', 'layout');
}

export async function proposeAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  const userId = await requireUserId();
  const account = formData.get('account') === 'reco' ? 'reco' : 'perso';
  const topic = String(formData.get('topic') ?? '').trim() || undefined;
  try {
    const proposal = await proposePost({ account, topic });
    await createPost({ userId, account, kind: 'post', ...proposal });
  } catch (error) {
    console.error(error);
    return { error: 'Claude n’a pas pu écrire la proposition. Réessayez.' };
  }
  refresh();
  return {};
}

export async function saveAction(id: string, title: string, body: string) {
  const userId = await requireUserId();
  await updatePost(userId, id, { title, body });
  refresh();
}

export async function approveAction(id: string, account: Account) {
  const userId = await requireUserId();
  const now = new Date();
  const horizon = new Date(now.getTime() + 120 * 24 * 3600 * 1000);
  const mine = (await listPostsBetween(userId, now, horizon)).filter(
    (p) => p.account === account && p.status !== 'rejected' && p.id !== id,
  );
  const scheduledAt = nextFreeSlot(
    now,
    mine.map((p) => p.scheduledAt as Date),
  );
  await updatePost(userId, id, { status: 'approved', scheduledAt });

  const [post] = await getPosts(userId, [id]);
  if (post && scheduledAt) {
    const limitError = checkLimits(account, scheduledAt, mine);
    try {
      if (limitError) throw new Error(limitError);
      const result = await schedulePost(post, scheduledAt);
      await updatePost(userId, id, {
        externalId: result?.externalId ?? null,
        publishError: null,
      });
    } catch (error) {
      await updatePost(userId, id, {
        publishError: error instanceof Error ? error.message : String(error),
      });
    }
  }
  refresh();
}

// Typefully plan: about 10 posts a month. Buffer free plan: 10 queued posts.
function checkLimits(
  account: Account,
  at: Date,
  others: Array<{ scheduledAt: Date | null; externalId: string | null }>,
) {
  const sent = others.filter((p) => p.externalId);
  if (account === 'perso') {
    const month = dayKey(at).slice(0, 7);
    const count = sent.filter(
      (p) => p.scheduledAt && dayKey(p.scheduledAt).slice(0, 7) === month,
    ).length;
    if (count >= 10) {
      return 'Limite Typefully atteinte : 10 posts déjà programmés ce mois-ci.';
    }
  } else if (sent.length >= 10) {
    return 'File Buffer pleine : 10 posts sont déjà programmés.';
  }
  return null;
}

export async function rejectAction(id: string) {
  const userId = await requireUserId();
  await updatePost(userId, id, { status: 'rejected' });
  refresh();
}

export async function monthPosts(year: number, month: number) {
  const userId = await requireUserId();
  const { from, to } = monthBounds(year, month);
  return listPostsBetween(userId, from, to);
}

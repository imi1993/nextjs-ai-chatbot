'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import type { Account } from '@/lib/studio/brand';
import { monthBounds, nextFreeSlot } from '@/lib/studio/dates';
import { proposePost } from '@/lib/studio/generate';
import {
  createPost,
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
  const taken = (await listPostsBetween(userId, now, horizon))
    .filter((p) => p.account === account && p.status !== 'rejected')
    .map((p) => p.scheduledAt as Date);
  const scheduledAt = nextFreeSlot(now, taken);
  await updatePost(userId, id, { status: 'approved', scheduledAt });
  refresh();
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

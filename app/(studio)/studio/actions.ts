'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { monthBounds, nextFreeSlot } from '@/lib/studio/dates';
import { type Kind, proposeContent } from '@/lib/studio/generate';
import { approve, planUpcoming } from '@/lib/studio/plan';
import {
  createPost,
  getPosts,
  listPostsBetween,
  updatePost,
} from '@/lib/studio/queries';

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  return session.user.id;
}

function refresh() {
  revalidatePath('/studio', 'layout');
}

const KINDS: Array<Kind> = ['post', 'visual', 'carousel', 'video'];

export async function proposeAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  const userId = await requireUserId();
  const account = formData.get('account') === 'reco' ? 'reco' : 'perso';
  const kindField = String(formData.get('kind'));
  const kind = KINDS.includes(kindField as Kind) ? (kindField as Kind) : 'post';
  const topic = String(formData.get('topic') ?? '').trim() || undefined;
  try {
    const now = new Date();
    const taken = (
      await listPostsBetween(userId, now, new Date(now.getTime() + 120 * 864e5))
    )
      .filter((p) => p.account === account && p.status !== 'rejected')
      .map((p) => p.scheduledAt as Date);
    const content = await proposeContent({ account, kind, topic });
    await createPost({
      userId,
      account,
      kind,
      scheduledAt: nextFreeSlot(now, taken),
      ...content,
    });
  } catch (error) {
    console.error(error);
    return { error: 'Claude n’a pas pu écrire la proposition. Réessayez.' };
  }
  refresh();
  return {};
}

export async function planAction() {
  const userId = await requireUserId();
  try {
    const result = await planUpcoming(userId);
    refresh();
    return result;
  } catch (error) {
    console.error(error);
    return { created: 0, failed: 1, remaining: 0 };
  }
}

export async function saveAction(id: string, title: string, body: string) {
  const userId = await requireUserId();
  await updatePost(userId, id, { title, body });
  refresh();
}

export async function approveAction(id: string) {
  const userId = await requireUserId();
  const [post] = await getPosts(userId, [id]);
  if (post) await approve(userId, post);
  refresh();
}

export async function rejectAction(id: string) {
  const userId = await requireUserId();
  await updatePost(userId, id, { status: 'rejected' });
  refresh();
}

/** Replaces a proposal with a new one of the same format, for the same slot. */
export async function regenerateAction(id: string) {
  const userId = await requireUserId();
  const [post] = await getPosts(userId, [id]);
  if (!post) return;
  const content = await proposeContent({
    account: post.account,
    kind: post.kind,
    avoid: [post.title],
  });
  await updatePost(userId, id, content);
  refresh();
}

export async function monthPosts(year: number, month: number) {
  const userId = await requireUserId();
  const { from, to } = monthBounds(year, month);
  return listPostsBetween(userId, from, to);
}

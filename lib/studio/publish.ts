import 'server-only';

import type { StudioPost } from '../db/schema';

/**
 * Schedules an approved post on LinkedIn: the personal account through
 * Typefully, the recruitment account through Buffer. Returns null when the
 * service's key is not configured, so the post stays scheduled in the Studio
 * only.
 */
export async function schedulePost(
  post: Pick<StudioPost, 'account' | 'title' | 'body'>,
  at: Date,
): Promise<{ externalId: string } | null> {
  return post.account === 'perso'
    ? scheduleOnTypefully(post, at)
    : scheduleOnBuffer(post, at);
}

async function scheduleOnTypefully(
  post: Pick<StudioPost, 'title' | 'body'>,
  at: Date,
) {
  const key = process.env.TYPEFULLY_API_KEY;
  const socialSetId = process.env.TYPEFULLY_SOCIAL_SET_ID;
  if (!key || !socialSetId) return null;

  const res = await fetch(
    `https://api.typefully.com/v2/social-sets/${socialSetId}/drafts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        draft_title: post.title,
        platforms: {
          linkedin: { enabled: true, posts: [{ text: post.body }] },
        },
        publish_at: at.toISOString(),
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`Typefully ${res.status} : ${await res.text()}`);
  }
  const draft = await res.json();
  return { externalId: String(draft.id) };
}

async function scheduleOnBuffer(post: Pick<StudioPost, 'body'>, at: Date) {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  const channelId = process.env.BUFFER_LINKEDIN_CHANNEL_ID;
  if (!token || !channelId) return null;

  const res = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess { post { id } }
          ... on MutationError { message }
        }
      }`,
      variables: {
        input: {
          channelId,
          text: post.body,
          schedulingType: 'automatic',
          mode: 'customScheduled',
          dueAt: at.toISOString(),
        },
      },
    }),
  });
  const json = await res.json().catch(() => null);
  const result = json?.data?.createPost;
  if (!res.ok || !result?.post?.id) {
    const message =
      result?.message ?? json?.errors?.[0]?.message ?? `HTTP ${res.status}`;
    throw new Error(`Buffer : ${message}`);
  }
  return { externalId: String(result.post.id) };
}

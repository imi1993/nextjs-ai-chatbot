import 'server-only';

import { put } from '@vercel/blob';

import type { StudioPost } from '../db/schema';
import { buildMediaFile, type MediaFile } from './media/assets';

type Publishable = Pick<
  StudioPost,
  'id' | 'account' | 'kind' | 'title' | 'body' | 'media'
>;

export function publishingConfigured(account: StudioPost['account']) {
  return account === 'perso'
    ? Boolean(
        process.env.TYPEFULLY_API_KEY && process.env.TYPEFULLY_SOCIAL_SET_ID,
      )
    : Boolean(
        process.env.BUFFER_ACCESS_TOKEN &&
          process.env.BUFFER_LINKEDIN_CHANNEL_ID,
      );
}

/**
 * Schedules an approved post on LinkedIn, with its visual, carousel or video:
 * the personal account through Typefully, the second account through Buffer.
 * Returns null when the service's key is not configured.
 */
export async function schedulePost(
  post: Publishable,
  at: Date,
): Promise<{ externalId: string } | null> {
  if (!publishingConfigured(post.account)) return null;
  const file = await buildMediaFile(post);
  return post.account === 'perso'
    ? scheduleOnTypefully(post, at, file)
    : scheduleOnBuffer(post, at, file);
}

/* ---------- Typefully ---------- */

const TYPEFULLY = 'https://api.typefully.com/v2/social-sets';

async function typefully(path: string, init?: RequestInit) {
  const res = await fetch(
    `${TYPEFULLY}/${process.env.TYPEFULLY_SOCIAL_SET_ID}${path}`,
    {
      ...init,
      headers: {
        Authorization: `Bearer ${process.env.TYPEFULLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );
  if (!res.ok) {
    throw new Error(`Typefully ${res.status} : ${await res.text()}`);
  }
  return res.json();
}

async function uploadToTypefully(file: MediaFile) {
  const upload = await typefully('/media/upload', {
    method: 'POST',
    body: JSON.stringify({ file_name: file.name }),
  });
  // The presigned URL must receive the raw bytes with no extra headers.
  const put = await fetch(upload.upload_url, {
    method: 'PUT',
    body: new Uint8Array(file.bytes),
  });
  if (!put.ok)
    throw new Error(`Typefully : envoi du média refusé (${put.status}).`);

  for (let i = 0; i < 30; i++) {
    const media = await typefully(`/media/${upload.media_id}`);
    if (media.status === 'ready') return String(upload.media_id);
    if (media.status === 'failed') {
      throw new Error('Typefully n’a pas pu traiter le média.');
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Typefully traite encore le média. Nouvel essai plus tard.');
}

async function scheduleOnTypefully(
  post: Publishable,
  at: Date,
  file: MediaFile | null,
) {
  const mediaIds = file ? [await uploadToTypefully(file)] : [];
  const draft = await typefully('/drafts', {
    method: 'POST',
    body: JSON.stringify({
      draft_title: post.title,
      platforms: {
        linkedin: {
          enabled: true,
          posts: [{ text: post.body, media_ids: mediaIds }],
        },
      },
      publish_at: at.toISOString(),
    }),
  });
  return { externalId: String(draft.id) };
}

/* ---------- Buffer ---------- */

async function host(name: string, bytes: Buffer) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'Stockage des médias non configuré (Vercel Blob) : Buffer a besoin d’une adresse publique.',
    );
  }
  const blob = await put(`studio/${name}`, bytes, {
    access: 'public',
    addRandomSuffix: true,
  });
  return blob.url;
}

async function bufferAssets(post: Publishable, file: MediaFile | null) {
  if (!file) return [];
  const url = await host(file.name, file.bytes);
  if (file.type === 'image') {
    return [{ image: { url, metadata: { altText: post.title } } }];
  }
  if (file.type === 'video') {
    return [{ video: { url, metadata: { title: post.title } } }];
  }
  const thumbnailUrl = await host(
    file.name.replace('.pdf', '.png'),
    file.cover as Buffer,
  );
  return [{ document: { url, title: post.title, thumbnailUrl } }];
}

async function scheduleOnBuffer(
  post: Publishable,
  at: Date,
  file: MediaFile | null,
) {
  const res = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.BUFFER_ACCESS_TOKEN}`,
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
          channelId: process.env.BUFFER_LINKEDIN_CHANNEL_ID,
          text: post.body,
          schedulingType: 'automatic',
          mode: 'customScheduled',
          dueAt: at.toISOString(),
          assets: await bufferAssets(post, file),
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

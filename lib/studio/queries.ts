import 'server-only';

import { and, asc, count, desc, eq, gte, inArray, lt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { studioPost, type StudioPost, user } from '../db/schema';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(
  (process.env.POSTGRES_URL ?? process.env.DATABASE_URL)!,
);
const db = drizzle(client);

export type PostStatus = StudioPost['status'];

export async function listPostsByStatus(userId: string, status: PostStatus) {
  return db
    .select()
    .from(studioPost)
    .where(and(eq(studioPost.userId, userId), eq(studioPost.status, status)))
    .orderBy(desc(studioPost.createdAt));
}

export async function countPostsByStatus(userId: string, status: PostStatus) {
  const [row] = await db
    .select({ n: count() })
    .from(studioPost)
    .where(and(eq(studioPost.userId, userId), eq(studioPost.status, status)));
  return row?.n ?? 0;
}

export async function listPostsBetween(userId: string, from: Date, to: Date) {
  return db
    .select()
    .from(studioPost)
    .where(
      and(
        eq(studioPost.userId, userId),
        gte(studioPost.scheduledAt, from),
        lt(studioPost.scheduledAt, to),
      ),
    )
    .orderBy(asc(studioPost.scheduledAt));
}

export async function createPost(
  values: Pick<
    StudioPost,
    'userId' | 'account' | 'kind' | 'title' | 'body' | 'rationale' | 'media'
  > & { scheduledAt?: Date | null },
) {
  const [row] = await db.insert(studioPost).values(values).returning();
  return row;
}

export async function updatePost(
  userId: string,
  id: string,
  values: Partial<
    Pick<
      StudioPost,
      | 'title'
      | 'body'
      | 'rationale'
      | 'status'
      | 'scheduledAt'
      | 'externalId'
      | 'publishError'
      | 'media'
    >
  >,
) {
  await db
    .update(studioPost)
    .set({ ...values, updatedAt: new Date() })
    .where(and(eq(studioPost.id, id), eq(studioPost.userId, userId)));
}

export async function getPosts(userId: string, ids: Array<string>) {
  return db
    .select()
    .from(studioPost)
    .where(and(eq(studioPost.userId, userId), inArray(studioPost.id, ids)));
}

export async function getUserIdByEmail(email: string) {
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));
  return row?.id ?? null;
}

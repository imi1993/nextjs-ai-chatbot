import { studioOwnerEmail } from '@/lib/constants';
import { runAutopilot } from '@/lib/studio/plan';
import { getUserIdByEmail } from '@/lib/studio/queries';

export const maxDuration = 300;

/** Called by Vercel Cron (see vercel.json) with the CRON_SECRET bearer token. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (!studioOwnerEmail) {
    return Response.json({ skipped: 'STUDIO_OWNER_EMAIL is not set' });
  }
  const userId = await getUserIdByEmail(studioOwnerEmail);
  if (!userId) return Response.json({ skipped: 'owner has no account yet' });
  return Response.json(await runAutopilot(userId));
}

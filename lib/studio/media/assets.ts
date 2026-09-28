import 'server-only';

import type { StudioPost } from '../../db/schema';
import { renderCarouselPdf, renderVisual } from './render';

export type MediaFile = {
  name: string;
  type: 'image' | 'pdf' | 'video';
  bytes: Buffer;
  /** First page of a carousel, used as the document thumbnail. */
  cover?: Buffer;
};

/** Builds the file that goes with a post, or null for a text-only post. */
export async function buildMediaFile(
  post: Pick<StudioPost, 'id' | 'kind' | 'account' | 'media'>,
): Promise<MediaFile | null> {
  const media = post.media;
  if (post.kind === 'visual' && media?.visual) {
    return {
      name: `visuel-${post.id}.png`,
      type: 'image',
      bytes: await renderVisual(media.visual, post.account),
    };
  }
  if (post.kind === 'carousel' && media?.slides?.length) {
    const { pdf, cover } = await renderCarouselPdf(media.slides, post.account);
    return { name: `carrousel-${post.id}.pdf`, type: 'pdf', bytes: pdf, cover };
  }
  if (post.kind === 'video') {
    if (!media?.video?.url) throw new Error('La vidéo n’est pas encore prête.');
    const res = await fetch(media.video.url);
    if (!res.ok) throw new Error(`Vidéo introuvable (HTTP ${res.status}).`);
    return {
      name: `video-${post.id}.mp4`,
      type: 'video',
      bytes: Buffer.from(await res.arrayBuffer()),
    };
  }
  return null;
}

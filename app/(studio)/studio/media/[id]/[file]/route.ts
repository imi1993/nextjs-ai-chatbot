import { auth } from '@/app/(auth)/auth';
import {
  renderCarouselPdf,
  renderSlide,
  renderVisual,
} from '@/lib/studio/media/render';
import { getPosts } from '@/lib/studio/queries';

/** Previews of a post's visual (visual.png), slides (slide-1.png…) and carousel PDF. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; file: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
  const { id, file } = await params;
  const [post] = await getPosts(session.user.id, [id]);
  const media = post?.media;
  if (!post || !media) return new Response('Not found', { status: 404 });

  const headers = { 'Cache-Control': 'private, max-age=86400' };
  if (file === 'visual.png' && media.visual) {
    const png = await renderVisual(media.visual, post.account);
    return new Response(new Uint8Array(png), {
      headers: { ...headers, 'Content-Type': 'image/png' },
    });
  }
  const slide = file.match(/^slide-(\d)\.png$/);
  if (slide && media.slides?.[Number(slide[1]) - 1]) {
    const png = await renderSlide(
      media.slides,
      Number(slide[1]) - 1,
      post.account,
    );
    return new Response(new Uint8Array(png), {
      headers: { ...headers, 'Content-Type': 'image/png' },
    });
  }
  if (file === 'carousel.pdf' && media.slides?.length) {
    const { pdf } = await renderCarouselPdf(media.slides, post.account);
    return new Response(new Uint8Array(pdf), {
      headers: { ...headers, 'Content-Type': 'application/pdf' },
    });
  }
  return new Response('Not found', { status: 404 });
}

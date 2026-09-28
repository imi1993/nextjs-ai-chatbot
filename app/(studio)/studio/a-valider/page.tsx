import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { listPostsByStatus } from '@/lib/studio/queries';
import { PostCard } from '../post-card';
import { ReviewTools } from '../review-tools';

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/guest');
  const posts = (await listPostsByStatus(session.user.id, 'pending')).sort(
    (a, b) =>
      (a.scheduledAt?.getTime() ?? Number.POSITIVE_INFINITY) -
      (b.scheduledAt?.getTime() ?? Number.POSITIVE_INFINITY),
  );

  return (
    <div className="st-page">
      <header className="st-pagehead split">
        <div>
          <p className="st-kick">Revue</p>
          <h1>À valider</h1>
          <p className="st-lede">
            {posts.length === 0
              ? 'Aucune proposition en attente.'
              : `${posts.length} proposition${posts.length > 1 ? 's' : ''}, dans l’ordre de publication. Rien ne part sans votre accord.`}
          </p>
        </div>
        <ReviewTools />
      </header>

      {posts.length === 0 ? (
        <div className="st-emptystate">
          <h2>Tout est à jour.</h2>
          <p>
            Chaque matin, Claude prépare les créneaux libres des deux prochaines
            semaines : lundi un post, mardi une vidéo, jeudi un carrousel ou un
            visuel. Vous pouvez aussi lancer la préparation maintenant, ou
            demander un contenu précis.
          </p>
        </div>
      ) : (
        <div className="st-reviews">
          {posts.map((post) => (
            <PostCard
              key={`${post.id}-${new Date(post.updatedAt).getTime()}`}
              post={post}
            />
          ))}
        </div>
      )}
    </div>
  );
}

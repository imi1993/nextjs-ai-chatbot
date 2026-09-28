import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { listPostsByStatus } from '@/lib/studio/queries';
import { PostCard } from '../post-card';
import { PlanButton } from '../plan-button';
import { ProposeForm } from '../propose-form';

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/guest');
  const posts = (await listPostsByStatus(session.user.id, 'pending')).sort(
    (a, b) =>
      (a.scheduledAt?.getTime() ?? Number.POSITIVE_INFINITY) -
      (b.scheduledAt?.getTime() ?? Number.POSITIVE_INFINITY),
  );

  return (
    <>
      <div className="st-h2">
        <h2>À valider</h2>
        <p>
          Claude prépare, vous décidez. Rien n’est publié sans votre accord.
        </p>
      </div>
      <PlanButton />
      <ProposeForm />
      <div className="st-stack">
        {posts.length === 0 ? (
          <p className="st-empty">
            Aucune proposition en attente. Touchez « Préparer maintenant » ou
            demandez un contenu précis ci-dessus.
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </>
  );
}

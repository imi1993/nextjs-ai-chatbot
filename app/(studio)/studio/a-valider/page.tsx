import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { listPostsByStatus } from '@/lib/studio/queries';
import { PostCard } from '../post-card';
import { ProposeForm } from '../propose-form';

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/guest');
  const posts = await listPostsByStatus(session.user.id, 'pending');

  return (
    <>
      <div className="st-h2">
        <h2>À valider</h2>
        <p>
          Claude prépare, vous décidez. Rien n’est publié sans votre accord.
        </p>
      </div>
      <ProposeForm />
      <div className="st-stack">
        {posts.length === 0 ? (
          <p className="st-empty">
            Aucune proposition en attente. Demandez-en une ci-dessus.
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </>
  );
}

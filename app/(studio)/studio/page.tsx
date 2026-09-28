import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { ACCOUNTS, KIND_LABELS } from '@/lib/studio/brand';
import { dayKey, formatSlot } from '@/lib/studio/dates';
import { listPostsBetween, listPostsByStatus } from '@/lib/studio/queries';

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/guest');
  const userId = session.user.id;

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
  const dayStart = new Date(now.getTime() - 24 * 3600 * 1000);
  const [pending, upcoming] = await Promise.all([
    listPostsByStatus(userId, 'pending'),
    listPostsBetween(userId, dayStart, in30Days),
  ]);
  const scheduled = upcoming.filter((p) => p.status === 'approved');
  const today = scheduled.filter(
    (p) => p.scheduledAt && dayKey(p.scheduledAt) === dayKey(now),
  );
  const next = scheduled.filter((p) => p.scheduledAt && p.scheduledAt > now);

  return (
    <>
      <section className="st-hero">
        <div className="st-kick">Bonjour Imene</div>
        <h2 className="st-big">
          {today.length > 0
            ? `${today.length} publication${today.length > 1 ? 's' : ''} aujourd’hui`
            : 'Rien à publier aujourd’hui'}
        </h2>
        <p>L’automatisation prépare. L’humain décide.</p>
      </section>

      <div className="st-kpis">
        <Link href="/studio/a-valider" className="st-kpi">
          <b>{pending.length}</b>
          <span>À valider</span>
        </Link>
        <Link href="/studio/calendrier" className="st-kpi">
          <b>{next.length}</b>
          <span>Programmés (30 jours)</span>
        </Link>
      </div>

      <div className="st-grid2">
        <section className="st-block">
          <h3>À valider</h3>
          {pending.length === 0 ? (
            <p className="st-empty2">Tout est validé.</p>
          ) : (
            pending.slice(0, 4).map((p) => (
              <Link key={p.id} href="/studio/a-valider" className="st-item">
                <span className={`st-ic ${p.account}`}>¶</span>
                <span>
                  <b>{p.title}</b>
                  <small>
                    {ACCOUNTS[p.account].label} · {KIND_LABELS[p.kind]}
                  </small>
                </span>
              </Link>
            ))
          )}
        </section>
        <section className="st-block">
          <h3>Prochaines publications</h3>
          {next.length === 0 ? (
            <p className="st-empty2">Rien de programmé pour l’instant.</p>
          ) : (
            next.slice(0, 4).map((p) => (
              <div key={p.id} className="st-item">
                <span className={`st-ic ${p.account}`}>¶</span>
                <span>
                  <b>{p.title}</b>
                  <small>{formatSlot(p.scheduledAt as Date)}</small>
                </span>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}

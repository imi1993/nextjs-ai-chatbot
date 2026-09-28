import Link from 'next/link';

import { ACCOUNTS } from '@/lib/studio/brand';
import { dayKey } from '@/lib/studio/dates';
import { monthPosts } from '../actions';

const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function parseMonth(m?: string) {
  const match = m?.match(/^(\d{4})-(\d{2})$/);
  if (match) return { year: Number(match[1]), month: Number(match[2]) };
  const [year, month] = dayKey(new Date()).split('-').map(Number);
  return { year, month };
}

function shift(year: number, month: number, delta: number) {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { year, month } = parseMonth((await searchParams).m);
  const posts = (await monthPosts(year, month)).filter(
    (p) => p.status !== 'rejected',
  );

  const first = new Date(Date.UTC(year, month - 1, 1));
  const lead = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const today = dayKey(new Date());
  const cells = Array.from(
    { length: Math.ceil((lead + days) / 7) * 7 },
    (_, i) => {
      const d = i - lead + 1;
      if (d < 1 || d > days) return null;
      const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return {
        d,
        key,
        posts: posts.filter(
          (p) => p.scheduledAt && dayKey(p.scheduledAt) === key,
        ),
      };
    },
  );
  const title = new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(first);

  return (
    <>
      <div className="st-h2">
        <h2>Calendrier</h2>
        <p>
          Lundi, mardi et jeudi à 8 h 30. Chaque post validé prend le prochain
          créneau libre.
        </p>
      </div>
      <div className="st-monthbar">
        <Link
          href={`?m=${shift(year, month, -1)}`}
          className="st-ib"
          aria-label="Mois précédent"
        >
          ‹
        </Link>
        <h3>{title}</h3>
        <Link
          href={`?m=${shift(year, month, 1)}`}
          className="st-ib"
          aria-label="Mois suivant"
        >
          ›
        </Link>
      </div>
      <div className="st-legend">
        {Object.entries(ACCOUNTS).map(([key, a]) => (
          <span key={key}>
            <span className={`st-dot ${key}`} />
            {a.label}
          </span>
        ))}
      </div>
      <div className="st-cal">
        {DOW.map((d) => (
          <div key={d} className="st-dow">
            {d}
          </div>
        ))}
        {cells.map((cell, i) =>
          cell ? (
            <div
              key={cell.key}
              className={`st-cell${cell.key === today ? ' today' : ''}`}
            >
              <span className="st-num">{cell.d}</span>
              {cell.posts.map((p) => (
                <Link
                  key={p.id}
                  href="/studio/a-valider"
                  className={`st-chip ${p.account}${p.status === 'pending' ? ' pending' : ''}`}
                >
                  {p.title}
                </Link>
              ))}
            </div>
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: empty padding cells
            <div key={`pad-${i}`} className="st-cell out" />
          ),
        )}
      </div>
    </>
  );
}

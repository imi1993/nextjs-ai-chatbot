import Link from 'next/link';

import type { StudioPost } from '@/lib/db/schema';
import {
  ACCOUNTS,
  KIND_LABELS,
  SLOT_DAYS,
  SLOT_HOUR,
  SLOT_MINUTE,
} from '@/lib/studio/brand';
import { dayKey, formatDayLong, parisTime } from '@/lib/studio/dates';
import { monthPosts } from '../actions';
import { IconChevron, KindIcon } from '../icons';

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

function stateOf(p: StudioPost) {
  if (p.status === 'pending') return { cls: 'todo', label: 'À valider' };
  if (p.publishError) return { cls: 'err', label: 'À revoir' };
  if (p.status === 'published') return { cls: 'ok', label: 'Publié' };
  if (p.externalId) return { cls: 'ok', label: 'Programmé' };
  return { cls: 'wait', label: 'Validé' };
}

function Chip({ p }: { p: StudioPost }) {
  const s = stateOf(p);
  const content = (
    <>
      <KindIcon kind={p.kind} size={14} />
      <span className="st-chip-t">{p.title}</span>
      <span className={`st-chip-s ${s.cls}`} title={s.label} />
    </>
  );
  const label = `${ACCOUNTS[p.account].label}, ${KIND_LABELS[p.kind]} : ${p.title} (${s.label})`;
  return p.status === 'pending' ? (
    <Link
      href="/studio/a-valider"
      className={`st-chip ${p.account}`}
      aria-label={label}
    >
      {content}
    </Link>
  ) : (
    <span className={`st-chip ${p.account}`} aria-label={label} title={label}>
      {content}
    </span>
  );
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
  const now = new Date();
  const today = dayKey(now);
  const cells = Array.from(
    { length: Math.ceil((lead + days) / 7) * 7 },
    (_, i) => {
      const d = i - lead + 1;
      if (d < 1 || d > days) return { pad: true as const, key: `pad-${i}` };
      const key = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const weekday = new Date(`${key}T12:00:00Z`).getUTCDay();
      return {
        pad: false as const,
        d,
        key,
        slot: SLOT_DAYS.includes(weekday),
        future: parisTime(year, month, d, SLOT_HOUR, SLOT_MINUTE) > now,
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
  const agenda = cells.filter(
    (c): c is Extract<typeof c, { pad: false }> =>
      !c.pad && (c.posts.length > 0 || (c.slot && c.future)),
  );
  const current = `${today.slice(0, 7)}`;
  const shown = `${year}-${String(month).padStart(2, '0')}`;

  return (
    <div className="st-page">
      <header className="st-pagehead split">
        <div>
          <p className="st-kick">Calendrier</p>
          <h1 className="st-month">{title}</h1>
          <p className="st-lede">
            Lundi, mardi et jeudi à 8 h 30, sur chacun des deux comptes.
          </p>
        </div>
        <div className="st-monthnav">
          <Link
            href={`?m=${shift(year, month, -1)}`}
            className="st-iconbtn"
            aria-label="Mois précédent"
          >
            <IconChevron dir="left" size={18} />
          </Link>
          {shown !== current && (
            <Link href="?" className="st-btn ghost">
              Aujourd’hui
            </Link>
          )}
          <Link
            href={`?m=${shift(year, month, 1)}`}
            className="st-iconbtn"
            aria-label="Mois suivant"
          >
            <IconChevron size={18} />
          </Link>
        </div>
      </header>

      <div className="st-legend">
        {Object.entries(ACCOUNTS).map(([key, a]) => (
          <span key={key}>
            <span className={`st-dot ${key}`} />
            {a.label}
          </span>
        ))}
        <span>
          <span className="st-chip-s ok" /> Programmé
        </span>
        <span>
          <span className="st-chip-s todo" /> À valider
        </span>
      </div>

      <div className="st-cal" role="grid" aria-label={title}>
        {DOW.map((d, i) => (
          <div
            key={d}
            className={`st-dow${i >= 5 ? ' we' : ''}`}
            role="columnheader"
          >
            {d}
          </div>
        ))}
        {cells.map((cell, i) =>
          cell.pad ? (
            <div
              key={cell.key}
              className={`st-cell out${i % 7 >= 5 ? ' we' : ''}`}
            />
          ) : (
            <div
              key={cell.key}
              role="gridcell"
              className={`st-cell${cell.key === today ? ' today' : ''}${i % 7 >= 5 ? ' we' : ''}${cell.key < today ? ' past' : ''}`}
            >
              <span className="st-num">{cell.d}</span>
              {cell.posts.map((p) => (
                <Chip key={p.id} p={p} />
              ))}
              {cell.slot && cell.future && cell.posts.length < 2 && (
                <span className="st-free">Créneau libre</span>
              )}
            </div>
          ),
        )}
      </div>

      <ol className="st-agenda">
        {agenda.length === 0 && (
          <li className="st-quiet">Aucune publication ce mois-ci.</li>
        )}
        {agenda.map((c) => (
          <li key={c.key} className={c.key === today ? 'today' : undefined}>
            <span className="st-agenda-day">
              {formatDayLong(new Date(`${c.key}T12:00:00Z`))}
            </span>
            <div className="st-agenda-items">
              {c.posts.map((p) => (
                <Chip key={p.id} p={p} />
              ))}
              {c.slot && c.future && c.posts.length < 2 && (
                <span className="st-free">
                  {2 - c.posts.length === 2
                    ? 'Deux créneaux libres'
                    : 'Un créneau libre'}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

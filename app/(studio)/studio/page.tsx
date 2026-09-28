import Link from 'next/link';
import { after } from 'next/server';
import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import type { StudioPost } from '@/lib/db/schema';
import { ACCOUNTS, KIND_LABELS, type Account } from '@/lib/studio/brand';
import {
  dayKey,
  formatDayLong,
  formatDayShort,
  formatFromNow,
  formatSlot,
  upcomingSlots,
} from '@/lib/studio/dates';
import { runAutopilot } from '@/lib/studio/plan';
import { listPostsBetween, listPostsByStatus } from '@/lib/studio/queries';
import { IconArrow, IconClock, KindIcon } from './icons';

const DAY = 24 * 3600 * 1000;

function publishState(post: StudioPost) {
  const service = post.account === 'perso' ? 'Typefully' : 'Buffer';
  if (post.publishError)
    return { tone: 'err', text: `Non programmé : ${post.publishError}` };
  if (post.externalId) return { tone: 'ok', text: `Programmé dans ${service}` };
  return { tone: 'wait', text: `En attente d’envoi vers ${service}` };
}

function Thumb({ post }: { post: StudioPost }) {
  const v = new Date(post.updatedAt).getTime();
  const src =
    post.kind === 'visual' && post.media?.visual
      ? `/studio/media/${post.id}/visual.png?v=${v}`
      : post.kind === 'carousel' && post.media?.slides?.length
        ? `/studio/media/${post.id}/slide-1.png?v=${v}`
        : null;
  if (!src) {
    return (
      <div className={`st-thumb st-thumb-empty ${post.account}`}>
        <KindIcon kind={post.kind} size={30} />
      </div>
    );
  }
  // biome-ignore lint/nursery/noImgElement: generated image served by the Studio
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="st-thumb" src={src} alt="" />;
}

function Lane({ post, account }: { post?: StudioPost; account: Account }) {
  if (!post) {
    return (
      <span className={`st-lane free ${account}`}>
        <span className="st-lane-dot" />
        Libre
      </span>
    );
  }
  const state =
    post.status === 'pending'
      ? 'todo'
      : post.publishError
        ? 'err'
        : post.externalId
          ? 'ok'
          : 'wait';
  const label = {
    todo: 'À valider',
    err: 'À revoir',
    ok: 'Programmé',
    wait: 'Validé',
  }[state];
  const inner = (
    <>
      <KindIcon kind={post.kind} size={16} />
      <span className="st-lane-kind">{KIND_LABELS[post.kind]}</span>
      <span className={`st-pill ${state}`}>{label}</span>
    </>
  );
  return post.status === 'pending' ? (
    <Link href="/studio/a-valider" className={`st-lane ${account}`}>
      {inner}
    </Link>
  ) : (
    <span className={`st-lane ${account}`}>{inner}</span>
  );
}

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/api/auth/guest');
  const userId = session.user.id;
  // Check videos being made and send ready posts, without slowing the page.
  after(() => runAutopilot(userId, { plan: false }).catch(console.error));

  const now = new Date();
  const [pending, window] = await Promise.all([
    listPostsByStatus(userId, 'pending'),
    listPostsBetween(
      userId,
      new Date(now.getTime() - DAY),
      new Date(now.getTime() + 15 * DAY),
    ),
  ]);
  const live = window.filter((p) => p.status !== 'rejected');
  const next = live.find(
    (p) => p.status === 'approved' && p.scheduledAt && p.scheduledAt > now,
  );
  const slots = upcomingSlots(now, 14);
  const bySlot = (slot: Date, account: Account) =>
    live.find(
      (p) =>
        p.account === account &&
        p.scheduledAt &&
        dayKey(p.scheduledAt) === dayKey(slot),
    );
  const filled = slots.reduce(
    (n, s) =>
      n + (['perso', 'reco'] as const).filter((a) => bySlot(s, a)).length,
    0,
  );

  return (
    <div className="st-page">
      <header className="st-pagehead">
        <p className="st-kick">{formatDayLong(now)}</p>
        <h1>Bonjour Imene.</h1>
        <p className="st-lede">L’automatisation prépare. L’humain décide.</p>
      </header>

      {pending.length > 0 ? (
        <Link href="/studio/a-valider" className="st-callout">
          <span className="st-callout-n">{pending.length}</span>
          <span className="st-callout-text">
            <b>
              {pending.length === 1
                ? 'Une proposition attend votre regard'
                : `${pending.length} propositions attendent votre regard`}
            </b>
            <small>Relisez, ajustez si besoin, puis validez d’un geste.</small>
          </span>
          <span className="st-btn primary">
            Commencer la revue <IconArrow size={18} />
          </span>
        </Link>
      ) : (
        <div className="st-callout calm">
          <span className="st-callout-text">
            <b>Tout est validé.</b>
            <small>
              Le pilote automatique prépare les prochains créneaux chaque matin.
            </small>
          </span>
        </div>
      )}

      <div className="st-today">
        <section className="st-panel st-next" aria-labelledby="next-h">
          <h2 id="next-h" className="st-panel-h">
            Prochaine publication
          </h2>
          {next?.scheduledAt ? (
            <div className="st-next-body">
              <Thumb post={next} />
              <div className="st-next-info">
                <span className={`st-tag ${next.account}`}>
                  {ACCOUNTS[next.account].label} · {KIND_LABELS[next.kind]}
                </span>
                <h3>{next.title}</h3>
                <p className="st-when">
                  <IconClock size={16} />
                  {formatSlot(next.scheduledAt)}
                </p>
                <span className="st-soonpill">
                  {formatFromNow(next.scheduledAt, now)}
                </span>
                {(() => {
                  const s = publishState(next);
                  return <p className={`st-status ${s.tone}`}>{s.text}</p>;
                })()}
              </div>
            </div>
          ) : (
            <p className="st-quiet">
              Rien n’est encore programmé. Validez une proposition pour remplir
              le prochain créneau.
            </p>
          )}
        </section>

        <section className="st-panel" aria-labelledby="slots-h">
          <div className="st-panel-row">
            <h2 id="slots-h" className="st-panel-h">
              Les deux prochaines semaines
            </h2>
            <span className="st-soft">
              {filled} / {slots.length * 2} créneaux
            </span>
          </div>
          <div
            className="st-meter"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={slots.length * 2}
            aria-valuenow={filled}
            aria-label="Créneaux préparés"
          >
            <span
              style={{
                width: `${slots.length ? (filled / (slots.length * 2)) * 100 : 0}%`,
              }}
            />
          </div>
          <ol className="st-slots">
            {slots.map((slot) => (
              <li key={slot.toISOString()} className="st-slot">
                <span className="st-slot-day">{formatDayShort(slot)}</span>
                <Lane post={bySlot(slot, 'perso')} account="perso" />
                <Lane post={bySlot(slot, 'reco')} account="reco" />
              </li>
            ))}
          </ol>
          <div className="st-legend">
            {Object.entries(ACCOUNTS).map(([key, a]) => (
              <span key={key}>
                <span className={`st-dot ${key}`} />
                {a.label}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

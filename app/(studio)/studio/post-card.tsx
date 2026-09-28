'use client';

import { useState, useTransition } from 'react';

import type { StudioPost } from '@/lib/db/schema';
import { ACCOUNTS, KIND_LABELS } from '@/lib/studio/brand';
import { formatDayShort } from '@/lib/studio/dates';
import {
  approveAction,
  regenerateAction,
  rejectAction,
  saveAction,
} from './actions';
import {
  IconCheck,
  IconClock,
  IconPen,
  IconRefresh,
  IconX,
  KindIcon,
} from './icons';

// LinkedIn cuts a post after about 210 characters behind « … voir plus ».
const FOLD = 210;
const LIMIT = 3000;

export function MediaPreview({ post }: { post: StudioPost }) {
  const media = post.media;
  const v = new Date(post.updatedAt).getTime();
  const base = `/studio/media/${post.id}`;

  if (post.kind === 'visual' && media?.visual) {
    return (
      // biome-ignore lint/nursery/noImgElement: generated image, no optimisation needed
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="st-media"
        src={`${base}/visual.png?v=${v}`}
        alt={media.visual.headline}
      />
    );
  }
  if (post.kind === 'carousel' && media?.slides?.length) {
    return (
      <div className="st-slides" aria-label="Diapositives du carrousel">
        {media.slides.map((s, i) => (
          // biome-ignore lint/nursery/noImgElement: generated image, no optimisation needed
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.title}
            src={`${base}/slide-${i + 1}.png?v=${v}`}
            alt={`${i + 1}/${media.slides?.length} · ${s.title}`}
            loading="lazy"
          />
        ))}
      </div>
    );
  }
  if (post.kind === 'video' && media?.video) {
    const video = media.video;
    if (video.url) {
      return (
        <video
          className="st-media"
          src={video.url}
          controls
          playsInline
          preload="metadata"
        />
      );
    }
    return (
      <div className="st-video-wait">
        <span className="st-kick">
          {video.status === 'processing'
            ? 'Votre jumeau enregistre la vidéo…'
            : video.status === 'failed'
              ? 'La vidéo n’a pas pu être fabriquée'
              : 'Script de la vidéo · tournée dès votre validation'}
        </span>
        <p>{video.script}</p>
      </div>
    );
  }
  return null;
}

function LinkedInPreview({ post, body }: { post: StudioPost; body: string }) {
  const [open, setOpen] = useState(false);
  const folded = body.length > FOLD && !open;
  return (
    <div className="st-li">
      <div className="st-li-head">
        <div className="st-li-av" aria-hidden="true">
          h
        </div>
        <div>
          <b>Imene Ben Salem</b>
          <span>harmoniq ai · 8 h 30</span>
        </div>
      </div>
      <p className="st-li-text">
        {folded ? `${body.slice(0, FOLD).trimEnd()}… ` : body}
        {folded && (
          <button
            type="button"
            className="st-li-more"
            onClick={() => setOpen(true)}
          >
            voir plus
          </button>
        )}
      </p>
      <MediaPreview post={post} />
    </div>
  );
}

function slotLabel(date: Date | null) {
  if (!date) return null;
  return `${formatDayShort(date)} · 8 h 30`;
}

export function PostCard({ post }: { post: StudioPost }) {
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [editing, setEditing] = useState(false);
  const [done, setDone] = useState<null | 'approved' | 'rejected'>(null);
  const [busy, setBusy] = useState<null | 'rewrite' | 'save'>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const dirty = title !== post.title || body !== post.body;
  const slot = post.scheduledAt ? new Date(post.scheduledAt) : null;
  const account = ACCOUNTS[post.account];

  if (done) {
    return (
      <div className={`st-done ${done}`} role="status">
        {done === 'approved' ? <IconCheck size={18} /> : <IconX size={18} />}
        <span>
          <b>{title}</b>
          {done === 'approved'
            ? ` · validé${slot ? ` pour ${slotLabel(slot)?.toLowerCase()}` : ''}`
            : ' · refusé'}
        </span>
      </div>
    );
  }

  return (
    <article
      className={`st-review ${post.account}`}
      aria-busy={busy !== null}
      aria-labelledby={`t-${post.id}`}
    >
      <div className="st-review-preview">
        <div className={busy === 'rewrite' ? 'st-rewriting' : undefined}>
          <LinkedInPreview post={post} body={body} />
        </div>
        {busy === 'rewrite' && (
          <p className="st-rewrite-note" role="status">
            Claude écrit une autre version…
          </p>
        )}
      </div>

      <div className="st-review-side">
        <div className="st-review-meta">
          <span className={`st-tag ${post.account}`}>
            <KindIcon kind={post.kind} size={15} />
            {account.label} · {KIND_LABELS[post.kind]}
          </span>
          {slot && (
            <span className="st-slotchip">
              <IconClock size={15} />
              {slotLabel(slot)}
            </span>
          )}
        </div>

        <label className="st-sr" htmlFor={`t-${post.id}`}>
          Titre interne
        </label>
        <textarea
          id={`t-${post.id}`}
          className="st-titlefield"
          value={title}
          rows={2}
          onChange={(e) => setTitle(e.target.value.replace(/\n/g, ' '))}
        />

        {post.rationale && (
          <div className="st-why">
            <span className="st-kick">Pourquoi maintenant</span>
            <p>{post.rationale}</p>
          </div>
        )}

        {editing ? (
          <div className="st-editor">
            <label className="st-kick" htmlFor={`b-${post.id}`}>
              Texte du post
            </label>
            <textarea
              id={`b-${post.id}`}
              className="st-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              maxLength={LIMIT}
            />
            <div className="st-editor-foot">
              <span
                className={body.length > LIMIT * 0.9 ? 'st-warn' : undefined}
              >
                {body.length.toLocaleString('fr-FR')} / 3 000
              </span>
              <span>L’aperçu se met à jour en direct.</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="st-linkbtn"
            onClick={() => setEditing(true)}
          >
            <IconPen size={16} /> Modifier le texte
          </button>
        )}

        <div className="st-review-actions">
          <button
            type="button"
            className="st-btn primary block"
            disabled={busy !== null}
            onClick={() => {
              setDone('approved');
              startTransition(async () => {
                if (dirty) await saveAction(post.id, title, body);
                await approveAction(post.id);
              });
            }}
          >
            <IconCheck size={18} />
            {slot
              ? `Valider pour ${slotLabel(slot)?.toLowerCase()}`
              : 'Valider et programmer'}
          </button>
          {dirty && (
            <button
              type="button"
              className="st-btn quiet block"
              disabled={busy !== null}
              onClick={() => {
                setBusy('save');
                setError(null);
                startTransition(async () => {
                  try {
                    await saveAction(post.id, title, body);
                  } catch {
                    setError('L’enregistrement a échoué. Réessayez.');
                  } finally {
                    setBusy(null);
                  }
                });
              }}
            >
              {busy === 'save' ? 'Enregistrement…' : 'Enregistrer sans valider'}
            </button>
          )}
          {error && (
            <p className="st-err" role="alert">
              {error}
            </p>
          )}
          <div className="st-review-minor">
            <button
              type="button"
              className="st-btn ghost"
              disabled={busy !== null}
              onClick={() => {
                setBusy('rewrite');
                setError(null);
                startTransition(async () => {
                  try {
                    await regenerateAction(post.id);
                  } catch {
                    setError('Claude n’a pas pu réécrire ce post. Réessayez.');
                  } finally {
                    setBusy(null);
                  }
                });
              }}
            >
              <IconRefresh size={17} /> Autre version
            </button>
            <button
              type="button"
              className="st-btn danger"
              disabled={busy !== null}
              onClick={() => {
                setDone('rejected');
                startTransition(() => rejectAction(post.id));
              }}
            >
              <IconX size={17} /> Refuser
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

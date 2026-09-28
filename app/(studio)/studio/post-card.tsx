'use client';

import { useState, useTransition } from 'react';

import type { StudioPost } from '@/lib/db/schema';
import { ACCOUNTS, KIND_LABELS } from '@/lib/studio/brand';
import { formatSlot } from '@/lib/studio/dates';
import {
  approveAction,
  regenerateAction,
  rejectAction,
  saveAction,
} from './actions';

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
      <div className="st-slides">
        {media.slides.map((s, i) => (
          // biome-ignore lint/nursery/noImgElement: generated image, no optimisation needed
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.title}
            src={`${base}/slide-${i + 1}.png?v=${v}`}
            alt={s.title}
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
        <div className="st-kick">
          {video.status === 'processing'
            ? 'Votre jumeau enregistre la vidéo…'
            : video.status === 'failed'
              ? 'La vidéo n’a pas pu être fabriquée'
              : 'Texte de la vidéo · fabriquée dès votre validation'}
        </div>
        <p>{video.script}</p>
      </div>
    );
  }
  return null;
}

export function PostCard({ post }: { post: StudioPost }) {
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [gone, setGone] = useState(false);
  const [pending, startTransition] = useTransition();
  const dirty = title !== post.title || body !== post.body;

  if (gone) return null;

  return (
    <article className={`st-prop ${post.account}`} aria-busy={pending}>
      <div className="st-prop-main">
        <div className="st-meta">
          <span className={`st-dot ${post.account}`} />
          {ACCOUNTS[post.account].label} · {KIND_LABELS[post.kind]}
          {post.scheduledAt && (
            <> · prévu {formatSlot(new Date(post.scheduledAt))}</>
          )}
        </div>
        <input
          className="st-input st-prop-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Titre"
        />
        {post.rationale && <p className="st-why">{post.rationale}</p>}
        <textarea
          className="st-input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-label="Texte du post"
          rows={12}
        />
        <div className="st-acts">
          <button
            type="button"
            className="st-btn ok"
            disabled={pending}
            onClick={() => {
              setGone(true);
              startTransition(async () => {
                if (dirty) await saveAction(post.id, title, body);
                await approveAction(post.id);
              });
            }}
          >
            ✓ Valider et programmer
          </button>
          <button
            type="button"
            className="st-btn ghost"
            disabled={pending || !dirty}
            onClick={() =>
              startTransition(() => saveAction(post.id, title, body))
            }
          >
            ✎ Enregistrer
          </button>
          <button
            type="button"
            className="st-btn ghost"
            disabled={pending}
            onClick={() => startTransition(() => regenerateAction(post.id))}
          >
            {pending ? 'Claude réécrit…' : '↻ Autre proposition'}
          </button>
          <button
            type="button"
            className="st-btn no"
            disabled={pending}
            onClick={() => {
              setGone(true);
              startTransition(() => rejectAction(post.id));
            }}
          >
            ✕ Refuser
          </button>
        </div>
      </div>
      <div className="st-prop-preview">
        <div className="st-li">
          <div className="st-li-head">
            <div className="st-li-av">h</div>
            <div>
              <b>Imene Ben Salem</b>
              <span>harmoniq ai</span>
            </div>
          </div>
          <p>{body}</p>
          <MediaPreview post={post} />
        </div>
      </div>
    </article>
  );
}

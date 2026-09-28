'use client';

import { useState, useTransition } from 'react';

import type { StudioPost } from '@/lib/db/schema';
import { ACCOUNTS, KIND_LABELS } from '@/lib/studio/brand';
import { approveAction, rejectAction, saveAction } from './actions';

export function PostCard({ post }: { post: StudioPost }) {
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [pending, startTransition] = useTransition();
  const [gone, setGone] = useState(false);
  const dirty = title !== post.title || body !== post.body;

  if (gone) return null;

  return (
    <article className={`st-prop ${post.account}`}>
      <div className="st-prop-main">
        <div className="st-meta">
          <span className={`st-dot ${post.account}`} />
          {ACCOUNTS[post.account].label} · {KIND_LABELS[post.kind]}
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
                await approveAction(post.id, post.account);
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
        </div>
      </div>
    </article>
  );
}

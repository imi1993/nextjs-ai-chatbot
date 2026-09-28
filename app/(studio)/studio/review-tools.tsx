'use client';

import { useActionState, useState, useTransition } from 'react';

import { ACCOUNTS, KIND_LABELS } from '@/lib/studio/brand';
import { planAction, proposeAction } from './actions';
import { IconPlus, IconSpark, IconX } from './icons';

export function ReviewTools() {
  const [open, setOpen] = useState(false);
  const [planning, startPlan] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  const [state, formAction, proposing] = useActionState(proposeAction, {});

  return (
    <div className="st-tools">
      <div className="st-tools-row">
        <button
          type="button"
          className="st-btn ghost"
          disabled={planning}
          onClick={() =>
            startPlan(async () => {
              const r = await planAction();
              setNote(
                r.failed
                  ? 'Claude n’a pas pu tout préparer. Réessayez dans un instant.'
                  : r.created === 0
                    ? 'Tous les créneaux des deux prochaines semaines sont déjà pris.'
                    : `${r.created} proposition${r.created > 1 ? 's' : ''} prête${r.created > 1 ? 's' : ''}.${r.remaining ? ' La suite arrive au prochain passage.' : ''}`,
              );
            })
          }
        >
          <IconSpark size={17} />
          {planning ? 'Claude prépare…' : 'Préparer les 2 semaines'}
        </button>
        <button
          type="button"
          className="st-btn primary"
          aria-expanded={open}
          aria-controls="st-propose"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <IconX size={17} /> : <IconPlus size={17} />}
          {open ? 'Fermer' : 'Nouvelle proposition'}
        </button>
      </div>
      {note && (
        <p className="st-note" role="status">
          {note}
        </p>
      )}
      {open && (
        <form id="st-propose" action={formAction} className="st-propose">
          <div className="st-field">
            <label htmlFor="p-account">Compte</label>
            <select
              id="p-account"
              name="account"
              className="st-input"
              defaultValue="perso"
            >
              {Object.entries(ACCOUNTS).map(([key, a]) => (
                <option key={key} value={key}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div className="st-field">
            <label htmlFor="p-kind">Format</label>
            <select
              id="p-kind"
              name="kind"
              className="st-input"
              defaultValue="visual"
            >
              {Object.entries(KIND_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="st-field grow">
            <label htmlFor="p-topic">Angle (facultatif)</label>
            <input
              id="p-topic"
              name="topic"
              className="st-input"
              placeholder="ex. le coût caché d’un certificat non conforme"
            />
          </div>
          <button type="submit" className="st-btn gold" disabled={proposing}>
            <IconSpark size={17} />
            {proposing ? 'Claude écrit…' : 'Proposer'}
          </button>
          {state?.error && (
            <p className="st-err" role="alert">
              {state.error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}

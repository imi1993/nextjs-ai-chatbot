'use client';

import { useActionState } from 'react';

import { ACCOUNTS, KIND_LABELS } from '@/lib/studio/brand';
import { proposeAction } from './actions';

export function ProposeForm() {
  const [state, formAction, pending] = useActionState(proposeAction, {});
  return (
    <form action={formAction} className="st-block st-propose">
      <div className="st-kick">Nouvelle proposition</div>
      <div className="st-row">
        <select name="account" className="st-input" defaultValue="perso">
          {Object.entries(ACCOUNTS).map(([key, a]) => (
            <option key={key} value={key}>
              {a.label}
            </option>
          ))}
        </select>
        <select name="kind" className="st-input" defaultValue="visual">
          {Object.entries(KIND_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <input
          name="topic"
          className="st-input"
          placeholder="Angle (facultatif) : ex. le coût caché d’un certificat non conforme"
        />
        <button type="submit" className="st-btn gold" disabled={pending}>
          {pending ? 'Claude écrit…' : '✨ Proposer'}
        </button>
      </div>
      {state?.error && <p className="st-err">{state.error}</p>}
    </form>
  );
}

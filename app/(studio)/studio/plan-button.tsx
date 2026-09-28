'use client';

import { useState, useTransition } from 'react';

import { planAction } from './actions';

export function PlanButton() {
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);
  return (
    <div className="st-plan">
      <div>
        <div className="st-kick">Pilote automatique</div>
        <p>
          Chaque matin, Claude prépare les créneaux libres des deux prochaines
          semaines : lundi un post, mardi une vidéo, jeudi un carrousel ou un
          visuel. Vous n’avez qu’à valider.
        </p>
        {note && <p className="st-plan-note">{note}</p>}
      </div>
      <button
        type="button"
        className="st-btn gold"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
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
        {pending ? 'Claude prépare…' : '✨ Préparer maintenant'}
      </button>
    </div>
  );
}

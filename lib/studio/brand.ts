export type Account = 'perso' | 'reco';

export const ACCOUNTS: Record<
  Account,
  { label: string; subject: string; audience: string }
> = {
  perso: {
    label: 'Contrôle documentaire',
    subject: 'le pré-contrôle documentaire fournisseur',
    audience:
      'responsables qualité et industriels du nucléaire et de l’aéronautique',
  },
  reco: {
    label: 'Recrutement',
    subject: 'l’automatisation du recrutement',
    audience: 'DRH, sociétés d’ingénierie, cabinets de recrutement et PME',
  },
};

export const KIND_LABELS = {
  post: 'Post',
  carousel: 'Carrousel',
  video: 'Vidéo',
  visual: 'Visuel',
} as const;

// Publishing slots: Monday, Tuesday and Thursday at 8:30.
export const SLOT_DAYS = [1, 2, 4];
export const SLOT_HOUR = 8;
export const SLOT_MINUTE = 30;

export const brandPrompt = `Tu écris pour harmoniq ai, écrit toujours en minuscules, jamais « Nuance ».
Signature : « La précision, sans la répétition. » Principe : « L'automatisation prépare. L'humain décide. »
Ton : luxe discret, éditorial, raffiné, sincère. Français soigné, phrases courtes, pas de jargon creux, pas d'emoji en rafale.
Règles absolues : n'invente aucun chiffre, aucun client, aucun témoignage. Tout document simulé porte la mention « démonstration fictive ».
Offre : diagnostic à 2 500 € HT, puis pilote sur un périmètre limité, puis déploiement. Deux places pilotes à l'automne 2026.`;

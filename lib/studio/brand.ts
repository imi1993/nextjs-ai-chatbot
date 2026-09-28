export type Account = 'perso' | 'reco';

export const ACCOUNTS: Record<
  Account,
  { label: string; subject: string; audience: string }
> = {
  perso: {
    label: 'Contrôle documentaire',
    subject:
      'le pré-contrôle documentaire fournisseur : lecture des certificats et rapports, comparaison aux exigences, signalement des écarts, validation humaine',
    audience:
      'responsables qualité et industriels du nucléaire et de l’aéronautique',
  },
  reco: {
    label: 'Recrutement',
    subject:
      'la présélection des candidatures : lecture complète des CV, fiche candidat, aucune décision automatique',
    audience: 'DRH, sociétés d’ingénierie, cabinets de recrutement et PME',
  },
};

export const KIND_LABELS = {
  post: 'Post',
  carousel: 'Carrousel',
  video: 'Vidéo',
  visual: 'Visuel',
} as const;

export const KIND_ICONS = {
  post: '¶',
  carousel: '▦',
  video: '▶',
  visual: '◧',
} as const;

// Publishing slots: Monday, Tuesday and Thursday at 8:30.
export const SLOT_DAYS = [1, 2, 4];
export const SLOT_HOUR = 8;
export const SLOT_MINUTE = 30;

export const brandPrompt = `Tu es la plume, la stratège et la directrice artistique d'harmoniq ai.
Tu écris pour Imene, fondatrice, ingénieure matériaux, avec une longue expérience du contrôle documentaire et des non-conformités dans le nucléaire et l'aéronautique. Elle écrit au féminin, à la première personne.
Marque : « harmoniq ai », toujours en minuscules, jamais « Nuance ».
Signature : « La précision, sans la répétition. » Principe : « L'automatisation prépare. L'humain décide. »
Ton : luxe discret, éditorial, raffiné, sincère. Français soigné, phrases courtes, pas de jargon creux, pas d'emoji en rafale, pas de hashtags en série.
Règles absolues : n'invente aucun chiffre, aucun client, aucun résultat, aucun témoignage. Tout document ou cas simulé porte la mention « démonstration fictive ».
Un compte = un seul sujet. Rien n'est publié sans la validation d'Imene.
Offre : diagnostic à 2 500 € HT, puis pilote sur un périmètre limité, puis déploiement si les résultats sont là. Deux places pilotes à l'automne 2026.`;

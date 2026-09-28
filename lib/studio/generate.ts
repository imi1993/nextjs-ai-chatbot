import 'server-only';

import { generateObject } from 'ai';
import { z } from 'zod';

import { myProvider } from '../ai/providers';
import type { StudioPost } from '../db/schema';
import { ACCOUNTS, brandPrompt, type Account } from './brand';
import type { PostMedia } from './types';

export type Kind = StudioPost['kind'];

const base = {
  title: z.string().describe('Titre interne court, 8 mots maximum'),
  body: z
    .string()
    .describe(
      'Texte du post LinkedIn prêt à publier, 900 à 1 300 caractères, sauts de ligne soignés',
    ),
  rationale: z
    .string()
    .describe('Pourquoi ce post maintenant, en une ou deux phrases'),
};

const visualSchema = z.object({
  ...base,
  visual: z.object({
    style: z
      .enum(['raffine', 'sondage'])
      .describe('raffine : phrase forte ; sondage : question à trois choix'),
    kicker: z.string().describe('Surtitre de 2 à 4 mots, sans ponctuation'),
    headline: z
      .string()
      .describe('Phrase forte ou question, 90 caractères maximum'),
    options: z
      .array(z.string().describe('Choix de 35 caractères maximum'))
      .optional()
      .describe('Exactement 3 choix, seulement pour le style sondage'),
  }),
});

const SLIDE_ORDER = ['cover', 'list', 'steps', 'benefits', 'cta'] as const;

const carouselSchema = z.object({
  ...base,
  slides: z
    .array(
      z.object({
        title: z
          .string()
          .describe('Titre de diapositive, 60 caractères maximum'),
        items: z
          .array(z.string().describe('45 caractères maximum'))
          .optional()
          .describe('3 ou 4 éléments, pour les diapositives 2, 3 et 4'),
        body: z
          .string()
          .optional()
          .describe(
            'Une phrase de 110 caractères maximum, pour les diapositives 1 et 5',
          ),
      }),
    )
    .describe(
      'Exactement 5 diapositives dans cet ordre : couverture, liste (ce qui pose problème), étapes de la méthode, bénéfices, appel à échanger',
    ),
});

const videoSchema = z.object({
  ...base,
  script: z
    .string()
    .describe(
      'Texte dit face caméra par Imene, 30 à 45 secondes (90 à 120 mots) : accroche forte, problème, mécanisme, appel à échanger. Ton sincère, phrases courtes, à l’oral.',
    ),
});

const SCHEMAS = {
  post: z.object(base),
  visual: visualSchema,
  carousel: carouselSchema,
  video: videoSchema,
};

const KIND_BRIEF: Record<Kind, string> = {
  post: 'un post texte',
  visual: 'un post accompagné d’un visuel (image 4:5)',
  carousel: 'un carrousel LinkedIn de 5 diapositives et son texte',
  video: 'une vidéo verticale où Imene parle face caméra, et le texte du post',
};

export async function proposeContent({
  account,
  kind,
  topic,
  avoid = [],
}: {
  account: Account;
  kind: Kind;
  topic?: string;
  avoid?: Array<string>;
}): Promise<{
  title: string;
  body: string;
  rationale: string;
  media: PostMedia | null;
}> {
  const a = ACCOUNTS[account];
  const { object } = await generateObject({
    model: myProvider.languageModel('studio-model'),
    schema: SCHEMAS[kind] as z.ZodType<Record<string, unknown>>,
    system: brandPrompt,
    prompt: `Crée ${KIND_BRIEF[kind]} sur ${a.subject}, pour ${a.audience}.
${topic ? `Angle demandé : ${topic}.` : 'Choisis un angle concret, utile et différent des sujets récents.'}
${avoid.length ? `Sujets déjà traités récemment, à ne pas répéter : ${avoid.join(' ; ')}.` : ''}
Commence le post par une accroche forte, termine par une question ou une invitation à échanger.`,
  });

  const { title, body, rationale } = object as {
    title: string;
    body: string;
    rationale: string;
  };
  let media: PostMedia | null = null;
  if (kind === 'visual') {
    media = { visual: (object as z.infer<typeof visualSchema>).visual };
  } else if (kind === 'carousel') {
    const slides = (object as z.infer<typeof carouselSchema>).slides;
    media = {
      slides: SLIDE_ORDER.map((kind, i) => ({
        kind,
        title: slides[i]?.title ?? '',
        items: slides[i]?.items,
        body: slides[i]?.body,
      })),
    };
  } else if (kind === 'video') {
    media = {
      video: { script: (object as z.infer<typeof videoSchema>).script },
    };
  }
  return { title, body, rationale, media };
}

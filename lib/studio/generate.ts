import 'server-only';

import { generateObject } from 'ai';
import { z } from 'zod';

import { myProvider } from '../ai/providers';
import { ACCOUNTS, brandPrompt, type Account } from './brand';

const proposalSchema = z.object({
  title: z.string().describe('Titre interne court, 8 mots maximum'),
  body: z
    .string()
    .describe('Texte du post LinkedIn prêt à publier, 900 à 1 300 caractères'),
  rationale: z
    .string()
    .describe('Pourquoi ce post maintenant, en une ou deux phrases'),
});

export async function proposePost({
  account,
  topic,
}: {
  account: Account;
  topic?: string;
}) {
  const a = ACCOUNTS[account];
  const { object } = await generateObject({
    model: myProvider.languageModel('studio-model'),
    schema: proposalSchema,
    system: brandPrompt,
    prompt: `Propose un post LinkedIn sur ${a.subject}, pour ${a.audience}.
${topic ? `Angle demandé : ${topic}.` : 'Choisis un angle concret et utile pour cette cible.'}
Commence par une accroche forte, termine par une question ou un appel à échanger.`,
  });
  return object;
}

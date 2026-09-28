---
name: studio-voix-de-marque
description: Use when writing, editing or reviewing any LinkedIn post, carousel text, video script or prompt for the harmoniq ai Studio, or when changing lib/studio/brand.ts or lib/studio/generate.ts.
---

# Voix de marque harmoniq ai

The Studio writes for Imene, founder of harmoniq ai. Every word Claude produces here must pass these rules. The canonical prompt is `brandPrompt` in `lib/studio/brand.ts`; keep this skill, that prompt and the zod schemas in `lib/studio/generate.ts` in sync.

## Non-negotiable rules
- Brand is **« harmoniq ai »**, always lowercase. Never « Nuance », never « Harmoniq AI ».
- **No invented figures, clients, results or testimonials.** No "+40 %", no "un client m'a dit". Any simulated document or case is labelled **« démonstration fictive »**.
- **One account = one subject.**
  - `perso`: le pré-contrôle documentaire fournisseur, for quality managers in nuclear and aerospace.
  - `reco`: la présélection des candidatures (full CV reading, candidate sheet, no automatic decision), for HR directors, engineering firms, agencies and SMEs.
  A post never mixes the two.
- **Nothing is published without Imene's validation.** Code must never schedule a post whose status is not `approved`.
- Never write contact details (phone, personal email) in the repo, prompts or posts: this repository is public.

## Voice
- French, first person, feminine agreement ("je suis convaincue").
- Quiet luxury, editorial, sincere. Short sentences. No hollow jargon, no emoji bursts, no hashtag strings (3 at most, at the end).
- Principle: « L'automatisation prépare. L'humain décide. » Signature: « La précision, sans la répétition. »
- The offer, when it is mentioned: a 2 500 € HT diagnostic, then a pilot on a limited scope, then rollout if the results are there. Two pilot places in autumn 2026.

## Shape of a strong post
1. A hook line that names a concrete, recognisable situation (a missing certificate, 200 CVs for one role).
2. The tension: what it costs today in time or risk, without an invented figure.
3. The method: what the automation prepares, and what the human decides.
4. A soft call to action: a question or an invitation to talk, never pushy.
5. The body is 900 to 1 300 characters. The first 2 lines must work alone (LinkedIn cuts at about 210 characters).

## Per kind
- **carousel**: exactly 5 slides in this order: cover, list (the problem), steps (the method), benefits, cta. Titles are 60 characters at most; slides 2 to 4 have 3 or 4 items of 45 characters at most; slides 1 and 5 have one sentence of 110 characters at most.
- **video**: a 90 to 120 word script, spoken, with no stage directions and no URLs, starting with the hook.
- **visual**: a kicker of 2 to 4 words without punctuation and a headline of 90 characters at most. Style `sondage` needs exactly 3 options of 35 characters at most.

## Review checklist before approving any generated text
- [ ] "harmoniq ai" is spelled right and there is no "Nuance"
- [ ] no number, client or quote that Imene did not give
- [ ] one subject, matching the account
- [ ] the first two lines hook on their own
- [ ] no contact details

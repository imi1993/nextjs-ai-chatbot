'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';

import { sans, serif } from '@/lib/studio/fonts';
import {
  login,
  register,
  type LoginActionState,
  type RegisterActionState,
} from './actions';
import '../(studio)/studio/studio.css';

const COPY = {
  login: {
    title: 'Bon retour',
    lede: 'Connectez-vous pour retrouver votre Studio.',
    submit: 'Se connecter',
    pending: 'Connexion…',
    switchText: 'Première visite ?',
    switchLink: 'Créer mon accès',
    switchHref: '/register',
  },
  register: {
    title: 'Créer votre accès',
    lede: 'Le Studio est privé : seule l’adresse de sa propriétaire est acceptée.',
    submit: 'Créer mon accès',
    pending: 'Création…',
    switchText: 'Déjà un accès ?',
    switchLink: 'Se connecter',
    switchHref: '/login',
  },
};

const ERRORS: Record<string, string> = {
  failed: 'Adresse ou mot de passe incorrect.',
  invalid_data:
    'Vérifiez l’adresse e-mail et un mot de passe de 6 caractères minimum.',
  user_exists: 'Un accès existe déjà pour cette adresse. Connectez-vous.',
};

export function StudioAuth({ mode }: { mode: 'login' | 'register' }) {
  const copy = COPY[mode];
  const [state, action, pending] = useActionState<
    RegisterActionState,
    FormData
  >(
    (prev, formData) =>
      mode === 'login'
        ? login(prev as LoginActionState, formData)
        : register(prev, formData),
    { status: 'idle' },
  );

  useEffect(() => {
    if (state.status === 'success') {
      window.location.assign('/studio');
    }
  }, [state.status]);

  const error = ERRORS[state.status];

  return (
    <div className={`studio st-auth ${serif.variable} ${sans.variable}`}>
      <div className="st-auth-card">
        <div className="st-auth-brand">
          harmoniq <i>ai</i>
        </div>
        <div className="st-kick">Le Studio</div>
        <h1>{copy.title}</h1>
        <p className="st-auth-lede">{copy.lede}</p>
        <form action={action} className="st-auth-form">
          <label htmlFor="email">Adresse e-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            className="st-input"
            autoComplete="email"
            required
            autoFocus
          />
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            className="st-input"
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            minLength={6}
            required
          />
          {error && (
            <p className="st-err" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="st-btn gold"
            disabled={pending || state.status === 'success'}
          >
            {pending || state.status === 'success' ? copy.pending : copy.submit}
          </button>
        </form>
        <p className="st-auth-switch">
          {copy.switchText}{' '}
          <Link href={copy.switchHref}>{copy.switchLink}</Link>
        </p>
      </div>
      <p className="st-auth-sign">La précision, sans la répétition.</p>
    </div>
  );
}

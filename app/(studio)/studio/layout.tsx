import type { Metadata } from 'next';
import Link from 'next/link';

import { auth } from '@/app/(auth)/auth';
import { sans, serif } from '@/lib/studio/fonts';
import { countPostsByStatus } from '@/lib/studio/queries';
import { IconSpark } from './icons';
import { StudioNav } from './nav';
import './studio.css';

export const metadata: Metadata = {
  title: 'harmoniq ai · Le Studio',
};

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const pending = session?.user?.id
    ? await countPostsByStatus(session.user.id, 'pending')
    : 0;

  return (
    <div className={`studio ${serif.variable} ${sans.variable}`}>
      <a href="#contenu" className="st-skip">
        Aller au contenu
      </a>
      <aside className="st-side">
        <Link href="/studio" className="st-brand" aria-label="Le Studio">
          <span className="st-brand-word">
            harmoniq <i>ai</i>
          </span>
          <span className="st-brand-sub">Le Studio</span>
        </Link>
        <StudioNav pending={pending} />
        <div className="st-side-foot">
          <Link href="/chat" className="st-claude">
            <IconSpark size={18} />
            <span>
              <b>Parler à Claude</b>
              <small>Idées, angles, réécritures</small>
            </span>
          </Link>
          <p className="st-sign">La précision, sans la répétition.</p>
        </div>
      </aside>

      <header className="st-top">
        <Link href="/studio" className="st-brand-word">
          harmoniq <i>ai</i>
        </Link>
        <Link href="/chat" className="st-iconbtn" aria-label="Parler à Claude">
          <IconSpark size={20} />
        </Link>
      </header>

      <main id="contenu" className="st-main">
        {children}
      </main>

      <nav className="st-bottom" aria-label="Navigation principale">
        <StudioNav pending={pending} compact />
      </nav>
    </div>
  );
}

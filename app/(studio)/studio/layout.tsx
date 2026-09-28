import type { Metadata } from 'next';
import Link from 'next/link';
import { Cormorant_Garamond, Manrope } from 'next/font/google';

import { StudioTabs } from './tabs';
import './studio.css';

export const metadata: Metadata = {
  title: 'harmoniq ai · Le Studio',
};

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--st-serif',
});

const sans = Manrope({
  subsets: ['latin'],
  variable: '--st-sans',
});

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`studio ${serif.variable} ${sans.variable}`}>
      <header className="st-mast">
        <div className="st-w st-title">
          <h1>
            harmoniq <i>ai</i>
          </h1>
          <p className="st-sign">La précision, sans la répétition.</p>
        </div>
      </header>
      <nav className="st-tabs">
        <div className="st-w">
          <StudioTabs />
        </div>
      </nav>
      <main className="st-w st-main">{children}</main>
      <Link href="/chat" className="st-fab">
        ✨ Claude
      </Link>
    </div>
  );
}

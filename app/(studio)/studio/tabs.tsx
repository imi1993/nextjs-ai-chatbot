'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/studio', label: '☀︎ Aujourd’hui' },
  { href: '/studio/a-valider', label: '✓ À valider' },
  { href: '/studio/calendrier', label: '🗓 Calendrier' },
];

export function StudioTabs() {
  const pathname = usePathname();
  return (
    <>
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="st-tab"
          aria-current={pathname === tab.href ? 'page' : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </>
  );
}

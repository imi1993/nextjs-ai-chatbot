'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { IconCalendar, IconReview, IconToday } from './icons';

const ITEMS = [
  { href: '/studio', label: 'Aujourd’hui', Icon: IconToday },
  { href: '/studio/a-valider', label: 'À valider', Icon: IconReview },
  { href: '/studio/calendrier', label: 'Calendrier', Icon: IconCalendar },
];

export function StudioNav({
  pending,
  compact = false,
}: {
  pending: number;
  compact?: boolean;
}) {
  const pathname = usePathname();
  return (
    <ul className={compact ? 'st-tabbar' : 'st-nav'}>
      {ITEMS.map(({ href, label, Icon }) => {
        const badge = href === '/studio/a-valider' && pending > 0;
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
            >
              <span className="st-nav-ic">
                <Icon size={compact ? 22 : 19} />
                {badge && compact && <span className="st-dotbadge" />}
              </span>
              <span className="st-nav-label">{label}</span>
              {badge && !compact && (
                <span className="st-count" aria-label={`${pending} en attente`}>
                  {pending}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

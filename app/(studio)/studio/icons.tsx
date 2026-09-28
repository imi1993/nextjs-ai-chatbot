import type { StudioPost } from '@/lib/db/schema';

type IconProps = { size?: number; className?: string };

function Svg({
  size = 20,
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const IconToday = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </Svg>
);
export const IconReview = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="4" width="17" height="16" rx="3" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </Svg>
);
export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="3" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Svg>
);
export const IconSpark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5Z" />
    <path d="M18.5 16.5c.2 1.3.9 2 2.2 2.2-1.3.2-2 .9-2.2 2.2-.2-1.3-.9-2-2.2-2.2 1.3-.2 2-.9 2.2-2.2Z" />
  </Svg>
);
export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);
export const IconX = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </Svg>
);
export const IconRefresh = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
    <path d="M19.5 4.5v4h-4" />
  </Svg>
);
export const IconPen = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 19.5l1-4L15.8 5.2a2 2 0 0 1 2.9 0l.1.1a2 2 0 0 1 0 2.9L8.5 18.5l-4 1Z" />
  </Svg>
);
export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconChevron = ({
  dir = 'right',
  ...p
}: IconProps & { dir?: 'left' | 'right' }) => (
  <Svg {...p}>
    <path d={dir === 'right' ? 'm9.5 6 6 6-6 6' : 'm14.5 6-6 6 6 6'} />
  </Svg>
);
export const IconArrow = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />
  </Svg>
);
export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

const KIND_PATHS: Record<StudioPost['kind'], React.ReactNode> = {
  post: <path d="M6 6.5h12M6 10.5h12M6 14.5h8M6 18.5h5" />,
  carousel: (
    <>
      <rect x="7" y="4.5" width="10" height="15" rx="2" />
      <path d="M4 7v10M20 7v10" />
    </>
  ),
  video: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
      <path d="m10.5 9.5 4 2.5-4 2.5Z" />
    </>
  ),
  visual: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9.5" cy="9.5" r="1.5" />
      <path d="m20 15-4.5-4.5L6 20" />
    </>
  ),
};

export function KindIcon({
  kind,
  ...p
}: IconProps & { kind: StudioPost['kind'] }) {
  return <Svg {...p}>{KIND_PATHS[kind]}</Svg>;
}

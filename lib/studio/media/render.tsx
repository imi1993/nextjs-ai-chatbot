import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { PDFDocument } from 'pdf-lib';

import type { Account } from '../brand';
import type { SlideSpec, VisualSpec } from '../types';

export const MEDIA_WIDTH = 1080;
export const MEDIA_HEIGHT = 1350;

const INK = '#121110';
const IVORY = '#F4F0E8';
const MUTE = '#6E675C';
const RULE = '#D9D0BF';
const ACCENT: Record<Account, { strong: string; soft: string }> = {
  perso: { strong: '#A8823A', soft: '#F0C782' },
  reco: { strong: '#5F68BE', soft: '#A4AEEB' },
};

const FONT_DIR = path.join(process.cwd(), 'lib/studio/media/fonts');
let fontsPromise: ReturnType<typeof loadFonts> | undefined;

async function loadFonts() {
  const read = (file: string) => readFile(path.join(FONT_DIR, file));
  const [serif, serifItalic, sans, sansBold, sansHeavy] = await Promise.all([
    read('Cormorant-Medium.ttf'),
    read('Cormorant-MediumItalic.ttf'),
    read('Manrope-Medium.ttf'),
    read('Manrope-Bold.ttf'),
    read('Manrope-ExtraBold.ttf'),
  ]);
  return [
    {
      name: 'Serif',
      data: serif,
      weight: 500 as const,
      style: 'normal' as const,
    },
    {
      name: 'Serif',
      data: serifItalic,
      weight: 500 as const,
      style: 'italic' as const,
    },
    {
      name: 'Sans',
      data: sans,
      weight: 500 as const,
      style: 'normal' as const,
    },
    {
      name: 'Sans',
      data: sansBold,
      weight: 700 as const,
      style: 'normal' as const,
    },
    {
      name: 'Sans',
      data: sansHeavy,
      weight: 800 as const,
      style: 'normal' as const,
    },
  ];
}

async function toPng(element: React.ReactElement) {
  fontsPromise ??= loadFonts();
  const response = new ImageResponse(element, {
    width: MEDIA_WIDTH,
    height: MEDIA_HEIGHT,
    fonts: await fontsPromise,
  });
  return Buffer.from(await response.arrayBuffer());
}

function Kicker({ text, color }: { text: string; color: string }) {
  return (
    <div
      style={{
        fontFamily: 'Sans',
        fontWeight: 800,
        fontSize: 26,
        letterSpacing: 5,
        textTransform: 'uppercase',
        color,
      }}
    >
      {text}
    </div>
  );
}

function Brand({ color, size = 40 }: { color: string; size?: number }) {
  return (
    <div
      style={{ display: 'flex', fontFamily: 'Serif', fontSize: size, color }}
    >
      harmoniq&nbsp;<span style={{ fontStyle: 'italic' }}>ai</span>
    </div>
  );
}

function Check({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- single visual ---------- */

function Refined({ spec, account }: { spec: VisualSpec; account: Account }) {
  const accent = ACCENT[account];
  const scattered = [
    { x: 30, y: 40, r: -14 },
    { x: 150, y: 0, r: 9 },
    { x: 80, y: 150, r: 18 },
    { x: 200, y: 120, r: -6 },
    { x: 10, y: 250, r: 6 },
  ];
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: IVORY,
      }}
    >
      <div style={{ display: 'flex', height: 12, background: accent.strong }} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          padding: '80px 90px 60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Kicker text={spec.kicker} color={accent.strong} />
          <Brand color={INK} size={36} />
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 70,
            fontFamily: 'Serif',
            fontSize: 92,
            lineHeight: 1.02,
            color: INK,
            letterSpacing: -1,
          }}
        >
          {spec.headline}
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 40,
          }}
        >
          <div
            style={{
              display: 'flex',
              position: 'relative',
              width: 340,
              height: 380,
            }}
          >
            {scattered.map((d) => (
              <div
                key={`${d.x}-${d.y}`}
                style={{
                  position: 'absolute',
                  left: d.x,
                  top: d.y,
                  width: 110,
                  height: 140,
                  background: '#FFFFFF',
                  border: `2px solid ${RULE}`,
                  transform: `rotate(${d.r}deg)`,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 16,
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    height: 8,
                    width: 60,
                    background: RULE,
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    height: 8,
                    width: 76,
                    background: RULE,
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    height: 8,
                    width: 44,
                    background: RULE,
                  }}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              fontFamily: 'Serif',
              fontSize: 90,
              color: accent.strong,
            }}
          >
            →
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  width: 330,
                  height: 66,
                  padding: '0 22px',
                  background: '#FFFFFF',
                  border: `2px solid ${i === 2 ? accent.strong : RULE}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    background: i === 2 ? accent.strong : INK,
                    color: IVORY,
                    fontFamily: 'Sans',
                    fontWeight: 800,
                    fontSize: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i === 2 ? '!' : <Check color={IVORY} size={20} />}
                </div>
                <div
                  style={{
                    display: 'flex',
                    height: 10,
                    width: 170,
                    background: RULE,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: INK,
          padding: '42px 90px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Serif',
            fontStyle: 'italic',
            fontSize: 38,
            color: IVORY,
          }}
        >
          L’automatisation prépare. L’humain décide.
        </div>
        <Brand color={accent.soft} size={34} />
      </div>
    </div>
  );
}

function Poll({ spec, account }: { spec: VisualSpec; account: Account }) {
  const accent = ACCENT[account];
  const options = (spec.options ?? []).slice(0, 3);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: INK,
        padding: '90px 90px 70px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Kicker text={spec.kicker || 'Sondage'} color={accent.soft} />
        <Brand color={IVORY} size={36} />
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 90,
          fontFamily: 'Serif',
          fontSize: 84,
          lineHeight: 1.05,
          color: IVORY,
        }}
      >
        {spec.headline}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
          marginTop: 'auto',
        }}
      >
        {options.map((option, i) => (
          <div
            key={option}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 28,
              padding: '28px 32px',
              border: `2px solid ${i === 0 ? accent.soft : '#3A3631'}`,
              borderRadius: 22,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 58,
                height: 58,
                borderRadius: 29,
                background: accent.soft,
                color: INK,
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Sans',
                fontWeight: 800,
                fontSize: 28,
              }}
            >
              {String.fromCharCode(65 + i)}
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'Sans',
                fontWeight: 700,
                fontSize: 36,
                color: IVORY,
              }}
            >
              {option}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          marginTop: 50,
          fontFamily: 'Serif',
          fontStyle: 'italic',
          fontSize: 34,
          color: '#A8A195',
        }}
      >
        Répondez en commentaire : A, B ou C.
      </div>
    </div>
  );
}

export function renderVisual(spec: VisualSpec, account: Account) {
  return toPng(
    spec.style === 'sondage' ? (
      <Poll spec={spec} account={account} />
    ) : (
      <Refined spec={spec} account={account} />
    ),
  );
}

/* ---------- carousel ---------- */

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

function Slide({
  slide,
  index,
  total,
  account,
}: {
  slide: SlideSpec;
  index: number;
  total: number;
  account: Account;
}) {
  const accent = ACCENT[account];
  const dark = slide.kind === 'cover' || slide.kind === 'cta';
  const fg = dark ? IVORY : INK;
  const items = (slide.items ?? []).slice(0, 4);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: dark ? INK : IVORY,
        padding: '84px 90px 64px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Brand color={dark ? accent.soft : INK} size={36} />
        <div
          style={{
            display: 'flex',
            fontFamily: 'Sans',
            fontWeight: 700,
            fontSize: 24,
            color: dark ? '#A8A195' : MUTE,
          }}
        >
          {index + 1} / {total}
        </div>
      </div>

      {slide.kind === 'cover' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            gap: 36,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 120,
              height: 6,
              background: accent.soft,
            }}
          />
          <div
            style={{
              display: 'flex',
              fontFamily: 'Serif',
              fontSize: 104,
              lineHeight: 1,
              color: fg,
            }}
          >
            {slide.title}
          </div>
          {slide.body && (
            <div
              style={{
                display: 'flex',
                fontFamily: 'Sans',
                fontSize: 36,
                lineHeight: 1.4,
                color: '#CFC8BC',
              }}
            >
              {slide.body}
            </div>
          )}
        </div>
      )}

      {slide.kind === 'cta' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            gap: 34,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: 'Serif',
              fontSize: 90,
              lineHeight: 1.02,
              color: fg,
            }}
          >
            {slide.title}
          </div>
          {slide.body && (
            <div
              style={{
                display: 'flex',
                fontFamily: 'Sans',
                fontSize: 34,
                lineHeight: 1.45,
                color: '#CFC8BC',
              }}
            >
              {slide.body}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              marginTop: 20,
              padding: '22px 36px',
              borderRadius: 999,
              background: accent.soft,
              color: INK,
              fontFamily: 'Sans',
              fontWeight: 800,
              fontSize: 30,
            }}
          >
            harmoniq-ai.fr
          </div>
        </div>
      )}

      {!dark && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            marginTop: 70,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontFamily: 'Serif',
              fontSize: 76,
              lineHeight: 1.04,
              color: fg,
            }}
          >
            {slide.title}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 34,
              marginTop: 90,
            }}
          >
            {items.map((item, i) => (
              <div
                key={item}
                style={{ display: 'flex', alignItems: 'center', gap: 30 }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexShrink: 0,
                    width: 76,
                    height: 76,
                    borderRadius: 38,
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: slide.kind === 'steps' ? 'Serif' : 'Sans',
                    fontStyle: slide.kind === 'steps' ? 'italic' : 'normal',
                    fontWeight: slide.kind === 'steps' ? 500 : 800,
                    fontSize: slide.kind === 'steps' ? 36 : 28,
                    border: `4px solid ${accent.strong}`,
                    background:
                      slide.kind === 'benefits' ? accent.strong : 'transparent',
                    color: slide.kind === 'benefits' ? IVORY : accent.strong,
                  }}
                >
                  {slide.kind === 'steps' ? (
                    ROMAN[i]
                  ) : slide.kind === 'benefits' ? (
                    <Check color={IVORY} size={40} />
                  ) : (
                    String(i + 1).padStart(2, '0')
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    fontFamily: 'Sans',
                    fontWeight: 700,
                    fontSize: 36,
                    lineHeight: 1.3,
                    color: INK,
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `2px solid ${dark ? '#3A3631' : RULE}`,
          paddingTop: 26,
          fontFamily: 'Serif',
          fontStyle: 'italic',
          fontSize: 30,
          color: dark ? '#A8A195' : MUTE,
        }}
      >
        <div style={{ display: 'flex' }}>La précision, sans la répétition.</div>
        {index < total - 1 && (
          <div
            style={{
              display: 'flex',
              fontFamily: 'Sans',
              fontStyle: 'normal',
              fontWeight: 800,
              fontSize: 24,
              color: dark ? accent.soft : accent.strong,
            }}
          >
            GLISSEZ →
          </div>
        )}
      </div>
    </div>
  );
}

export function renderSlide(
  slides: Array<SlideSpec>,
  index: number,
  account: Account,
) {
  return toPng(
    <Slide
      slide={slides[index]}
      index={index}
      total={slides.length}
      account={account}
    />,
  );
}

export async function renderCarouselPdf(
  slides: Array<SlideSpec>,
  account: Account,
) {
  const pngs = await Promise.all(
    slides.map((_, i) => renderSlide(slides, i, account)),
  );
  const pdf = await PDFDocument.create();
  for (const png of pngs) {
    const image = await pdf.embedPng(png);
    const page = pdf.addPage([MEDIA_WIDTH, MEDIA_HEIGHT]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: MEDIA_WIDTH,
      height: MEDIA_HEIGHT,
    });
  }
  return { pdf: Buffer.from(await pdf.save()), cover: pngs[0] };
}

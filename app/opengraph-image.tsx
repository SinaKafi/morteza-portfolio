import { ImageResponse } from 'next/og';
import { careerSpanMonths, experienceByRecency, formatDuration, getResume, leadSentence } from '@/lib/content';
import { accent, hairline, ink, paper } from '@/lib/design/colors';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Required by `output: "export"`: the card is generated from the resume at build
// time, so the route must be declared static.
export const dynamic = 'force-static';

/**
 * Neutral on purpose: the name is carried by the page metadata. This file must
 * not restate a personal fact, and `tests/interface-guards.test.ts` enforces it.
 */
export const alt = 'Portfolio social card';

/**
 * The social card is typographic and generated from the resume: no stock
 * imagery, no gradient, and the same dimension-line detail as the page.
 *
 * Colours come from the token mirror because the `next/og` renderer rasterises
 * outside the CSS cascade.
 */
export default function OpengraphImage() {
  const resume = getResume();
  const byRecency = experienceByRecency(resume);
  const earliest = byRecency.at(-1);
  const lead = leadSentence(resume.profile);
  const span = formatDuration(careerSpanMonths(resume));
  const location = byRecency.find((entry) => entry.range.ongoing)?.location ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: ink.page,
          padding: 64,
          color: paper.primary,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, color: paper.muted }}>
          <span>{location}</span>
          <span>{earliest ? `since ${earliest.range.start.label}` : ''}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 84, letterSpacing: -2.5 }}>{resume.profile.name}</span>
          <span style={{ fontSize: 30, color: paper.secondary, marginTop: 14 }}>
            {resume.profile.title}
          </span>
          {lead ? (
            <span style={{ fontSize: 24, color: paper.secondary, marginTop: 26, maxWidth: 940 }}>
              {lead}
            </span>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', height: 1, flexGrow: 1, backgroundColor: hairline.strong }} />
          <span style={{ fontSize: 22, color: accent.ink }}>{span}</span>
          <div style={{ display: 'flex', height: 1, flexGrow: 1, backgroundColor: hairline.strong }} />
          <span style={{ fontSize: 22, color: paper.muted }}>{byRecency.length} roles</span>
        </div>
      </div>
    ),
    size,
  );
}

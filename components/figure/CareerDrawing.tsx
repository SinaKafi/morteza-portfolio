'use client';

import { useInView } from '@/lib/motion/use-reveal';
import { useSpringSettle } from '@/lib/motion/use-spring-settle';
import type { Timeline } from '@/lib/figure/timeline';

/** Row rhythm. The three columns share these so labels, bars and dates align. */
const ROW_HEIGHT = 34;
const ROW_GAP = 10;
const ROW_STEP = ROW_HEIGHT + ROW_GAP;

interface CareerDrawingProps {
  timeline: Timeline;
  /** `Jul 2019` — the figure's origin, printed on the dimension line. */
  originLabel: string;
  /** `7 yrs 4 mos` — the dimension line's subject. */
  spanLabel: string;
  /** Screen-reader text for the whole drawing. */
  describedBy: string;
}

/**
 * The one moment that carries the colour: the resume drawn as an engineering
 * chart. One row per role, real months, year gridlines, a dashed line at today,
 * and a dimension line along the top. Ongoing roles take the accent; everything
 * else sits in neutral steps of the ramp.
 *
 * The bars grow into place once, when the figure first scrolls into view, under
 * a critically damped spring. Nothing loops and nothing moves again.
 */
export function CareerDrawing({ timeline, originLabel, spanLabel, describedBy }: CareerDrawingProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const offsets = useSpringSettle(timeline.rows.length, {
    enabled: inView,
    from: -22,
    staggerMs: 45,
  });

  const extent = timeline.extent === 0 ? 1 : timeline.extent;
  const share = (months: number) => (months / extent) * 100;
  const trackHeight = timeline.rows.length * ROW_STEP - ROW_GAP;

  return (
    <div ref={ref} className="panel glass blueprint-grid relative overflow-hidden p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-mono text-meta text-paper-mute">Career, measured in months</h3>
        <p className="tnum font-mono text-meta text-paper-mute">{timeline.rows.length} roles</p>
      </div>

      <div className="tnum mt-6 flex items-center gap-3 font-mono text-meta text-paper-mute">
        <span>{originLabel}</span>
        <span aria-hidden className="h-px flex-1 bg-hairline" />
        <span className="text-paper-dim">{spanLabel}</span>
        <span aria-hidden className="h-px flex-1 bg-hairline" />
        <span>today</span>
      </div>

      <div className="mt-6 grid grid-cols-[6.5rem_1fr] gap-x-4 sm:grid-cols-[9rem_1fr_auto] sm:gap-x-5">
        {/* Row labels */}
        <div aria-hidden className="flex flex-col" style={{ gap: ROW_GAP }}>
          {timeline.rows.map((row) => (
            <span
              key={row.id}
              className={[
                'truncate text-[12px] leading-none sm:text-[13px]',
                row.ongoing ? 'text-paper' : 'text-paper-dim',
              ].join(' ')}
              style={{ height: ROW_HEIGHT, lineHeight: `${ROW_HEIGHT}px` }}
              title={row.label}
            >
              {row.label}
            </span>
          ))}
        </div>

        {/* Track: gridlines, the today marker, then the bars */}
        <div aria-hidden className="relative" style={{ height: trackHeight }}>
          {timeline.years.map((year) => (
            <div
              key={year.year}
              className="absolute top-0 bottom-0 w-px bg-hairline"
              style={{ left: `${share(year.offset)}%` }}
            />
          ))}

          <div
            className="absolute top-0 bottom-0 border-l border-dashed border-hairline-strong"
            style={{ left: `${share(timeline.nowOffset)}%` }}
          />

          {timeline.rows.map((row, index) => (
            <div
              key={row.id}
              className="absolute left-0 right-0"
              style={{
                top: index * ROW_STEP,
                height: ROW_HEIGHT,
                transform: `translate3d(0, ${(offsets[index] ?? 0).toFixed(2)}px, 0)`,
              }}
            >
              <div
                className="relative h-full rounded-[6px] border border-hairline bg-ink-750"
                style={{
                  marginLeft: `${share(row.offset)}%`,
                  width: `${share(row.months)}%`,
                  minWidth: 4,
                  boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.06)',
                }}
              >
                {/* The accent marks the live end of a role still running, and
                    nothing else in the figure takes colour. */}
                {row.ongoing ? (
                  <span
                    aria-hidden
                    className="absolute top-0 right-0 bottom-0 w-[2px] rounded-r-[5px] bg-cobalt"
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {/* Period annotations, in their own aligned column */}
        <div className="hidden flex-col sm:flex" style={{ gap: ROW_GAP }}>
          {timeline.rows.map((row) => (
            <span
              key={row.id}
              className="tnum whitespace-nowrap font-mono text-[11px] text-paper-mute"
              style={{ height: ROW_HEIGHT, lineHeight: `${ROW_HEIGHT}px` }}
            >
              {row.period}
            </span>
          ))}
        </div>

        {/* Axis */}
        <div aria-hidden className="hidden sm:block" />
        <div aria-hidden className="relative mt-3 h-4">
          {timeline.years.map((year) => (
            <span
              key={year.year}
              className="tnum absolute -translate-x-1/2 font-mono text-[11px] text-paper-mute"
              style={{ left: `${share(year.offset)}%` }}
            >
              {year.year}
            </span>
          ))}
        </div>
        <div aria-hidden className="hidden sm:block" />
      </div>

      <ul className="sr-only">
        {timeline.rows.map((row) => (
          <li key={row.id}>
            {row.label}, {row.role}, {row.period}
          </li>
        ))}
      </ul>
      <p className="sr-only">{describedBy}</p>
    </div>
  );
}

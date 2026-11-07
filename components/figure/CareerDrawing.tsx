"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { useInView } from "@/lib/motion/use-reveal";
import { FALL } from "@/lib/motion/config";
import { gravityFall } from "@/lib/motion/gravity";
import type { Timeline } from "@/lib/figure/timeline";

/** Row rhythm. The three columns share these so labels, bars and dates align. */
const ROW_HEIGHT = 34;
const ROW_GAP = 10;
const ROW_STEP = ROW_HEIGHT + ROW_GAP;

/** A deeper row has further to fall, exactly as a heavier drop would. */
function fallDistance(index: number): number {
  return FALL.baseDistance + index * FALL.distanceStep;
}

/** A longer fall takes more time: duration scales with the square root of height. */
function fallDuration(index: number): number {
  return FALL.baseDuration * Math.sqrt(fallDistance(index) / FALL.baseDistance);
}

/**
 * Year labels need about 44px each to stay clear of their neighbour. The track
 * is narrow, so show at most five labels and let the gridlines carry the rest.
 */
function axisYears(years: Timeline['years']): Timeline['years'] {
  const step = Math.max(1, Math.ceil(years.length / 5));
  return years.filter((_, index) => index % step === 0);
}

/**
 * Each visual row is split across three aligned columns (label, bar, date), so
 * they carry the same index and are animated as one group. That way a row never
 * drifts away from its own label while it falls.
 */
function rowsByIndex(root: HTMLElement): HTMLElement[][] {
  const groups = new Map<number, HTMLElement[]>();
  for (const element of root.querySelectorAll<HTMLElement>(
    "[data-row-index]",
  )) {
    const index = Number(element.dataset.rowIndex);
    const group = groups.get(index);
    if (group) group.push(element);
    else groups.set(index, [element]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, elements]) => elements);
}

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
 * When the figure first scrolls into view, its bars fall from above their rest
 * position under a gravity curve and settle, and the today marker draws down.
 * The motion runs once. Under `prefers-reduced-motion` nothing moves at all.
 */
export function CareerDrawing({
  timeline,
  originLabel,
  spanLabel,
  describedBy,
}: CareerDrawingProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  // Put the rows above their rest position before they are ever revealed, so
  // there is no flash of the finished chart followed by a jump.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = rowsByIndex(root);
    const now = root.querySelector<HTMLElement>("[data-now]");

    rows.forEach((elements, index) => {
      gsap.set(elements, { y: -fallDistance(index), opacity: 0 });
    });
    if (now) gsap.set(now, { scaleY: 0, opacity: 0, transformOrigin: "top" });
  }, [ref]);

  useEffect(() => {
    const root = ref.current;
    if (!root || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = rowsByIndex(root);
    const now = root.querySelector<HTMLElement>("[data-now]");

    const timeline = gsap.timeline();
    if (now) {
      timeline.to(
        now,
        { scaleY: 1, opacity: 1, duration: 0.8, ease: "power3.out" },
        0,
      );
    }
    rows.forEach((elements, index) => {
      timeline.to(
        elements,
        {
          y: 0,
          opacity: 1,
          duration: fallDuration(index),
          ease: gravityFall,
        },
        0.08 + index * FALL.stagger,
      );
    });

    return () => {
      timeline.kill();
    };
  }, [inView, ref]);

  const extent = timeline.extent === 0 ? 1 : timeline.extent;
  const share = (months: number) => (months / extent) * 100;
  const trackHeight = timeline.rows.length * ROW_STEP - ROW_GAP;

  return (
    <div
      ref={ref}
      className="panel glass blueprint-grid relative overflow-hidden p-6 sm:p-8"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-mono text-meta text-paper-mute">
          Career, measured in months
        </h3>
        <p className="tnum font-mono text-meta text-paper-mute">
          {timeline.rows.length} roles
        </p>
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
          {timeline.rows.map((row, index) => (
            <span
              key={row.id}
              data-row-index={index}
              className={[
                "truncate text-[12px] leading-none sm:text-[13px]",
                row.ongoing ? "text-paper" : "text-paper-dim",
              ].join(" ")}
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
            data-now
            className="absolute top-0 bottom-0 border-l border-dashed border-hairline-strong"
            style={{ left: `${share(timeline.nowOffset)}%` }}
          />

          {timeline.rows.map((row, index) => (
            <div
              key={row.id}
              data-row-index={index}
              className="absolute left-0 right-0"
              style={{
                top: index * ROW_STEP,
                height: ROW_HEIGHT,
              }}
            >
              <div
                className="relative h-full rounded-[6px] border border-hairline bg-ink-750"
                style={{
                  marginLeft: `${share(row.offset)}%`,
                  width: `${share(row.months)}%`,
                  minWidth: 4,
                  boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06)",
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
          {timeline.rows.map((row, index) => (
            <span
              key={row.id}
              data-row-index={index}
              className="tnum whitespace-nowrap font-mono text-[11px] text-paper-mute"
              style={{ height: ROW_HEIGHT, lineHeight: `${ROW_HEIGHT}px` }}
            >
              {row.period}
            </span>
          ))}
        </div>

        {/* Axis: under the track, thinned out so labels never touch. It is
            omitted on narrow screens, where the dates column is hidden too and
            the dimension line above already states the span. */}
        <div aria-hidden className="relative mt-3 hidden h-4 sm:col-start-2 sm:block">
          {axisYears(timeline.years).map((year) => (
            <span
              key={year.year}
              className="tnum absolute -translate-x-1/2 font-mono text-meta text-paper-mute"
              style={{ left: `${share(year.offset)}%` }}
            >
              {year.year}
            </span>
          ))}
        </div>
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

import type { Experience } from '@/lib/content/schema';

/**
 * Geometry for the career figure.
 *
 * One row per role, oldest at the top, positioned and sized by real months from
 * the resume. Overlaps are visible by comparison rather than by packing roles
 * into lanes — a lane layout looked like a broken chart, and it forced labels to
 * collide. Here every label owns its own row.
 */

/** Months of empty track after the present moment, so bars never touch the edge. */
const TAIL_MONTHS = 3;

export interface TimelineRow {
  id: string;
  /** Company, printed in the figure's label column. */
  label: string;
  role: string;
  /** Period text, exactly as the resume writes it. */
  period: string;
  ongoing: boolean;
  employment: boolean;
  /** Months from the figure's origin to the start of the bar. */
  offset: number;
  /** Bar length in months. */
  months: number;
}

export interface Timeline {
  rows: TimelineRow[];
  origin: number;
  /** Months from origin to the right edge of the track. */
  extent: number;
  /** Months from origin to today, where the dashed marker sits. */
  nowOffset: number;
  /** Calendar years to print along the axis. */
  years: { year: number; offset: number }[];
}

const asMonth = (date: { year: number; month: number }): number => date.year * 12 + date.month;

export function buildTimeline(entries: readonly Experience[], now: Date = new Date()): Timeline {
  if (entries.length === 0) {
    return { rows: [], origin: 0, extent: 1, nowOffset: 0, years: [] };
  }

  const nowMonth = now.getUTCFullYear() * 12 + now.getUTCMonth() + 1;
  const origin = Math.min(...entries.map((entry) => asMonth(entry.range.start)));

  const rows: TimelineRow[] = entries
    .map((entry) => {
      const start = asMonth(entry.range.start);
      const end = entry.range.ongoing
        ? nowMonth
        : entry.range.end
          ? asMonth(entry.range.end)
          : start + 1;
      return {
        id: entry.id,
        label: entry.company,
        role: entry.role,
        period: entry.range.label,
        ongoing: entry.range.ongoing,
        employment: entry.kind === 'employment',
        offset: start - origin,
        months: Math.max(end, start + 1) - start,
      };
    })
    .sort((a, b) => a.offset - b.offset || a.months - b.months);

  const lastMonth = Math.max(...rows.map((row) => row.offset + row.months));
  const extent = Math.max(lastMonth + TAIL_MONTHS, 1);

  const years: { year: number; offset: number }[] = [];
  for (let year = Math.floor(origin / 12); year <= Math.floor((origin + extent) / 12); year += 1) {
    const offset = year * 12 + 1 - origin;
    if (offset >= 0 && offset < extent) years.push({ year, offset });
  }

  return { rows, origin, extent, nowOffset: nowMonth - origin, years };
}

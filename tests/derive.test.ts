import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SELECTED_PROJECT_COMPANIES,
  careerSpanMonths,
  experienceByRecency,
  formatDuration,
  llmsTxt,
  metaDescription,
  resumeJson,
  selectProjects,
  skillCount,
  skillLabel,
} from '../lib/content/derive';
import { parseResume } from '../lib/content/parse-resume';

const NOW = new Date('2026-11-03T00:00:00Z');
const resume = parseResume(
  readFileSync(join(process.cwd(), 'content/resume.md'), 'utf8'),
  { now: NOW },
);

describe('views over the resume', () => {
  it('orders experience by recency, latest first', () => {
    const ordered = experienceByRecency(resume);

    expect(ordered[0]?.company).toBe('Baher');
    expect(ordered.at(-1)?.company).toBe('Dorna Robotics');
    // Every pair is ordered, not just the ends.
    for (let index = 1; index < ordered.length; index += 1) {
      const previous = ordered[index - 1]!;
      const current = ordered[index]!;
      const asMonth = (entry: typeof previous) => entry.range.start.year * 12 + entry.range.start.month;
      expect(asMonth(previous)).toBeGreaterThanOrEqual(asMonth(current));
    }
  });

  it('selects the curated projects in the curated order', () => {
    const projects = selectProjects(resume);

    expect(projects.map((project) => project.name)).toEqual([
      'Vardast',
      'Novin Arzesh',
      'Baher',
      'Adliran / 30dad.ir',
    ]);
    expect(SELECTED_PROJECT_COMPANIES.every((name) => resume.experience.some((entry) => entry.company.startsWith(name)))).toBe(true);
  });

  it('measures the career without double-counting overlapping roles', () => {
    // Jul 2019 to Nov 2026 is 88 months, with several roles running in parallel.
    expect(careerSpanMonths(resume, NOW)).toBe(88);
    expect(formatDuration(88)).toBe('7 yrs 4 mos');
    expect(formatDuration(1)).toBe('1 mo');
    expect(formatDuration(12)).toBe('1 yr');
  });

  it('keeps the meta description inside what search engines show', () => {
    const description = metaDescription(resume);

    expect(description.length).toBeLessThanOrEqual(160);
    expect(description.endsWith(' ')).toBe(false);
    expect(description).not.toContain('  ');
  });

  it('publishes the phone number to machines but keeps it off the page', () => {
    const json = JSON.parse(resumeJson(resume)) as {
      profile: { contacts: { kind: string; published: boolean }[] };
    };

    expect(json.profile.contacts.some((contact) => contact.kind === 'phone')).toBe(true);
    expect(llmsTxt(resume)).not.toContain('+98911');
    expect(llmsTxt(resume)).toContain('mortezanajafiofficial@gmail.com');
  });

  it('labels a skill with its note for machine consumers', () => {
    const next = resume.skills[0]?.skills[0];

    expect(next).toEqual({ name: 'Next.js', note: 'CSR, SSR' });
    expect(next && skillLabel(next)).toBe('Next.js (CSR, SSR)');
    expect(skillCount(resume.skills)).toBe(55);
  });
});

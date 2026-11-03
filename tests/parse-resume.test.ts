import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseResume, parseResumeSource } from '../lib/content/parse-resume';

const NOW = new Date('2026-11-03T00:00:00Z');
const real = readFileSync(join(process.cwd(), 'content/resume.md'), 'utf8');

const FIXTURE = `Ada Lovelace

Engineer

Email: ada@example.com
GitHub: ada

Summary

Writes programs for machines that do not exist yet.

Work Experience & Projects

Acme — Widgets
Senior Engineer
London, UK · Jan 2020 – Present

Built the widget pipeline.
Wrote the widget tests.

Old Co
Engineer · Contract
Paris, France · Mar 2018 – Dec 2019

Kept the lights on.

Technical Skills

Category Skills
Frontend Frameworks Next.js (CSR, SSR), React
Databases PostgreSQL, MySQL

Leadership & Management

Mentoring (juniors)

Education

Some University
B.S. in Computer Science
London, UK · 2010 – 2013

Studied things.
`;

describe('the real resume', () => {
  it('parses without a single complaint', () => {
    const { resume, problems } = parseResumeSource(real, { now: NOW });
    expect(problems).toEqual([]);
    expect(resume).not.toBeNull();
  });

  it('reads every section the page renders', () => {
    const resume = parseResume(real, { now: NOW });

    expect(resume.experience).toHaveLength(8);
    expect(resume.skills).toHaveLength(13);
    expect(resume.leadership).toHaveLength(6);
    expect(resume.education).toHaveLength(2);
    expect(resume.profile.summary).toBeTruthy();
  });

  it('keeps the phone number in the data but out of the interface', () => {
    const resume = parseResume(real, { now: NOW });
    const phone = resume.profile.contacts.find((contact) => contact.kind === 'phone');

    expect(phone).toBeDefined();
    expect(phone?.published).toBe(false);
  });

  it('only ever tags an entry with a technology its own text mentions', () => {
    const resume = parseResume(real, { now: NOW });

    for (const entry of resume.experience) {
      const text = [entry.role, entry.summary ?? '', ...entry.points].join(' ');
      for (const technology of entry.technologies) {
        expect(text).toContain(technology);
      }
    }
  });

  it('tags an entry once per technology, however often the prose names it', () => {
    const resume = parseResume(real, { now: NOW });

    for (const entry of resume.experience) {
      expect(new Set(entry.technologies).size).toBe(entry.technologies.length);
    }
    // MCI's bullets name Next.js and TypeScript more than once each.
    const mci = resume.experience.find((entry) => entry.company === 'MCI');
    expect(mci?.technologies.filter((technology) => technology === 'Next.js')).toHaveLength(1);
  });

  it('measures ongoing roles against the injected clock, not the wall clock', () => {
    const resume = parseResume(real, { now: NOW });
    const ongoing = resume.experience.filter((entry) => entry.range.ongoing);

    expect(ongoing.map((entry) => entry.company)).toContain('MCI');
    const mci = ongoing.find((entry) => entry.company === 'MCI');
    // Oct 2024 to Nov 2026.
    expect(mci?.range.durationMonths).toBe(25);
  });

  it('does not invent a duration for an entry that states a single year', () => {
    const resume = parseResume(real, { now: NOW });
    const research = resume.education.find((entry) => entry.kind === 'research');

    expect(research?.range.label).toBe('2013');
    expect(research?.range.durationMonths).toBe(0);
  });
});

describe('the parser', () => {
  it('accepts a hand-written fixture', () => {
    const { resume, problems } = parseResumeSource(FIXTURE, { now: NOW });
    expect(problems).toEqual([]);
    expect(resume?.experience).toHaveLength(2);
    expect(resume?.experience[0]?.company).toBe('Acme');
    expect(resume?.experience[1]?.kind).toBe('contract');
  });

  it('keeps a comma inside a parenthetical from splitting a skill in two', () => {
    const { resume } = parseResumeSource(FIXTURE, { now: NOW });
    const frontend = resume?.skills.find((group) => group.category === 'Frontend Frameworks');

    expect(frontend?.skills).toEqual([
      { name: 'Next.js', note: 'CSR, SSR' },
      { name: 'React', note: null },
    ]);
  });

  it('reports a missing section instead of rendering a half page', () => {
    const { resume, problems } = parseResumeSource(
      FIXTURE.replace('Leadership & Management\n\n', ''),
      { now: NOW },
    );

    expect(resume).toBeNull();
    expect(problems.join('\n')).toContain('no "Leadership & Management" heading found');
  });

  it('reports an unknown skill category and says how to fix it', () => {
    const { problems } = parseResumeSource(
      FIXTURE.replace('Databases PostgreSQL, MySQL', 'Cloud Providers AWS, GCP'),
      { now: NOW },
    );

    expect(problems.join('\n')).toContain('SKILL_CATEGORIES');
  });

  it('rejects a range that ends before it starts', () => {
    const { problems } = parseResumeSource(
      FIXTURE.replace('Mar 2018 – Dec 2019', 'Dec 2019 – Mar 2018'),
      { now: NOW },
    );

    expect(problems.join('\n')).toContain('ends before it starts');
  });

  it('rejects a header with no role line', () => {
    const { problems } = parseResumeSource(FIXTURE.replace('Engineer\n\n', ''), { now: NOW });

    expect(problems.join('\n')).toContain('the file must open with the name on one line');
  });

  it('reports a contact line it cannot read', () => {
    const { problems } = parseResumeSource(
      FIXTURE.replace('GitHub: ada', 'GitHub ada'),
      { now: NOW },
    );

    expect(problems.join('\n')).toContain('neither the role line nor a "Label: value" contact');
  });

  it('lists every problem at once rather than stopping at the first', () => {
    const { problems } = parseResumeSource(
      FIXTURE.replace('Cloud', 'Cloud').replace('Databases PostgreSQL, MySQL', 'Cloud Providers AWS').replace('Education', 'Education & Training'),
      { now: NOW },
    );

    expect(problems.length).toBeGreaterThan(1);
  });
});

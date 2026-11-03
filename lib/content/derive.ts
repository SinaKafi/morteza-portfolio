import type { Contact, DateRange, Experience, Profile, Project, Resume, Skill, SkillGroup } from './schema';

/**
 * Views over the parsed resume.
 *
 * Nothing here authors content. Every value is either read from the resume or
 * arithmetic on values the resume states (month counts, orderings, groupings),
 * so the Markdown stays the only place a fact can be introduced.
 */

/**
 * Projects are curated, not inferred from a keyword.
 *
 * These are the entries that describe a product Morteza built end to end rather
 * than an employer he worked at, chosen from `content/resume.md`. Company names
 * are matched by prefix; if one stops matching, `content:check` fails and names
 * it, so this list cannot rot silently.
 *
 * Change the selection by editing this list — never by hardcoding project copy
 * in a component.
 */
export const SELECTED_PROJECT_COMPANIES = [
  'Vardast',
  'Novin Arzesh',
  'Baher',
  'Adliran',
] as const;

function sortKey(range: DateRange): [number, number] {
  return [range.start.year * 12 + range.start.month, range.ongoing ? Infinity : (range.end?.year ?? 0) * 12 + (range.end?.month ?? 0)];
}

/** Most recent first: by start date, ties broken by the one that ran longer. */
export function byRecency(a: Experience, b: Experience): number {
  const [aStart, aEnd] = sortKey(a.range);
  const [bStart, bEnd] = sortKey(b.range);
  return bStart - aStart || bEnd - aEnd;
}

export function experienceByRecency(resume: Resume): Experience[] {
  return [...resume.experience].sort(byRecency);
}

export function selectProjects(resume: Resume): Project[] {
  return SELECTED_PROJECT_COMPANIES.flatMap((prefix) => {
    const entry = resume.experience.find((candidate) => candidate.company.startsWith(prefix));
    if (!entry) return [];
    return [
      {
        id: entry.id,
        name: entry.company,
        descriptor: entry.tagline,
        role: entry.role,
        period: entry.range.label,
        location: entry.location,
        href: entry.href,
        summary: entry.summary,
        points: entry.points,
        technologies: entry.technologies,
        kind: entry.kind,
      },
    ];
  });
}

/** `25` → `2 yrs 1 mo`. Quiet meta only, never a headline claim. */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years === 1 ? '' : 's'}`);
  if (rest > 0 || years === 0) parts.push(`${rest} mo${rest === 1 ? '' : 's'}`);
  return parts.join(' ');
}

/**
 * Months between the earliest start and the furthest end, counting overlapping
 * roles once. Ongoing roles are measured against `now`.
 */
export function careerSpanMonths(resume: Resume, now: Date = new Date()): number {
  const asMonth = (date: { year: number; month: number }): number => date.year * 12 + date.month;
  const nowMonth = now.getUTCFullYear() * 12 + now.getUTCMonth() + 1;

  const sorted = experienceByRecency(resume);
  const starts = sorted.map((entry) => asMonth(entry.range.start));
  const ends = sorted.map((entry) =>
    entry.range.ongoing ? nowMonth : entry.range.end ? asMonth(entry.range.end) : asMonth(entry.range.start),
  );

  if (starts.length === 0) return 0;
  return Math.max(0, Math.max(...ends) - Math.min(...starts));
}

/** A skill as one string, for machine consumers: `Next.js (CSR, SSR)`. */
export function skillLabel(skill: Skill): string {
  return skill.note ? `${skill.name} (${skill.note})` : skill.name;
}

export function skillCount(skills: readonly SkillGroup[]): number {
  return skills.reduce((total, group) => total + group.skills.length, 0);
}

export function contactByKind(profile: Profile, kind: Contact['kind']): Contact | undefined {
  return profile.contacts.find((contact) => contact.kind === kind);
}

/**
 * The one-sentence positioning line under the name. Built from the summary the
 * resume already writes, cut at a sentence boundary so it never trails off.
 */
export function leadSentence(profile: Profile): string | null {
  if (!profile.summary) return null;
  const [first] = profile.summary.split(/(?<=\.)\s+/);
  return first?.trim() ?? null;
}

/** Meta description: the lead sentence, trimmed to a length search engines show. */
export function metaDescription(resume: Resume): string {
  const source = leadSentence(resume.profile) ?? resume.profile.summary ?? resume.profile.title;
  if (source.length <= 158) return source;
  const cut = source.slice(0, 158);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace)}…`;
}

export function siteUrl(profile: Profile): string {
  const website = contactByKind(profile, 'website');
  const value = website?.value ?? '';
  return value.startsWith('http') ? value : `https://${value}`;
}

/** `Person` structured data, from the same parsed content as the page. */
export function personJsonLd(resume: Resume) {
  const { profile } = resume;
  const published = profile.contacts.filter((contact) => contact.published);
  const sameAs = published
    .filter((contact) => contact.kind !== 'email')
    .map((contact) => contact.href);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description: metaDescription(resume),
    url: siteUrl(profile),
    email: published.find((contact) => contact.kind === 'email')?.href,
    sameAs,
    knowsAbout: resume.skills.flatMap((group) => group.skills.map(skillLabel)),
    worksFor: resume.experience
      .filter((entry) => entry.range.ongoing && entry.kind === 'employment')
      .map((entry) => ({ '@type': 'Organization', name: entry.company })),
    alumniOf: resume.education
      .filter((entry) => entry.kind === 'degree')
      .map((entry) => ({ '@type': 'CollegeOrUniversity', name: entry.institution })),
  };
}

/**
 * Machine-readable export of the parsed content. Written to `public/resume.json`
 * by `pnpm content:check`, and consumed by nothing in the interface — the pages
 * always render from the parse, never from this file, so it can never become a
 * second source of truth.
 */
export function resumeJson(resume: Resume): string {
  return `${JSON.stringify(
    {
      $comment:
        'Generated from content/resume.md by scripts/check-content.ts. Do not edit; edit the Markdown instead.',
      profile: resume.profile,
      experience: resume.experience,
      projects: selectProjects(resume),
      skills: resume.skills,
      leadership: resume.leadership,
      education: resume.education,
    },
    null,
    2,
  )}\n`;
}

/** `llms.txt` body, so agent-facing documentation derives from the resume too. */
export function llmsTxt(resume: Resume): string {
  const { profile } = resume;
  const published = profile.contacts.filter((contact) => contact.published);
  const lines: string[] = [
    `# ${profile.name}`,
    '',
    `> ${profile.title}. ${leadSentence(profile) ?? ''}`.trim(),
    '',
    `Source of truth: content/resume.md. Everything below is generated from it.`,
    '',
    '## Experience',
    '',
  ];

  for (const entry of experienceByRecency(resume)) {
    lines.push(`- ${entry.company} — ${entry.role} (${entry.location}, ${entry.range.label})`);
  }

  lines.push('', '## Selected projects', '');
  for (const project of selectProjects(resume)) {
    lines.push(`- ${project.name}${project.descriptor ? ` — ${project.descriptor}` : ''} (${project.period})`);
  }

  lines.push('', '## Skills', '');
  for (const group of resume.skills) {
    lines.push(`- ${group.category}: ${group.skills.map(skillLabel).join(', ')}`);
  }

  lines.push('', '## Contact', '');
  for (const contact of published) {
    lines.push(`- ${contact.label}: ${contact.href}`);
  }

  lines.push('');
  return lines.join('\n');
}

import {
  ContentError,
  type Contact,
  type DateRange,
  type Education,
  type Experience,
  type ExperienceKind,
  type IsoDate,
  type LeadershipItem,
  type Profile,
  type Resume,
  type SkillGroup,
  resumeSchema,
} from './schema';

/**
 * Deterministic parser for `content/resume.md`.
 *
 * The file is plain text. Its only structure is: lines, blank lines, headings
 * that occupy a whole line, entries shaped `heading / role / location · dates`,
 * and — importantly — runs of sibling lines that are *not* separated by blank
 * lines (the skills list, the leadership list, each entry's bullet list). So the
 * parser works on lines and heading offsets, and never assumes a blank line
 * separates two items.
 *
 * The parser is total: it collects every problem it finds instead of stopping at
 * the first, so a broken edit reports all of its symptoms in one build.
 */

/** Headings that own a section. */
const SECTION_HEADINGS = [
  'Summary',
  'Work Experience & Projects',
  'Technical Skills',
  'Leadership & Management',
  'Education',
] as const;

type SectionHeading = (typeof SECTION_HEADINGS)[number];

/**
 * The Technical Skills section is written `Category Skill, Skill, Skill` with no
 * delimiter between the two halves, so the category labels are the only reliable
 * split point. They are listed exactly as the file writes them.
 *
 * Adding a category to the resume means adding it here; the build fails with a
 * message naming the offending line until you do.
 */
const SKILL_CATEGORIES = [
  'Infrastructure & Deployment',
  'Version Control & Collaboration',
  'UI Libraries & Forms',
  'Development Methodologies',
  'Operating Systems & IDEs',
  'Programming Languages',
  'Frontend Frameworks',
  'Backend Development',
  'State Management',
  'API & Integration',
  'DevOps & Observability',
  'Build & Tooling',
  'Databases',
] as const;

/** Header row of the skills list; parsed past, never rendered. */
const SKILLS_TABLE_HEADER = 'Category Skills';

const CONTACT_LABELS: Record<string, Contact['kind']> = {
  phone: 'phone',
  email: 'email',
  github: 'github',
  linkedin: 'linkedin',
  website: 'website',
};

const CONTACT_DISPLAY_LABELS: Record<Contact['kind'], string> = {
  phone: 'Phone',
  email: 'Email',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  website: 'Website',
};

/**
 * Only the phone number is withheld from the interface. It stays in the parsed
 * data so `resume.json` remains a faithful machine-readable copy.
 */
const UNPUBLISHED_CONTACTS: ReadonlySet<Contact['kind']> = new Set(['phone']);

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

/** Separate location from dates in `Tehran, Iran · Oct 2024 – Present`. */
const META_SEPARATOR = ' · ';
/** A whole `location · dates` line: it must carry a four-digit year. */
const META_LINE = / · .*\d{4}/;
/** `Oct 2024 – Present`, `Mar 2023 – Aug 2023`, `2015 – 2019`, `2013`. */
const DATE_TOKEN = /^([A-Za-z]{3})[a-z]*\s+(\d{4})$|^(\d{4})$/;
const RANGE_SPLIT = /\s*[–—-]\s*/;
const ONGOING = /^(present|current|now|ongoing)$/i;
const WEBSITE_LINE = /^website\s*:/i;
/** `Title (detail)` — the shape every leadership item takes. */
const LEADERSHIP_ITEM = /^([^(]+?)\s*\((.+)\)$/;

interface Line {
  text: string;
  /** 1-based line number, for error messages. */
  number: number;
}

export interface ParseOptions {
  /**
   * Reference point for ongoing durations. Injected so parsing stays
   * reproducible in tests instead of depending on the clock.
   */
  now?: Date;
}

function toLines(source: string): Line[] {
  return source
    .split(/\r?\n/)
    .map((raw, index) => ({
      // Two trailing spaces are the file's hard line break; they are not content.
      text: raw.replace(/\s+$/, ''),
      number: index + 1,
    }))
    .filter((line) => line.text !== '');
}

function parseDateToken(token: string): IsoDate | null {
  const match = DATE_TOKEN.exec(token.trim());
  if (!match) return null;
  const [, monthName, monthYear, bareYear] = match;
  if (bareYear !== undefined) {
    const year = Number(bareYear);
    return {
      label: bareYear,
      iso: `${year}-01`,
      year,
      month: 1,
      yearOnly: true,
    };
  }
  const month = MONTHS[(monthName ?? '').slice(0, 3).toLowerCase()];
  const year = Number(monthYear);
  if (month === undefined) return null;
  return {
    label: token.trim(),
    iso: `${year}-${String(month).padStart(2, '0')}`,
    year,
    month,
    yearOnly: false,
  };
}

function monthsBetween(from: IsoDate, to: IsoDate): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

function parseDateRange(
  text: string,
  now: Date,
  problems: string[],
  where: string,
): DateRange | null {
  const parts = text.split(RANGE_SPLIT).filter((part) => part.trim() !== '');
  const startText = parts[0];
  if (startText === undefined) {
    problems.push(`${where}: no date found in "${text}"`);
    return null;
  }

  const start = parseDateToken(startText);
  if (!start) {
    problems.push(`${where}: cannot read a start date out of "${startText}"`);
    return null;
  }

  const endText = parts.slice(1).join(' – ').trim();
  const ongoing = endText !== '' && ONGOING.test(endText);
  let end: IsoDate | null = null;

  if (endText !== '' && !ongoing) {
    end = parseDateToken(endText);
    if (!end) {
      problems.push(`${where}: cannot read an end date out of "${endText}"`);
      return null;
    }
    if (monthsBetween(start, end) < 0) {
      problems.push(`${where}: "${text}" ends before it starts`);
      return null;
    }
  }

  const reference: IsoDate = {
    label: 'now',
    iso: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`,
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    yearOnly: false,
  };

  return {
    start,
    end,
    ongoing,
    label: text.trim(),
    // A bare year with no range states no duration, so it claims none. Only an
    // ongoing role is measured against today.
    durationMonths: end
      ? monthsBetween(start, end)
      : ongoing
        ? Math.max(0, monthsBetween(start, reference))
        : 0,
  };
}

/** A range that failed to parse still has to occupy the field; flagged by `problems`. */
function emptyRange(): DateRange {
  return {
    start: { label: '', iso: '1970-01', year: 1970, month: 1, yearOnly: true },
    end: null,
    ongoing: false,
    label: '',
    durationMonths: 0,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function classifyRole(role: string): ExperienceKind {
  if (/freelance/i.test(role)) return 'freelance';
  if (/contract/i.test(role)) return 'contract';
  return 'employment';
}

function hrefForContact(kind: Contact['kind'], value: string): string {
  switch (kind) {
    case 'email':
      return `mailto:${value}`;
    case 'github':
      return `https://github.com/${value}`;
    case 'linkedin':
      return `https://www.linkedin.com/in/${value}`;
    case 'website':
      return /^https?:\/\//.test(value) ? value : `https://${value}`;
    case 'phone':
      return `tel:${value.replace(/[^\d+]/g, '')}`;
  }
}

function parseContacts(lines: readonly Line[], problems: string[]): Contact[] {
  return lines.flatMap((line) => {
    const separator = line.text.indexOf(':');
    if (separator === -1) {
      problems.push(`line ${line.number}: "${line.text}" is neither the role line nor a "Label: value" contact`);
      return [];
    }
    const kind = CONTACT_LABELS[line.text.slice(0, separator).trim().toLowerCase()];
    const value = line.text.slice(separator + 1).trim();
    if (!kind || value === '') {
      problems.push(`line ${line.number}: "${line.text}" has an unknown label or an empty value`);
      return [];
    }
    return [
      {
        kind,
        label: CONTACT_DISPLAY_LABELS[kind],
        value,
        href: hrefForContact(kind, value),
        published: !UNPUBLISHED_CONTACTS.has(kind),
      },
    ];
  });
}

/**
 * Technology tags are derived by matching an entry's own prose against the
 * Technical Skills section. Longest names win and matched spans are consumed, so
 * "React Query" never also reports a bare "React" from the same phrase. An entry
 * can therefore only claim a technology the resume already states elsewhere.
 *
 * The boundaries are word characters only: `React.` at the end of a sentence is
 * a match, `RESTful` is not.
 */
function deriveTechnologies(text: string, vocabulary: readonly string[]): string[] {
  const found: { name: string; start: number; end: number }[] = [];
  for (const name of vocabulary) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(?<!\\w)${escaped}(?!\\w)`, 'g');
    for (const match of text.matchAll(pattern)) {
      const start = match.index;
      if (start === undefined) continue;
      found.push({ name, start, end: start + name.length });
    }
  }
  found.sort((a, b) => a.start - b.start || b.name.length - a.name.length);

  const taken: typeof found = [];
  for (const candidate of found) {
    const overlaps = taken.some((span) => candidate.start < span.end && span.start < candidate.end);
    if (!overlaps) taken.push(candidate);
  }

  // A tag list is a set, not a list of mentions: a technology the prose names
  // twice is still one technology, and it keeps the position of its first
  // mention. Duplicates here would render a tag twice and collide as React keys.
  taken.sort((a, b) => a.start - b.start || b.name.length - a.name.length);

  const seen = new Set<string>();
  const names: string[] = [];
  for (const span of taken) {
    if (seen.has(span.name)) continue;
    seen.add(span.name);
    names.push(span.name);
  }
  return names;
}

/**
 * Split a section into entries. An entry is three consecutive lines whose third
 * line is a `location · dates` line. Everything up to the next such triple
 * belongs to the current entry — blank lines are already gone, so this works
 * whether or not the author separates entries with them.
 */
function groupEntries(lines: readonly Line[], problems: string[], section: string): Line[][] {
  const groups: Line[][] = [];
  let index = 0;

  while (index < lines.length) {
    const head = lines[index];
    const role = lines[index + 1];
    const meta = lines[index + 2];

    if (head && role && meta && META_LINE.test(meta.text)) {
      const group = [head, role, meta];
      index += 3;
      while (index < lines.length) {
        const next = lines[index];
        const nextRole = lines[index + 1];
        const nextMeta = lines[index + 2];
        if (next && nextRole && nextMeta && META_LINE.test(nextMeta.text)) break;
        if (next) group.push(next);
        index += 1;
      }
      groups.push(group);
      continue;
    }

    const line = head ?? role ?? meta;
    problems.push(
      `line ${line?.number ?? 0}: inside "${section}", expected a "heading / role / location · dates" entry, found "${line?.text ?? ''}"`,
    );
    break;
  }

  return groups;
}

function parseExperience(
  lines: readonly Line[],
  now: Date,
  problems: string[],
  vocabulary: readonly string[],
): Experience[] {
  return groupEntries(lines, problems, 'Work Experience & Projects').map((group) => {
    const [head, roleLine, metaLine, ...body] = group;
    const where = `line ${head?.number ?? 0}`;
    // `MCI — Hamrahe Aval` is `company — descriptor`; a heading without the
    // em dash is just the company.
    const headingParts = (head?.text ?? '').split(/\s+—\s+/);
    const company = (headingParts[0] ?? '').trim();
    const descriptor = headingParts.slice(1).join(' — ').trim();
    const role = (roleLine?.text ?? '').trim();
    const metaParts = (metaLine?.text ?? '').split(META_SEPARATOR);
    const location = (metaParts[0] ?? '').trim();
    const rangeText = metaParts.slice(1).join(META_SEPARATOR).trim();
    const range = rangeText === '' ? null : parseDateRange(rangeText, now, problems, where);

    if (company === '') problems.push(`${where}: an entry heading is empty`);
    if (role === '') problems.push(`${where}: an entry has no role line`);
    if (location === '') problems.push(`${where}: no location found in "${metaLine?.text ?? ''}"`);

    const websiteLine = body.find((line) => WEBSITE_LINE.test(line.text));
    const prose = body.filter((line) => !WEBSITE_LINE.test(line.text));
    const website = websiteLine
      ? websiteLine.text.slice(websiteLine.text.indexOf(':') + 1).trim()
      : null;

    return {
      id: slugify(company),
      company,
      tagline: descriptor === '' ? null : descriptor,
      role,
      kind: classifyRole(role),
      location,
      range: range ?? emptyRange(),
      website: website === '' ? null : website,
      href: website === '' || website === null ? null : hrefForContact('website', website),
      // A single prose line describes the product; several lines are the work.
      summary: prose.length === 1 ? (prose[0]?.text ?? null) : null,
      points: prose.length === 1 ? [] : prose.map((line) => line.text),
      technologies: deriveTechnologies([role, ...prose.map((line) => line.text)].join(' '), vocabulary),
    };
  });
}

function parseSkillGroups(lines: readonly Line[], problems: string[]): SkillGroup[] {
  return lines.flatMap((line) => {
    if (line.text === SKILLS_TABLE_HEADER) return [];

    const category = SKILL_CATEGORIES.find((candidate) =>
      line.text.startsWith(`${candidate} `),
    );
    if (!category) {
      problems.push(
        `line ${line.number}: "${line.text}" does not start with a known skill category. ` +
          'Add the category to SKILL_CATEGORIES in lib/content/parse-resume.ts.',
      );
      return [];
    }

    const skills = line.text
      .slice(category.length)
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill !== '')
      // A comma inside a parenthetical — `Next.js (CSR, SSR)` — must not split
      // the skill in two, so re-join a fragment that has lost the parenthesis.
      .reduce<string[]>((merged, part) => {
        const previous = merged.at(-1);
        const open = previous ? (previous.match(/\(/g)?.length ?? 0) - (previous.match(/\)/g)?.length ?? 0) : 0;
        if (previous !== undefined && open > 0) {
          merged[merged.length - 1] = `${previous}, ${part}`;
        } else {
          merged.push(part);
        }
        return merged;
      }, [])
      .map((skill) => {
        const match = /^(.+?)\s*\((.+)\)\s*$/.exec(skill);
        return match
          ? { name: (match[1] ?? '').trim(), note: (match[2] ?? '').trim() || null }
          : { name: skill, note: null };
      });

    if (skills.length === 0) {
      problems.push(`line ${line.number}: category "${category}" lists no skills`);
      return [];
    }

    return [{ category, skills }];
  });
}

/**
 * Leadership items are `Title` optionally followed by `(detail)`. The resume
 * mixes both shapes, so the parenthetical is enrichment, never a requirement.
 */
function parseLeadership(lines: readonly Line[], problems: string[]): LeadershipItem[] {
  return lines.map((line) => {
    const match = LEADERSHIP_ITEM.exec(line.text);
    if (!match) {
      if (line.text.length > 96) {
        problems.push(`line ${line.number}: leadership item "${line.text}" reads as prose, not a label`);
      }
      return { title: line.text, detail: null };
    }
    return {
      title: (match[1] ?? '').trim(),
      detail: (match[2] ?? '').trim() || null,
    };
  });
}

function parseEducation(lines: readonly Line[], now: Date, problems: string[]): Education[] {
  return groupEntries(lines, problems, 'Education').map((group) => {
    const [first, second, third, ...body] = group;
    const where = `line ${first?.number ?? 0}`;
    const metaParts = (third?.text ?? '').split(META_SEPARATOR);
    const location = (metaParts[0] ?? '').trim();
    const rangeText = metaParts.slice(1).join(META_SEPARATOR).trim();
    const range = rangeText === '' ? null : parseDateRange(rangeText, now, problems, where);
    const qualification = (second?.text ?? '').trim();

    if (location === '') problems.push(`${where}: no location found in "${third?.text ?? ''}"`);

    return {
      id: slugify(first?.text ?? ''),
      institution: first?.text ?? '',
      qualification,
      location,
      // A degree names itself ("B.S. in ..."); anything else here is research work.
      kind: /^(b\.?s\.?c?|b\.?a\.?|m\.?s\.?c?|master|phd)/i.test(qualification)
        ? ('degree' as const)
        : ('research' as const),
      range: range ?? emptyRange(),
      points: body.map((line) => line.text),
    };
  });
}

/**
 * Lines between a heading and whichever known heading comes next in the file.
 * Derived from the heading offsets, so sections cannot overlap or swallow each
 * other even when two headings sit on adjacent lines.
 */
function sectionLines(
  lines: readonly Line[],
  headings: Partial<Record<SectionHeading, number>>,
  from: SectionHeading,
): Line[] {
  const start = headings[from];
  if (start === undefined) return [];
  const ends = Object.values(headings).filter(
    (index): index is number => typeof index === 'number' && index > start,
  );
  const end = ends.length > 0 ? Math.min(...ends) : lines.length;
  return lines.slice(start + 1, end);
}

export interface ParseResult {
  resume: Resume | null;
  problems: string[];
}

/** Parse the resume text, collecting every structural problem found. */
export function parseResumeSource(source: string, options: ParseOptions = {}): ParseResult {
  const now = options.now ?? new Date();
  const problems: string[] = [];
  const lines = toLines(source);

  const headings: Partial<Record<SectionHeading, number>> = {};
  for (const heading of SECTION_HEADINGS) {
    const index = lines.findIndex((line) => line.text === heading);
    if (index === -1) {
      problems.push(`no "${heading}" heading found`);
      continue;
    }
    headings[heading] = index;
  }

  const headerLines = lines.slice(0, headings['Summary'] ?? lines.length);
  const nameLine = headerLines[0];
  const rest = headerLines.slice(1);
  // The role line carries no colon anywhere; contacts all do.
  const titleLine = rest.find((line) => !line.text.includes(':'));
  if (!nameLine || !titleLine) {
    problems.push('the file must open with the name on one line and the role on the next');
  }
  const name = nameLine?.text ?? '';
  const title = titleLine?.text ?? '';
  const contacts = parseContacts(
    rest.filter((line) => line !== titleLine),
    problems,
  );

  const summaryLines = sectionLines(lines, headings, 'Summary');
  const summary = summaryLines.map((line) => line.text).join(' ').trim();

  const skillGroups = parseSkillGroups(
    sectionLines(lines, headings, 'Technical Skills'),
    problems,
  );
  const vocabulary = [...new Set(skillGroups.flatMap((group) => group.skills.map((skill) => skill.name)))].sort(
    (a, b) => b.length - a.length,
  );

  const experience = parseExperience(
    sectionLines(lines, headings, 'Work Experience & Projects'),
    now,
    problems,
    vocabulary,
  );
  const leadership = parseLeadership(
    sectionLines(lines, headings, 'Leadership & Management'),
    problems,
  );
  const education = parseEducation(sectionLines(lines, headings, 'Education'), now, problems);

  if (problems.length > 0) return { resume: null, problems };

  const candidate: Resume = {
    profile: { name, title, summary: summary === '' ? null : summary, contacts },
    experience,
    skills: skillGroups,
    leadership,
    education,
    meta: { source: 'content/resume.md', parsedFrom: 'content/resume.md' },
  };

  const result = resumeSchema.safeParse(candidate);
  if (!result.success) {
    for (const issue of result.error.issues) {
      problems.push(`${issue.path.join('.') || 'resume'}: ${issue.message}`);
    }
    return { resume: null, problems };
  }

  return { resume: result.data, problems: [] };
}

/** Parse the resume, throwing a single error that lists every problem found. */
export function parseResume(source: string, options: ParseOptions = {}): Resume {
  const { resume, problems } = parseResumeSource(source, options);
  if (!resume) {
    throw new ContentError('content/resume.md', problems);
  }
  return resume;
}

/** Contacts the interface is allowed to render. */
export function publishedContacts(profile: Profile): Contact[] {
  return profile.contacts.filter((contact) => contact.published);
}

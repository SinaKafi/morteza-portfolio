import { z } from 'zod';

/**
 * Content schema for the portfolio.
 *
 * Every field here is produced by `parse-resume.ts` from `content/resume.md`.
 * Nothing in this file may be hand-filled: if a value is missing from the
 * Markdown, it is absent here too, and the sections that depend on it either
 * degrade gracefully or fail the build with a message naming the field.
 */

export const isoDateSchema = z.object({
  /** Human label exactly as written in the resume, e.g. `Oct 2024`. */
  label: z.string().min(1),
  /** `YYYY-MM`. Month is `01` when the source only gave a year. */
  iso: z.string().regex(/^\d{4}-\d{2}$/),
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  /** True when the source gave a year but no month. */
  yearOnly: z.boolean(),
});

export const dateRangeSchema = z.object({
  start: isoDateSchema,
  /** `null` while the role is ongoing. */
  end: isoDateSchema.nullable(),
  ongoing: z.boolean(),
  /** Range text as written, e.g. `Oct 2024 – Present`. */
  label: z.string().min(1),
  /** Whole months elapsed, exclusive of the current partial month. */
  durationMonths: z.number().int().nonnegative(),
});

export const contactSchema = z.object({
  kind: z.enum(['email', 'github', 'linkedin', 'website', 'phone']),
  label: z.string().min(1),
  /** Display form, e.g. `mortezanajafiofficial@gmail.com`. */
  value: z.string().min(1),
  href: z.string().min(1),
  /**
   * Whether this contact may be rendered in the interface. The Markdown stays
   * the source of truth either way; unpublished contacts still reach
   * `resume.json` for machine consumers.
   */
  published: z.boolean(),
});

export const experienceKindSchema = z.enum(['employment', 'freelance', 'contract']);

export const experienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  /** The text after the em dash in the entry heading, if any. */
  tagline: z.string().min(1).nullable(),
  role: z.string().min(1),
  kind: experienceKindSchema,
  location: z.string().min(1),
  range: dateRangeSchema,
  website: z.string().min(1).nullable(),
  href: z.string().min(1).nullable(),
  /** Prose paragraph that describes the product, when the source has one. */
  summary: z.string().min(1).nullable(),
  /** One responsibility or achievement per line. */
  points: z.array(z.string().min(1)),
  /**
   * Technology names mentioned in this entry's own prose, matched against the
   * Technical Skills section. Derived, never authored: an entry can only claim a
   * technology the resume already states elsewhere.
   */
  technologies: z.array(z.string().min(1)),
});

/**
 * A skill as written, split into the name and the parenthetical that qualifies
 * it: `Next.js (CSR, SSR)` is the name `Next.js` plus the note `CSR, SSR`. The
 * split exists so the name can be matched against the prose in each experience
 * entry — a note must never stop a technology from being recognised in the text.
 */
export const skillSchema = z.object({
  name: z.string().min(1),
  note: z.string().min(1).nullable(),
});

export const skillGroupSchema = z.object({
  category: z.string().min(1),
  skills: z.array(skillSchema).min(1),
});

export const leadershipItemSchema = z.object({
  title: z.string().min(1),
  /** The parenthetical that follows the title in the source, if any. */
  detail: z.string().min(1).nullable(),
});

export const educationSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  qualification: z.string().min(1),
  location: z.string().min(1),
  range: dateRangeSchema,
  kind: z.enum(['degree', 'research']),
  points: z.array(z.string().min(1)),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1).nullable(),
  contacts: z.array(contactSchema),
});

export const resumeMetaSchema = z.object({
  /** Repository-relative path of the canonical source. */
  source: z.string().min(1),
  /** Parsed at build time; rendered as a quiet caption, never as a claim. */
  parsedFrom: z.literal('content/resume.md'),
});

export const resumeSchema = z.object({
  profile: profileSchema,
  experience: z.array(experienceSchema).min(1),
  skills: z.array(skillGroupSchema),
  leadership: z.array(leadershipItemSchema),
  education: z.array(educationSchema),
  meta: resumeMetaSchema,
});

export type IsoDate = z.infer<typeof isoDateSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type ExperienceKind = z.infer<typeof experienceKindSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type LeadershipItem = z.infer<typeof leadershipItemSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Resume = z.infer<typeof resumeSchema>;

/** A curated view over an experience entry, for the Projects section. */
export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  descriptor: z.string().min(1).nullable(),
  role: z.string().min(1),
  period: z.string().min(1),
  location: z.string().min(1),
  href: z.string().min(1).nullable(),
  summary: z.string().min(1).nullable(),
  points: z.array(z.string().min(1)),
  technologies: z.array(z.string().min(1)),
  kind: experienceKindSchema,
});

export type Project = z.infer<typeof projectSchema>;

/**
 * Thrown when the Markdown cannot produce content the interface can render.
 * Carries every problem found in one pass, so a broken edit reports all of its
 * symptoms at once instead of one per build.
 */
export class ContentError extends Error {
  readonly problems: readonly string[];

  constructor(source: string, problems: readonly string[]) {
    super(
      `${source} does not match the expected structure:\n` +
        problems.map((problem) => `  - ${problem}`).join('\n'),
    );
    this.name = 'ContentError';
    this.problems = problems;
  }
}

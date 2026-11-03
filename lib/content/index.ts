import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';
import { parseResume } from './parse-resume';
import type { Resume } from './schema';

/** The canonical source. Every page renders from this file and nothing else. */
export const RESUME_SOURCE = 'content/resume.md';

/**
 * Parse `content/resume.md` once per build and hand the same typed object to
 * every server component. `cache` dedupes within a render pass; the module
 * itself is only ever evaluated on the server, so no resume data ships as a
 * client bundle.
 *
 * Reading the Markdown directly — rather than a generated JSON copy — is what
 * makes the Markdown the single source of truth: there is no intermediate file
 * that could drift.
 */
export const getResume = cache((): Resume => {
  const source = readFileSync(join(process.cwd(), RESUME_SOURCE), 'utf8');
  return parseResume(source);
});

export { parseResume, parseResumeSource, publishedContacts } from './parse-resume';
export * from './derive';

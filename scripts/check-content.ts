/**
 * Content gate. Runs before every build.
 *
 * 1. Parses `content/resume.md` and fails on any structural problem, listing all
 *    of them at once.
 * 2. Proves the curated project selection still matches the resume.
 * 3. Writes `public/resume.json` and reports a summary, so a content edit is
 *    verified rather than hoped for.
 *
 * Run with `pnpm content:check`.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  RESUME_SOURCE,
  SELECTED_PROJECT_COMPANIES,
  careerSpanMonths,
  experienceByRecency,
  formatDuration,
  resumeJson,
  skillCount,
} from '../lib/content/index';
import { parseResumeSource } from '../lib/content/parse-resume';
import { selectProjects } from '../lib/content/derive';

const root = process.cwd();
const source = readFileSync(join(root, RESUME_SOURCE), 'utf8');
const { resume, problems } = parseResumeSource(source);

const failures: string[] = [...problems];

if (resume) {
  for (const name of SELECTED_PROJECT_COMPANIES) {
    const match = resume.experience.some((entry) => entry.company.startsWith(name));
    if (!match) {
      failures.push(
        `SELECTED_PROJECT_COMPANIES lists "${name}", which no longer matches an entry in ${RESUME_SOURCE}. ` +
          'Update the list in lib/content/derive.ts.',
      );
    }
  }
}

if (failures.length > 0 || !resume) {
  console.error(`✖ ${RESUME_SOURCE} failed validation\n`);
  for (const problem of failures) console.error(`  - ${problem}`);
  console.error('\nNothing was generated. Fix the Markdown (and only the Markdown), then re-run.');
  process.exit(1);
}

const outputPath = join(root, 'public', 'resume.json');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, resumeJson(resume), 'utf8');

const recency = experienceByRecency(resume);
const current = recency.filter((entry) => entry.range.ongoing);
const projectCount = selectProjects(resume).length;
const span = formatDuration(careerSpanMonths(resume));

console.log(`✔ ${RESUME_SOURCE} parsed`);
console.log(`  ${resume.experience.length} entries, ${current.length} ongoing`);
console.log(`  ${projectCount} selected projects, ${skillCount(resume.skills)} skills in ${resume.skills.length} categories`);
console.log(`  ${resume.leadership.length} leadership items, ${resume.education.length} education entries`);
console.log(`  career span ${span}, most recent entry: ${recency[0]?.company ?? '—'}`);
console.log(`  wrote public/resume.json`);

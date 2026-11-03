import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseResume } from '../lib/content/parse-resume';

/**
 * Guards for the two rules the brief cares about most and a code review cannot
 * enforce: personal facts live in the Markdown, and the interface carries no
 * emoji, no tracked uppercase labels and no colour literals of its own.
 */

const ROOT = process.cwd();
const SOURCE_DIRS = ['app', 'components'];

function sourceFiles(dir: string): string[] {
  const absolute = join(ROOT, dir);
  return readdirSync(absolute).flatMap((entry) => {
    const path = join(absolute, entry);
    if (statSync(path).isDirectory()) return sourceFiles(relative(ROOT, path));
    return /\.tsx?$/.test(entry) && entry !== 'next-env.d.ts' ? [path] : [];
  });
}

const files = SOURCE_DIRS.flatMap(sourceFiles).map((path) => ({
  path: relative(ROOT, path),
  text: readFileSync(path, 'utf8'),
}));

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

describe('the interface', () => {
  const resume = parseResume(readFileSync(join(ROOT, 'content/resume.md'), 'utf8'));

  it('finds source files to check', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it('never restates a personal fact in a component', () => {
    const forbidden = [
      resume.profile.name,
      resume.profile.contacts.find((contact) => contact.kind === 'email')?.value ?? '',
      resume.profile.contacts.find((contact) => contact.kind === 'phone')?.value ?? '',
      'mortezanjfi',
    ].filter((value) => value.length > 3);

    for (const file of files) {
      for (const value of forbidden) {
        expect(
          file.text.includes(value),
          `${file.path} hardcodes "${value}" — read it from lib/content instead`,
        ).toBe(false);
      }
    }
  });

  it('carries no emoji and no tracked uppercase labels', () => {
    for (const file of files) {
      expect(EMOJI.test(file.text), `${file.path} contains an emoji`).toBe(false);
      expect(
        /\buppercase\b|tracking-widest|tracking-\[0\.\d+em\].*uppercase/.test(file.text),
        `${file.path} uses an uppercase tracked label`,
      ).toBe(false);
    }
  });

  it('keeps colour in the token layer instead of in components', () => {
    for (const file of files) {
      const hex = file.text.match(/#[0-9a-fA-F]{3,8}\b/g);
      expect(hex, `${file.path} contains a raw colour literal: ${hex?.join(', ')}`).toBeNull();
    }
  });

  it('imports content through lib/content rather than reading the Markdown', () => {
    for (const file of files) {
      expect(
        /from\s+['"].*resume\.md['"]/.test(file.text),
        `${file.path} imports resume.md directly`,
      ).toBe(false);
    }
  });
});

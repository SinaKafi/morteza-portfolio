import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'skills/**', 'public/**', 'next-env.d.ts'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // The interface renders parsed content; a component that reaches for
      // resume facts directly should fail here rather than ship.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/content/resume.md', '*resume.md'],
              message: 'Import parsed content via lib/content (getResume), never the Markdown file.',
            },
          ],
        },
      ],
    },
  },
];

export default config;

/**
 * Literal mirrors of the design tokens declared in `app/globals.css`.
 *
 * They exist because exactly two APIs cannot read a CSS custom property:
 * `viewport.themeColor` in the app layout, and `next/og`'s renderer, which
 * rasterises outside the CSS cascade. Everything visual in the interface reads
 * the CSS tokens; nothing else may hold a colour literal.
 *
 * `tests/design-tokens.test.ts` compares this file against `app/globals.css`, so
 * the two copies cannot drift apart.
 */

export const ink = {
  deepest: '#06070b',
  sidebar: '#07080d',
  page: '#0b0d14',
  card: '#11141c',
  raised: '#1a1e28',
  rail: '#232833',
} as const;

export const paper = {
  primary: '#eef0f5',
  secondary: '#a3a9b8',
  muted: '#7a8296',
} as const;

export const accent = {
  fill: '#4b7bff',
  ink: '#8fb0ff',
  deep: '#2f57c9',
} as const;

/** Primary text at 8% and 16%: the two hairline weights. */
export const hairline = {
  base: 'rgb(238 240 245 / 0.08)',
  strong: 'rgb(238 240 245 / 0.16)',
} as const;

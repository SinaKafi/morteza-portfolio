import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { accent, hairline, ink, paper } from '../lib/design/colors';

/**
 * The design system lives in `app/globals.css`, but `viewport.themeColor` and the
 * `next/og` renderer cannot read CSS custom properties, so `lib/design/colors.ts`
 * mirrors the values. These tests are what stops the mirror drifting.
 */

const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8');

function token(name: string): string | undefined {
  return new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim();
}

const MIRROR: { token: string; value: string }[] = [
  { token: 'color-ink-1000', value: ink.deepest },
  { token: 'color-ink-950', value: ink.sidebar },
  { token: 'color-ink-900', value: ink.page },
  { token: 'color-ink-850', value: ink.card },
  { token: 'color-ink-800', value: ink.raised },
  { token: 'color-ink-750', value: ink.rail },
  { token: 'color-paper', value: paper.primary },
  { token: 'color-paper-dim', value: paper.secondary },
  { token: 'color-paper-mute', value: paper.muted },
  { token: 'color-cobalt', value: accent.fill },
  { token: 'color-cobalt-ink', value: accent.ink },
  { token: 'color-cobalt-deep', value: accent.deep },
  { token: 'color-hairline', value: hairline.base },
  { token: 'color-hairline-strong', value: hairline.strong },
];

describe('design tokens', () => {
  it('keeps the TypeScript mirror in step with the CSS tokens', () => {
    for (const pair of MIRROR) {
      expect(token(pair.token), `--${pair.token} is missing from globals.css`).toBeDefined();
      expect(token(pair.token), `--${pair.token} drifted from lib/design/colors.ts`).toBe(pair.value);
    }
  });

  it('declares one neutral ramp, three text roles and one accent', () => {
    const colours = [...css.matchAll(/--color-([a-z0-9-]+):/g)].map((match) => match[1]);

    // Six ink steps, three paper roles, three cobalt steps, two hairlines. A new
    // colour has to be argued for in review, not dropped in.
    expect(colours.sort()).toEqual(
      [
        'cobalt',
        'cobalt-deep',
        'cobalt-ink',
        'hairline',
        'hairline-strong',
        'ink-1000',
        'ink-750',
        'ink-800',
        'ink-850',
        'ink-900',
        'ink-950',
        'paper',
        'paper-dim',
        'paper-mute',
      ].sort(),
    );
  });

  it('carries no hue gradient, no glow and no decorative blur', () => {
    // A gradient is allowed only as a tone shift inside one neutral, which is
    // what the drafting grid does: one colour, faded to transparent.
    const huePairs = /linear-gradient\([^)]*#[0-9a-f]{6}[^)]*#[0-9a-f]{6}/gi;
    expect(css.match(huePairs)).toBeNull();
    expect(css).not.toMatch(/text-shadow/);
    expect(css).not.toMatch(/box-shadow:\s*[^;]*rgb\((?!0 0 0|255 255 255)/);
    // `backdrop-filter` belongs to glass surfaces and stays at a readable value;
    // a standalone `filter: blur(...)` is the tell of a decorative wash.
    expect(css).not.toMatch(/(?<!backdrop-)filter:\s*blur/);
    for (const match of css.matchAll(/blur\((\d+)px\)/g)) {
      expect(Number(match[1]), 'blur is used as decoration, not as glass').toBeLessThanOrEqual(20);
    }
  });

  it('declares one easing curve and a small set of durations', () => {
    const easings = [...css.matchAll(/--ease-[a-z-]+:/g)];
    const durations = [...css.matchAll(/--duration-[a-z-]+:/g)];

    expect(easings).toHaveLength(1);
    expect(durations.length).toBeLessThanOrEqual(4);
  });
});

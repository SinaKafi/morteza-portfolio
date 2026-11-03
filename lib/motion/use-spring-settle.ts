'use client';

import { useEffect, useState } from 'react';

interface Spring {
  /** Displacement from rest, in pixels. */
  x: number;
  /** Velocity, in pixels per second. */
  v: number;
  /** Time this element starts moving, in ms after the animation begins. */
  delay: number;
}

/**
 * One integrator for the whole group: a critically damped spring, solved with
 * fixed 1/120s substeps so it behaves the same on a 60Hz and a 120Hz display.
 *
 * This is the only place physics is used, and it drives an entrance — bars fall
 * into place once and stop. Nothing keeps moving, nothing loops, and under
 * `prefers-reduced-motion` nothing animates at all.
 */
export function useSpringSettle(
  count: number,
  options: {
    enabled: boolean;
    /** Where each element starts, in pixels. Negative is above its rest position. */
    from?: number;
    stiffness?: number;
    damping?: number;
    staggerMs?: number;
  },
): number[] {
  const { enabled, from = -24, stiffness = 150, damping = 25, staggerMs = 45 } = options;
  const [offsets, setOffsets] = useState<number[]>(() => new Array<number>(count).fill(0));

  useEffect(() => {
    if (!enabled) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOffsets(new Array<number>(count).fill(0));
      return;
    }

    const springs: Spring[] = Array.from({ length: count }, (_, index) => ({
      x: from,
      v: 0,
      delay: index * staggerMs,
    }));

    const step = 1 / 120;
    let raf = 0;
    let previous = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      // Clamp so a backgrounded tab does not resume with an explosive step.
      const frame = Math.min((now - previous) / 1000, 0.05);
      previous = now;

      for (const spring of springs) {
        if (elapsed * 1000 < spring.delay) continue;
        let remaining = frame;
        while (remaining > 0) {
          const dt = Math.min(step, remaining);
          const acceleration = -stiffness * spring.x - damping * spring.v;
          spring.v += acceleration * dt;
          spring.x += spring.v * dt;
          remaining -= dt;
        }
        if (Math.abs(spring.x) < 0.05 && Math.abs(spring.v) < 0.05) {
          spring.x = 0;
          spring.v = 0;
        }
      }

      elapsed += frame;
      setOffsets(springs.map((spring) => spring.x));

      if (springs.some((spring) => spring.x !== 0 || spring.v !== 0)) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, enabled, from, stiffness, damping, staggerMs]);

  return offsets;
}

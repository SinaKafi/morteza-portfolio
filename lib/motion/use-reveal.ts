'use client';

import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * True once the element has been seen. Used both for reveals and as the trigger
 * that lets the hero figure settle, so nothing animates off-screen.
 */
export function useInView<T extends HTMLElement>(options?: {
  rootMargin?: string;
  threshold?: number;
}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const rootMargin = options?.rootMargin ?? '0px 0px -12% 0px';
  const threshold = options?.threshold ?? 0.15;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return { ref, inView };
}

/** Reveal on first entry into the viewport: a 10px rise and a fade, once. */
export function useReveal<T extends HTMLElement>(delayMs = 0) {
  const { ref, inView } = useInView<T>();

  return {
    ref,
    className: `reveal${inView ? ' is-visible' : ''}`,
    style: delayMs > 0 ? ({ '--reveal-delay': `${delayMs}ms` } as React.CSSProperties) : undefined,
  };
}

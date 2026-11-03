'use client';

import type { ReactNode } from 'react';
import { useReveal } from '@/lib/motion/use-reveal';

interface RevealProps {
  children: ReactNode;
  /** Stagger in ms, capped by the caller at six items. */
  delay?: number;
  className?: string;
}

/** A block that rises into place once. Wrapper only — no layout opinions. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, className: revealClass, style } = useReveal<HTMLDivElement>(delay);

  return (
    <div ref={ref} className={className ? `${revealClass} ${className}` : revealClass} style={style}>
      {children}
    </div>
  );
}

'use client';

import { useCallback, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useSpring } from 'framer-motion';
import { SPRING_MAGNET } from '@/lib/motion/config';

interface MagneticLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /** Maximum pull towards the pointer, in px. */
  strength?: number;
  external?: boolean;
}

/**
 * Magnetic control. The pointer sets a target a few pixels towards itself and a
 * stiff, damped spring follows it, so the button leans into the hand rather
 * than teleporting. On leave the springs return to rest.
 *
 * Transform only, capped at `strength` pixels, and switched off on touch and
 * when reduced motion is requested.
 */
export function MagneticLink({
  href,
  children,
  className,
  strength = 4,
  external = false,
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const reduced = useReducedMotion();
  const x = useSpring(0, SPRING_MAGNET);
  const y = useSpring(0, SPRING_MAGNET);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLAnchorElement>) => {
      const node = ref.current;
      if (!node || reduced || event.pointerType !== 'mouse') return;

      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const offsetX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const offsetY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      x.set(offsetX * strength);
      y.set(offsetY * strength);
    },
    [reduced, strength, x, y],
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x, y }}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerCancel={handleLeave}
      onBlur={handleLeave}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    >
      {children}
    </motion.a>
  );
}

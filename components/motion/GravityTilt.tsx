'use client';

import { useCallback, useRef, type ReactNode } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { SPRING_TILT, TILT_DEGREES } from '@/lib/motion/config';

interface GravityTiltProps {
  children: ReactNode;
  className?: string;
}

/**
 * A weighted panel. The pointer pulls it a couple of degrees on both axes and
 * two springs carry it back when the pointer leaves. The travel is small on
 * purpose: the chart inside has to stay readable, so the tilt is felt more than
 * it is noticed. Touch devices and reduced motion keep the panel flat.
 */
export function GravityTilt({ children, className }: GravityTiltProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  // Pointer position, normalised to -1..1 on each axis.
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const sx = useSpring(nx, SPRING_TILT);
  const sy = useSpring(ny, SPRING_TILT);

  // Pointer at the top pushes the top edge away; the right pulls the right edge
  // back. Both stay inside ±TILT_DEGREES.
  const rotateX = useTransform(sy, [-1, 1], [TILT_DEGREES, -TILT_DEGREES]);
  const rotateY = useTransform(sx, [-1, 1], [-TILT_DEGREES, TILT_DEGREES]);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const node = ref.current;
      if (!node || reduced || event.pointerType !== 'mouse') return;

      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      nx.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
      ny.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [nx, ny, reduced],
  );

  const handleLeave = useCallback(() => {
    nx.set(0);
    ny.set(0);
  }, [nx, ny]);

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onPointerCancel={handleLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1100,
          transformOrigin: 'center',
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

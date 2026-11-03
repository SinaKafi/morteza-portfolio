'use client';

import { useCallback, useRef, type ReactNode } from 'react';

interface MagneticLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /** Maximum pull towards the pointer, in px. */
  strength?: number;
  external?: boolean;
}

/**
 * Magnetic control: the element leans towards the pointer by a few pixels and
 * returns on leave. Transform only, clamped to 4px, and switched off entirely on
 * touch devices and when reduced motion is requested.
 */
export function MagneticLink({
  href,
  children,
  className,
  strength = 4,
  external = false,
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  const handleMove = useCallback(
    (event: React.PointerEvent<HTMLAnchorElement>) => {
      const node = ref.current;
      if (!node || event.pointerType !== 'mouse') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const rect = node.getBoundingClientRect();
      const offsetX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const offsetY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      node.style.setProperty('--mx', `${(offsetX * strength).toFixed(2)}px`);
      node.style.setProperty('--my', `${(offsetY * strength).toFixed(2)}px`);
    },
    [strength],
  );

  const handleLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--mx', '0px');
    node.style.setProperty('--my', '0px');
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      className={className ? `magnetic ${className}` : 'magnetic'}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    >
      {children}
    </a>
  );
}

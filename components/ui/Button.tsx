import type { ReactNode } from 'react';
import { MagneticLink } from '@/components/motion/MagneticLink';

type Size = 'sm' | 'md';

const BASE =
  'inline-flex select-none items-center justify-center gap-2 rounded-[10px] font-medium transition-colors duration-140 ease-out';

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-[14px]',
};

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  size?: Size;
  external?: boolean;
  iconAfter?: ReactNode;
}

/**
 * The primary action on dark: an off-white fill from the ramp with dark text, so
 * the accent stays reserved for the one figure that matters.
 */
export function PrimaryLink({
  href,
  children,
  size = 'md',
  external = false,
  iconAfter,
}: LinkButtonProps) {
  return (
    <MagneticLink
      href={href}
      external={external}
      className={`${BASE} ${SIZES[size]} bg-paper text-ink-900 hover:bg-white`}
    >
      {children}
      {iconAfter}
    </MagneticLink>
  );
}

/** Secondary: the raised surface with a hairline, primary text. */
export function SecondaryLink({
  href,
  children,
  size = 'md',
  external = false,
  iconAfter,
}: LinkButtonProps) {
  return (
    <MagneticLink
      href={href}
      external={external}
      className={`${BASE} ${SIZES[size]} border border-hairline bg-ink-800 text-paper hover:bg-ink-750`}
    >
      {children}
      {iconAfter}
    </MagneticLink>
  );
}

/** A quiet text link for the places a button would be too loud. */
export function QuietLink({ href, children, external = false }: LinkButtonProps) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1.5 text-[14px] text-paper-dim underline decoration-hairline-strong underline-offset-4 transition-colors duration-140 hover:text-paper hover:decoration-paper-mute"
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    >
      {children}
    </a>
  );
}

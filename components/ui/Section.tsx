import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';

interface SectionProps {
  id: string;
  /** Position in the page, printed as a quiet index beside the label. */
  index: string;
  label: string;
  /** Quiet mono meta under the label, e.g. a count or a range. */
  aside?: ReactNode;
  /**
   * Top padding for the label column. Sections whose first row carries its own
   * top padding pass the same value here, so the label and the first line of
   * content share one baseline down the page.
   */
  labelOffsetClassName?: string;
  children: ReactNode;
}

/**
 * One section shell for the whole page: a hairline rule, a narrow label column,
 * a wide content column. Alignment is the point — labels start on one line, and
 * content keeps the same measure in every section.
 */
export function Section({ id, index, label, aside, labelOffsetClassName, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-hairline py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-6 sm:px-8 lg:grid-cols-12 lg:gap-12">
        <div className={labelOffsetClassName ? `lg:col-span-3 ${labelOffsetClassName}` : 'lg:col-span-3'}>
          <Reveal>
            <h2 className="flex items-baseline gap-3 font-mono text-meta text-paper-mute tnum">
              <span aria-hidden>{index}</span>
              <span className="text-paper-dim">{label}</span>
            </h2>
            {aside ? <div className="mt-4 max-w-[22rem]">{aside}</div> : null}
          </Reveal>
        </div>
        <div className="lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}

/** Shared measure for body copy inside a section's content column. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className="max-w-152 text-body text-paper-dim">{children}</div>;
}

import { Reveal } from '@/components/motion/Reveal';
import { Section } from '@/components/ui/Section';
import { getResume } from '@/lib/content';

/**
 * Education holds a degree and a research year. They are different things, so
 * they are labelled differently instead of being flattened into two schools.
 */
export function Education() {
  const resume = getResume();

  return (
    <Section
      id="education"
      index="06"
      label="Education"
      aside={
        <p className="font-mono text-[11px] leading-5 text-paper-mute">
          Degree and research work, in the order the resume lists them.
        </p>
      }
      labelOffsetClassName="pt-8"
    >
      <ul className="divide-y divide-hairline">
        {resume.education.map((entry, index) => (
          <li key={entry.id} className="py-8">
            <Reveal delay={Math.min(index, 5) * 40}>
              <article className="grid gap-3 sm:grid-cols-12 sm:gap-6">
                <div className="sm:col-span-3">
                  <p className="tnum font-mono text-meta text-paper-dim">{entry.range.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-paper-mute">
                    {entry.kind === 'degree' ? 'degree' : 'research'}
                  </p>
                </div>

                <div className="sm:col-span-9">
                  <h3 className="text-[16px] leading-6 text-paper">{entry.institution}</h3>
                  <p className="mt-1 text-[14px] text-paper-dim">{entry.qualification}</p>
                  <p className="mt-1 font-mono text-[11px] text-paper-mute">{entry.location}</p>

                  {entry.points.length > 0 ? (
                    <ul className="mt-4 max-w-152 space-y-2">
                      {entry.points.map((point, position) => (
                        <li key={`${position}-${point}`} className="flex gap-3 text-body text-paper-dim">
                          <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-hairline-strong" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

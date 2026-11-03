import { Reveal } from '@/components/motion/Reveal';
import { Section } from '@/components/ui/Section';
import { experienceByRecency, formatDuration, getResume } from '@/lib/content';

/**
 * The timeline. Dates sit in one left column so every period starts on the same
 * line, and the rail hairline carries a cobalt tick on the roles still running.
 */
export function Experience() {
  const resume = getResume();
  const entries = experienceByRecency(resume);

  return (
    <Section
      id="work"
      index="02"
      label="Experience"
      aside={
        <p className="tnum font-mono text-[11px] leading-5 text-paper-mute">
          {entries.length} roles, most recent first
        </p>
      }
      labelOffsetClassName="pt-8"
    >
      <ol className="divide-y divide-hairline">
        {entries.map((entry, index) => (
          <li key={entry.id} className="py-8">
            <Reveal delay={Math.min(index, 5) * 40}>
              <article className="grid gap-4 sm:grid-cols-12 sm:gap-6">
                <div className="sm:col-span-3">
                  <p className="tnum font-mono text-meta text-paper-dim">{entry.range.label}</p>
                  <p className="tnum mt-1 font-mono text-[11px] text-paper-mute">
                    {entry.range.durationMonths > 0
                      ? `${formatDuration(entry.range.durationMonths)}${entry.range.ongoing ? ' so far' : ''}`
                      : 'duration not stated'}
                  </p>
                  {entry.range.ongoing ? (
                    <p className="mt-2 flex items-center gap-2 font-mono text-[11px] text-cobalt-ink">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-cobalt" />
                      ongoing
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-9">
                  <h3 className="text-[17px] leading-6 text-paper">{entry.role}</h3>
                  <p className="mt-1 text-[14px] text-paper-dim">
                    {entry.company}
                    {entry.tagline ? <span className="text-paper-mute"> · {entry.tagline}</span> : null}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-paper-mute">
                    {entry.location}
                    {entry.href ? (
                      <>
                        {' · '}
                        <a
                          href={entry.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-paper-dim underline decoration-hairline-strong underline-offset-2 transition-colors duration-140 hover:text-paper"
                        >
                          {entry.website}
                        </a>
                      </>
                    ) : null}
                  </p>

                  {entry.summary ? (
                    <p className="mt-4 max-w-152 text-body text-paper-dim">{entry.summary}</p>
                  ) : null}

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

                  {entry.technologies.length > 0 ? (
                    <ul className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {entry.technologies.map((technology, position) => (
                        <li key={technology} className="flex items-center gap-3">
                          {position > 0 ? (
                            <span aria-hidden className="h-3 w-px bg-hairline-strong" />
                          ) : null}
                          <span className="tnum font-mono text-[11px] text-paper-mute">{technology}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

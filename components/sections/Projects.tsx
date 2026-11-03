import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { Section } from '@/components/ui/Section';
import { getResume, selectProjects } from '@/lib/content';

/**
 * Projects are written records, not screenshots: the resume states no metrics,
 * clients or imagery, so none are invented. Each row takes its text verbatim,
 * and rows are separated by hairlines instead of being boxed into equal cards.
 */
export function Projects() {
  const resume = getResume();
  const projects = selectProjects(resume);

  return (
    <Section
      id="projects"
      index="03"
      label="Selected projects"
      aside={
        <p className="font-mono text-[11px] leading-5 text-paper-mute">
          Products built end to end, taken from the same entries as the timeline.
        </p>
      }
      labelOffsetClassName="pt-8"
    >
      <ol className="divide-y divide-hairline">
        {projects.map((project, index) => {
          const [first, ...rest] = project.points;
          const lead = project.summary ?? first;

          return (
            <li key={project.id} className="py-8">
              <Reveal delay={Math.min(index, 5) * 40}>
                <article className="grid gap-5 sm:grid-cols-12 sm:gap-8">
                  <div className="sm:col-span-4">
                    <p className="tnum font-mono text-meta text-paper-mute">
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-3 text-[20px] leading-7 text-paper">{project.name}</h3>
                    {project.descriptor ? (
                      <p className="mt-1 text-[14px] text-paper-dim">{project.descriptor}</p>
                    ) : null}
                    <p className="tnum mt-4 font-mono text-[11px] leading-5 text-paper-mute">
                      {project.period}
                      <br />
                      {project.role} · {project.location}
                    </p>
                  </div>

                  <div className="sm:col-span-8">
                    {lead ? <p className="max-w-152 text-body text-paper-dim">{lead}</p> : null}

                    {rest.length > 0 ? (
                      <ul className="mt-4 max-w-152 space-y-2">
                        {rest.map((point, position) => (
                          <li key={`${position}-${point}`} className="flex gap-3 text-body text-paper-dim">
                            <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-hairline-strong" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {project.technologies.length > 0 ? (
                      <ul className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {project.technologies.map((technology, position) => (
                          <li key={technology} className="flex items-center gap-3">
                            {position > 0 ? (
                              <span aria-hidden className="h-3 w-px bg-hairline-strong" />
                            ) : null}
                            <span className="tnum font-mono text-[11px] text-paper-mute">{technology}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    {project.href ? (
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-paper-dim underline decoration-hairline-strong underline-offset-4 transition-colors duration-140 hover:text-paper"
                      >
                        Visit the project
                        <ArrowUpRight size={14} strokeWidth={1.5} />
                      </a>
                    ) : null}
                  </div>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

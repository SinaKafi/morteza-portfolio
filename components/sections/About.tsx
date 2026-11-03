import { Reveal } from '@/components/motion/Reveal';
import { Section } from '@/components/ui/Section';
import {
  careerSpanMonths,
  experienceByRecency,
  formatDuration,
  getResume,
  skillCount,
} from '@/lib/content';

/**
 * About carries the resume's own summary, then the same facts expressed as
 * measurements — every figure is arithmetic on dates the resume states.
 */
export function About() {
  const resume = getResume();
  const byRecency = experienceByRecency(resume);
  const ongoing = byRecency.filter((entry) => entry.range.ongoing);

  const facts: { label: string; value: string }[] = [
    { label: 'Career span', value: formatDuration(careerSpanMonths(resume)) },
    {
      label: 'Roles',
      value: `${resume.experience.length}, ${ongoing.length} running now`,
    },
    { label: 'Skills', value: `${skillCount(resume.skills)} across ${resume.skills.length} categories` },
    {
      label: 'Based in',
      value: ongoing.find((entry) => entry.kind === 'employment')?.location ?? byRecency[0]?.location ?? '',
    },
  ];

  return (
    <Section
      id="about"
      index="01"
      label="About"
      aside={
        <p className="font-mono text-[11px] leading-5 text-paper-mute">
          Parsed from the Summary section of the resume.
        </p>
      }
    >
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <Reveal>
            {resume.profile.summary ? (
              <p className="max-w-152 text-[16px] leading-7 text-paper-dim">
                {resume.profile.summary}
              </p>
            ) : null}

            <h3 className="mt-10 font-mono text-meta text-paper-mute">
              Running now
            </h3>
            <ul className="mt-4 divide-y divide-hairline border-t border-hairline">
              {ongoing.map((entry) => (
                <li key={entry.id} className="grid gap-1 py-4 sm:grid-cols-12 sm:gap-4">
                  <p className="text-[14px] text-paper sm:col-span-5">{entry.company}</p>
                  <p className="text-[13px] text-paper-dim sm:col-span-4">{entry.role}</p>
                  <p className="tnum font-mono text-meta text-paper-mute sm:col-span-3 sm:text-right">
                    {entry.range.label}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <Reveal delay={40}>
            <dl className="panel divide-y divide-hairline p-6">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between gap-6 py-3 first:pt-0 last:pb-0">
                  <dt className="font-mono text-meta text-paper-mute">{fact.label}</dt>
                  <dd className="tnum text-[14px] text-paper">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

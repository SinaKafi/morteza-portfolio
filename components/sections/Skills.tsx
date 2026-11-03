import { Reveal } from '@/components/motion/Reveal';
import { Section } from '@/components/ui/Section';
import { getResume, skillCount } from '@/lib/content';

/**
 * Skills as a spec table: category on the left, names on the right, aligned down
 * one column. No percentages, no bars, no proficiency theatre.
 */
export function Skills() {
  const resume = getResume();

  return (
    <Section
      id="skills"
      index="04"
      label="Technical skills"
      aside={
        <p className="tnum font-mono text-[11px] leading-5 text-paper-mute">
          {skillCount(resume.skills)} tools and methods in {resume.skills.length} categories
        </p>
      }
    >
      <dl className="border-t border-hairline">
        {resume.skills.map((group, index) => (
          <Reveal key={group.category} delay={Math.min(index, 5) * 30}>
            <div className="grid gap-2 border-b border-hairline py-4 sm:grid-cols-12 sm:gap-6">
              <dt className="font-mono text-meta text-paper-mute sm:col-span-4">
                {group.category}
              </dt>
              <dd className="flex flex-wrap items-baseline gap-x-4 gap-y-1 sm:col-span-8">
                {group.skills.map((skill) => (
                  <span key={skill.name} className="text-[14px] leading-6 text-paper-dim">
                    {skill.name}
                    {skill.note ? (
                      <span className="ml-1.5 font-mono text-[11px] text-paper-mute">{skill.note}</span>
                    ) : null}
                  </span>
                ))}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}

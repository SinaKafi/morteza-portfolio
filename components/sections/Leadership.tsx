import { Reveal } from '@/components/motion/Reveal';
import { Section } from '@/components/ui/Section';
import { getResume } from '@/lib/content';

/** Leadership, as stated: the practice beside the parenthetical the resume adds. */
export function Leadership() {
  const resume = getResume();

  return (
    <Section
      id="leadership"
      index="05"
      label="Leadership"
      aside={
        <p className="font-mono text-[11px] leading-5 text-paper-mute">
          Team-leading, review and mentoring work, as listed in the resume.
        </p>
      }
    >
      <ul className="grid gap-x-12 gap-y-6 sm:grid-cols-2">
        {resume.leadership.map((item, index) => (
          <li key={item.title}>
            <Reveal delay={Math.min(index, 5) * 30}>
              <div className="border-t border-hairline pt-4">
                <p className="text-[14px] leading-6 text-paper">{item.title}</p>
                {item.detail ? (
                  <p className="mt-1.5 font-mono text-[11px] leading-5 text-paper-mute">{item.detail}</p>
                ) : null}
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

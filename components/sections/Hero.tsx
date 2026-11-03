import { ArrowUpRight, Mail } from 'lucide-react';
import { CareerDrawing } from '@/components/figure/CareerDrawing';
import { Reveal } from '@/components/motion/Reveal';
import { PrimaryLink, SecondaryLink } from '@/components/ui/Button';
import {
  careerSpanMonths,
  experienceByRecency,
  formatDuration,
  getResume,
  leadSentence,
  publishedContacts,
} from '@/lib/content';
import { buildTimeline } from '@/lib/figure/timeline';

/**
 * The hero is a split, not a centred stack: the claim on the left, the drawing
 * on the right, both centred against each other. The drawing is the one bright
 * element; everything around it stays quiet.
 */
export function Hero() {
  const resume = getResume();
  const { profile } = resume;

  const byRecency = experienceByRecency(resume);
  const timeline = buildTimeline(byRecency);
  const earliest = byRecency.at(-1);
  const currentEmployment = byRecency.find((entry) => entry.range.ongoing && entry.kind === 'employment');
  const email = publishedContacts(profile).find((contact) => contact.kind === 'email');
  const lead = leadSentence(profile);
  const span = formatDuration(careerSpanMonths(resume));
  const location = currentEmployment?.location ?? byRecency[0]?.location ?? '';

  const meta = [location, earliest ? `working since ${earliest.range.start.label}` : null]
    .filter((part): part is string => part !== null && part !== '')
    .join(' · ');

  return (
    <section id="top" className="relative">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-6 pt-24 pb-16 sm:px-8 lg:min-h-[94vh] lg:grid-cols-12 lg:gap-16 lg:pt-32 lg:pb-24">
        <div className="lg:col-span-5">
          <Reveal>
            {meta !== '' ? (
              <p className="tnum font-mono text-meta text-paper-mute">{meta}</p>
            ) : null}

            <h1 className="mt-6 text-[2.5rem] leading-[1.05] tracking-[-0.03em] text-paper sm:text-[3.25rem] lg:text-[4rem]">
              {profile.name}
            </h1>

            <p className="mt-5 text-subhead text-paper-dim">{profile.title}</p>

            {lead ? (
              <p className="mt-6 max-w-[34rem] text-body text-paper-dim">{lead}</p>
            ) : null}

            <div className="mt-9 flex flex-wrap items-center gap-3">
              {email ? (
                <PrimaryLink
                  href={email.href}
                  iconAfter={<Mail size={16} strokeWidth={1.5} />}
                >
                  Email me
                </PrimaryLink>
              ) : null}
              <SecondaryLink
                href="#projects"
                iconAfter={<ArrowUpRight size={16} strokeWidth={1.5} />}
              >
                Selected projects
              </SecondaryLink>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal delay={60}>
            <CareerDrawing
              timeline={timeline}
              originLabel={earliest?.range.start.label ?? ''}
              spanLabel={span}
              describedBy={`Career from ${earliest?.range.start.label ?? ''} to today: ${timeline.rows
                .length} roles across ${span}.`}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

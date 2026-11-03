import { Mail } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { PrimaryLink } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { getResume, publishedContacts } from '@/lib/content';

export function ContactSection() {
  const resume = getResume();
  const contacts = publishedContacts(resume.profile);
  const email = contacts.find((contact) => contact.kind === 'email');
  const profiles = contacts.filter((contact) => contact.kind !== 'email');
  const withheld = resume.profile.contacts.filter((contact) => !contact.published);

  return (
    <Section id="contact" index="07" label="Contact">
      <Reveal>
        <div className="glass blueprint-grid rounded-[18px] p-8 sm:p-10">
          <div className="grid gap-10 sm:grid-cols-12 sm:gap-12">
            <div className="sm:col-span-7">
              <h3 className="font-mono text-meta text-paper-mute">Email</h3>
              {email ? (
                <p className="mt-5">
                  <a
                    href={email.href}
                    className="break-all font-mono text-[18px] leading-8 text-paper transition-colors duration-140 hover:text-cobalt-ink sm:text-[22px]"
                  >
                    {email.value}
                  </a>
                </p>
              ) : null}

              {email ? (
                <div className="mt-8">
                  <PrimaryLink
                    href={email.href}
                    iconAfter={<Mail size={16} strokeWidth={1.5} />}
                  >
                    Write an email
                  </PrimaryLink>
                </div>
              ) : null}
            </div>

            <div className="sm:col-span-5">
              <h3 className="font-mono text-meta text-paper-mute">Elsewhere</h3>
              <ul className="mt-5 divide-y divide-hairline border-t border-hairline">
                {profiles.map((profile) => (
                  <li key={profile.kind}>
                    <a
                      href={profile.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center justify-between gap-4 py-3 text-[14px] text-paper-dim transition-colors duration-140 hover:text-paper"
                    >
                      {profile.label}
                      <span className="truncate font-mono text-[11px] text-paper-mute">{profile.value}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="measure measure-start mt-10 font-mono text-[11px] text-paper-mute">
            {resume.meta.source}
            {withheld.length > 0 ? ` · ${withheld.map((contact) => contact.label.toLowerCase()).join(', ')} withheld` : ''}
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

import type { Contact } from '@/lib/content/schema';

interface SiteFooterProps {
  name: string;
  title: string;
  contacts: readonly Contact[];
  /** Path of the canonical source, printed so the claim is checkable. */
  source: string;
}

export function SiteFooter({ name, title, contacts, source }: SiteFooterProps) {
  return (
    <footer className="border-t border-hairline py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-6 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="text-[13px] text-paper-mute">
          {name} · {title}
        </p>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {contacts.map((contact) => (
            <li key={contact.kind}>
              <a
                href={contact.href}
                className="font-mono text-meta text-paper-mute transition-colors duration-140 hover:text-paper-dim"
                {...(contact.kind === 'email' ? {} : { target: '_blank', rel: 'noreferrer noopener' })}
              >
                {contact.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mx-auto mt-6 max-w-[1200px] px-6 sm:px-8">
        <p className="font-mono text-[11px] leading-5 text-paper-mute">
          Every word above is parsed from <span className="text-paper-dim">{source}</span> at build time.
          Edit the Markdown, rebuild, and the page follows.
        </p>
      </div>
    </footer>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Mail, Menu, X } from 'lucide-react';
import { PrimaryLink } from '@/components/ui/Button';

export interface NavLink {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  /** The product name is the logo: no mark, no gradient wordmark. */
  name: string;
  links: readonly NavLink[];
  /** `mailto:` href for the one button, absent when the resume has no email. */
  emailHref: string | null;
}

export function SiteHeader({ name, links, emailHref }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50',
        'transition-colors duration-200 ease-out',
        scrolled ? 'glass' : 'border-b border-transparent',
      ].join(' ')}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-6 sm:px-8">
        <a href="#top" className="text-[15px] font-medium tracking-[-0.01em]">
          {name}
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-[8px] px-3 py-2 text-[14px] text-paper-dim transition-colors duration-140 hover:text-paper"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {emailHref ? (
            <div className="hidden md:block">
              <PrimaryLink href={emailHref} size="sm" iconAfter={<Mail size={16} strokeWidth={1.5} />}>
                Email
              </PrimaryLink>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-hairline text-paper-dim transition-colors duration-140 hover:text-paper md:hidden"
          >
            {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-menu" className="glass border-t border-hairline md:hidden">
          <nav aria-label="Sections" className="mx-auto flex max-w-[1200px] flex-col px-6 py-3 sm:px-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-hairline py-3 text-[15px] text-paper-dim last:border-b-0 hover:text-paper"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

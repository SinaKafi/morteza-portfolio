import { SiteFooter } from '@/components/site/SiteFooter';
import { About } from '@/components/sections/About';
import { ContactSection } from '@/components/sections/Contact';
import { Education } from '@/components/sections/Education';
import { Experience } from '@/components/sections/Experience';
import { Hero } from '@/components/sections/Hero';
import { Leadership } from '@/components/sections/Leadership';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { getResume, publishedContacts } from '@/lib/content';

/**
 * Every section reads the same parsed object. There is no page-level content
 * here on purpose: if a fact is not in the resume, it is not on the page.
 */
export default function Home() {
  const resume = getResume();
  const contacts = publishedContacts(resume.profile);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-6 focus:z-60 focus:rounded-[8px] focus:bg-paper focus:px-4 focus:py-2 focus:text-[13px] focus:text-ink-900"
      >
        Skip to content
      </a>

      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Leadership />
        <Education />
        <ContactSection />
      </main>

      <SiteFooter
        name={resume.profile.name}
        title={resume.profile.title}
        contacts={contacts}
        source={resume.meta.source}
      />
    </>
  );
}

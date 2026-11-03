import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader, type NavLink } from '@/components/site/SiteHeader';
import { getResume, metaDescription, personJsonLd, publishedContacts, siteUrl } from '@/lib/content';
import { ink } from '@/lib/design/colors';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

/** Quiet navigation: four section links and one action. */
const NAV_LINKS: readonly NavLink[] = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

export async function generateMetadata(): Promise<Metadata> {
  const resume = getResume();
  const title = `${resume.profile.name} — ${resume.profile.title}`;
  const description = metaDescription(resume);

  return {
    title,
    description,
    metadataBase: new URL(siteUrl(resume.profile)),
    alternates: { canonical: '/' },
    authors: [{ name: resume.profile.name, url: siteUrl(resume.profile) }],
    creator: resume.profile.name,
    openGraph: {
      type: 'profile',
      title,
      description,
      url: '/',
      siteName: resume.profile.name,
      locale: 'en_US',
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: ink.page,
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const resume = getResume();
  const email = publishedContacts(resume.profile).find((contact) => contact.kind === 'email');

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      // The script below adds `js` before the document paints, so the class
      // React hydrates against is deliberately one step ahead of the server's.
      suppressHydrationWarning
    >
      <body>
        {/* Marks the document as scripted before anything paints, so the reveal
            styles only apply when JavaScript can undo them. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <script
          type="application/ld+json"
          // Structured data comes from the same parse as the visible page.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(resume)) }}
        />
        <SiteHeader
          name={resume.profile.name}
          links={NAV_LINKS}
          emailHref={email?.href ?? null}
        />
        {children}
      </body>
    </html>
  );
}

import type { MetadataRoute } from 'next';
import { getResume, siteUrl } from '@/lib/content';

export default function robots(): MetadataRoute.Robots {
  const resume = getResume();
  const base = siteUrl(resume.profile);

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

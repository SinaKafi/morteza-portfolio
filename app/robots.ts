import type { MetadataRoute } from 'next';
import { getResume, siteUrl } from '@/lib/content';

// Required by `output: "export"`: emitted once at build time.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  const resume = getResume();
  const base = siteUrl(resume.profile);

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

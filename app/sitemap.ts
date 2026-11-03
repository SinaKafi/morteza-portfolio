import type { MetadataRoute } from 'next';
import { getResume, siteUrl } from '@/lib/content';

// Required by `output: "export"`: emitted once at build time.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const resume = getResume();

  return [
    {
      url: siteUrl(resume.profile),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}

import type { MetadataRoute } from 'next';
import { getResume, siteUrl } from '@/lib/content';

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

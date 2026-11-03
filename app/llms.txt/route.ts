import { getResume, llmsTxt } from '@/lib/content';

/**
 * Agent-facing documentation, generated from the same parse as the page. It is a
 * route rather than a file on disk so it can never fall out of date with the
 * resume — there is nothing to regenerate and nothing to forget.
 */
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(getResume()), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
}

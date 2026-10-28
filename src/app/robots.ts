import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

// AI assistants (ChatGPT, Claude, Perplexity…) can only cite pages their search bots can read.
const ANSWER_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Googlebot',
  'Bingbot',
  'Applebot',
  'DuckAssistBot',
]

const PRIVATE = ['/go/', '/admin', '/api/', '/search']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      ...ANSWER_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}

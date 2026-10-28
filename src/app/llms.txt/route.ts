import { getPayload } from 'payload'
import config from '@payload-config'
import { SITE, absUrl, pathFor } from '@/lib/site'

export const revalidate = 3600

/** A short map of the site for AI assistants (llms.txt convention). */
export async function GET() {
  const payload = await getPayload({ config })
  const stores = await payload.find({ collection: 'stores', locale: 'ar', limit: 200, depth: 0, sort: '-popularity', select: { name: true, slug: true, countries: true } })

  const lines = [
    `# ${SITE.name.ar} (${SITE.name.en})`,
    '',
    `> ${SITE.tagline.en}. Every code shows when it was last tested, its terms, and the country it works in.`,
    '',
    'Pages: Arabic at /sa/<store> and /ae/<store>; English at /en/sa/<store> and /en/ae/<store>.',
    '',
    '## Stores',
    ...stores.docs.flatMap((s) =>
      (s.countries || []).map((c) => `- [${s.name} ${c.toUpperCase()}](${absUrl(pathFor('ar', c as 'sa' | 'ae', s.slug))})`),
    ),
    '',
  ]
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

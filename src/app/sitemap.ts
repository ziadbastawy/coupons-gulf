import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { COUNTRIES, COUNTRY_INFO, LANGS, absUrl, pathFor, type Country } from '@/lib/site'

// Read from the database on each request (cheap), never at build time.
export const dynamic = 'force-dynamic'

function entry(rest: string[], countries: readonly Country[], lastModified?: string): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {}
  for (const c of countries) for (const l of LANGS) languages[COUNTRY_INFO[c].hreflang[l]] = absUrl(pathFor(l, c, ...rest))
  return countries.flatMap((c) =>
    LANGS.map((l) => ({
      url: absUrl(pathFor(l, c, ...rest)),
      lastModified: lastModified ? new Date(lastModified) : new Date(),
      alternates: { languages },
    })),
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const [stores, categories] = await Promise.all([
    payload.find({ collection: 'stores', limit: 2000, depth: 0, select: { slug: true, countries: true, updatedAt: true } }),
    payload.find({ collection: 'categories', limit: 200, depth: 0, select: { slug: true, updatedAt: true } }),
  ])

  return [
    ...entry([], COUNTRIES),
    ...entry(['stores'], COUNTRIES),
    ...categories.docs.flatMap((c) => entry(['category', c.slug], COUNTRIES, c.updatedAt)),
    ...stores.docs.flatMap((s) => entry([s.slug], (s.countries || []) as Country[], s.updatedAt)),
  ]
}

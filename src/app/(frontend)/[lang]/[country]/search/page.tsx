import type { Metadata } from 'next'
import Link from 'next/link'
import { isCountry, isLang, pathFor } from '@/lib/site'
import { t } from '@/lib/i18n'
import { searchStores } from '@/lib/data'
import { SearchBox } from '@/components/SearchBox'
import { StoreTile } from '@/components/StoreTile'

export const metadata: Metadata = { robots: { index: false, follow: true } }
// Results depend on ?q=, so render on every request.
export const dynamic = 'force-dynamic'

export default async function SearchPage({ params, searchParams }: PageProps<'/[lang]/[country]/search'>) {
  const { lang, country } = await params
  if (!isLang(lang) || !isCountry(country)) return null
  const s = t(lang)
  const raw = (await searchParams).q
  const q = (Array.isArray(raw) ? raw[0] : raw || '').slice(0, 60)
  const results = q ? await searchStores(q, lang, country) : []

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <SearchBox lang={lang} country={country} defaultValue={q} />
      </div>
      {q && <h1 className="text-xl font-bold">{s.resultsFor(q)}</h1>}
      {q && results.length === 0 && (
        <p className="text-ink-soft">
          {s.noResults(q)}{' '}
          <Link href={pathFor(lang, country, 'stores')} className="text-ink underline underline-offset-4">
            {s.allStores}
          </Link>
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((st) => (
          <StoreTile key={st.id} store={st} lang={lang} country={country} />
        ))}
      </div>
    </div>
  )
}

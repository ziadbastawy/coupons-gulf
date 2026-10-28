import type { Metadata } from 'next'
import { COUNTRIES, COUNTRY_INFO, isCountry, isLang } from '@/lib/site'
import { t } from '@/lib/i18n'
import { getStores } from '@/lib/data'
import { alternates } from '@/lib/seo'
import { StoreTile } from '@/components/StoreTile'

export const revalidate = 600

type Props = PageProps<'/[lang]/[country]/stores'>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, country } = await params
  if (!isLang(lang) || !isCountry(country)) return {}
  const title = `${t(lang).allStores} ${COUNTRY_INFO[country].name[lang]}`
  return { title, alternates: alternates(lang, country, ['stores'], COUNTRIES) }
}

export default async function StoresPage({ params }: Props) {
  const { lang, country } = await params
  if (!isLang(lang) || !isCountry(country)) return null
  const s = t(lang)
  const stores = [...(await getStores(lang, country))].sort((a, b) => a.name.localeCompare(b.name, lang))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">
        {s.allStores} {COUNTRY_INFO[country].name[lang]}
      </h1>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((st) => (
          <StoreTile key={st.id} store={st} lang={lang} country={country} />
        ))}
      </div>
    </div>
  )
}

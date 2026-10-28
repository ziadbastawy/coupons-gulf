import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Category } from '@/payload-types'
import { COUNTRIES, COUNTRY_INFO, isCountry, isLang, pathFor } from '@/lib/site'
import { t } from '@/lib/i18n'
import { getCategories, getStores, getTopCoupons } from '@/lib/data'
import { JsonLd, alternates, breadcrumbs } from '@/lib/seo'
import { StoreTile } from '@/components/StoreTile'

export const revalidate = 600

// Build pages on first visit, then cache them (ISR).
export async function generateStaticParams() {
  return []
}

type Props = PageProps<'/[lang]/[country]/category/[slug]'>

async function load(props: Props) {
  const { lang, country, slug } = await props.params
  if (!isLang(lang) || !isCountry(country)) return null
  const category = (await getCategories(lang)).find((c) => c.slug === slug)
  if (!category) return null
  return { lang, country, category }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await load(props)
  if (!data) return {}
  const { lang, country, category } = data
  const title = `${t(lang).storesInCategory(category.name)} ${COUNTRY_INFO[country].name[lang]}`
  return { title, description: category.intro || title, alternates: alternates(lang, country, ['category', category.slug], COUNTRIES) }
}

export default async function CategoryPage(props: Props) {
  const data = await load(props)
  if (!data) notFound()
  const { lang, country, category } = data
  const s = t(lang)
  const [stores, top] = await Promise.all([getStores(lang, country), getTopCoupons(lang, country, 500)])
  const inCat = stores.filter((st) => (st.categories || []).some((c) => (typeof c === 'object' ? (c as Category).id : c) === category.id))
  const bestByStore = new Map(top.map((c) => [typeof c.store === 'object' ? c.store.id : c.store, c.discountLabel]))
  const title = `${s.storesInCategory(category.name)} ${COUNTRY_INFO[country].name[lang]}`

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      {category.intro && <p className="max-w-prose text-ink-soft">{category.intro}</p>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {inCat.map((st) => (
          <StoreTile key={st.id} store={st} lang={lang} country={country} best={bestByStore.get(st.id)} />
        ))}
      </div>
      <JsonLd
        data={breadcrumbs([
          { name: s.home, path: pathFor(lang, country) },
          { name: category.name, path: pathFor(lang, country, 'category', category.slug) },
        ])}
      />
    </div>
  )
}

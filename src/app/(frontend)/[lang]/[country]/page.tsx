import type { Metadata } from 'next'
import Link from 'next/link'
import type { Store } from '@/payload-types'
import { COUNTRIES, COUNTRY_INFO, SITE, isCountry, isLang, pathFor } from '@/lib/site'
import { t } from '@/lib/i18n'
import { getCategories, getStores, getTopCoupons } from '@/lib/data'
import { alternates } from '@/lib/seo'
import { CouponTicket } from '@/components/CouponTicket'
import { SearchBox } from '@/components/SearchBox'
import { StoreTile } from '@/components/StoreTile'

export const revalidate = 600

type Props = PageProps<'/[lang]/[country]'>

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, country } = await params
  if (!isLang(lang) || !isCountry(country)) return {}
  const cname = COUNTRY_INFO[country].name[lang]
  const title = lang === 'ar' ? `أكواد خصم وكوبونات ${cname} المتجرّبة` : `Tested promo codes in ${cname}`
  return { title: { absolute: `${title} | ${SITE.name[lang]}` }, description: SITE.tagline[lang], alternates: alternates(lang, country, [], COUNTRIES) }
}

export default async function Home({ params }: Props) {
  const { lang, country } = await params
  if (!isLang(lang) || !isCountry(country)) return null
  const s = t(lang)
  const cname = COUNTRY_INFO[country].name[lang]
  const [top, stores, categories] = await Promise.all([getTopCoupons(lang, country, 6), getStores(lang, country), getCategories(lang)])
  const featured = stores.filter((st) => st.featured)
  const popular = stores.filter((st) => !st.featured).slice(0, 12)
  const source = pathFor(lang, country)

  return (
    <div className="space-y-14">
      <section className="space-y-5 pt-2 sm:pt-6">
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl sm:leading-tight">
          {lang === 'ar' ? `كود الخصم الصح، متجرّب النهارده في ${cname}.` : `The right promo code, tested today in ${cname}.`}
        </h1>
        <div className="max-w-2xl">
          <SearchBox lang={lang} country={country} size="lg" />
        </div>
        {categories.length > 0 && (
          <ul className="flex flex-wrap gap-2 text-sm" aria-label={s.categories}>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={pathFor(lang, country, 'category', c.slug)} className="block rounded-full border border-line bg-card px-3.5 py-1.5 hover:border-ink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {top.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold sm:text-2xl">{s.bestToday}</h2>
          <div className="space-y-4">
            {top.map((c) => (
              <CouponTicket key={c.id} coupon={c} store={c.store as Store} lang={lang} country={country} showStore source={source} />
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold sm:text-2xl">{s.featuredStores}</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((st) => (
              <StoreTile key={st.id} store={st} lang={lang} country={country} />
            ))}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-bold sm:text-2xl">{s.popularStores}</h2>
            <Link href={pathFor(lang, country, 'stores')} className="text-sm text-ink-soft underline underline-offset-4 hover:text-ink">
              {s.allStores}
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((st) => (
              <StoreTile key={st.id} store={st} lang={lang} country={country} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

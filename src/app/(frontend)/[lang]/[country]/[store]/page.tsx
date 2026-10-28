import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Category, Coupon, Store } from '@/payload-types'
import { COUNTRY_INFO, isCountry, isLang, pathFor, type Country, type Lang } from '@/lib/site'
import { formatDate, iso, t } from '@/lib/i18n'
import { getStore, getStoreCoupons, getStores, storeHasCountry } from '@/lib/data'
import { JsonLd, alternates, breadcrumbs, faqPage } from '@/lib/seo'
import { CouponTicket } from '@/components/CouponTicket'
import { StoreLogo } from '@/components/StoreLogo'
import { StoreTile } from '@/components/StoreTile'

export const revalidate = 600

// Build pages on first visit, then cache them (ISR).
export async function generateStaticParams() {
  return []
}

type Props = PageProps<'/[lang]/[country]/[store]'>

async function load(props: Props) {
  const { lang, country, store: slug } = await props.params
  if (!isLang(lang) || !isCountry(country)) return null
  const store = await getStore(slug, lang)
  if (!store || !storeHasCountry(store, country)) return null
  const coupons = await getStoreCoupons(store.id, lang, country)
  return { lang, country, store, coupons }
}

function lastUpdated(coupons: Coupon[], store: Store) {
  const dates = coupons.map((c) => c.verifiedAt || c.updatedAt).concat(store.updatedAt)
  return dates.sort().at(-1) || store.updatedAt
}

function answerLine(lang: Lang, country: Country, store: Store, coupons: Coupon[]) {
  const s = t(lang)
  if (store.summary) return store.summary
  const best = coupons[0]
  if (!best) return null
  const cname = COUNTRY_INFO[country].name[lang]
  const date = formatDate(best.verifiedAt || best.updatedAt, lang)
  return best.type === 'code' && best.code
    ? s.answerLine(store.name, cname, iso(best.code), iso(best.discountLabel), date)
    : s.answerDeal(store.name, cname, iso(best.discountLabel), date)
}

function buildFaqs(lang: Lang, country: Country, store: Store, coupons: Coupon[]) {
  const s = t(lang)
  const faqs: { question: string; answer: string }[] = []
  const line = answerLine(lang, country, store, coupons)
  if (line) faqs.push({ question: s.faqBest(store.name), answer: line })
  faqs.push({ question: s.faqHow(store.name), answer: s.faqHowAnswer(store.name) })
  for (const f of store.faqs || []) faqs.push({ question: f.question, answer: f.answer })
  return faqs
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const data = await load(props)
  if (!data) return {}
  const { lang, country, store, coupons } = data
  const s = t(lang)
  const cname = COUNTRY_INFO[country].name[lang]
  const best = coupons[0]
  const year = new Date().getFullYear()
  const title = store.seoTitle || `${s.codesFor(store.name, cname)} ${year}${best ? ` (${best.code || best.discountLabel})` : ''}`
  const description = store.seoDescription || answerLine(lang, country, store, coupons) || s.codesFor(store.name, cname)
  return {
    title,
    description,
    alternates: alternates(lang, country, [store.slug], (store.countries || []) as Country[]),
    openGraph: { title, description, type: 'website', locale: COUNTRY_INFO[country].hreflang[lang].replace('-', '_') },
  }
}

export default async function StorePage(props: Props) {
  const data = await load(props)
  if (!data) notFound()
  const { lang, country, store, coupons } = data
  const s = t(lang)
  const cname = COUNTRY_INFO[country].name[lang]
  const updated = lastUpdated(coupons, store)
  const line = answerLine(lang, country, store, coupons)
  const faqs = buildFaqs(lang, country, store, coupons)
  const source = pathFor(lang, country, store.slug)

  // Related: other stores sharing a category in this country.
  const catIds = new Set((store.categories || []).map((c) => (typeof c === 'object' ? (c as Category).id : c)))
  const related = (await getStores(lang, country))
    .filter((o) => o.id !== store.id && (o.categories || []).some((c) => catIds.has(typeof c === 'object' ? (c as Category).id : c)))
    .slice(0, 6)

  const crumbs = [
    { name: s.home, path: pathFor(lang, country) },
    { name: s.allStores, path: pathFor(lang, country, 'stores') },
    { name: store.name, path: source },
  ]

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-10">
        <nav aria-label="breadcrumb" className="text-sm text-ink-soft">
          <ol className="flex flex-wrap gap-1.5">
            {crumbs.map((c, i) => (
              <li key={c.path} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                {i < crumbs.length - 1 ? (
                  <Link href={c.path} className="hover:text-ink">
                    {c.name}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink">
                    {c.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <header className="flex gap-4 sm:gap-6">
          <StoreLogo store={store} size={84} />
          <div className="min-w-0 space-y-3">
            <h1 className="text-2xl font-bold leading-tight sm:text-4xl">{s.codesFor(store.name, cname)}</h1>
            {line && <p className="max-w-prose text-lg leading-relaxed">{line}</p>}
            <p className="flex flex-wrap gap-x-4 text-sm text-ink-soft">
              <span>
                <strong className="font-semibold text-ink">{coupons.length}</strong> {s.activeCodes}
              </span>
              <span>
                {s.updated} {formatDate(updated, lang)}
              </span>
            </p>
          </div>
        </header>

        <section aria-label={s.activeCodes} className="space-y-4">
          {coupons.length ? (
            coupons.map((c) => <CouponTicket key={c.id} coupon={c} store={store} lang={lang} country={country} source={source} />)
          ) : (
            <p className="rounded-xl border border-dashed border-line p-6 text-ink-soft">{s.noCoupons}</p>
          )}
        </section>

        {coupons.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-bold">{s.codesTable(store.name)}</h2>
            <div className="overflow-x-auto rounded-xl border border-line bg-card">
              <table className="w-full text-start text-sm">
                <thead className="bg-paper text-ink-soft">
                  <tr>
                    <th className="px-4 py-2.5 text-start font-medium">{s.colCode}</th>
                    <th className="px-4 py-2.5 text-start font-medium">{s.colDiscount}</th>
                    <th className="px-4 py-2.5 text-start font-medium">{s.colTerms}</th>
                    <th className="px-4 py-2.5 text-start font-medium">{s.colTested}</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-t border-line align-top">
                      <td className="code-face px-4 py-2.5 font-semibold">{c.code || s.noCode}</td>
                      <td className="px-4 py-2.5">{c.discountLabel}</td>
                      <td className="px-4 py-2.5 text-ink-soft">{c.conditions || c.title}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-soft">{formatDate(c.verifiedAt, lang) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {store.guide && store.guide.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-xl font-bold">{s.guide(store.name)}</h2>
            {store.guide.map((g) => (
              <div key={g.id || g.heading} className="max-w-prose space-y-1.5">
                <h3 className="font-semibold">{g.heading}</h3>
                <p className="whitespace-pre-line text-ink-soft">{g.body}</p>
              </div>
            ))}
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-xl font-bold">{s.faq}</h2>
          <div className="divide-y divide-line rounded-xl border border-line bg-card">
            {faqs.map((f) => (
              <details key={f.question} className="group p-4" open={faqs.indexOf(f) === 0}>
                <summary className="cursor-pointer list-none font-semibold marker:hidden">
                  <h3 className="inline">{f.question}</h3>
                </summary>
                <p className="mt-2 max-w-prose text-ink-soft">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {store.about && (
          <section className="max-w-prose space-y-2">
            <h2 className="text-xl font-bold">{s.about(store.name)}</h2>
            <p className="whitespace-pre-line text-ink-soft">{store.about}</p>
          </section>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        {related.length > 0 && (
          <>
            <h2 className="font-bold">{s.related}</h2>
            <div className="grid gap-2">
              {related.map((r) => (
                <StoreTile key={r.id} store={r} lang={lang} country={country} />
              ))}
            </div>
          </>
        )}
        <p className="text-xs leading-relaxed text-ink-soft">{s.disclosure}</p>
      </aside>

      <JsonLd data={breadcrumbs(crumbs)} />
      <JsonLd data={faqPage(faqs)} />
    </div>
  )
}

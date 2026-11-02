import Link from 'next/link'
import { notFound } from 'next/navigation'
import { COUNTRIES, COUNTRY_INFO, SITE, isCountry, isLang, pathFor } from '@/lib/site'
import { t } from '@/lib/i18n'
import { getCategories } from '@/lib/data'
import { CountrySwitch, LangSwitch } from '@/components/Switchers'

// Pages are built on the first visit and then cached (ISR), so the build never needs the database.
export function generateStaticParams() {
  return []
}

export default async function CountryLayout({ children, params }: LayoutProps<'/[lang]/[country]'>) {
  const { lang, country } = await params
  if (!isLang(lang) || !isCountry(country)) notFound()
  const s = t(lang)
  const categories = await getCategories(lang)

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3">
          <Link href={pathFor(lang, country)} className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-saffron text-base text-ink">%</span>
            {SITE.name[lang]}
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href={pathFor(lang, country, 'stores')} className="rounded-full px-3 py-1.5 text-ink-soft hover:bg-card hover:text-ink">
              {s.allStores}
            </Link>
          </nav>
          <div className="ms-auto flex items-center gap-2">
            <CountrySwitch current={country} options={COUNTRIES.map((c) => ({ value: c, label: COUNTRY_INFO[c].name[lang] }))} />
            <LangSwitch label={s.langSwitch} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">{children}</main>

      <footer className="mt-12 border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-ink-soft sm:grid-cols-[2fr_3fr]">
          <div className="space-y-3">
            <p className="text-base font-semibold text-ink">{SITE.name[lang]}</p>
            <p>{s.footerAbout}</p>
            <p className="max-w-prose">{s.disclosure}</p>
          </div>
          <div>
            <p className="mb-3 font-semibold text-ink">{s.categories}</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={pathFor(lang, country, 'category', c.slug)} className="hover:text-ink">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

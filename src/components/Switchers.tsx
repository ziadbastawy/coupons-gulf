'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Country, Lang } from '@/lib/site'

/** Split a public path into lang, country and the rest. */
function parse(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  const lang: Lang = parts[0] === 'en' ? 'en' : 'ar'
  if (lang === 'en') parts.shift()
  const country = parts.shift() || 'sa'
  return { lang, country, rest: parts }
}

function build(lang: Lang, country: string, rest: string[]) {
  return '/' + [lang === 'en' ? 'en' : '', country, ...rest].filter(Boolean).join('/')
}

export function LangSwitch({ label }: { label: string }) {
  const { lang, country, rest } = parse(usePathname())
  const other: Lang = lang === 'ar' ? 'en' : 'ar'
  return (
    <Link href={build(other, country, rest)} hrefLang={other} lang={other} className="rounded-full px-3 py-1.5 text-sm text-ink-soft hover:bg-card hover:text-ink">
      {label}
    </Link>
  )
}

export function CountrySwitch({ current, options }: { current: Country; options: { value: Country; label: string }[] }) {
  const { lang, rest } = parse(usePathname())
  return (
    <div className="flex rounded-full border border-line bg-card p-0.5 text-sm" role="group">
      {options.map((o) => (
        <Link
          key={o.value}
          href={build(lang, o.value, rest)}
          aria-current={o.value === current ? 'true' : undefined}
          className={
            o.value === current
              ? 'rounded-full bg-ink px-3 py-1 text-paper'
              : 'rounded-full px-3 py-1 text-ink-soft hover:text-ink'
          }
        >
          {o.label}
        </Link>
      ))}
    </div>
  )
}

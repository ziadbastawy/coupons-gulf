import type { Metadata } from 'next'
import { COUNTRY_INFO, LANGS, absUrl, pathFor, type Country, type Lang } from './site'

/**
 * Canonical + hreflang for a page that exists in several countries and both languages.
 * `rest` is the part after the country, e.g. ['noon'].
 */
export function alternates(lang: Lang, country: Country, rest: string[], countries: readonly Country[]): Metadata['alternates'] {
  const languages: Record<string, string> = {}
  for (const c of countries) {
    for (const l of LANGS) {
      languages[COUNTRY_INFO[c].hreflang[l]] = absUrl(pathFor(l, c, ...rest))
    }
  }
  // Saudi Arabic is the default for everyone else.
  const fallbackCountry = countries.includes('sa') ? 'sa' : countries[0]
  languages['x-default'] = absUrl(pathFor('ar', fallbackCountry, ...rest))
  return { canonical: absUrl(pathFor(lang, country, ...rest)), languages }
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: absUrl(it.path) })),
  }
}

export function faqPage(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  }
}

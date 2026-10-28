// Central site settings. Change the brand name and URL here.
export const SITE = {
  name: { ar: 'خصمك', en: 'Khasmak' },
  tagline: {
    ar: 'أكواد خصم متجرّبة للسعودية والإمارات',
    en: 'Tested discount codes for Saudi Arabia and the UAE',
  },
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
}

export const LANGS = ['ar', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'ar'

export const COUNTRIES = ['sa', 'ae'] as const
export type Country = (typeof COUNTRIES)[number]
export const DEFAULT_COUNTRY: Country = 'sa'

export const COUNTRY_INFO: Record<Country, { name: Record<Lang, string>; currency: Record<Lang, string>; hreflang: Record<Lang, string> }> = {
  sa: {
    name: { ar: 'السعودية', en: 'Saudi Arabia' },
    currency: { ar: 'ريال', en: 'SAR' },
    hreflang: { ar: 'ar-SA', en: 'en-SA' },
  },
  ae: {
    name: { ar: 'الإمارات', en: 'UAE' },
    currency: { ar: 'درهم', en: 'AED' },
    hreflang: { ar: 'ar-AE', en: 'en-AE' },
  },
}

export const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v)
export const isCountry = (v: string): v is Country => (COUNTRIES as readonly string[]).includes(v)

/** Public path for a page. Arabic has no prefix, English lives under /en. */
export function pathFor(lang: Lang, country: Country, ...rest: string[]) {
  const parts = [lang === 'ar' ? '' : 'en', country, ...rest].filter(Boolean)
  return '/' + parts.join('/')
}

export const absUrl = (path: string) => SITE.url + path

import 'server-only'
import { cache } from 'react'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import type { Category, Coupon, Store } from '@/payload-types'
import type { Country, Lang } from './site'

export const getClient = cache(() => getPayload({ config }))

const liveCoupon = (country: Country): Where => ({
  and: [
    { status: { equals: 'active' } },
    { countries: { contains: country } },
    { or: [{ expiresAt: { exists: false } }, { expiresAt: { greater_than: new Date().toISOString() } }] },
  ],
})

export const getCategories = cache(async (lang: Lang) => {
  const payload = await getClient()
  const res = await payload.find({ collection: 'categories', locale: lang, limit: 100, sort: 'order', depth: 0 })
  return res.docs as Category[]
})

export const getStores = cache(async (lang: Lang, country: Country) => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'stores',
    locale: lang,
    limit: 500,
    depth: 1,
    where: { countries: { contains: country } },
    sort: '-popularity',
  })
  return res.docs as Store[]
})

export const getStore = cache(async (slug: string, lang: Lang) => {
  const payload = await getClient()
  const res = await payload.find({ collection: 'stores', locale: lang, limit: 1, depth: 1, where: { slug: { equals: slug } } })
  return (res.docs[0] as Store) || null
})

export const getStoreCoupons = cache(async (storeId: number, lang: Lang, country: Country) => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'coupons',
    locale: lang,
    limit: 100,
    depth: 0,
    where: { and: [{ store: { equals: storeId } }, liveCoupon(country)] },
    sort: 'sortOrder',
  })
  return res.docs as Coupon[]
})

/** Best coupon per store across the country, for the home page. */
export const getTopCoupons = cache(async (lang: Lang, country: Country, limit = 8) => {
  const payload = await getClient()
  const res = await payload.find({
    collection: 'coupons',
    locale: lang,
    limit: 200,
    depth: 1,
    where: liveCoupon(country),
    sort: 'sortOrder',
  })
  const seen = new Set<number>()
  const out: Coupon[] = []
  for (const c of res.docs as Coupon[]) {
    const sid = typeof c.store === 'object' ? c.store.id : c.store
    if (seen.has(sid)) continue
    seen.add(sid)
    out.push(c)
  }
  // Most popular stores first.
  const pop = (c: Coupon) => (typeof c.store === 'object' ? c.store.popularity || 0 : 0)
  return out.sort((a, b) => pop(b) - pop(a)).slice(0, limit)
})

export const searchStores = cache(async (q: string, lang: Lang, country: Country) => {
  const payload = await getClient()
  const term = q.trim()
  if (!term) return []
  // Match the store name in either language, the slug or the aliases.
  const [ar, en] = await Promise.all(
    (['ar', 'en'] as const).map((locale) =>
      payload.find({
        collection: 'stores',
        locale,
        limit: 30,
        depth: 1,
        where: {
          and: [
            { countries: { contains: country } },
            { or: [{ name: { like: term } }, { slug: { like: term.toLowerCase() } }, { aliases: { like: term } }] },
          ],
        },
      }),
    ),
  )
  const ids = new Set([...ar.docs, ...en.docs].map((d) => d.id))
  if (!ids.size) return []
  const res = await payload.find({ collection: 'stores', locale: lang, depth: 1, limit: 30, where: { id: { in: [...ids] } }, sort: '-popularity' })
  return res.docs as Store[]
})

export const storeHasCountry = (store: Store, country: Country) => (store.countries || []).includes(country)

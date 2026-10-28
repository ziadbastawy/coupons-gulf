import { NextResponse, after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Store } from '@/payload-types'
import { DEFAULT_COUNTRY, SITE, isCountry, isLang, pathFor } from '@/lib/site'

/**
 * /go/:couponId?c=sa&l=ar&s=/sa/noon
 * Logs the click, then sends the shopper to the store's affiliate link for that country.
 * The click id is appended as a sub-id so network reports can be matched back to the click.
 */
export async function GET(req: Request, { params }: RouteContext<'/go/[id]'>) {
  const { id } = await params
  const url = new URL(req.url)
  const country = isCountry(url.searchParams.get('c') || '') ? (url.searchParams.get('c') as 'sa' | 'ae') : DEFAULT_COUNTRY
  const lang = isLang(url.searchParams.get('l') || '') ? (url.searchParams.get('l') as 'ar' | 'en') : 'ar'
  const source = (url.searchParams.get('s') || '').slice(0, 200)

  const payload = await getPayload({ config })
  const couponId = Number(id)
  const coupon = Number.isInteger(couponId)
    ? await payload.findByID({ collection: 'coupons', id: couponId, depth: 1, overrideAccess: false }).catch(() => null)
    : null
  if (!coupon) return NextResponse.redirect(new URL(pathFor(lang, country), SITE.url), 302)

  const store = coupon.store as Store
  const link =
    coupon.urlOverride ||
    store.affiliateLinks?.find((l) => l.country === country)?.url ||
    store.affiliateLinks?.[0]?.url ||
    store.website

  if (!link) return NextResponse.redirect(new URL(pathFor(lang, country, store.slug), SITE.url), 302)

  const clickId = crypto.randomUUID().replace(/-/g, '').slice(0, 16)
  const target = withSubId(link, clickId)

  // Log after the redirect is sent so the shopper never waits on the database.
  after(async () => {
    await payload.create({
      collection: 'clicks',
      overrideAccess: true,
      data: { store: store.id, coupon: coupon.id, country, lang, source, clickId, referrer: (req.headers.get('referer') || '').slice(0, 300) },
    })
    await payload.update({
      collection: 'coupons',
      id: coupon.id,
      overrideAccess: true,
      context: { skipRevalidate: true },
      data: { clicks: (coupon.clicks || 0) + 1 },
    })
  })

  const res = NextResponse.redirect(target, 302)
  res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('Referrer-Policy', 'no-referrer-when-downgrade')
  return res
}

/** Most networks accept a sub-id parameter; fill the one this link already uses, or add a generic one. */
function withSubId(link: string, clickId: string) {
  try {
    const u = new URL(link)
    const known = ['subid', 'sub_id', 'subid1', 'aff_sub', 'clickref', 'ascsubtag']
    const existing = known.find((k) => u.searchParams.has(k))
    if (existing) u.searchParams.set(existing, clickId)
    else if (!u.hostname.includes('amazon.')) u.searchParams.set('subid', clickId)
    return u.toString()
  } catch {
    return link
  }
}

import Link from 'next/link'
import type { Coupon, Store } from '@/payload-types'
import { COUNTRY_INFO, pathFor, type Country, type Lang } from '@/lib/site'
import { formatDate, t } from '@/lib/i18n'
import { CopyCode } from './CopyCode'
import { StoreLogo } from './StoreLogo'

export function successRate(c: Pick<Coupon, 'worked' | 'failed'>) {
  const w = c.worked || 0
  const f = c.failed || 0
  return w + f >= 5 ? Math.round((w / (w + f)) * 100) : null
}

export function CouponTicket({
  coupon,
  store,
  lang,
  country,
  showStore = false,
  source,
}: {
  coupon: Coupon
  store: Store
  lang: Lang
  country: Country
  showStore?: boolean
  source: string
}) {
  const s = t(lang)
  const cur = COUNTRY_INFO[country].currency[lang]
  const rate = successRate(coupon)
  const goHref = `/go/${coupon.id}?c=${country}&l=${lang}&s=${encodeURIComponent(source)}`

  const facts: string[] = []
  if (coupon.audience === 'new') facts.push(s.newCustomers)
  if (coupon.audience === 'existing') facts.push(s.existingCustomers)
  if (coupon.appOnly) facts.push(s.appOnly)
  if (coupon.minOrder) facts.push(`${s.minOrder} ${coupon.minOrder} ${cur}`)
  if (coupon.maxDiscount) facts.push(`${s.maxDiscount} ${coupon.maxDiscount} ${cur}`)
  if (coupon.expiresAt) facts.push(`${s.expires} ${formatDate(coupon.expiresAt, lang)}`)

  return (
    <article className="ticket" id={`c${coupon.id}`}>
      <div className="flex min-w-0 gap-4 p-4 sm:p-5">
        {showStore && (
          <Link href={pathFor(lang, country, store.slug)} className="shrink-0">
            <StoreLogo store={store} size={52} />
          </Link>
        )}
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {showStore && (
              <Link href={pathFor(lang, country, store.slug)} className="font-semibold text-ink hover:underline">
                {store.name}
              </Link>
            )}
            {coupon.verifiedAt && (
              <span className="inline-flex items-center gap-1 rounded-full bg-palm-soft px-2 py-0.5 font-medium text-palm">
                <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
                  <path d="M6.4 11.2 3.2 8l1.1-1.1 2.1 2.1 5.3-5.3L12.8 4.8z" />
                </svg>
                {s.verified} {formatDate(coupon.verifiedAt, lang)}
              </span>
            )}
            {coupon.exclusive && <span className="rounded-full border border-saffron px-2 py-0.5 font-medium text-saffron-ink">{s.exclusive}</span>}
            {rate !== null && (
              <span className="text-ink-soft">
                {s.worked} {rate}% {s.ofUsers}
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold leading-snug sm:text-lg">{coupon.title}</h3>
          {coupon.conditions && <p className="text-sm text-ink-soft">{coupon.conditions}</p>}
          {facts.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 text-xs text-ink-soft">
              {facts.map((f) => (
                <li key={f} className="rounded-md bg-paper px-2 py-0.5">
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="ticket-stub grid w-full grid-cols-[auto_1fr] items-center gap-x-3 gap-y-3 p-4 sm:flex sm:w-56 sm:flex-col sm:items-stretch sm:justify-center sm:p-5">
        <p className="text-center text-2xl font-bold leading-none text-saffron-ink">{coupon.discountLabel}</p>
        {coupon.type === 'code' && coupon.code ? (
          <p className="code-face rounded-lg border border-dashed border-saffron bg-card/60 py-1.5 text-center text-lg font-semibold">{coupon.code}</p>
        ) : (
          <p className="text-center text-sm text-saffron-ink">{s.noCode}</p>
        )}
        <div className="col-span-2">
        <CopyCode
          couponId={coupon.id}
          code={coupon.type === 'code' ? coupon.code || null : null}
          goHref={goHref}
          labels={{
            copy: s.copyCode,
            deal: s.getDeal,
            copied: s.copied,
            go: s.goToStore(store.name),
            didItWork: s.didItWork,
            yes: s.yes,
            no: s.no,
            thanks: s.thanks,
            pasteHint: s.pasteHint,
            close: s.close,
          }}
        />
        </div>
      </div>
    </article>
  )
}

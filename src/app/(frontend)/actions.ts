'use server'

import { cookies } from 'next/headers'
import { getClient } from '@/lib/data'

/** Record a "did the code work?" vote. One vote per coupon per browser. */
export async function voteCoupon(couponId: number, worked: boolean) {
  if (!Number.isInteger(couponId) || couponId <= 0) return { ok: false }
  const jar = await cookies()
  const key = `v_${couponId}`
  if (jar.get(key)) return { ok: true, duplicate: true }

  const payload = await getClient()
  const coupon = await payload.findByID({ collection: 'coupons', id: couponId, depth: 0, overrideAccess: true }).catch(() => null)
  if (!coupon) return { ok: false }

  await payload.update({
    collection: 'coupons',
    id: couponId,
    overrideAccess: true,
    context: { skipRevalidate: true },
    data: worked ? { worked: (coupon.worked || 0) + 1 } : { failed: (coupon.failed || 0) + 1 },
  })
  jar.set(key, worked ? '1' : '0', { maxAge: 60 * 60 * 24 * 30, httpOnly: true, sameSite: 'lax', path: '/' })
  return { ok: true }
}

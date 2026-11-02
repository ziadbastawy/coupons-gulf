import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
let admin: User
let couponEditor: User
let noAccess: User
let storeId: number

const staff = (email: string, permissions: User['permissions'] = {}) =>
  payload.create({ collection: 'users', data: { email, password: 'test', role: 'staff', permissions } })

const couponData = (title: string, status: 'draft' | 'active' = 'draft') => ({
  title,
  status,
  store: storeId,
  type: 'code' as const,
  discountLabel: '10%',
  countries: ['sa' as const],
})

const clearAll = async () => {
  await payload.delete({ collection: 'coupons', where: { id: { exists: true } } })
  await payload.delete({ collection: 'stores', where: { id: { exists: true } } })
  await payload.db.deleteMany({ collection: 'users', where: { id: { exists: true } } })
}

describe('Permissions', () => {
  beforeAll(async () => {
    expect(process.env.DATABASE_URL).toBe('file:./test.db')
    payload = await getPayload({ config: await config })
    await clearAll()

    admin = await payload.create({ collection: 'users', data: { email: 'first@test.com', password: 'test', role: 'staff' } })
    couponEditor = await staff('editor@test.com', { coupons: { create: true } })
    noAccess = await staff('none@test.com')
    const store = await payload.create({
      collection: 'stores',
      data: { name: 'Store', slug: 'store', countries: ['sa'] },
    })
    storeId = store.id
  })

  afterAll(clearAll)

  it('makes the first account an admin', () => {
    expect(admin.role).toBe('admin')
  })

  it('lets staff do only the granted action', async () => {
    const asEditor = { user: couponEditor, overrideAccess: false }
    const coupon = await payload.create({ collection: 'coupons', data: couponData('Mine'), ...asEditor })
    expect(coupon.id).toBeDefined()

    await expect(payload.update({ collection: 'coupons', id: coupon.id, data: { title: 'New' }, ...asEditor })).rejects.toThrow()
    await expect(payload.delete({ collection: 'coupons', id: coupon.id, ...asEditor })).rejects.toThrow()
    await expect(payload.create({ collection: 'stores', data: { name: 'X', slug: 'x', countries: ['sa'] }, ...asEditor })).rejects.toThrow()
  })

  it('lets coupon editors see stores so they can pick one', async () => {
    const stores = await payload.find({ collection: 'stores', user: couponEditor, overrideAccess: false })
    expect(stores.totalDocs).toBe(1)
    await expect(payload.find({ collection: 'stores', user: noAccess, overrideAccess: false })).rejects.toThrow()
  })

  it('keeps the public view of coupons', async () => {
    await payload.create({ collection: 'coupons', data: couponData('Live', 'active') })
    await payload.create({ collection: 'coupons', data: couponData('Hidden') })

    const visible = await payload.find({ collection: 'coupons', overrideAccess: false })
    expect(visible.docs.map((c) => c.title)).toEqual(['Live'])
    await expect(payload.find({ collection: 'coupons', user: noAccess, overrideAccess: false })).rejects.toThrow()
  })

  it('stops staff from raising their own access', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: noAccess.id,
      data: { role: 'admin', permissions: { coupons: { delete: true } } },
      user: noAccess,
      overrideAccess: false,
    })
    expect(updated.role).toBeUndefined()
    expect(updated.permissions).toBeUndefined()

    const stored = await payload.findByID({ collection: 'users', id: noAccess.id })
    expect(stored.role).toBe('staff')
    expect(stored.permissions?.coupons?.delete).not.toBe(true)
  })

  it('keeps users admin-only', async () => {
    const asStaff = { user: noAccess, overrideAccess: false }
    await expect(
      payload.create({ collection: 'users', data: { email: 'new@test.com', password: 'test', role: 'admin' }, ...asStaff }),
    ).rejects.toThrow()
    await expect(payload.update({ collection: 'users', id: couponEditor.id, data: { email: 'x@test.com' }, ...asStaff })).rejects.toThrow()
    await expect(payload.delete({ collection: 'users', id: couponEditor.id, ...asStaff })).rejects.toThrow()

    const users = await payload.find({ collection: 'users', ...asStaff })
    expect(users.docs.map((u) => u.id)).toEqual([noAccess.id])
  })

  it('refuses to remove the last admin', async () => {
    await expect(payload.update({ collection: 'users', id: admin.id, data: { role: 'staff' } })).rejects.toThrow()
    await expect(payload.delete({ collection: 'users', id: admin.id })).rejects.toThrow()

    const second = await payload.create({ collection: 'users', data: { email: 'second@test.com', password: 'test', role: 'admin' } })
    const demoted = await payload.update({ collection: 'users', id: second.id, data: { role: 'staff' } })
    expect(demoted.role).toBe('staff')
  })
})

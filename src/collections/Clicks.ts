import type { CollectionConfig } from 'payload'

/** One row per click on "Go to store". Written by /go, read in the admin. */
export const Clicks: CollectionConfig = {
  slug: 'clicks',
  labels: { singular: { ar: 'نقرة', en: 'Click' }, plural: { ar: 'النقرات', en: 'Clicks' } },
  admin: { defaultColumns: ['store', 'coupon', 'country', 'source', 'createdAt'], group: { ar: 'التقارير', en: 'Reports' } },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false, // only the server writes clicks (overrideAccess)
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'store', type: 'relationship', relationTo: 'stores', index: true },
    { name: 'coupon', type: 'relationship', relationTo: 'coupons', index: true },
    { name: 'country', type: 'text', index: true },
    { name: 'lang', type: 'text' },
    { name: 'source', type: 'text', admin: { description: 'Page the click came from' } },
    { name: 'referrer', type: 'text' },
    { name: 'clickId', type: 'text', index: true, admin: { description: 'Sent to the network as a sub-id' } },
  ],
}

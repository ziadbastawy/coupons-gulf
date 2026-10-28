import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  labels: { singular: { ar: 'كوبون', en: 'Coupon' }, plural: { ar: 'الكوبونات', en: 'Coupons' } },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'store', 'code', 'status', 'verifiedAt', 'clicks'],
    listSearchableFields: ['title', 'code'],
  },
  access: {
    // Public can only read live coupons; editors see everything.
    read: ({ req }) => (req.user ? true : { status: { equals: 'active' } }),
  },
  defaultSort: 'sortOrder',
  hooks: {
    // Votes update counters only; don't refresh the whole site for those.
    afterChange: [({ context }) => { if (!context?.skipRevalidate) revalidateSite() }],
  },
  fields: [
    { name: 'store', type: 'relationship', relationTo: 'stores', required: true, index: true, label: { ar: 'المتجر', en: 'Store' } },
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'code',
          options: [
            { label: { ar: 'كود', en: 'Code' }, value: 'code' },
            { label: { ar: 'عرض بدون كود', en: 'Deal (no code)' }, value: 'deal' },
          ],
        },
        { name: 'code', type: 'text', label: { ar: 'الكود', en: 'Code' }, admin: { condition: (_, s) => s?.type === 'code' } },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'draft',
          index: true,
          options: [
            { label: { ar: 'مسودة', en: 'Draft' }, value: 'draft' },
            { label: { ar: 'فعال', en: 'Active' }, value: 'active' },
            { label: { ar: 'منتهي', en: 'Expired' }, value: 'expired' },
          ],
        },
      ],
    },
    { name: 'title', type: 'text', required: true, localized: true, label: { ar: 'العنوان', en: 'Title' } },
    {
      name: 'discountLabel',
      type: 'text',
      required: true,
      localized: true,
      label: { ar: 'الخصم المختصر', en: 'Short discount' },
      admin: { description: 'e.g. 15% / خصم 50 ريال' },
    },
    { name: 'conditions', type: 'textarea', localized: true, label: { ar: 'الشروط', en: 'Terms' } },
    {
      type: 'row',
      fields: [
        {
          name: 'countries',
          type: 'select',
          hasMany: true,
          required: true,
          defaultValue: ['sa', 'ae'],
          options: [
            { label: { ar: 'السعودية', en: 'Saudi Arabia' }, value: 'sa' },
            { label: { ar: 'الإمارات', en: 'UAE' }, value: 'ae' },
          ],
        },
        { name: 'audience', type: 'select', defaultValue: 'all', options: [
          { label: { ar: 'الكل', en: 'Everyone' }, value: 'all' },
          { label: { ar: 'العملاء الجدد', en: 'New customers' }, value: 'new' },
          { label: { ar: 'العملاء الحاليين', en: 'Existing customers' }, value: 'existing' },
        ] },
        { name: 'appOnly', type: 'checkbox', label: { ar: 'التطبيق فقط', en: 'App only' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'minOrder', type: 'number', label: { ar: 'الحد الأدنى للسلة', en: 'Minimum order' } },
        { name: 'maxDiscount', type: 'number', label: { ar: 'أقصى خصم', en: 'Maximum discount' } },
        { name: 'exclusive', type: 'checkbox', label: { ar: 'حصري لنا', en: 'Exclusive to us' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'verifiedAt',
          type: 'date',
          label: { ar: 'آخر تجربة', en: 'Last tested' },
          admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'Set this every time someone tests the code' },
        },
        { name: 'expiresAt', type: 'date', label: { ar: 'ينتهي', en: 'Expires' } },
        { name: 'sortOrder', type: 'number', defaultValue: 100, label: { ar: 'الترتيب', en: 'Order' }, admin: { description: 'Lower shows first' } },
      ],
    },
    {
      name: 'urlOverride',
      type: 'text',
      label: { ar: 'رابط خاص للعرض', en: 'Deal link override' },
      admin: { description: 'Optional. Otherwise the store affiliate link for the country is used.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'clicks', type: 'number', defaultValue: 0, admin: { readOnly: true }, label: { ar: 'النقرات', en: 'Clicks' } },
        { name: 'worked', type: 'number', defaultValue: 0, admin: { readOnly: true }, label: { ar: 'اشتغل', en: 'Worked' } },
        { name: 'failed', type: 'number', defaultValue: 0, admin: { readOnly: true }, label: { ar: 'ما اشتغلش', en: "Didn't work" } },
      ],
    },
  ],
}

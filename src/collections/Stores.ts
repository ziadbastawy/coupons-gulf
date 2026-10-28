import type { CollectionConfig } from 'payload'
import { revalidateSite } from '../lib/revalidate'

const COUNTRY_OPTIONS = [
  { label: { ar: 'السعودية', en: 'Saudi Arabia' }, value: 'sa' },
  { label: { ar: 'الإمارات', en: 'UAE' }, value: 'ae' },
]

export const Stores: CollectionConfig = {
  slug: 'stores',
  labels: { singular: { ar: 'متجر', en: 'Store' }, plural: { ar: 'المتاجر', en: 'Stores' } },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'countries', 'featured', 'updatedAt'],
  },
  access: { read: () => true },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { ar: 'الأساسي', en: 'Basics' },
          fields: [
            { name: 'name', type: 'text', required: true, localized: true, label: { ar: 'اسم المتجر', en: 'Store name' } },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              label: { ar: 'الرابط', en: 'Slug' },
              admin: { description: 'English, lowercase, e.g. noon → /sa/noon' },
            },
            {
              name: 'aliases',
              type: 'text',
              label: { ar: 'أسماء بديلة للبحث', en: 'Search aliases' },
              admin: { description: 'Comma separated, e.g. نون, noon, نون فود' },
            },
            { name: 'logo', type: 'upload', relationTo: 'media', label: { ar: 'الشعار', en: 'Logo' } },
            {
              name: 'brandColor',
              type: 'text',
              label: { ar: 'لون البراند', en: 'Brand colour' },
              admin: { description: 'Hex, e.g. #FEEE00 — used for the logo tile when no logo is uploaded' },
            },
            {
              name: 'countries',
              type: 'select',
              hasMany: true,
              required: true,
              defaultValue: ['sa', 'ae'],
              options: COUNTRY_OPTIONS,
              label: { ar: 'الدول', en: 'Countries' },
            },
            { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true, label: { ar: 'الفئات', en: 'Categories' } },
            { name: 'website', type: 'text', label: { ar: 'موقع المتجر', en: 'Store website' } },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
              label: { ar: 'متجر مميز (مدفوع)', en: 'Featured (paid placement)' },
              admin: { description: 'Shown first on the home page with a "Featured" label' },
            },
            { name: 'popularity', type: 'number', defaultValue: 0, label: { ar: 'الشعبية', en: 'Popularity' }, admin: { description: 'Higher shows first' } },
          ],
        },
        {
          label: { ar: 'روابط الأفلييت', en: 'Affiliate links' },
          fields: [
            {
              name: 'affiliateLinks',
              type: 'array',
              label: { ar: 'روابط الأفلييت حسب الدولة', en: 'Affiliate links per country' },
              admin: { description: 'Where /go sends shoppers. One row per country.' },
              fields: [
                { name: 'country', type: 'select', required: true, options: COUNTRY_OPTIONS },
                { name: 'url', type: 'text', required: true },
                {
                  name: 'network',
                  type: 'select',
                  options: ['direct', 'admitad', 'arabclicks', 'boostiny', 'optimise', 'amazon', 'awin', 'other'].map((v) => ({ label: v, value: v })),
                },
              ],
            },
          ],
        },
        {
          label: { ar: 'المحتوى', en: 'Content' },
          fields: [
            {
              name: 'summary',
              type: 'textarea',
              localized: true,
              label: { ar: 'سطر الإجابة', en: 'Answer line' },
              admin: { description: 'Optional. Leave empty to build it from the best code automatically.' },
            },
            { name: 'about', type: 'textarea', localized: true, label: { ar: 'عن المتجر', en: 'About the store' } },
            {
              name: 'guide',
              type: 'array',
              localized: true,
              label: { ar: 'دليل التوفير', en: 'Savings guide' },
              admin: { description: 'Short sections: shipping fees, payment, returns, sale seasons…' },
              fields: [
                { name: 'heading', type: 'text', required: true },
                { name: 'body', type: 'textarea', required: true },
              ],
            },
            {
              name: 'faqs',
              type: 'array',
              localized: true,
              label: { ar: 'أسئلة شائعة', en: 'FAQs' },
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', type: 'text', localized: true, admin: { description: 'Leave empty for the default title' } },
            { name: 'seoDescription', type: 'textarea', localized: true },
          ],
        },
      ],
    },
  ],
}

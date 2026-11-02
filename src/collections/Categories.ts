import type { CollectionConfig } from 'payload'
import { can, publicOrCanView } from '../lib/permissions'
import { revalidateSite } from '../lib/revalidate'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: { ar: 'فئة', en: 'Category' }, plural: { ar: 'الفئات', en: 'Categories' } },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'slug', 'order'] },
  access: {
    read: publicOrCanView('categories'),
    create: can('categories', 'create'),
    update: can('categories', 'update'),
    delete: can('categories', 'delete'),
  },
  defaultSort: 'order',
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, label: { ar: 'الاسم', en: 'Name' } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: { ar: 'الرابط', en: 'Slug' },
      admin: { description: 'English, lowercase, e.g. fashion' },
    },
    { name: 'intro', type: 'textarea', localized: true, label: { ar: 'مقدمة', en: 'Intro' } },
    { name: 'order', type: 'number', defaultValue: 100, label: { ar: 'الترتيب', en: 'Order' } },
  ],
}

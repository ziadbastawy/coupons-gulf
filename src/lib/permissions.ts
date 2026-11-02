import type { Access, FieldAccess } from 'payload'
import type { User } from '../payload-types'

export type Action = 'read' | 'create' | 'update' | 'delete'
type Slug = keyof NonNullable<User['permissions']>
type PermissionUser = Pick<User, 'role' | 'permissions'> | null | undefined

/** What a staff user can be granted, one row of checkboxes per collection. Users are admin-only. */
export const PERMISSION_COLLECTIONS: { slug: Slug; label: { ar: string; en: string }; actions: Action[] }[] = [
  { slug: 'coupons', label: { ar: 'الكوبونات', en: 'Coupons' }, actions: ['read', 'create', 'update', 'delete'] },
  { slug: 'stores', label: { ar: 'المتاجر', en: 'Stores' }, actions: ['read', 'create', 'update', 'delete'] },
  { slug: 'categories', label: { ar: 'الفئات', en: 'Categories' }, actions: ['read', 'create', 'update', 'delete'] },
  { slug: 'media', label: { ar: 'الصور', en: 'Media' }, actions: ['read', 'create', 'update', 'delete'] },
  { slug: 'clicks', label: { ar: 'النقرات', en: 'Clicks' }, actions: ['read', 'delete'] },
]

export const ACTION_LABELS: Record<Action, { ar: string; en: string }> = {
  read: { ar: 'عرض', en: 'View' },
  create: { ar: 'إضافة', en: 'Add' },
  update: { ar: 'تعديل', en: 'Edit' },
  delete: { ar: 'حذف', en: 'Delete' },
}

// Editing a coupon means picking its store, and editing a store means picking its categories and logo.
const NEEDED_BY: Partial<Record<Slug, Slug[]>> = { stores: ['coupons'], categories: ['stores'], media: ['stores'] }

export const isAdminUser = (user: PermissionUser) => user?.role === 'admin'

export const hasPermission = (user: PermissionUser, slug: Slug, action: Action) => {
  if (isAdminUser(user)) return true
  const granted = user?.permissions?.[slug] as Partial<Record<Action, boolean | null>> | undefined
  return granted?.[action] === true
}

/** Any granted action implies viewing, as does editing a collection that links to this one. */
export const canView = (user: PermissionUser, slug: Slug) =>
  (['read', 'create', 'update', 'delete'] as const).some((action) => hasPermission(user, slug, action)) ||
  (NEEDED_BY[slug] ?? []).some((parent) => hasPermission(user, parent, 'create') || hasPermission(user, parent, 'update'))

export const can = (slug: Slug, action: Action): Access => ({ req }) => hasPermission(req.user, slug, action)

/** For public collections: the site stays readable, signed-in users only see what they were granted. */
export const publicOrCanView = (slug: Slug): Access => ({ req }) => !req.user || canView(req.user, slug)

export const isAdmin: Access = ({ req }) => isAdminUser(req.user)
export const isAdminField: FieldAccess = ({ req }) => isAdminUser(req.user)
export const isAdminOrSelf: Access = ({ req }) => {
  if (isAdminUser(req.user)) return true
  return req.user ? { id: { equals: req.user.id } } : false
}

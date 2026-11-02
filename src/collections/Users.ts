import { APIError, type CollectionConfig, type PayloadRequest } from 'payload'
import { ACTION_LABELS, PERMISSION_COLLECTIONS, isAdmin, isAdminField, isAdminOrSelf, isAdminUser } from '../lib/permissions'
import type { User } from '../payload-types'

const assertNotLastAdmin = async (req: PayloadRequest) => {
  const { totalDocs } = await req.payload.count({ collection: 'users', where: { role: { equals: 'admin' } }, req })
  if (totalDocs <= 1) {
    throw new APIError(req.i18n?.language === 'en' ? 'At least one admin is required' : 'لازم يفضل أدمن واحد على الأقل', 400, null, true)
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: { ar: 'مستخدم', en: 'User' }, plural: { ar: 'المستخدمين', en: 'Users' } },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'updatedAt'],
    // Staff still reach their own email and password through the account page.
    hidden: ({ user }) => !isAdminUser(user as unknown as User),
  },
  auth: true,
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    unlock: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (operation === 'create') {
          // The account made on the first visit to /admin owns the site.
          const { totalDocs } = await req.payload.count({ collection: 'users', req })
          if (totalDocs === 0) data.role = 'admin'
        } else if (originalDoc?.role === 'admin' && data.role === 'staff') {
          await assertNotLastAdmin(req)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const user = await req.payload.findByID({ collection: 'users', id, depth: 0, req })
        if (user.role === 'admin') await assertNotLastAdmin(req)
      },
    ],
  },
  fields: [
    // Email added by default
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      label: { ar: 'الدور', en: 'Role' },
      access: { read: isAdminField, create: isAdminField, update: isAdminField },
      options: [
        { label: { ar: 'أدمن (كل الصلاحيات)', en: 'Admin (full access)' }, value: 'admin' },
        { label: { ar: 'موظف (صلاحيات محددة)', en: 'Staff (selected permissions)' }, value: 'staff' },
      ],
    },
    {
      name: 'permissions',
      type: 'group',
      label: { ar: 'الصلاحيات', en: 'Permissions' },
      access: { read: isAdminField, create: isAdminField, update: isAdminField },
      admin: { condition: (_, siblingData) => siblingData?.role === 'staff' },
      fields: PERMISSION_COLLECTIONS.map(({ slug, label, actions }) => ({
        name: slug,
        type: 'group' as const,
        label,
        fields: [
          {
            type: 'row' as const,
            fields: actions.map((action) => ({ name: action, type: 'checkbox' as const, label: ACTION_LABELS[action] })),
          },
        ],
      })),
    },
  ],
}

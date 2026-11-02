import type { CollectionConfig } from 'payload'
import { can, canView } from '../lib/permissions'
import type { User } from '../payload-types'

export const Media: CollectionConfig = {
  slug: 'media',
  // Files are served through read access, so it stays open or logos break for signed-in staff on the site.
  admin: { hidden: ({ user }) => !canView(user as unknown as User, 'media') },
  access: {
    read: () => true,
    create: can('media', 'create'),
    update: can('media', 'update'),
    delete: can('media', 'delete'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}

import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ar } from '@payloadcms/translations/languages/ar'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { migrations } from './migrations'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Stores } from './collections/Stores'
import { Coupons } from './collections/Coupons'
import { Clicks } from './collections/Clicks'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: { titleSuffix: ' — لوحة التحكم' },
  },
  i18n: {
    supportedLanguages: { ar, en },
    fallbackLanguage: 'ar',
  },
  localization: {
    locales: [
      { code: 'ar', label: 'العربية', rtl: true },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'ar',
    fallback: true,
  },
  collections: [Stores, Coupons, Categories, Media, Clicks, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // DATABASE_URL=file:./local.db → SQLite file for running on a laptop with nothing installed.
  // Anything else → Postgres (production). Migrations in src/migrations are for Postgres.
  db: (process.env.DATABASE_URL || '').startsWith('file:')
    ? sqliteAdapter({ client: { url: process.env.DATABASE_URL || '' } })
    : postgresAdapter({
        pool: { connectionString: process.env.DATABASE_URL || '' },
        prodMigrations: migrations,
      }),
  sharp,
  plugins: [],
})

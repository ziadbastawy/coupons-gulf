import Link from 'next/link'
import type { Store } from '@/payload-types'
import { pathFor, type Country, type Lang } from '@/lib/site'
import { t } from '@/lib/i18n'
import { StoreLogo } from './StoreLogo'

export function StoreTile({ store, lang, country, best }: { store: Store; lang: Lang; country: Country; best?: string }) {
  const s = t(lang)
  return (
    <Link
      href={pathFor(lang, country, store.slug)}
      className="group flex items-center gap-3 rounded-xl border border-line bg-card p-3 hover:border-ink"
    >
      <StoreLogo store={store} size={44} />
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="truncate font-semibold">{store.name}</span>
          {store.featured && <span className="rounded bg-saffron-soft px-1.5 text-[11px] font-medium text-saffron-ink">{s.featured}</span>}
        </span>
        {best && <span className="block truncate text-sm text-ink-soft">{best}</span>}
      </span>
    </Link>
  )
}

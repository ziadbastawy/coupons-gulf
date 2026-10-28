import { pathFor, type Country, type Lang } from '@/lib/site'
import { t } from '@/lib/i18n'

/** Plain GET form so search works without JavaScript and is crawlable. */
export function SearchBox({ lang, country, defaultValue = '', size = 'md' }: { lang: Lang; country: Country; defaultValue?: string; size?: 'md' | 'lg' }) {
  const s = t(lang)
  const big = size === 'lg'
  return (
    <form action={pathFor(lang, country, 'search')} method="get" role="search" className="flex w-full items-stretch gap-2">
      <label className="sr-only" htmlFor={`q-${size}`}>
        {s.search}
      </label>
      <input
        id={`q-${size}`}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={s.searchPlaceholder}
        autoComplete="off"
        className={`min-w-0 flex-1 rounded-xl border border-line bg-card px-4 text-ink placeholder:text-ink-soft/70 focus:border-ink focus:outline-none ${big ? 'h-14 text-lg' : 'h-11'}`}
      />
      <button type="submit" className={`shrink-0 rounded-xl bg-ink px-5 font-medium text-paper hover:opacity-90 ${big ? 'h-14 text-lg' : 'h-11'}`}>
        {s.search}
      </button>
    </form>
  )
}

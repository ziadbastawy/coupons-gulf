import { revalidatePath } from 'next/cache'

/**
 * Refresh cached pages after content changes in the admin.
 * Pages also refresh on their own every few minutes (see `revalidate` in each page).
 */
export function revalidateSite() {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Running outside Next (seed script, CLI) — nothing to refresh.
  }
}

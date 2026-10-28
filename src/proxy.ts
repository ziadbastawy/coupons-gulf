import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COUNTRIES = ['sa', 'ae']

/**
 * URL scheme
 *   /sa/noon        Arabic (default, no prefix)
 *   /en/sa/noon     English
 * Internally every page lives under /[lang]/[country]/..., so Arabic URLs are rewritten to /ar/...
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const parts = pathname.split('/').filter(Boolean)

  // "/" and "/en" → pick a country from the visitor's location (Vercel/Cloudflare headers), default Saudi.
  if (parts.length === 0 || (parts.length === 1 && parts[0] === 'en')) {
    const geo = (req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry') || '').toLowerCase()
    const country = COUNTRIES.includes(geo) ? geo : 'sa'
    const url = req.nextUrl.clone()
    url.pathname = parts[0] === 'en' ? `/en/${country}` : `/${country}`
    return NextResponse.redirect(url, 307)
  }

  // /ar/... is never public — keep one canonical Arabic URL.
  if (parts[0] === 'ar') {
    const url = req.nextUrl.clone()
    url.pathname = '/' + parts.slice(1).join('/')
    return NextResponse.redirect(url, 308)
  }

  if (parts[0] === 'en') return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = `/ar${pathname}`
  url.search = search
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Everything except the admin, APIs, click redirects, Next internals and root files.
    '/((?!admin|api|go|_next|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\..*).*)',
  ],
}

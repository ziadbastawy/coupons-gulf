import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { SITE, isLang, absUrl } from '@/lib/site'
// Self-hosted Arabic + Latin font (no build-time call to Google Fonts).
import '@fontsource-variable/readex-pro'
import '../globals.css'

// Pages are built on the first visit and then cached (ISR), so the build never needs the database.
export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  const l = isLang(lang) ? lang : 'ar'
  return {
    metadataBase: new URL(SITE.url),
    title: { default: `${SITE.name[l]} | ${SITE.tagline[l]}`, template: `%s | ${SITE.name[l]}` },
    description: SITE.tagline[l],
    applicationName: SITE.name[l],
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f4f3' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1a24' },
  ],
}

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  if (!isLang(lang)) notFound()

  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name[lang],
    alternateName: SITE.name[lang === 'ar' ? 'en' : 'ar'],
    url: absUrl('/'),
    description: SITE.tagline[lang],
  }

  return (
    <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <body className="min-h-dvh antialiased">
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </body>
    </html>
  )
}

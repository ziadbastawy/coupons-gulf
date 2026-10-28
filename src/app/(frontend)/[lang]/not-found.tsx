import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60dvh] max-w-md place-items-center px-4 text-center">
      <div className="space-y-4">
        <p className="text-6xl font-bold text-saffron">404</p>
        <h1 className="text-xl font-bold">الصفحة دي مش موجودة</h1>
        <p className="text-ink-soft">This page does not exist.</p>
        <Link href="/sa" className="inline-block rounded-xl bg-ink px-5 py-2.5 font-medium text-paper">
          ارجع للرئيسية
        </Link>
      </div>
    </div>
  )
}

import Image from 'next/image'
import type { Media, Store } from '@/payload-types'

export function StoreLogo({ store, size = 56 }: { store: Store; size?: number }) {
  const logo = typeof store.logo === 'object' ? (store.logo as Media | null) : null
  if (logo?.url) {
    return (
      <span className="grid shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white" style={{ width: size, height: size }}>
        <Image src={logo.url} alt={logo.alt || store.name} width={size} height={size} className="object-contain p-1.5" />
      </span>
    )
  }
  // No logo yet: a tile in the brand colour with the first letter.
  const bg = store.brandColor || '#142334'
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-xl font-bold"
      style={{ width: size, height: size, background: bg, color: readableOn(bg), fontSize: size * 0.42 }}
    >
      {store.name.trim().charAt(0)}
    </span>
  )
}

function readableOn(hex: string) {
  const m = hex.replace('#', '')
  if (m.length !== 6) return '#fff'
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m.slice(i, i + 2), 16) / 255)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.6 ? '#142334' : '#ffffff'
}

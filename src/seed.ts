/**
 * Demo content so the site renders end to end.
 * Run:  npm run seed
 * All codes here are FAKE placeholders (DEMO…). Replace them with real codes from your networks before launch.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const CATEGORIES = [
  { slug: 'marketplaces', ar: 'متاجر شاملة', en: 'Marketplaces', order: 1 },
  { slug: 'fashion', ar: 'أزياء', en: 'Fashion', order: 2 },
  { slug: 'beauty', ar: 'جمال وعطور', en: 'Beauty & perfume', order: 3 },
  { slug: 'electronics', ar: 'إلكترونيات', en: 'Electronics', order: 4 },
  { slug: 'pharmacy', ar: 'صيدليات', en: 'Pharmacies', order: 5 },
  { slug: 'food', ar: 'توصيل أكل', en: 'Food delivery', order: 6 },
]

type SeedStore = {
  slug: string
  ar: string
  en: string
  aliases: string
  color: string
  countries: ('sa' | 'ae')[]
  cats: string[]
  website: string
  popularity: number
  featured?: boolean
}

const STORES: SeedStore[] = [
  { slug: 'noon', ar: 'نون', en: 'noon', aliases: 'نون, noon, نون فود', color: '#FEEE00', countries: ['sa', 'ae'], cats: ['marketplaces', 'electronics'], website: 'https://www.noon.com', popularity: 100, featured: true },
  { slug: 'amazon', ar: 'أمازون', en: 'Amazon', aliases: 'امازون, أمازون, amazon', color: '#232F3E', countries: ['sa', 'ae'], cats: ['marketplaces', 'electronics'], website: 'https://www.amazon.sa', popularity: 95 },
  { slug: 'shein', ar: 'شي إن', en: 'SHEIN', aliases: 'شي ان, شين, shein', color: '#000000', countries: ['sa', 'ae'], cats: ['fashion'], website: 'https://www.shein.com', popularity: 90 },
  { slug: 'namshi', ar: 'نمشي', en: 'Namshi', aliases: 'نمشي, namshi', color: '#1A1A1A', countries: ['sa', 'ae'], cats: ['fashion', 'beauty'], website: 'https://www.namshi.com', popularity: 80 },
  { slug: 'trendyol', ar: 'ترينديول', en: 'Trendyol', aliases: 'ترنديول, ترينديول, trendyol', color: '#F27A1A', countries: ['sa', 'ae'], cats: ['fashion'], website: 'https://www.trendyol.com', popularity: 85 },
  { slug: 'nahdi', ar: 'النهدي', en: 'Nahdi', aliases: 'النهدي, صيدلية النهدي, nahdi', color: '#00A651', countries: ['sa'], cats: ['pharmacy', 'beauty'], website: 'https://www.nahdionline.com', popularity: 70 },
  { slug: 'talabat', ar: 'طلبات', en: 'talabat', aliases: 'طلبات, talabat', color: '#FF5A00', countries: ['ae'], cats: ['food'], website: 'https://www.talabat.com', popularity: 75 },
]

const now = new Date()
const daysAgo = (d: number) => new Date(now.getTime() - d * 864e5).toISOString()

async function run() {
  const payload = await getPayload({ config })
  payload.logger.info('Seeding demo content…')

  // Fresh start for demo collections.
  for (const collection of ['clicks', 'coupons', 'stores', 'categories'] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true })
  }

  const catIds: Record<string, number> = {}
  for (const c of CATEGORIES) {
    const doc = await payload.create({ collection: 'categories', locale: 'ar', data: { slug: c.slug, name: c.ar, order: c.order } })
    await payload.update({ collection: 'categories', id: doc.id, locale: 'en', data: { name: c.en } })
    catIds[c.slug] = doc.id
  }

  for (const s of STORES) {
    const store = await payload.create({
      collection: 'stores',
      locale: 'ar',
      data: {
        slug: s.slug,
        name: s.ar,
        aliases: s.aliases,
        brandColor: s.color,
        countries: s.countries,
        categories: s.cats.map((c) => catIds[c]),
        website: s.website,
        popularity: s.popularity,
        featured: Boolean(s.featured),
        affiliateLinks: s.countries.map((country) => ({ country, url: s.website, network: 'direct' as const })),
        about: `${s.ar} من أشهر المتاجر أونلاين في الخليج. الصفحة دي فيها كل أكواد ${s.ar} الفعالة، ومكتوب جنب كل كود آخر مرة اتجرب فيها وشروطه.`,
        guide: [
          { heading: 'قبل ما تدفع', body: 'قارن قيمة الخصم بالحد الأقصى المكتوب في شروط الكود. لو السلة كبيرة، ممكن كود بخصم ثابت يبقى أوفر من نسبة.' },
          { heading: 'الشحن', body: 'شوف حد الشحن المجاني في السلة قبل ما تطبق الكود. أحياناً إضافة منتج صغير بتوفر رسوم التوصيل وتخلي الخصم أكبر.' },
          { heading: 'مواسم التخفيضات', body: 'أقوى العروض بتبقى في رمضان والعيد والجمعة البيضاء والأيام الوطنية. الأكواد في المواسم دي بتتغير بسرعة، فارجع للصفحة يوم الشراء.' },
        ],
        faqs: [{ question: `هل كود ${s.ar} بيشتغل على المنتجات المخفضة؟`, answer: 'حسب الكود. الشروط مكتوبة تحت كل كود، ولو فيها "يشمل المنتجات المخفضة" يبقى بيشتغل.' }],
      },
    })
    await payload.update({
      collection: 'stores',
      id: store.id,
      locale: 'en',
      data: {
        name: s.en,
        about: `${s.en} is one of the most popular online stores in the Gulf. This page lists every working ${s.en} code with the date it was last tested and its terms.`,
        guide: [
          { heading: 'Before you pay', body: 'Compare the discount against the maximum in the code terms. On a big basket, a fixed-amount code can beat a percentage.' },
          { heading: 'Shipping', body: 'Check the free-shipping threshold in your basket before applying the code. Adding a small item can remove the delivery fee.' },
          { heading: 'Sale seasons', body: 'The strongest deals land in Ramadan, Eid, White Friday and the national days. Codes change fast then, so check this page on the day you buy.' },
        ],
        faqs: [{ question: `Does the ${s.en} code work on sale items?`, answer: 'It depends on the code. Terms are listed under each one; if they say sale items are included, it works.' }],
      },
    })

    const upper = s.slug.slice(0, 4).toUpperCase()
    const coupons = [
      { code: `DEMO${upper}15`, ar: { title: `كود خصم ${s.ar} على كل الموقع`, label: '15%', cond: 'يشمل أغلب المنتجات. مش بيتجمع مع عروض البنوك.' }, en: { title: `${s.en} sitewide code`, label: '15%', cond: 'Most products included. Cannot be combined with bank offers.' }, audience: 'all', max: 100, verified: 0, sort: 1, exclusive: true, worked: 41, failed: 6 },
      { code: `DEMO${upper}NEW`, ar: { title: `خصم أول طلب في ${s.ar}`, label: '25%', cond: 'لأول طلب بس.' }, en: { title: `First order at ${s.en}`, label: '25%', cond: 'First order only.' }, audience: 'new', max: 150, min: 99, verified: 1, sort: 2, worked: 12, failed: 3 },
      { code: null, ar: { title: `عروض ${s.ar} اليومية`, label: 'حتى 70%', cond: 'تخفيضات من غير كود على أقسام مختارة.' }, en: { title: `${s.en} daily deals`, label: 'Up to 70%', cond: 'No-code discounts on selected categories.' }, audience: 'all', verified: 2, sort: 3, worked: 0, failed: 0 },
    ]

    for (const c of coupons) {
      const doc = await payload.create({
        collection: 'coupons',
        locale: 'ar',
        overrideAccess: true,
        data: {
          store: store.id,
          type: c.code ? 'code' : 'deal',
          code: c.code ?? undefined,
          status: 'active',
          title: c.ar.title,
          discountLabel: c.ar.label,
          conditions: c.ar.cond,
          countries: s.countries,
          audience: c.audience as 'all' | 'new',
          maxDiscount: c.max,
          minOrder: c.min,
          exclusive: Boolean(c.exclusive),
          verifiedAt: daysAgo(c.verified),
          sortOrder: c.sort,
          worked: c.worked,
          failed: c.failed,
        },
      })
      await payload.update({ collection: 'coupons', id: doc.id, locale: 'en', overrideAccess: true, data: { title: c.en.title, discountLabel: c.en.label, conditions: c.en.cond } })
    }
  }

  payload.logger.info(`Seeded ${CATEGORIES.length} categories and ${STORES.length} stores.`)
  process.exit(0)
}

try {
  await run()
} catch (e) {
  console.error(e)
  process.exit(1)
}

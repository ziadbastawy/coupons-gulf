# موقع كوبونات الخليج (السعودية والإمارات)

موقع أكواد خصم عربي أولاً بنسخة إنجليزي، مبني على **Next.js 16 + Payload CMS 3 + PostgreSQL**. لوحة التحكم جوه نفس المشروع على `/admin`، ونفس الـ API هيخدم تطبيق الموبايل بعدين.

> الاسم "خصمك / Khasmak" مؤقت. غيّره من `src/lib/site.ts`.
> كل الأكواد في بيانات التجربة (`DEMO…`) وهمية. امسحها وحط الأكواد الحقيقية من الشبكات قبل الإطلاق.

## الروابط

| الصفحة | عربي (الافتراضي) | إنجليزي |
| --- | --- | --- |
| الرئيسية | `/sa` ، `/ae` | `/en/sa` ، `/en/ae` |
| صفحة متجر | `/sa/noon` | `/en/sa/noon` |
| فئة | `/sa/category/fashion` | `/en/sa/category/fashion` |
| كل المتاجر | `/sa/stores` | `/en/sa/stores` |
| بحث | `/sa/search?q=نون` | `/en/sa/search?q=noon` |
| تحويل للمتجر | `/go/<coupon-id>?c=sa` | |
| لوحة التحكم | `/admin` | |

`/` بيحوّل الزائر لـ `/sa` افتراضياً. لو حطيت Cloudflare قدام السيرفر، بيحوّل زوار الإمارات لـ `/ae` تلقائياً.

## اللي جاهز في النسخة دي

- **صفحة المتجر:** أول سطر إجابة مباشرة (أقوى كود + آخر تجربة)، كروت أكواد على شكل تذكرة، جدول بكل الأكواد، دليل توفير، أسئلة شائعة، متاجر شبيهة.
- **رحلة الكود:** الكود ظاهر نص في الصفحة (عشان جوجل والـ AI يقروه). زرار "انسخ الكود" بينسخه ويفتح نافذة فيها زرار "روح للمتجر" وتصويت "اشتغل؟".
- **تتبع النقرات:** `/go/<id>` بيسجل كل نقرة في جدول `clicks` بـ `clickId`، ويضيفه للينك كـ `subid`، ويحوّل على لينك الأفلييت حسب الدولة.
- **SEO وGEO:** canonical و hreflang لـ ar-SA/en-SA/ar-AE/en-AE، وschema لـ FAQPage و BreadcrumbList و Organization، و`sitemap.xml`، و`robots.txt` فاتح لبوتات ChatGPT وClaude وPerplexity وBing، و`/llms.txt`.
- **الأداء:** الصفحات بتتكاش (ISR) وبتتحدث كل 10 دقايق، أو فوراً لما تعدّل حاجة في لوحة التحكم.
- **لوحة التحكم:** بالعربي، والمحتوى بلغتين (اختار اللغة من فوق في صفحة التعديل).

## تشغيل محلي (من غير أي قاعدة بيانات)

محتاج بس Node.js 22 أو أحدث.

```bash
git clone https://github.com/ziadbastawy/coupons-gulf
cd coupons-gulf
printf "DATABASE_URL=file:./local.db\nPAYLOAD_SECRET=localdevsecret123\nSITE_URL=http://localhost:3000\n" > .env
npm install
npm run seed      # بيانات تجربة
npm run dev       # افتح http://localhost:3000
```

`file:./local.db` بيشغّل الموقع على ملف SQLite محلي. في الإنتاج حط رابط Postgres بدل كده.
أول مرة تفتح `/admin` هيطلب منك تعمل حساب أدمن.

## النشر على سيرفر

الخطوات كاملة في **[DEPLOY.md](DEPLOY.md)**: سيرفر Ubuntu، و Docker، وأمر واحد بيشغّل الموقع و Postgres و HTTPS.
التحديث بعد كده: `git pull && docker compose up -d --build`.

لو غيرت الـ collections (ضفت حقل مثلاً): شغّل `npx payload migrate:create <name>` وانت متوصل بـ Postgres، وارفع ملف الـ migration مع الكود. السيرفر بيطبقه لوحده أول ما يقوم.

## إضافة محتوى

1. **الفئات:** اسم بالعربي والإنجليزي + slug إنجليزي.
2. **المتاجر:** الاسم، الـ slug (ده الرابط)، الدول، لينك الأفلييت لكل دولة، الشعار، الدليل والأسئلة.
3. **الكوبونات:** المتجر، الكود، العنوان، الخصم المختصر، الشروط، الدول، وحط **"آخر تجربة"** كل مرة تجرب الكود. الحالة لازم تبقى **فعال** عشان يظهر.

علّم المتجر **"مميز (مدفوع)"** لو المتجر دافع مكان في الرئيسية؛ بيظهر عليه كلمة "مميز".

## الهيكل

```
src/
  app/(frontend)/[lang]/[country]/   صفحات الموقع
  app/go/[id]/route.ts               تحويل وتسجيل النقرات
  app/sitemap.ts, robots.ts, llms.txt
  collections/                       Stores, Coupons, Categories, Clicks, Media, Users
  components/                        CouponTicket, CopyCode, StoreTile…
  lib/site.ts                        الاسم، الدول، اللغات
  lib/i18n.ts                        كل نصوص الواجهة
  proxy.ts                           قواعد الروابط (عربي بدون /ar)
  seed.ts                            بيانات تجربة
```

## الخطوات الجاية

- ربط APIs شبكات الأفلييت (Admitad وغيرها) لسحب العروض والعمولات تلقائياً.
- أجنت بيجرب الأكواد ويعلّم المنتهي.
- صفحات المواسم (رمضان، الجمعة البيضاء، الأيام الوطنية).
- بحث أسرع بـ Meilisearch لما عدد المتاجر يكبر.
- تطبيق Expo بيستخدم نفس الـ API (`/api/stores`, `/api/coupons`).

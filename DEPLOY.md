# رفع الموقع على سيرفر خاص (VPS)

الموقع وقاعدة البيانات وشهادة HTTPS كلهم شغالين على سيرفر واحد بـ Docker. بعد أول مرة، أي تحديث بيبقى أمر واحد.

**هتحتاج:** سيرفر Ubuntu 24.04 فيه 4GB رام على الأقل، ودومين.

---

## 1. اعمل السيرفر

من [Hetzner Cloud](https://console.hetzner.cloud) أو أي مزود تاني (DigitalOcean، Contabo، OVH):

- **النظام:** Ubuntu 24.04
- **المكان:** ألمانيا (Falkenstein أو Nuremberg) أقرب حاجة للخليج عند Hetzner
- **الحجم:** 2 vCPU و 4GB رام (أرخص خطة بالمواصفات دي كفاية)
- **SSH key:** ضيف المفتاح بتاع جهازك. على الماك بتلاقيه بالأمر `cat ~/.ssh/id_ed25519.pub`، ولو مش موجود اعمله بـ `ssh-keygen -t ed25519`

خد الـ IP بتاع السيرفر.

## 2. وجّه الدومين للسيرفر

من لوحة الدومين (GoDaddy أو Namecheap أو Cloudflare…) ضيف سجلين:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | IP السيرفر |
| A | `www` | IP السيرفر |

لو بتستخدم Cloudflare، خلي السحابة **رمادي (DNS only)** في الأول لحد ما الموقع يشتغل.

## 3. جهّز السيرفر

ادخل على السيرفر من Terminal الماك:

```bash
ssh root@IP_السيرفر
```

وبعدين الصق دول:

```bash
# Docker
curl -fsSL https://get.docker.com | sh

# جدار حماية: SSH و HTTP و HTTPS بس
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw --force enable

# ذاكرة احتياطية عشان البناء ميقعش على 4GB
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 4. نزّل الكود

الـ repo خاص، فـ GitHub هيطلب يوزر وتوكن:

1. على GitHub: **Settings ← Developer settings ← Personal access tokens ← Fine-grained tokens ← Generate new token**
2. **Repository access:** اختار `coupons-gulf` بس. **Permissions ← Contents:** Read-only.
3. انسخ التوكن.

```bash
git clone https://github.com/ziadbastawy/coupons-gulf ~/coupons-gulf
cd ~/coupons-gulf
git config credential.helper store   # عشان ميسألكش تاني في التحديثات
```

لما يطلب **Username** اكتب `ziadbastawy`، ولما يطلب **Password** الصق التوكن.

## 5. الإعدادات

غيّر `khasmak.com` للدومين بتاعك والصق:

```bash
cp .env.server.example .env
sed -i "s/^DOMAIN=.*/DOMAIN=khasmak.com/" .env
sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(openssl rand -hex 24)/" .env
sed -i "s/^PAYLOAD_SECRET=.*/PAYLOAD_SECRET=$(openssl rand -hex 32)/" .env
cat .env
```

احفظ نسخة من الملف ده في مكان آمن. لو ضاع `POSTGRES_PASSWORD` مش هتعرف توصل لقاعدة البيانات.

## 6. شغّل

```bash
docker compose up -d --build
```

أول مرة بتاخد 5 لـ 10 دقايق للبناء. تابع بـ:

```bash
docker compose logs -f app
```

لما تشوف `Ready` افتح:

- `https://الدومين/admin` واعمل حساب الأدمن الأول
- `https://الدومين` الموقع

قاعدة البيانات بتتجهز لوحدها أول ما السيرفر يقوم، وشهادة HTTPS بتطلع وتتجدد لوحدها. لو الشهادة اتأخرت، اتأكد إن الدومين بيشاور على الـ IP الصح (خطوة 2).

---

## التحديث (كل ما ترفع كود جديد على GitHub)

```bash
cd ~/coupons-gulf && git pull && docker compose up -d --build
```

الموقع بيفضل شغال لحد ما النسخة الجديدة تجهز.

## نسخ احتياطي يومي

```bash
crontab -e
```

وضيف السطر ده تحت (بياخد نسخة كل يوم 3 الفجر ويحتفظ بآخر 14 يوم في `~/coupons-gulf/backups`):

```
0 3 * * * cd ~/coupons-gulf && sh deploy/backup.sh >> backups/cron.log 2>&1
```

نزّل نسخة على جهازك من وقت للتاني:

```bash
scp root@IP_السيرفر:~/coupons-gulf/backups/db-*.sql.gz ~/Downloads/
```

ترجيع نسخة:

```bash
gunzip -c backups/db-2026-11-01.sql.gz | docker compose exec -T db psql -U coupons coupons
```

## أوامر مفيدة

| عايز | الأمر |
| --- | --- |
| تشوف الحالة | `docker compose ps` |
| تشوف أخطاء الموقع | `docker compose logs --tail 100 app` |
| تعيد تشغيل الموقع | `docker compose restart app` |
| توقف كل حاجة | `docker compose down` (البيانات مش بتتمسح) |
| تمسح صور Docker القديمة | `docker image prune -f` |

## الملفات

| الملف | دوره |
| --- | --- |
| `Dockerfile` | بيبني الموقع في صورة واحدة صغيرة |
| `docker-compose.yml` | الموقع + Postgres + Caddy |
| `deploy/Caddyfile` | HTTPS، تحويل www، كاش الملفات |
| `deploy/backup.sh` | النسخ الاحتياطي |
| `.env.server.example` | نموذج الإعدادات |

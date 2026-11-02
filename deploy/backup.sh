#!/bin/sh
# Daily database backup, keeps the last 14 days in ./backups.
# Add to cron on the server:  crontab -e  →  0 3 * * * cd ~/coupons-gulf && sh deploy/backup.sh
set -e
cd "$(dirname "$0")/.."
mkdir -p backups
docker compose exec -T db pg_dump -U coupons coupons | gzip > "backups/db-$(date +%F).sql.gz"
find backups -name 'db-*.sql.gz' -mtime +14 -delete
echo "Saved backups/db-$(date +%F).sql.gz"

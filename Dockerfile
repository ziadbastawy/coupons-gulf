# Production image for the coupons site (Next.js standalone + Payload).
# Built and started by docker-compose.yml; see DEPLOY.md.

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. Dependencies
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build (no database needed: pages are rendered on first visit)
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholders so config loading works during the build; real values come from .env at runtime.
RUN DATABASE_URL=postgres://build:build@127.0.0.1:5432/build PAYLOAD_SECRET=build-only npm run build

# 3. Runtime
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Uploaded logos live here; docker-compose mounts a volume on it.
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

USER nextjs
EXPOSE 3000
# Database migrations run automatically when the server starts.
CMD ["node", "server.js"]

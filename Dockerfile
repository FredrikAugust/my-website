FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy build-time env vars required by Payload CMS
ENV DATABASE_URI=postgres://postgres:postgres@localhost:5432/cms
ENV PAYLOAD_SECRET=build-time-secret-replace-at-runtime
ENV S3_BUCKET=upload
ENV S3_ACCESS_KEY_ID=build-dummy
ENV S3_SECRET_ACCESS_KEY=build-dummy
ENV S3_REGION=us-east-1
ENV S3_ENDPOINT=http://localhost:9000
ENV SERVER_URL=http://localhost:3000

RUN corepack enable pnpm && pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD HOSTNAME="0.0.0.0" node server.js

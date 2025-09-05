# Use the official Node.js runtime as a parent image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables (optional - defaults are in next.config.js)
# Set these as build arguments in Coolify for production values
ARG NEXT_PUBLIC_DOMAIN_NAME
ARG NEXT_PUBLIC_DOMAIN_PRICE
ARG NEXT_PUBLIC_CURRENCY
ARG NEXT_PUBLIC_PAYMENT_OPTIONS
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_COMPANY_NAME
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

# Runtime environment variables (server-side only)
# These are set as defaults but can be overridden by Coolify
ENV BREVO_API_KEY=""
ENV BREVO_SENDER_EMAIL=""
ENV BREVO_SENDER_NAME=""
ENV SMTP_HOST=""
ENV SMTP_PORT=""
ENV SMTP_USER=""
ENV SMTP_PASS=""
ENV TURNSTILE_SECRET_KEY=""

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create public directory for potential static assets
RUN mkdir -p ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# Add health check for Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]

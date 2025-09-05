# Base Node.js image
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat curl
COPY package.json package-lock.json* ./
RUN npm ci

# Build application
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Ensure public directory exists (Next.js expects it)
RUN mkdir -p public

# Build Next.js (uses NEXT_PUBLIC_* vars from environment during build automatically)
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

# Add health check for Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["sh", "-c", "PORT=${PORT:-3000} npm start"]

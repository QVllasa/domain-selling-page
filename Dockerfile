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

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_DOMAIN_NAME
ARG NEXT_PUBLIC_DOMAIN_PRICE
ARG NEXT_PUBLIC_CURRENCY
ARG NEXT_PUBLIC_PAYMENT_OPTIONS
ARG NEXT_PUBLIC_CONTACT_EMAIL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_COMPANY_NAME
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Set environment variables for build
ENV NEXT_PUBLIC_DOMAIN_NAME=$NEXT_PUBLIC_DOMAIN_NAME
ENV NEXT_PUBLIC_DOMAIN_PRICE=$NEXT_PUBLIC_DOMAIN_PRICE
ENV NEXT_PUBLIC_CURRENCY=$NEXT_PUBLIC_CURRENCY
ENV NEXT_PUBLIC_PAYMENT_OPTIONS=$NEXT_PUBLIC_PAYMENT_OPTIONS
ENV NEXT_PUBLIC_CONTACT_EMAIL=$NEXT_PUBLIC_CONTACT_EMAIL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_COMPANY_NAME=$NEXT_PUBLIC_COMPANY_NAME
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Ensure public directory exists (Next.js expects it)
RUN mkdir -p public

# Build Next.js with environment variables
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Accept runtime environment variables
ARG BREVO_API_KEY
ARG BREVO_SENDER_EMAIL
ARG BREVO_SENDER_NAME
ARG TURNSTILE_SECRET_KEY
ARG OWNER_NOTIFICATION_EMAIL

# Set runtime environment variables
ENV BREVO_API_KEY=$BREVO_API_KEY
ENV BREVO_SENDER_EMAIL=$BREVO_SENDER_EMAIL
ENV BREVO_SENDER_NAME=$BREVO_SENDER_NAME
ENV TURNSTILE_SECRET_KEY=$TURNSTILE_SECRET_KEY
ENV OWNER_NOTIFICATION_EMAIL=$OWNER_NOTIFICATION_EMAIL

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

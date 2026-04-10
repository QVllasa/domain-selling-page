const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for simpler Docker deployment
  
  // Environment variables with defaults for easier development
  env: {
    // Public variables (available on client-side)
    NEXT_PUBLIC_DOMAIN_NAME: process.env.NEXT_PUBLIC_DOMAIN_NAME || 'example.com',
    NEXT_PUBLIC_DOMAIN_PRICE: process.env.NEXT_PUBLIC_DOMAIN_PRICE || '1000',
    NEXT_PUBLIC_CURRENCY: process.env.NEXT_PUBLIC_CURRENCY || 'USD',
    NEXT_PUBLIC_PAYMENT_OPTIONS: process.env.NEXT_PUBLIC_PAYMENT_OPTIONS || 'Bank Transfer,PayPal',
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@example.com',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
    NEXT_PUBLIC_COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Your Company',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
  },
  
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://challenges.cloudflare.com",
              "frame-src https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

module.exports = withNextIntl(nextConfig);

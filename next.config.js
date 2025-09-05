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
}

module.exports = withNextIntl(nextConfig);

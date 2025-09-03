# 🏷️ Domain Selling Page

A modern, professional Next.js 15 application for selling premium domains with automated email confirmations, spam protection, and a beautiful responsive interface.

![Domain Selling Page](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC) ![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

## ✨ Features

- **🎨 Modern UI**: shadcn/ui components with Tailwind CSS
- **📱 Responsive Design**: Mobile, tablet, and desktop optimized  
- **🔒 Spam Protection**: Cloudflare Turnstile integration
- **📧 Dual Email System**: Owner notifications + buyer confirmations via Brevo
- **🌍 Internationalization**: German and English support
- **🐳 Docker Ready**: Production deployment with Coolify/Docker
- **💳 Payment Options**: Bank Transfer and PayPal with icons
- **🛡️ TypeScript**: Full type safety and Next.js 15 App Router

## 📋 Prerequisites

- Node.js 18.18+ (20+ recommended) | npm/yarn/pnpm
- Brevo account (email service) | Cloudflare account (Turnstile spam protection)
- Docker (optional, for deployment)

## 🚀 Quick Start

```bash
# 1. Clone and Install
git clone https://github.com/QVllasa/domain-selling-page.git
cd domain-selling-page
npm install

# 2. Configure Environment
cp .env.example .env.local
# Edit .env.local with your configuration (see Environment Variables section below)

# 3. Development
npm run dev
# Visit http://localhost:3000
```

## 🔧 Service Setup

### Brevo Email Service
1. Sign up at [brevo.com](https://brevo.com) → SMTP & API → Create API key
2. Verify your sender email address in Brevo console

### Cloudflare Turnstile
1. Sign up at [cloudflare.com](https://cloudflare.com) → Security → Turnstile
2. Add your domain → Get Site Key (public) and Secret Key (private)

> **Note**: Turnstile is automatically disabled for localhost development

## 🐳 Deployment

### Local Docker
```bash
docker build -t domain-selling-page .
docker run -p 3000:3000 --env-file .env.production domain-selling-page
```

### Docker Compose
```bash
docker-compose up -d
```

### Coolify (Recommended)
1. Connect your GitHub repository to Coolify
2. Add environment variables in Coolify interface (see table below)
3. Deploy automatically

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_DOMAIN_NAME` | Domain for sale | `example.com` |
| `NEXT_PUBLIC_DOMAIN_PRICE` | Price (number only) | `10000` |
| `NEXT_PUBLIC_CURRENCY` | Currency code | `EUR` |
| `NEXT_PUBLIC_PAYMENT_OPTIONS` | Payment methods | `Bank Transfer,PayPal` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Your contact email | `contact@example.com` |
| `NEXT_PUBLIC_SITE_URL` | Full site URL | `https://example.com` |
| `NEXT_PUBLIC_COMPANY_NAME` | Company/owner name | `Your Company` |
| `BREVO_API_KEY` | Brevo API key | `xkeysib-...` |
| `BREVO_SENDER_EMAIL` | Verified sender email | `noreply@example.com` |
| `BREVO_SENDER_NAME` | Sender display name | `Domain Sales` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile public key | `0x4AAA...` |
| `TURNSTILE_SECRET_KEY` | Turnstile private key | `0x4AAA...` |

## 🎨 Customization

- **Styling**: Modify `src/components/` and `tailwind.config.js`
- **Content**: Update `messages/de.json` and `messages/en.json`
- **Payment Options**: Change `NEXT_PUBLIC_PAYMENT_OPTIONS` environment variable
- **Languages**: Add new JSON files in `messages/` folder

## 🛠️ Development Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run type-check   # TypeScript validation
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/           # Contact & health check endpoints
│   └── [locale]/      # Internationalized pages
├── components/        # React components (DomainSaleClient, UI)
├── i18n/             # Internationalization config
└── lib/              # Utility functions
messages/             # Translation files (de.json, en.json)
```

## 🚨 Troubleshooting

**Email not working**: Verify Brevo API key and sender email verification  
**Turnstile errors**: Check site key/domain configuration in Cloudflare  
**Build issues**: Ensure Node.js 18.18+, clear node_modules, run `npm run type-check`  
**Docker problems**: Check environment variables and review logs with `docker logs`

## 🔍 API Endpoints

- `POST /api/contact` - Form submissions with Turnstile verification
- `GET /api/health` - Health check for monitoring

---

**Made with ❤️ using Next.js 15, TypeScript, and Tailwind CSS**

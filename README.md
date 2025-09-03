# Domain Selling Page

A modern, responsive Next.js 15 application for selling domains with a beautiful UI built using shadcn/ui and Tailwind CSS. The application allows visitors to learn about domain selling opportunities and contact the owner with offers.

## 🚀 Features

- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Optimized for mobile and desktop devices
- **Next.js 15**: Latest version with App Router
- **Email Integration**: Contact form with email service integration (SendGrid, Brevo, etc.)
- **Docker Ready**: Containerized for easy deployment anywhere
- **Environment Configurable**: Domain name, price, and payment options via environment variables
- **TypeScript**: Full type safety
- **MIT Licensed**: Open source and free to use

## 📋 Prerequisites

- Node.js 18 or later
- npm, yarn, or pnpm
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd domain-selling-page
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment variables** (see Configuration section below)

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t domain-selling-page .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Or run with Docker directly**
   ```bash
   docker run -p 3000:3000 --env-file .env.local domain-selling-page
   ```

## ⚙️ Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Domain Information
DOMAIN_NAME=example.com
DOMAIN_PRICE=5000
DOMAIN_CURRENCY=USD

# Payment Options (comma-separated)
PAYMENT_OPTIONS=Bank Transfer,PayPal,Cryptocurrency,Escrow Service

# Email Configuration (Choose one service)

# SendGrid
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Brevo (formerly Sendinblue)
# EMAIL_SERVICE=brevo
# BREVO_API_KEY=your_brevo_api_key_here
# BREVO_FROM_EMAIL=noreply@yourdomain.com

# Generic SMTP
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password
# SMTP_FROM=your_email@gmail.com

# Contact Information
CONTACT_EMAIL=contact@yourdomain.com

# Optional: Additional customization
DOMAIN_DESCRIPTION=A premium domain perfect for your business
COMPANY_NAME=Your Company Name
```

### Environment Variables Explained

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DOMAIN_NAME` | The domain name being sold | ✅ | `example.com` |
| `DOMAIN_PRICE` | Price of the domain | ✅ | `5000` |
| `DOMAIN_CURRENCY` | Currency for the price | ✅ | `USD` |
| `PAYMENT_OPTIONS` | Accepted payment methods | ✅ | `Bank Transfer,PayPal` |
| `EMAIL_SERVICE` | Email service provider | ✅ | `sendgrid` |
| `CONTACT_EMAIL` | Email to receive inquiries | ✅ | `contact@domain.com` |
| `DOMAIN_DESCRIPTION` | Description of the domain | ❌ | `Premium domain...` |
| `COMPANY_NAME` | Your company name | ❌ | `Domain Sales Inc` |

## 📧 Email Service Setup

### SendGrid Setup

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key with "Mail Send" permissions
3. Verify your sender email address
4. Add your API key to `.env.local`:
   ```env
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.your_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   ```

### Brevo (Sendinblue) Setup

1. Sign up at [Brevo](https://www.brevo.com/)
2. Go to SMTP & API settings
3. Create a new API key
4. Add your API key to `.env.local`:
   ```env
   EMAIL_SERVICE=brevo
   BREVO_API_KEY=your_api_key_here
   BREVO_FROM_EMAIL=noreply@yourdomain.com
   ```

### SMTP Setup (Gmail, Outlook, etc.)

1. Enable 2-factor authentication on your email account
2. Generate an app-specific password
3. Configure SMTP settings:
   ```env
   EMAIL_SERVICE=smtp
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=your_email@gmail.com
   ```

## 🚀 Deployment Options

### Vercel (Recommended)

1. Push your code to GitHub/GitLab
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker on any VPS

1. **Build and push to registry**
   ```bash
   docker build -t your-registry/domain-selling-page .
   docker push your-registry/domain-selling-page
   ```

2. **Deploy on your server**
   ```bash
   docker pull your-registry/domain-selling-page
   docker run -d -p 3000:3000 --env-file .env.local your-registry/domain-selling-page
   ```

### Railway

1. Connect your GitHub repository to [Railway](https://railway.app)
2. Add environment variables
3. Deploy with one click

### DigitalOcean App Platform

1. Create a new app from your GitHub repository
2. Configure environment variables
3. Deploy

## 🛠️ Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── contact/
│   │   │   └── route.ts          # Contact form API endpoint
│   │   └── health/
│   │       └── route.ts          # Health check endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main landing page
├── components/
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── textarea.tsx
└── lib/
    └── utils.ts                  # Utility functions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Email Services

To add support for a new email service:

1. Update the contact API route (`src/app/api/contact/route.ts`)
2. Add the new service configuration
3. Update environment variable documentation

## 🎨 Customization

### Styling

The application uses Tailwind CSS for styling. You can customize:

- Colors in `tailwind.config.js`
- Components in `src/components/ui/`
- Global styles in `src/app/globals.css`

### Content

Update the main page content in `src/app/page.tsx`:

- Hero section text
- Features list
- Call-to-action buttons
- Contact form fields

## 🐛 Troubleshooting

### Common Issues

1. **Email not sending**
   - Check your API keys are correct
   - Verify sender email is authenticated
   - Check spam folder

2. **Docker build fails**
   - Ensure Node.js version compatibility
   - Check all environment variables are set

3. **Styling issues**
   - Clear Next.js cache: `rm -rf .next`
   - Rebuild: `npm run build`

### Health Check

Visit `/api/health` to check if the application is running correctly.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you need help with this application:

1. Check the troubleshooting section
2. Review environment variable configuration
3. Open an issue on GitHub

## 🔄 Updates

To update to the latest Next.js version:

```bash
npm update next react react-dom
```

The application is configured to use `"next": "latest"` for automatic updates.

---

**Happy domain selling! 🚀**

import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {Bodoni_Moda, Geist, Geist_Mono} from 'next/font/google';
import {locales} from '@/i18n/config';
import '../globals.css';
import type { Metadata } from 'next';

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'seo'});
  const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || 'yourdomain.com';

  return {
    title: t('title', {domain: domainName}),
    description: t('description', {domain: domainName}),
    keywords: t('keywords', {domain: domainName}),
    authors: [{name: 'Domain Owner'}],
    creator: 'Domain Sales Platform',
    publisher: 'Domain Sales Platform',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: t('title', {domain: domainName}),
      description: t('description', {domain: domainName}),
      url: `https://${domainName}`,
      siteName: domainName,
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title', {domain: domainName}),
      description: t('description', {domain: domainName}),
    },
    alternates: {
      canonical: `https://${domainName}/${locale}`,
      languages: {
        'en': `https://${domainName}/en`,
        'de': `https://${domainName}/de`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${bodoni.variable} ${geist.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

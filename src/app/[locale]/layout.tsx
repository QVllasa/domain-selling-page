import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '@/i18n/config';
import '../globals.css';
import type { Metadata } from 'next';

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
  
  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

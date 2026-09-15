import {setRequestLocale} from 'next-intl/server';
import DomainSaleClient from '@/components/DomainSaleClient';

interface DomainSalePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function DomainSalePage({ params }: DomainSalePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DomainSaleClient locale={locale} />;
}

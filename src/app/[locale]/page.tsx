import DomainSaleClient from '@/components/DomainSaleClient';

interface DomainSalePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function DomainSalePage({ params }: DomainSalePageProps) {
  const { locale } = await params;

  return <DomainSaleClient locale={locale} />;
}

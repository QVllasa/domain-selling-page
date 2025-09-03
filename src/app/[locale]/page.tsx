'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CheckCircle, Mail, Phone, CreditCard, Building, Globe, Star, Github, ExternalLink } from 'lucide-react';

interface DomainSalePageProps {
  params: {
    locale: string;
  };
}

export default function DomainSalePage({ params: { locale } }: DomainSalePageProps) {
  const t = useTranslations();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    offer: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // These would normally come from environment variables on the server side
  // For display purposes, we'll use placeholder values
  const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || 'yourdomain.com';
  const askingPrice = process.env.NEXT_PUBLIC_ASKING_PRICE || '$10,000';
  const paymentOptions = process.env.NEXT_PUBLIC_PAYMENT_OPTIONS || 'PayPal, Bank Transfer, Crypto';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, locale }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('success.title')}</h2>
              <p className="text-gray-600">
                {t('success.message')}
              </p>
              <Button 
                onClick={() => setSubmitted(false)}
                className="mt-4"
                variant="outline"
              >
                {t('success.backButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-blue-600 mr-2" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{domainName}</h1>
                <p className="text-sm text-gray-600">{t('header.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector currentLocale={locale} />
              <div className="text-right">
                <p className="text-sm text-gray-600">{t('header.title')}</p>
                <p className="text-lg font-semibold text-blue-600">{t('hero.price')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Domain Info */}
          <div className="space-y-8">
            {/* Hero Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {t('hero.title')}
                </h2>
                <p className="text-xl mb-6 text-blue-100">
                  {domainName} {t('hero.subtitle')}
                </p>
                <div className="flex items-center text-2xl font-bold">
                  <span className="mr-2">💰</span>
                  <span>{askingPrice}</span>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-500" />
                  {t('features.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {Object.entries(t.raw('features.items')).map(([key, value]) => (
                    <li key={key} className="flex items-center">
                      <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                      <span>{value as string}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Payment Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                  {t('payment.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t('payment.subtitle')}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {paymentOptions.split(',').map((option, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {option.trim()}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-green-600 font-medium">{t('payment.secure')}</p>
              </CardContent>
            </Card>

            {/* Repository Info */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Github className="h-6 w-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800 mb-2">
                      {t('footer.openSource')} GitHub
                    </h3>
                    <p className="text-sm text-green-700 mb-3">
                      {t('footer.builtWith')} Next.js 15, shadcn/ui, Tailwind CSS & next-intl
                    </p>
                    <a
                      href="https://github.com/QVllasa/domain-selling-page"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      View on GitHub
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      {t('footer.noBroker')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-blue-600" />
                  {t('contact.title')}
                </CardTitle>
                <CardDescription>
                  {t('contact.subtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('contact.form.name')} *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('contact.form.namePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('contact.form.email')} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('contact.form.emailPlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('contact.form.phonePlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="offer">{t('contact.form.offer')} *</Label>
                    <Input
                      id="offer"
                      name="offer"
                      type="text"
                      required
                      value={formData.offer}
                      onChange={handleChange}
                      placeholder={t('contact.form.offerPlaceholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">{t('contact.form.message')}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('contact.form.messagePlaceholder')}
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Building className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {t('footer.serious')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              © 2025 {domainName}. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

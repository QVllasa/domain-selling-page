'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LanguageSelector } from '@/components/LanguageSelector';
import { CheckCircle, Mail, Phone, CreditCard, Building, Globe, Star, Github, ExternalLink, DollarSign } from 'lucide-react';

interface DomainSaleClientProps {
  locale: string;
}

export default function DomainSaleClient({ locale }: DomainSaleClientProps) {
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  // Check if running on localhost after component mounts
  useEffect(() => {
    setIsLocalhost(window.location.hostname.includes('localhost'));
  }, []);

  // These would normally come from environment variables on the server side
  // For display purposes, we'll use placeholder values
  const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || 'yourdomain.com';
  const domainPrice = process.env.NEXT_PUBLIC_DOMAIN_PRICE || '10000';
  const currency = process.env.NEXT_PUBLIC_CURRENCY || 'EUR';
  const paymentOptions = process.env.NEXT_PUBLIC_PAYMENT_OPTIONS || 'Bank Transfer,PayPal';
  
  const formatPrice = (price: string, currency: string, locale: string) => {
    const numPrice = parseInt(price);
    // Use locale-specific formatting consistently
    const formatter = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return currency === 'EUR' ? `€${formatter.format(numPrice)}` : `$${formatter.format(numPrice)}`;
  };
  
  const askingPrice = formatPrice(domainPrice, currency, locale);

  // Payment icons mapping
  const getPaymentIcon = (option: string) => {
    const normalizedOption = option.trim().toLowerCase();
    if (normalizedOption.includes('bank') || normalizedOption.includes('transfer')) {
      return <Building className="h-4 w-4" />;
    }
    if (normalizedOption.includes('paypal')) {
      return <CreditCard className="h-4 w-4" />;
    }
    return <DollarSign className="h-4 w-4" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only require Turnstile token if not on localhost and Turnstile is configured and loaded successfully
    if (!isLocalhost && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && turnstileLoaded && !turnstileToken) {
      alert('Please complete the spam protection challenge.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formData, 
          locale,
          turnstileToken: turnstileToken || (isLocalhost ? 'localhost-bypass' : 'bypassed')
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to send message. Please try again.');
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
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    offer: '',
                    message: ''
                  });
                  setTurnstileToken(null);
                  setTurnstileLoaded(false);
                }}
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
            <div className="flex items-center">
              <LanguageSelector currentLocale={locale} />
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
                <div className="flex flex-wrap gap-3 mb-4">
                  {paymentOptions.split(',').map((option, index) => (
                    <div 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {getPaymentIcon(option)}
                      <span>{option.trim()}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-green-600 font-medium">{t('payment.secure')}</p>
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

                  {/* Turnstile spam protection */}
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !isLocalhost && (
                    <div className="flex justify-center">
                      <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                        onSuccess={(token) => {
                          setTurnstileToken(token);
                          setTurnstileLoaded(true);
                        }}
                        onError={() => {
                          setTurnstileToken(null);
                          setTurnstileLoaded(true); // Allow form submission even if Turnstile fails
                        }}
                        onExpire={() => {
                          setTurnstileToken(null);
                        }}
                        onLoad={() => setTurnstileLoaded(true)}
                        options={{
                          theme: 'light',
                          size: 'normal',
                        }}
                      />
                    </div>
                  )}

                  {/* Development message for localhost */}
                  {isLocalhost && (
                    <div className="flex justify-center">
                      <p className="text-xs text-gray-500 bg-yellow-50 px-3 py-1 rounded">
                        Development mode - Spam protection disabled
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || (!isLocalhost && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileLoaded && !turnstileToken)}
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
                  <p className="text-sm text-gray-600 mb-2">
                    {t('footer.serious')}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    {t('footer.noBroker')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Full-width GitHub Section */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <a
              href="https://github.com/QVllasa/domain-selling-page"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Github className="h-3 w-3 mr-1" />
              View on GitHub
              <ExternalLink className="ml-1 h-2 w-2" />
            </a>
          </div>
        </div>
      </section>

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

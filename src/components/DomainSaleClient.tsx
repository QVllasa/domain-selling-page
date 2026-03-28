'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Turnstile } from '@marsidev/react-turnstile';
import { LanguageSelector } from '@/components/LanguageSelector';

interface DomainSaleClientProps {
  locale: string;
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView] as const;
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setIsLocalhost(window.location.hostname.includes('localhost'));

    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || 'yourdomain.com';
  const domainPrice = process.env.NEXT_PUBLIC_DOMAIN_PRICE || '10000';
  const currency = process.env.NEXT_PUBLIC_CURRENCY || 'EUR';
  const paymentOptions = process.env.NEXT_PUBLIC_PAYMENT_OPTIONS || 'Bank Transfer,PayPal';

  const formatPrice = (price: string, curr: string, loc: string) => {
    const numPrice = parseInt(price);
    const formatter = new Intl.NumberFormat(loc === 'de' ? 'de-DE' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return curr === 'EUR' ? `\u20AC${formatter.format(numPrice)}` : `$${formatter.format(numPrice)}`;
  };

  const askingPrice = formatPrice(domainPrice, currency, locale);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLocalhost && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && turnstileLoaded && !turnstileToken) {
      alert(locale === 'de' ? 'Bitte den Spam-Schutz abschliessen.' : 'Please complete the spam protection challenge.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [featuresRef, featuresInView] = useInView();
  const [formRef, formInView] = useInView(0.05);

  // --- Success State ---
  if (submitted) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center p-6 noise-bg">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 text-center max-w-md animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-8 rounded-full border border-gold/30 flex items-center justify-center animate-scale-in">
            <svg className="w-9 h-9 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-draw-check" />
            </svg>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream mb-4 tracking-tight">
            {t('success.title')}
          </h2>
          <p className="text-stone-400 text-base md:text-lg mb-10 font-light leading-relaxed">
            {t('success.message')}
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', phone: '', offer: '', message: '' });
              setTurnstileToken(null);
              setTurnstileLoaded(false);
            }}
            className="px-8 py-3.5 border border-gold/25 text-gold hover:bg-gold/10 transition-all duration-300 text-xs tracking-[0.25em] uppercase font-body font-medium"
          >
            {t('success.backButton')}
          </button>
        </div>
      </div>
    );
  }

  // --- Main Page ---
  return (
    <div className="min-h-screen bg-noir text-cream noise-bg">
      {/* Fixed Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-noir/80 backdrop-blur-2xl border-b border-white/[0.04]' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
          <span className="font-display text-lg tracking-tight text-cream/70 font-light">{domainName}</span>
          <LanguageSelector currentLocale={locale} />
        </div>
      </nav>

      {/* ========= HERO SECTION ========= */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gold/[0.06] rounded-full blur-[140px] animate-pulse-slow" />
          <div className="absolute top-[60%] left-1/4 w-[300px] h-[300px] bg-gold/[0.03] rounded-full blur-[100px]" />
          {/* Bottom edge line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
        </div>

        <div className="relative z-10 text-center animate-stagger">
          {/* Eyebrow */}
          <p className="text-[10px] sm:text-xs tracking-[0.45em] uppercase text-gold/60 mb-8 sm:mb-10 font-body font-medium stagger-1">
            {t('header.subtitle')}
          </p>

          {/* Domain Name — the star of the show */}
          <h1 className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-light tracking-tight leading-[0.85] mb-6 sm:mb-8 stagger-2">
            <span className="bg-gradient-to-b from-cream via-cream/90 to-cream/50 bg-clip-text text-transparent">
              {domainName}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-stone-500 text-base sm:text-lg md:text-xl font-light mb-14 stagger-3">
            {t('hero.subtitle')}
          </p>

          {/* Price Badge */}
          <div className="inline-flex items-center gap-5 px-8 sm:px-10 py-4 sm:py-5 border border-gold/15 bg-gold/[0.04] stagger-4">
            <span className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-stone-500 font-body">{t('hero.price')}</span>
            <span className="w-px h-6 sm:h-7 bg-gold/15" />
            <span className="font-display text-2xl sm:text-3xl md:text-4xl font-light text-gold tracking-tight">{askingPrice}</span>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 stagger-5 flex flex-col items-center gap-3">
          <span className="text-[9px] tracking-[0.3em] uppercase text-stone-600 font-body">Scroll</span>
          <div className="w-px h-10 sm:h-14 bg-gradient-to-b from-gold/30 to-transparent animate-scroll-line" />
        </div>
      </section>

      {/* ========= FEATURES SECTION ========= */}
      <section
        ref={featuresRef}
        className={`py-24 sm:py-32 lg:py-40 px-6 transition-all duration-1000 ease-out ${
          featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <span className="text-[10px] sm:text-xs tracking-[0.45em] uppercase text-gold/50 font-body font-medium">
              {t('features.title')}
            </span>
            <div className="mt-5 w-10 h-px bg-gold/25 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-0">
            {Object.entries(t.raw('features.items')).map(([key, value], i) => (
              <div
                key={key}
                className="flex items-center gap-5 py-5 border-b border-white/[0.04] group transition-all duration-500"
                style={{
                  transitionDelay: featuresInView ? `${i * 80}ms` : '0ms',
                  opacity: featuresInView ? 1 : 0,
                  transform: featuresInView ? 'translateX(0)' : 'translateX(-12px)',
                }}
              >
                <span className="text-gold/40 text-xs font-body select-none">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-stone-400 font-light text-[15px] group-hover:text-cream transition-colors duration-300">
                  {value as string}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= FORM SECTION ========= */}
      <section
        ref={formRef}
        className={`py-24 sm:py-32 lg:py-40 px-6 transition-all duration-1000 ease-out ${
          formInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-2xl mx-auto">
          {/* Payment Methods */}
          <div className="text-center mb-16 sm:mb-20">
            <span className="text-[10px] sm:text-xs tracking-[0.45em] uppercase text-gold/50 font-body font-medium">
              {t('payment.title')}
            </span>
            <div className="mt-5 w-10 h-px bg-gold/25 mx-auto mb-8" />
            <div className="flex justify-center gap-3 flex-wrap">
              {paymentOptions.split(',').map((option, index) => (
                <span
                  key={index}
                  className="px-5 py-2.5 border border-white/[0.06] text-stone-400 text-xs sm:text-sm font-light tracking-wider"
                >
                  {option.trim()}
                </span>
              ))}
            </div>
            <p className="text-stone-600 text-xs mt-5 tracking-wide">{t('payment.secure')}</p>
          </div>

          {/* Contact Form Card */}
          <div className="border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm">
            {/* Form Header */}
            <div className="text-center px-8 pt-10 sm:pt-14 pb-8 sm:pb-10 border-b border-white/[0.04]">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-3">
                {t('contact.title')}
              </h2>
              <p className="text-stone-500 text-sm font-light max-w-sm mx-auto leading-relaxed">
                {t('contact.subtitle')}
              </p>
            </div>

            {/* Form Body */}
            <div className="p-8 sm:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <InputField
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    label={`${t('contact.form.name')} *`}
                    placeholder={t('contact.form.namePlaceholder')}
                  />
                  <InputField
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    label={`${t('contact.form.email')} *`}
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </div>

                <InputField
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  label={t('contact.form.phone')}
                  placeholder={t('contact.form.phonePlaceholder')}
                />

                <InputField
                  id="offer"
                  name="offer"
                  type="text"
                  required
                  value={formData.offer}
                  onChange={handleChange}
                  label={`${t('contact.form.offer')} *`}
                  placeholder={t('contact.form.offerPlaceholder')}
                />

                <div>
                  <label htmlFor="message" className="block text-[10px] sm:text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 font-body">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contact.form.messagePlaceholder')}
                    rows={4}
                    className="w-full bg-transparent border-b border-white/[0.08] focus:border-gold/40 px-0 py-3 text-cream placeholder:text-stone-700 outline-none transition-colors duration-300 text-[15px] font-light resize-none"
                  />
                </div>

                {/* Turnstile */}
                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !isLocalhost && (
                  <div className="flex justify-center pt-2">
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                      onSuccess={(token) => { setTurnstileToken(token); setTurnstileLoaded(true); }}
                      onError={() => { setTurnstileToken(null); setTurnstileLoaded(true); }}
                      onExpire={() => { setTurnstileToken(null); }}
                      onLoad={() => setTurnstileLoaded(true)}
                      options={{ theme: 'dark', size: 'normal' }}
                    />
                  </div>
                )}

                {isLocalhost && (
                  <div className="flex justify-center">
                    <p className="text-[10px] text-stone-600 bg-white/[0.03] px-4 py-1.5 tracking-wider">
                      DEV MODE &mdash; Spam protection disabled
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || (!isLocalhost && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileLoaded && !turnstileToken)}
                  className="group w-full relative py-4.5 sm:py-5 bg-gold text-noir font-medium text-xs sm:text-sm tracking-[0.25em] uppercase overflow-hidden transition-all duration-300 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-gold-light active:scale-[0.995]"
                >
                  <span className="relative z-10">
                    {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-10 sm:mt-12 space-y-2">
            <p className="text-stone-600 text-xs tracking-wider font-light">{t('footer.serious')}</p>
            <p className="text-gold/30 text-[11px] tracking-wider">{t('footer.noBroker')}</p>
          </div>
        </div>
      </section>

      {/* ========= FOOTER ========= */}
      <footer className="border-t border-white/[0.04] py-8 sm:py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone-700 text-[11px] tracking-wider">
            &copy; {new Date().getFullYear()} {domainName}. {t('footer.copyright')}
          </p>
          <a
            href="https://github.com/QVllasa/domain-selling-page"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-700 hover:text-stone-400 transition-colors duration-300 text-[11px] tracking-wider flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Open Source
          </a>
        </div>
      </footer>
    </div>
  );
}

/* Reusable input field component */
function InputField({
  id, name, type, required, value, onChange, label, placeholder
}: {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] sm:text-xs tracking-[0.2em] uppercase text-stone-500 mb-3 font-body">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-white/[0.08] focus:border-gold/40 px-0 py-3 text-cream placeholder:text-stone-700 outline-none transition-colors duration-300 text-[15px] font-light"
      />
    </div>
  );
}

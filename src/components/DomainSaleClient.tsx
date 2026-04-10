'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Turnstile } from '@marsidev/react-turnstile';
import { LanguageSelector } from '@/components/LanguageSelector';

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

  useEffect(() => {
    setIsLocalhost(window.location.hostname.includes('localhost'));
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

  // Domain-derived metadata
  const tld = '.' + domainName.split('.').slice(1).join('.');
  const domainBase = domainName.split('.')[0];
  const charCount = domainBase.length;

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

  /* ─── Success State ─── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center p-6 noise-bg relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.06] blur-[140px]" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-10 border border-gold/30 flex items-center justify-center animate-scale-in">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-draw-check" />
            </svg>
          </div>
          <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-normal text-cream mb-5 tracking-[-0.02em] italic animate-fade-up">
            {t('success.title')}
          </h2>
          <p className="text-stone-400 text-base mb-12 font-light leading-relaxed animate-fade-up" style={{ animationDelay: '0.15s' }}>
            {t('success.message')}
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', phone: '', offer: '', message: '' });
              setTurnstileToken(null);
              setTurnstileLoaded(false);
            }}
            className="font-mono px-8 py-4 border border-gold/30 text-gold hover:bg-gold hover:text-noir transition-all duration-500 text-[10px] tracking-[0.3em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            ← {t('success.backButton')}
          </button>
        </div>
      </div>
    );
  }

  /* ─── Main Page ─── */
  return (
    <div className="min-h-screen bg-noir text-cream noise-bg relative overflow-hidden">

      {/* Ambient glow — single, subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[15%] w-[700px] h-[700px] rounded-full bg-gold/[0.04] blur-[160px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] rounded-full bg-gold/[0.025] blur-[140px]" />
      </div>

      {/* ═══════════ TOP BAR ═══════════ */}
      <header className="relative z-20 px-6 lg:px-12 py-6 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-4">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-gold/70">
            {locale === 'de' ? 'Zu Verkaufen' : 'For Sale'}
          </span>
          <span className="hidden md:inline-block w-8 h-px bg-white/[0.08]" />
          <span className="hidden md:inline-block font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500">
            {locale === 'de' ? 'Premium Domain' : 'Premium Domain'}
          </span>
        </div>
        <LanguageSelector currentLocale={locale} />
      </header>

      {/* ═══════════ MAIN SPLIT LAYOUT ═══════════ */}
      <main className="relative z-10 grid lg:grid-cols-2 min-h-[calc(100vh-65px)]">

        {/* ─── LEFT: Domain Hero ─── */}
        <div className="relative px-6 sm:px-10 lg:px-16 xl:px-24 py-12 lg:py-16 flex flex-col justify-center">

          <div className="max-w-xl">
            {/* Eyebrow */}
            <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-gold/60 mb-8 animate-fade-up">
              {locale === 'de' ? 'Premium Domain · Direktverkauf' : 'Premium Domain · Direct Sale'}
            </p>

            {/* Domain Name */}
            <h1 className="font-display font-normal text-[clamp(3.5rem,9vw,8rem)] leading-[0.9] tracking-[-0.04em] text-cream mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {domainBase}<span className="italic text-gold">{tld}</span>
            </h1>

            {/* Subtitle */}
            <p className="font-display italic text-[clamp(1.1rem,1.6vw,1.4rem)] text-stone-400 leading-relaxed mb-10 max-w-md animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {locale === 'de'
                ? `Eine seltene ${charCount}-Buchstaben ${tld} Domain. Kurz, einprägsam, einzigartig.`
                : `A rare ${charCount}-letter ${tld} domain. Short, memorable, unforgettable.`}
            </p>

            {/* Price block */}
            <div className="flex items-baseline gap-6 mb-12 pb-12 border-b border-white/[0.06] animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-2">
                  {locale === 'de' ? 'Festpreis' : 'Asking Price'}
                </p>
                <p className="font-display text-[clamp(2.5rem,5vw,4rem)] font-normal text-gold leading-none tracking-[-0.02em]">
                  {askingPrice}
                </p>
              </div>
              <div className="hidden sm:block">
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-stone-500 mb-2">
                  {locale === 'de' ? 'Oder Gebot' : 'Or Make Offer'}
                </p>
                <p className="font-display italic text-stone-500 text-base">→</p>
              </div>
            </div>

            {/* Value props */}
            <ul className="space-y-3 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              {[
                { de: 'Sofortige Übertragung', en: 'Instant transfer after payment' },
                { de: 'Direktverkauf · Keine Maklergebühren', en: 'Direct sale · No broker fees' },
                { de: paymentOptions.split(',').map(p => p.trim()).join(' · '), en: paymentOptions.split(',').map(p => p.trim()).join(' · ') },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-[13px] text-stone-400 font-light">
                  <span className="w-6 h-px bg-gold/40 shrink-0" />
                  {locale === 'de' ? item.de : item.en}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ─── RIGHT: Contact Form ─── */}
        <div className="relative bg-white/[0.012] backdrop-blur-sm lg:border-l border-t lg:border-t-0 border-white/[0.06] px-6 sm:px-10 lg:px-14 xl:px-20 py-12 lg:py-16 flex flex-col justify-center">

          <div className="max-w-md w-full mx-auto lg:mx-0">
            {/* Form header */}
            <div className="mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-gold/60 mb-3">
                {locale === 'de' ? 'Kontakt aufnehmen' : 'Get in Touch'}
              </p>
              <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-normal text-cream tracking-[-0.02em] mb-3">
                {t('contact.title')}
              </h2>
              <p className="text-stone-500 text-sm font-light leading-relaxed">
                {locale === 'de'
                  ? 'Senden Sie Ihr Angebot — Antwort innerhalb von 24 Stunden.'
                  : 'Submit your offer — response within 24 hours.'}
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-7 animate-fade-up"
              style={{ animationDelay: '0.35s' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                <FormField
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  label={t('contact.form.name')}
                  placeholder={t('contact.form.namePlaceholder')}
                />
                <FormField
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  label={t('contact.form.email')}
                  placeholder={t('contact.form.emailPlaceholder')}
                />
              </div>

              <FormField
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                label={t('contact.form.phone')}
                placeholder={t('contact.form.phonePlaceholder')}
              />

              <FormField
                id="offer"
                name="offer"
                type="text"
                required
                value={formData.offer}
                onChange={handleChange}
                label={t('contact.form.offer')}
                placeholder={t('contact.form.offerPlaceholder')}
                highlight
              />

              <div className="bid-field group">
                <label htmlFor="message" className="block font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500 group-focus-within:text-gold transition-colors duration-500 mb-3">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('contact.form.messagePlaceholder')}
                  rows={3}
                  className="w-full bg-transparent border-b border-white/[0.08] hover:border-white/[0.15] focus:border-transparent px-0 py-3 text-cream placeholder:text-stone-700 outline-none transition-all duration-500 text-[15px] font-light resize-none"
                />
              </div>

              {/* Turnstile */}
              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !isLocalhost && (
                <div className="flex justify-start pt-2">
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
                <p className="font-mono text-[9px] text-stone-700 tracking-[0.2em] uppercase">
                  DEV MODE — Spam protection disabled
                </p>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || (!isLocalhost && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileLoaded && !turnstileToken)}
                className="group w-full relative py-5 mt-4 bg-gold text-noir font-mono text-[11px] tracking-[0.35em] uppercase overflow-hidden disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/60 transition-all duration-500 hover:tracking-[0.45em] hover:bg-gold-light"
              >
                <span className="relative z-10 inline-flex items-center gap-3">
                  {isSubmitting && (
                    <span className="inline-block w-3 h-3 border-[1.5px] border-noir/30 border-t-noir rounded-full animate-spin" />
                  )}
                  {isSubmitting ? t('contact.form.submitting') : t('contact.form.submit')}
                  <span className="ml-1 transition-transform duration-500 group-hover:translate-x-1">→</span>
                </span>
              </button>

              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-stone-700 text-center pt-2">
                {locale === 'de'
                  ? 'Diskret · Sicher · Direkt'
                  : 'Discreet · Secure · Direct'}
              </p>
            </form>
          </div>
        </div>
      </main>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="relative z-10 px-6 lg:px-12 py-5 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-stone-700">
          © {new Date().getFullYear()} ⋅ {domainName}
        </p>
        <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-stone-700">
          {t('footer.serious')}
        </p>
        <a
          href="https://github.com/QVllasa/domain-selling-page"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[9px] tracking-[0.25em] uppercase text-stone-700 hover:text-gold transition-colors duration-500 inline-flex items-center gap-2"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Source
        </a>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Form Field — clean luxury input
   ═══════════════════════════════════════════════ */

function FormField({
  id, name, type, required, value, onChange, label, placeholder, highlight = false
}: {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
  highlight?: boolean;
}) {
  return (
    <div className="bid-field group">
      <label htmlFor={id} className="block font-mono text-[10px] tracking-[0.25em] uppercase text-stone-500 group-focus-within:text-gold transition-colors duration-500 mb-3">
        {label} {required && <span className="text-gold/60">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-transparent border-b border-white/[0.08] hover:border-white/[0.15] focus:border-transparent px-0 py-3 text-cream placeholder:text-stone-700 outline-none transition-all duration-500 ${highlight ? 'font-display text-2xl' : 'text-[15px] font-light'}`}
      />
    </div>
  );
}

'use client';

import {usePathname, useRouter} from '@/i18n/routing';
import {type Locale} from '@/i18n/config';

interface LanguageSelectorProps {
  currentLocale: string;
}

export function LanguageSelector({currentLocale}: LanguageSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const otherLocale: Locale = currentLocale === 'en' ? 'de' : 'en';

  return (
    <button
      onClick={() => router.replace(pathname, {locale: otherLocale})}
      className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-stone-500 hover:text-cream transition-colors duration-300 px-3 sm:px-4 py-2 border border-white/[0.06] hover:border-white/[0.12] font-body"
      aria-label={`Switch to ${otherLocale === 'de' ? 'Deutsch' : 'English'}`}
    >
      {otherLocale === 'de' ? 'DE' : 'EN'}
    </button>
  );
}

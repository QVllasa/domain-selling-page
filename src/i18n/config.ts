export const locales = ['en', 'de'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch'
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  de: '🇩🇪'
};

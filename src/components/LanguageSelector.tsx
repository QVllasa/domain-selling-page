'use client';

import {useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/routing';
import {locales, localeLabels, localeFlags, type Locale} from '@/i18n/config';
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {Globe} from 'lucide-react';

interface LanguageSelectorProps {
  currentLocale: string;
}

export function LanguageSelector({currentLocale}: LanguageSelectorProps) {
  const t = useTranslations('navigation');
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (locale: Locale) => {
    router.replace(pathname, {locale});
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{localeFlags[currentLocale as Locale]}</span>
          <span className="hidden md:inline">{localeLabels[currentLocale as Locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={currentLocale === locale ? 'bg-accent' : ''}
          >
            <span className="mr-2">{localeFlags[locale]}</span>
            {localeLabels[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import {redirect} from 'next/navigation';
import {defaultLocale} from '@/i18n/config';

// This page only renders when the user is at `/`, in which case we
// redirect to the default locale.
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}

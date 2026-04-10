import { NextResponse } from 'next/server';
import { buildConfirmationEmail, buildOwnerNotificationEmail } from '@/lib/email-templates';

/**
 * Dev-only preview endpoint for email templates.
 * Visit:
 *   /api/preview-emails?type=confirmation
 *   /api/preview-emails?type=owner
 *   Add &locale=de for German
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not available in production', { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'confirmation';
  const locale = searchParams.get('locale') || 'en';

  const sample = {
    name: 'Alexander Müller',
    email: 'alex@founderlabs.io',
    phone: '+49 175 1234567',
    offer: locale === 'de' ? '€7.500' : '€7,500',
    message:
      locale === 'de'
        ? 'Hallo, ich leite ein schnell wachsendes KI-Startup und vuse.io wäre die perfekte Heimat für unsere Marke. Ich freue mich auf Ihre Antwort!'
        : 'Hi, I run a fast-growing AI startup and vuse.io would be the perfect home for our brand. Looking forward to your reply!',
    domainName: process.env.NEXT_PUBLIC_DOMAIN_NAME || 'vuse.io',
    locale,
  };

  const result =
    type === 'owner'
      ? buildOwnerNotificationEmail(sample)
      : buildConfirmationEmail(sample);

  return new NextResponse(result.html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

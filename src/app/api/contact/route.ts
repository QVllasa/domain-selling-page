import { NextResponse } from 'next/server';
import { buildConfirmationEmail, buildOwnerNotificationEmail } from '@/lib/email-templates';

// ─── Verify Turnstile token ───
async function verifyTurnstile(token: string): Promise<boolean> {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.warn('Turnstile secret key not configured');
    return true; // Allow without verification if not configured
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }).toString(),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// ─── Send email via Brevo ───
async function sendBrevoEmail({
  to,
  replyTo,
  subject,
  html,
  text,
}: {
  to: { email: string; name?: string }[];
  replyTo?: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  if (!process.env.BREVO_API_KEY) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'Domain Sales',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@yourdomain.com',
        },
        to,
        ...(replyTo ? { replyTo } : {}),
        subject,
        htmlContent: html,
        textContent: text,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) return true;
    const errorText = await response.text();
    console.error('Brevo API error response:', response.status, errorText);
    return false;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Brevo email timeout - request aborted after 10 seconds');
    } else {
      console.error('Brevo email error:', error instanceof Error ? error.message : String(error));
    }
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, offer, message, locale = 'en', turnstileToken } = body;

    // Basic validation
    if (!name || !email || !offer) {
      return NextResponse.json(
        { error: 'Name, email, and offer are required' },
        { status: 400 }
      );
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return NextResponse.json(
        { error: 'Please complete the spam protection challenge' },
        { status: 400 }
      );
    }

    // Skip Turnstile verification if bypassed (for development or if Turnstile failed to load)
    if (turnstileToken !== 'bypassed' && turnstileToken !== 'localhost-bypass') {
      const turnstileValid = await verifyTurnstile(turnstileToken);
      if (!turnstileValid) {
        return NextResponse.json(
          { error: 'Spam protection verification failed' },
          { status: 400 }
        );
      }
    }

    const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || 'yourdomain.com';
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@yourdomain.com';
    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;

    // Build the two emails
    const ownerEmailContent = buildOwnerNotificationEmail({
      name, email, phone, offer, message, domainName, locale,
    });
    const confirmationEmailContent = buildConfirmationEmail({
      name, email, phone, offer, message, domainName, locale,
    });

    // Send notification to domain owner
    const ownerEmailSent = await sendBrevoEmail({
      to: [
        { email: contactEmail },
        ...(ownerEmail && ownerEmail !== contactEmail ? [{ email: ownerEmail }] : []),
      ],
      replyTo: { email, name },
      subject: ownerEmailContent.subject,
      html: ownerEmailContent.html,
      text: ownerEmailContent.text,
    });

    // Send confirmation to the prospect
    const confirmationSent = await sendBrevoEmail({
      to: [{ email, name }],
      subject: confirmationEmailContent.subject,
      html: confirmationEmailContent.html,
      text: confirmationEmailContent.text,
    });

    if (!ownerEmailSent) {
      console.log('New domain inquiry (email service not configured):', {
        domain: domainName,
        name,
        email,
        phone,
        offer,
        message,
        locale,
        confirmationSent,
      });
    }

    // Always return success to user (even if email failed)
    return NextResponse.json({
      success: true,
      confirmationSent,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

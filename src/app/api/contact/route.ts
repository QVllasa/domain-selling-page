import { NextResponse } from 'next/server';
import { buildConfirmationEmail, buildOwnerNotificationEmail } from '@/lib/email-templates';

/* ─── Constants ─── */
const IS_DEV = process.env.NODE_ENV === 'development';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 200;
const MAX_EMAIL = 254;
const MAX_PHONE = 30;
const MAX_OFFER = 100;
const MAX_MESSAGE = 5000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/* ─── In-memory rate limiter (per IP) ─── */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Reset or initialize
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count++;
  return { allowed: true };
}

// Periodic cleanup of expired entries (runs at most once per minute)
let lastCleanup = 0;
function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}

function getClientIp(request: Request): string {
  // Coolify/Traefik proxies set x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

/* ─── Verify Turnstile token ─── */
async function verifyTurnstile(token: string): Promise<boolean> {
  // Dev-only escape hatch: in development with the literal "dev" placeholder
  // token, skip the Cloudflare round-trip. This is the ONLY bypass and it
  // requires NODE_ENV=development which Next.js never sets in production builds.
  if (IS_DEV && token === 'dev') {
    return true;
  }

  if (!process.env.TURNSTILE_SECRET_KEY) {
    console.error('CRITICAL: Turnstile secret key not configured');
    return false;
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
    return result.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/* ─── Send email via Brevo ─── */
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
    console.error('Brevo API error:', response.status, errorText);
    return false;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Brevo email timeout — aborted after 10s');
    } else {
      console.error('Brevo email error:', error instanceof Error ? error.message : String(error));
    }
    return false;
  }
}

/* ─── Validate request body ─── */
function validateBody(body: unknown): { valid: true; data: ValidatedBody } | { valid: false; error: string } {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Invalid request body' };
  }

  const b = body as Record<string, unknown>;

  // Required fields
  if (typeof b.name !== 'string' || b.name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  if (typeof b.email !== 'string' || b.email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  if (typeof b.offer !== 'string' || b.offer.trim().length === 0) {
    return { valid: false, error: 'Offer is required' };
  }

  // Length limits
  if (b.name.length > MAX_NAME) return { valid: false, error: 'Name too long' };
  if (b.email.length > MAX_EMAIL) return { valid: false, error: 'Email too long' };
  if (b.offer.length > MAX_OFFER) return { valid: false, error: 'Offer too long' };

  // Email format
  if (!EMAIL_REGEX.test(b.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Optional fields with type + length validation
  if (b.phone != null && (typeof b.phone !== 'string' || b.phone.length > MAX_PHONE)) {
    return { valid: false, error: 'Invalid phone' };
  }
  if (b.message != null && (typeof b.message !== 'string' || b.message.length > MAX_MESSAGE)) {
    return { valid: false, error: 'Message too long' };
  }
  if (b.locale != null && (typeof b.locale !== 'string' || (b.locale !== 'en' && b.locale !== 'de'))) {
    return { valid: false, error: 'Invalid locale' };
  }
  if (typeof b.turnstileToken !== 'string' || b.turnstileToken.length === 0) {
    return { valid: false, error: 'Spam protection token required' };
  }

  return {
    valid: true,
    data: {
      name: b.name.trim(),
      email: b.email.trim().toLowerCase(),
      phone: typeof b.phone === 'string' ? b.phone.trim() : '',
      offer: b.offer.trim(),
      message: typeof b.message === 'string' ? b.message.trim() : '',
      locale: (b.locale === 'de' ? 'de' : 'en') as 'de' | 'en',
      turnstileToken: b.turnstileToken,
    },
  };
}

interface ValidatedBody {
  name: string;
  email: string;
  phone: string;
  offer: string;
  message: string;
  locale: 'de' | 'en';
  turnstileToken: string;
}

/* ─── POST handler ─── */
export async function POST(request: Request) {
  try {
    // Rate limiting
    maybeCleanup();
    const clientIp = getClientIp(request);
    const limit = checkRateLimit(clientIp);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(limit.retryAfter ?? 3600),
          },
        }
      );
    }

    // Parse + validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = validateBody(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const data = validation.data;

    // Verify Turnstile — no bypass tokens, real verification only.
    // In dev mode, if no secret key is set, verifyTurnstile returns true.
    const turnstileValid = await verifyTurnstile(data.turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: 'Spam protection verification failed' },
        { status: 400 }
      );
    }

    const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || 'yourdomain.com';
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contact@yourdomain.com';
    const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;

    // Build the two emails
    const ownerEmailContent = buildOwnerNotificationEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      offer: data.offer,
      message: data.message,
      domainName,
      locale: data.locale,
    });
    const confirmationEmailContent = buildConfirmationEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      offer: data.offer,
      message: data.message,
      domainName,
      locale: data.locale,
    });

    // Send notification to domain owner
    const ownerEmailSent = await sendBrevoEmail({
      to: [
        { email: contactEmail },
        ...(ownerEmail && ownerEmail !== contactEmail ? [{ email: ownerEmail }] : []),
      ],
      replyTo: { email: data.email, name: data.name },
      subject: ownerEmailContent.subject,
      html: ownerEmailContent.html,
      text: ownerEmailContent.text,
    });

    // Send confirmation to the prospect
    const confirmationSent = await sendBrevoEmail({
      to: [{ email: data.email, name: data.name }],
      subject: confirmationEmailContent.subject,
      html: confirmationEmailContent.html,
      text: confirmationEmailContent.text,
    });

    // Log only non-PII operational data
    console.log('Domain inquiry processed', {
      domain: domainName,
      locale: data.locale,
      ownerEmailSent,
      confirmationSent,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      confirmationSent,
    });
  } catch (error) {
    console.error('Contact form error:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

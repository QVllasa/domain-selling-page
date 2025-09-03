import { NextResponse } from 'next/server';

// Verify Turnstile token
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
      body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// Send confirmation email to the sender
async function sendConfirmationEmail(email: string, name: string, locale: string, domainName: string) {
  const isGerman = locale === 'de';
  
  const subject = isGerman 
    ? `Bestätigung: Ihr Angebot für ${domainName} wurde erhalten`
    : `Confirmation: Your offer for ${domainName} has been received`;
  
  const emailBody = isGerman ? `
    Hallo ${name},

    vielen Dank für Ihr Interesse an der Domain ${domainName}.

    Wir haben Ihr Angebot erfolgreich erhalten und werden es sorgfältig prüfen. 
    Unser Team wird sich innerhalb von 24 Stunden bei Ihnen melden.

    Falls Sie in der Zwischenzeit Fragen haben, können Sie gerne auf diese E-Mail antworten.

    Mit freundlichen Grüßen
    Das ${domainName} Team

    ---
    Diese E-Mail wurde automatisch generiert.
  ` : `
    Hello ${name},

    Thank you for your interest in the domain ${domainName}.

    We have successfully received your offer and will review it carefully.
    Our team will get back to you within 24 hours.

    If you have any questions in the meantime, feel free to reply to this email.

    Best regards,
    The ${domainName} Team

    ---
    This email was automatically generated.
  `;

  // Try Brevo with timeout and better error handling
  if (process.env.BREVO_API_KEY) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
          to: [{ email: email, name: name }],
          subject: subject,
          htmlContent: emailBody.replace(/\n/g, '<br>'),
          textContent: emailBody,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('Confirmation email sent successfully to:', email);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Brevo API error response:', response.status, errorText);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Brevo confirmation email timeout - request aborted after 5 seconds');
        } else {
          console.error('Brevo confirmation email error:', error.message);
        }
      } else {
        console.error('Brevo confirmation email error:', String(error));
      }
    }
  }

  console.log('Confirmation email not sent - email service unavailable');
  return false;
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

    // Prepare email content for owner notification
    const isGerman = locale === 'de';
    const subject = isGerman 
      ? `Neues Angebot für ${domainName}` 
      : `New Offer for ${domainName}`;
    
    const emailBody = isGerman ? `
      Neue Anfrage für Domain: ${domainName}
      
      Von: ${name}
      E-Mail: ${email}
      Telefon: ${phone || 'Nicht angegeben'}
      Angebot: ${offer}
      
      Nachricht:
      ${message || 'Keine zusätzliche Nachricht'}
      
      ---
      Diese E-Mail wurde automatisch von der Domain-Verkaufsseite generiert.
    ` : `
      New inquiry for domain: ${domainName}
      
      From: ${name}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      Offer: ${offer}
      
      Message:
      ${message || 'No additional message provided'}
      
      ---
      This email was automatically generated from the domain sales page.
    `;

    // Send notification to domain owner
    let ownerEmailSent = false;
    if (process.env.BREVO_API_KEY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
            to: [{ email: contactEmail }],
            replyTo: {
              email: email,
              name: name,
            },
            subject: subject,
            htmlContent: emailBody.replace(/\n/g, '<br>'),
            textContent: emailBody,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          ownerEmailSent = true;
          console.log('Owner notification email sent successfully');
        } else {
          const errorText = await response.text();
          console.error('Brevo owner notification API error:', response.status, errorText);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error('Brevo owner notification timeout - request aborted after 10 seconds');
        } else {
          console.error('Brevo owner notification error:', error);
        }
      }
    }

    // Send confirmation email to the sender
    const confirmationSent = await sendConfirmationEmail(email, name, locale, domainName);

    if (!ownerEmailSent) {
      // If no email service is configured, just log the inquiry
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
      confirmationSent: confirmationSent
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

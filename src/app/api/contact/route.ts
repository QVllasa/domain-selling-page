import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, offer, message, locale = 'en' } = body;

    // Basic validation
    if (!name || !email || !offer) {
      return NextResponse.json(
        { error: 'Name, email, and offer are required' },
        { status: 400 }
      );
    }

    const domainName = process.env.NEXT_PUBLIC_DOMAIN_NAME || 'yourdomain.com';
    const contactEmail = process.env.CONTACT_EMAIL || 'contact@yourdomain.com';

    // Prepare email content based on locale
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

    // Choose email service based on available environment variables
    let emailSent = false;

    // Try SendGrid
    if (process.env.SENDGRID_API_KEY) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: contactEmail }],
                subject: subject,
              },
            ],
            from: {
              email: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
              name: 'Domain Sales',
            },
            reply_to: {
              email: email,
              name: name,
            },
            content: [
              {
                type: 'text/plain',
                value: emailBody,
              },
            ],
          }),
        });

        if (response.ok) {
          emailSent = true;
        }
      } catch (error) {
        console.error('SendGrid error:', error);
      }
    }

    // Try Brevo if SendGrid failed
    if (!emailSent && process.env.BREVO_API_KEY) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: {
              name: 'Domain Sales',
              email: process.env.BREVO_FROM_EMAIL || 'noreply@yourdomain.com',
            },
            to: [{ email: contactEmail }],
            replyTo: {
              email: email,
              name: name,
            },
            subject: subject,
            textContent: emailBody,
          }),
        });

        if (response.ok) {
          emailSent = true;
        }
      } catch (error) {
        console.error('Brevo error:', error);
      }
    }

    // Try Resend if others failed
    if (!emailSent && process.env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
            to: contactEmail,
            reply_to: email,
            subject: subject,
            text: emailBody,
          }),
        });

        if (response.ok) {
          emailSent = true;
        }
      } catch (error) {
        console.error('Resend error:', error);
      }
    }

    if (!emailSent) {
      // If no email service is configured, just log the inquiry
      console.log('New domain inquiry (email service not configured):', {
        domain: domainName,
        name,
        email,
        phone,
        offer,
        message,
        locale,
      });
    }

    // Always return success to user (even if email failed)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

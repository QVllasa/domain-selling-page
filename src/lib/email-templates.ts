/**
 * Email templates for domain inquiry flow.
 *
 * Design principles:
 * - Light cream background (#f7f5ef) with deep noir text — robust across all clients
 * - Gold accent (#b8923a) for hierarchy and brand cohesion with the website
 * - Web-safe fonts (Georgia for serif display, system sans for body) — no web fonts
 * - Table-based layout for Outlook compatibility
 * - Inline CSS only — no <style> dependencies for the body
 * - All user input is HTML-escaped (XSS-safe)
 */

/* ─── HTML Escape (XSS protection) ─── */
function esc(str: string | undefined | null): string {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/* ─── Format multi-line text for HTML (preserves line breaks) ─── */
function nl2br(str: string): string {
  return esc(str).replace(/\r?\n/g, '<br>');
}

/* ─── Shared design tokens ─── */
const tokens = {
  bgPage: '#f4f1e8',
  bgCard: '#ffffff',
  textPrimary: '#0a0a0a',
  textSecondary: '#5a5751',
  textMuted: '#9c9890',
  textFaint: '#bfbcb3',
  accent: '#b8923a',
  accentLight: '#d4ad58',
  divider: '#e8e3d4',
  // Fonts
  fontDisplay: "Georgia, 'Times New Roman', 'Bodoni 72', serif",
  fontBody:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontMono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

/* ─── Shared shell wrapper ─── */
function wrapEmail({
  preheader,
  domainName,
  body,
  locale,
}: {
  preheader: string;
  domainName: string;
  body: string;
  locale: string;
}): string {
  const t = tokens;
  const safeDomain = esc(domainName);
  const [domainBase, ...rest] = domainName.split('.');
  const tld = '.' + rest.join('.');

  return `<!doctype html>
<html lang="${locale === 'de' ? 'de' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(preheader)}</title>
<!--[if mso]>
<style type="text/css">
table, td, div, h1, h2, h3, p { font-family: Georgia, 'Times New Roman', serif !important; }
</style>
<![endif]-->
<style>
  body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
  img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
  a { color: ${t.accent}; text-decoration: none; }
  @media screen and (max-width: 600px) {
    .email-container { width: 100% !important; max-width: 100% !important; }
    .px { padding-left: 28px !important; padding-right: 28px !important; }
    .py-lg { padding-top: 36px !important; padding-bottom: 36px !important; }
    .hero-title { font-size: 38px !important; }
    .stat-label { font-size: 10px !important; }
    .stat-value { font-size: 18px !important; }
    .stack-block { display: block !important; width: 100% !important; padding: 16px 0 !important; }
    .hide-mobile { display: none !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:${t.bgPage};font-family:${t.fontBody};-webkit-font-smoothing:antialiased;">
<!-- Preheader (hidden preview text shown in inbox) -->
<div style="display:none;font-size:1px;color:${t.bgPage};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
${esc(preheader)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${t.bgPage};">
  <tr>
    <td align="center" style="padding:48px 16px;">

      <!-- ═══ Container ═══ -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="max-width:600px;background-color:${t.bgCard};">

        <!-- ─── Header ─── -->
        <tr>
          <td align="center" class="px" style="padding:56px 64px 8px;">
            <!-- Eyebrow -->
            <p style="margin:0 0 24px;font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:3.5px;text-transform:uppercase;color:${t.accent};">
              ${locale === 'de' ? 'Premium Domain · Direktverkauf' : 'Premium Domain · Direct Sale'}
            </p>
            <!-- Domain name in serif -->
            <h1 class="hero-title" style="margin:0;font-family:${t.fontDisplay};font-size:56px;font-weight:400;line-height:1;letter-spacing:-2px;color:${t.textPrimary};">
              ${esc(domainBase)}<em style="color:${t.accent};font-style:italic;font-weight:400;">${esc(tld)}</em>
            </h1>
            <!-- Hairline divider -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:32px auto 0;">
              <tr>
                <td style="width:48px;height:1px;background-color:${t.accent};line-height:1px;font-size:1px;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        ${body}

        <!-- ─── Footer ─── -->
        <tr>
          <td align="center" class="px" style="padding:48px 64px 56px;border-top:1px solid ${t.divider};">
            <p style="margin:0 0 8px;font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${t.textMuted};">
              ${safeDomain}
            </p>
            <p style="margin:0 0 16px;font-family:${t.fontDisplay};font-style:italic;font-size:14px;color:${t.textSecondary};">
              ${locale === 'de' ? 'Eine seltene Domain. Direkt verkauft.' : 'A rare domain. Sold directly.'}
            </p>
            <p style="margin:0;font-family:${t.fontBody};font-size:10px;line-height:1.7;color:${t.textFaint};">
              ${locale === 'de'
                ? 'Diese E-Mail wurde automatisch generiert.'
                : 'This email was automatically generated.'}<br>
              © ${new Date().getFullYear()} ${safeDomain}
            </p>
          </td>
        </tr>
      </table>
      <!-- ═══ /Container ═══ -->

      <!-- Spacer -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="max-width:600px;">
        <tr>
          <td align="center" style="padding:24px 0 0;">
            <p style="margin:0;font-family:${tokens.fontBody};font-size:10px;color:${t.textFaint};">
              ${locale === 'de' ? 'Diskret · Sicher · Direkt' : 'Discreet · Secure · Direct'}
            </p>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
</body>
</html>`;
}

/* ════════════════════════════════════════════════════
   1. Confirmation email (sent to the prospect)
   ════════════════════════════════════════════════════ */

export function buildConfirmationEmail({
  name,
  email,
  phone,
  offer,
  message,
  domainName,
  locale,
}: {
  name: string;
  email: string;
  phone?: string;
  offer: string;
  message?: string;
  domainName: string;
  locale: string;
}): { subject: string; html: string; text: string } {
  const isGerman = locale === 'de';
  const t = tokens;
  const safeName = esc(name);
  const safeOffer = esc(offer);
  const safeDomain = esc(domainName);

  const subject = isGerman
    ? `Bestätigung: Ihr Angebot für ${domainName} wurde erhalten`
    : `Confirmation: Your offer for ${domainName} has been received`;

  const preheader = isGerman
    ? `Wir haben Ihr Angebot in Höhe von ${offer} erhalten und melden uns innerhalb von 24 Stunden.`
    : `We received your offer of ${offer} and will respond within 24 hours.`;

  const body = `
    <!-- Greeting + Confirmation -->
    <tr>
      <td class="px py-lg" style="padding:48px 64px 16px;">
        <p style="margin:0 0 24px;font-family:${t.fontBody};font-size:15px;line-height:1.7;color:${t.textPrimary};">
          ${isGerman ? `Hallo ${safeName},` : `Hello ${safeName},`}
        </p>

        <h2 style="margin:0 0 24px;font-family:${t.fontDisplay};font-size:28px;font-weight:400;line-height:1.2;letter-spacing:-0.5px;color:${t.textPrimary};">
          ${isGerman
            ? `Ihr Angebot wurde <em style="font-style:italic;color:${t.accent};">erhalten</em>.`
            : `Your offer has been <em style="font-style:italic;color:${t.accent};">received</em>.`}
        </h2>

        <p style="margin:0 0 16px;font-family:${t.fontBody};font-size:15px;line-height:1.75;color:${t.textSecondary};">
          ${isGerman
            ? `vielen Dank für Ihr Interesse an <strong style="color:${t.textPrimary};">${safeDomain}</strong>. Wir haben Ihr Angebot erhalten und werden es persönlich prüfen.`
            : `thank you for your interest in <strong style="color:${t.textPrimary};">${safeDomain}</strong>. We've received your offer and will review it personally.`}
        </p>

        <p style="margin:0;font-family:${t.fontBody};font-size:15px;line-height:1.75;color:${t.textSecondary};">
          ${isGerman
            ? 'Sie hören innerhalb von <strong style="color:' + t.textPrimary + '">24 Stunden</strong> von uns. Bei dringenden Anfragen können Sie direkt auf diese E-Mail antworten.'
            : 'You will hear back from us within <strong style="color:' + t.textPrimary + '">24 hours</strong>. For urgent inquiries, simply reply to this email.'}
        </p>
      </td>
    </tr>

    <!-- Submitted offer summary card -->
    <tr>
      <td class="px" style="padding:24px 64px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${t.bgPage};border:1px solid ${t.divider};">
          <tr>
            <td style="padding:32px 36px;">

              <p style="margin:0 0 24px;font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${t.textMuted};">
                ${isGerman ? 'Ihr Angebot' : 'Your Offer'}
              </p>

              <!-- Offer amount — hero -->
              <p class="stat-value" style="margin:0 0 28px;font-family:${t.fontDisplay};font-size:38px;font-weight:400;line-height:1;letter-spacing:-1px;color:${t.accent};">
                ${safeOffer}
              </p>

              <!-- Details list -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:12px 0;border-top:1px solid ${t.divider};">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="35%" style="font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${t.textMuted};">
                          ${isGerman ? 'Domain' : 'Domain'}
                        </td>
                        <td style="font-family:${t.fontDisplay};font-size:15px;color:${t.textPrimary};text-align:right;">
                          ${safeDomain}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-top:1px solid ${t.divider};">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="35%" style="font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${t.textMuted};">
                          ${isGerman ? 'Name' : 'Name'}
                        </td>
                        <td style="font-family:${t.fontBody};font-size:14px;color:${t.textPrimary};text-align:right;">
                          ${safeName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-top:1px solid ${t.divider};">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="35%" style="font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${t.textMuted};">
                          ${isGerman ? 'Eingegangen' : 'Received'}
                        </td>
                        <td style="font-family:${t.fontBody};font-size:14px;color:${t.textPrimary};text-align:right;">
                          ${new Date().toLocaleString(isGerman ? 'de-DE' : 'en-US', { dateStyle: 'long', timeStyle: 'short' })}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Next steps -->
    <tr>
      <td class="px" style="padding:32px 64px 16px;">
        <p style="margin:0 0 20px;font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${t.accent};">
          ${isGerman ? 'Wie es weitergeht' : 'What Happens Next'}
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="32" valign="top" style="padding:4px 0;">
              <span style="display:inline-block;width:18px;font-family:${t.fontDisplay};font-style:italic;font-size:18px;color:${t.accent};line-height:1;">I</span>
            </td>
            <td valign="top" style="padding:4px 0;">
              <p style="margin:0;font-family:${t.fontBody};font-size:14px;line-height:1.6;color:${t.textSecondary};">
                ${isGerman
                  ? 'Wir prüfen Ihr Angebot persönlich.'
                  : 'We review your offer personally.'}
              </p>
            </td>
          </tr>
          <tr>
            <td width="32" valign="top" style="padding:4px 0;">
              <span style="display:inline-block;width:18px;font-family:${t.fontDisplay};font-style:italic;font-size:18px;color:${t.accent};line-height:1;">II</span>
            </td>
            <td valign="top" style="padding:4px 0;">
              <p style="margin:0;font-family:${t.fontBody};font-size:14px;line-height:1.6;color:${t.textSecondary};">
                ${isGerman
                  ? 'Sie erhalten innerhalb von 24 Stunden eine persönliche Antwort.'
                  : 'You receive a personal response within 24 hours.'}
              </p>
            </td>
          </tr>
          <tr>
            <td width="32" valign="top" style="padding:4px 0;">
              <span style="display:inline-block;width:18px;font-family:${t.fontDisplay};font-style:italic;font-size:18px;color:${t.accent};line-height:1;">III</span>
            </td>
            <td valign="top" style="padding:4px 0;">
              <p style="margin:0;font-family:${t.fontBody};font-size:14px;line-height:1.6;color:${t.textSecondary};">
                ${isGerman
                  ? 'Bei Annahme: direkter Transfer und sichere Zahlung — keine Maklergebühren.'
                  : 'Upon acceptance: direct transfer and secure payment — no broker fees.'}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Closing -->
    <tr>
      <td class="px" style="padding:32px 64px 48px;">
        <p style="margin:0 0 8px;font-family:${t.fontBody};font-size:14px;line-height:1.7;color:${t.textSecondary};">
          ${isGerman ? 'Mit besten Grüßen,' : 'Kind regards,'}
        </p>
        <p style="margin:0;font-family:${t.fontDisplay};font-style:italic;font-size:18px;color:${t.textPrimary};">
          ${safeDomain}
        </p>
      </td>
    </tr>
  `;

  const html = wrapEmail({ preheader, domainName, body, locale });

  // Plain-text fallback
  const text = isGerman
    ? `Hallo ${name},

vielen Dank für Ihr Interesse an ${domainName}.
Wir haben Ihr Angebot erhalten und werden es persönlich prüfen.

────────────────────────────
IHR ANGEBOT
────────────────────────────
Domain:      ${domainName}
Angebot:     ${offer}
Name:        ${name}
Eingegangen: ${new Date().toLocaleString('de-DE')}
────────────────────────────

WIE ES WEITERGEHT
I.   Wir prüfen Ihr Angebot persönlich.
II.  Sie erhalten innerhalb von 24 Stunden eine persönliche Antwort.
III. Bei Annahme: direkter Transfer und sichere Zahlung — keine Maklergebühren.

Bei dringenden Anfragen können Sie direkt auf diese E-Mail antworten.

Mit besten Grüßen,
${domainName}

──────────
Diese E-Mail wurde automatisch generiert.
© ${new Date().getFullYear()} ${domainName}
`
    : `Hello ${name},

thank you for your interest in ${domainName}.
We've received your offer and will review it personally.

────────────────────────────
YOUR OFFER
────────────────────────────
Domain:    ${domainName}
Offer:     ${offer}
Name:      ${name}
Received:  ${new Date().toLocaleString('en-US')}
────────────────────────────

WHAT HAPPENS NEXT
I.   We review your offer personally.
II.  You receive a personal response within 24 hours.
III. Upon acceptance: direct transfer and secure payment — no broker fees.

For urgent inquiries, simply reply to this email.

Kind regards,
${domainName}

──────────
This email was automatically generated.
© ${new Date().getFullYear()} ${domainName}
`;

  return { subject, html, text };
}

/* ════════════════════════════════════════════════════
   2. Owner notification email (sent to domain owner)
   ════════════════════════════════════════════════════ */

export function buildOwnerNotificationEmail({
  name,
  email,
  phone,
  offer,
  message,
  domainName,
  locale,
}: {
  name: string;
  email: string;
  phone?: string;
  offer: string;
  message?: string;
  domainName: string;
  locale: string;
}): { subject: string; html: string; text: string } {
  const isGerman = locale === 'de';
  const t = tokens;
  const safeName = esc(name);
  const safeEmail = esc(email);
  const safePhone = phone ? esc(phone) : '';
  const safeOffer = esc(offer);
  const safeMessage = message ? nl2br(message) : '';
  const safeDomain = esc(domainName);

  const subject = isGerman
    ? `🟡 Neues Angebot: ${offer} für ${domainName}`
    : `🟡 New offer: ${offer} for ${domainName}`;

  const preheader = isGerman
    ? `${name} bietet ${offer}. Antworten Sie direkt auf diese E-Mail.`
    : `${name} is offering ${offer}. Reply directly to this email.`;

  const phoneRow = phone
    ? `
      <tr>
        <td style="padding:14px 0;border-top:1px solid ${t.divider};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="35%" style="font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${t.textMuted};">
                ${isGerman ? 'Telefon' : 'Phone'}
              </td>
              <td style="font-family:${t.fontMono};font-size:14px;color:${t.textPrimary};text-align:right;">
                <a href="tel:${safePhone}" style="color:${t.textPrimary};text-decoration:none;">${safePhone}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    : '';

  const messageBlock = message
    ? `
    <!-- Message -->
    <tr>
      <td class="px" style="padding:24px 64px 16px;">
        <p style="margin:0 0 16px;font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${t.accent};">
          ${isGerman ? 'Nachricht des Interessenten' : 'Message from prospect'}
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${t.bgPage};">
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0;font-family:${t.fontDisplay};font-style:italic;font-size:15px;line-height:1.7;color:${t.textPrimary};">
                "${safeMessage}"
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    : '';

  const body = `
    <!-- Alert headline -->
    <tr>
      <td class="px py-lg" style="padding:48px 64px 24px;">
        <p style="margin:0 0 12px;font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${t.accent};">
          ${isGerman ? '◆ Neues Angebot eingegangen' : '◆ New offer received'}
        </p>
        <h2 style="margin:0 0 8px;font-family:${t.fontDisplay};font-size:32px;font-weight:400;line-height:1.15;letter-spacing:-0.8px;color:${t.textPrimary};">
          ${isGerman
            ? `Ein neuer Interessent <em style="font-style:italic;color:${t.accent};">möchte kaufen</em>.`
            : `A new prospect <em style="font-style:italic;color:${t.accent};">wants to buy</em>.`}
        </h2>
      </td>
    </tr>

    <!-- HERO offer block -->
    <tr>
      <td class="px" style="padding:8px 64px 24px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0a0a0a;">
          <tr>
            <td align="center" style="padding:48px 32px;">
              <p style="margin:0 0 16px;font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${t.accent};">
                ${isGerman ? 'Gebotener Betrag' : 'Offered Amount'}
              </p>
              <p class="hero-title" style="margin:0;font-family:${t.fontDisplay};font-size:64px;font-weight:400;line-height:1;letter-spacing:-2px;color:#ffffff;">
                ${safeOffer}
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto 0;">
                <tr>
                  <td style="width:48px;height:1px;background-color:${t.accent};line-height:1px;font-size:1px;">&nbsp;</td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-family:${t.fontDisplay};font-style:italic;font-size:14px;color:#bfbcb3;">
                ${isGerman ? 'für' : 'for'} <span style="color:#ffffff;">${safeDomain}</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Contact details -->
    <tr>
      <td class="px" style="padding:24px 64px 16px;">
        <p style="margin:0 0 16px;font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${t.accent};">
          ${isGerman ? 'Kontaktdaten' : 'Contact Details'}
        </p>

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="padding:14px 0;border-top:1px solid ${t.divider};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="35%" style="font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${t.textMuted};">
                    ${isGerman ? 'Name' : 'Name'}
                  </td>
                  <td style="font-family:${t.fontDisplay};font-size:16px;color:${t.textPrimary};text-align:right;">
                    ${safeName}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 0;border-top:1px solid ${t.divider};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="35%" style="font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${t.textMuted};">
                    ${isGerman ? 'E-Mail' : 'Email'}
                  </td>
                  <td style="font-family:${t.fontMono};font-size:13px;color:${t.textPrimary};text-align:right;word-break:break-all;">
                    <a href="mailto:${safeEmail}" style="color:${t.textPrimary};text-decoration:none;">${safeEmail}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${phoneRow}
          <tr>
            <td style="padding:14px 0;border-top:1px solid ${t.divider};border-bottom:1px solid ${t.divider};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="35%" style="font-family:${t.fontBody};font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${t.textMuted};">
                    ${isGerman ? 'Eingegangen' : 'Received'}
                  </td>
                  <td style="font-family:${t.fontMono};font-size:12px;color:${t.textSecondary};text-align:right;">
                    ${new Date().toLocaleString(isGerman ? 'de-DE' : 'en-US', { dateStyle: 'long', timeStyle: 'short' })}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${messageBlock}

    <!-- Reply CTA -->
    <tr>
      <td class="px" style="padding:32px 64px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding:0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color:${t.accent};">
                    <a href="mailto:${safeEmail}?subject=${encodeURIComponent((isGerman ? 'Re: Ihr Angebot für ' : 'Re: Your offer for ') + domainName)}"
                       style="display:inline-block;padding:18px 44px;font-family:${t.fontBody};font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#0a0a0a;text-decoration:none;">
                      ${isGerman ? 'Direkt antworten →' : 'Reply Directly →'}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 0 0;">
              <p style="margin:0;font-family:${t.fontBody};font-size:11px;color:${t.textMuted};">
                ${isGerman
                  ? 'Oder antworten Sie einfach auf diese E-Mail — Reply-To ist gesetzt.'
                  : 'Or simply reply to this email — Reply-To is set.'}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Spacer -->
    <tr>
      <td style="padding:32px 0 0;">&nbsp;</td>
    </tr>
  `;

  const html = wrapEmail({ preheader, domainName, body, locale });

  const text = isGerman
    ? `◆ NEUES ANGEBOT EINGEGANGEN

Ein neuer Interessent möchte ${domainName} kaufen.

════════════════════════════
GEBOTENER BETRAG
${offer}
für ${domainName}
════════════════════════════

KONTAKTDATEN
────────────────────────────
Name:        ${name}
E-Mail:      ${email}${phone ? `\nTelefon:     ${phone}` : ''}
Eingegangen: ${new Date().toLocaleString('de-DE')}
────────────────────────────
${message ? `
NACHRICHT DES INTERESSENTEN
"${message}"

` : ''}
─────────────────
Antworten Sie direkt auf diese E-Mail (Reply-To ist gesetzt)
oder schreiben Sie an: ${email}

──────────
${domainName}
© ${new Date().getFullYear()}
`
    : `◆ NEW OFFER RECEIVED

A new prospect wants to buy ${domainName}.

════════════════════════════
OFFERED AMOUNT
${offer}
for ${domainName}
════════════════════════════

CONTACT DETAILS
────────────────────────────
Name:     ${name}
Email:    ${email}${phone ? `\nPhone:    ${phone}` : ''}
Received: ${new Date().toLocaleString('en-US')}
────────────────────────────
${message ? `
MESSAGE FROM PROSPECT
"${message}"

` : ''}
─────────────────
Reply directly to this email (Reply-To is set)
or write to: ${email}

──────────
${domainName}
© ${new Date().getFullYear()}
`;

  return { subject, html, text };
}

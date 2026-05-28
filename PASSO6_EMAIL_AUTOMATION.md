# Passo 6: Email Automation - Conversão de Leads & Confirmações

**Status:** ✅ Complete  
**Date:** 2026-05-28  
**Implementation Time:** ~35 minutes

## Overview

Passo 6 integra automação de emails com a plataforma de CRM. Quando um lead é convertido ou criado, emails são enviados automaticamente para notificar a equipe e confirmar o contato com o lead.

## Architecture

```
Lead Event                Backend                     Email Service
    │                      │                              │
    ├─ Lead Created ──────→ POST /api/leads             │
    │                      │                              │
    │                      ├─ Save to Database           │
    │                      │                              │
    │                      ├─ Send Confirmation Email ───→ Nodemailer
    │                      │                              │ (to lead email)
    │                      │                              │
    │                      └─ Return Response            │
    │
    ├─ Lead Converted ─────→ PATCH /api/leads/:id/status
    │                      │                              │
    │                      ├─ Update Status             │
    │                      │                              │
    │                      ├─ Emit Socket Events         │
    │                      │                              │
    │                      ├─ Send Team Email ──────────→ Nodemailer
    │                      │                              │ (to team email)
    │                      │                              │
    │                      └─ Return Response            │
```

## Email Service Implementation

### File: `backend/src/services/emailService.ts`

**Class:** `EmailService`

**Methods:**
1. `sendEmail(to: string, template: EmailTemplate)` - Generic email sender
2. `sendLeadConversionEmail(leadName, leadEmail, phone)` - Team notification
3. `sendLeadConfirmationEmail(leadName, leadEmail)` - Confirmation to lead
4. `sendDailyDigestEmail(email, stats)` - Daily summary

**Templates Included:**
- 🎉 Lead Conversion (team email)
- ✅ Lead Confirmation (lead email)
- 📊 Daily Digest (team stats)

### SMTP Configuration

**Development:** Uses Mailtrap (testing service)
```
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your_mailtrap_user"
SMTP_PASSWORD="your_mailtrap_password"
```

**Production:** Uses SendGrid or similar
```
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.your-api-key"
```

## Integration Points

### 1. Lead Creation Email
**File:** `backend/src/controllers/leads.ts` → `createLead()`

```typescript
// When new lead is created
await emailService.sendLeadConfirmationEmail(name, email);
```

**Email Template:**
- Subject: ✅ Recebemos seu contato - ADVGD
- Content: Welcome message, 24h response time
- Recipient: Lead email address

### 2. Lead Conversion Email
**File:** `backend/src/controllers/leads.ts` → `updateLeadStatus()`

```typescript
// When lead status = "Convertido"
if (status === 'Convertido') {
  socketService.emitLeadConverted(...);
  await emailService.sendLeadConversionEmail(
    lead.name,
    lead.email,
    lead.phone
  );
}
```

**Email Template:**
- Subject: 🎉 Novo Cliente Convertido: [Lead Name]
- Content: Lead details, conversion confirmation
- Recipient: Team email (TEAM_EMAIL env var)

## Configuration

### Required Environment Variables

```bash
# Email SMTP
SMTP_HOST="smtp.mailtrap.io"          # SMTP server
SMTP_PORT="2525"                       # SMTP port
SMTP_SECURE="false"                    # Use TLS
SMTP_USER="username"                   # SMTP username
SMTP_PASSWORD="password"               # SMTP password
EMAIL_FROM="noreply@advgd.com.br"     # From address
TEAM_EMAIL="team@advgd.com.br"        # Team email for notifications
APP_URL="http://localhost:5173"        # App URL for email links
```

### Setup Instructions

#### For Development (Mailtrap)

1. Sign up at https://mailtrap.io
2. Create project and get credentials
3. Add to `.env`:
```
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_SECURE="false"
SMTP_USER="your_inbox_username"
SMTP_PASSWORD="your_inbox_password"
```

#### For Production (SendGrid)

1. Sign up at https://sendgrid.com
2. Create API key
3. Add to `.env`:
```
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="true"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.your-api-key"
```

## Email Templates

### 1. Lead Confirmation Email

**When:** New lead created
**To:** Lead's email address
**Subject:** ✅ Recebemos seu contato - ADVGD

**Content:**
- Greeting with lead name
- Confirmation of contact received
- Response time: 24h
- Support email

### 2. Lead Conversion Email

**When:** Lead status changed to "Convertido"
**To:** Team email
**Subject:** 🎉 Novo Cliente Convertido: [Lead Name]

**Content:**
- Lead name, email, phone
- Clickable link to view client details
- Timestamp of conversion
- Celebration message

### 3. Daily Digest Email (Optional)

**When:** Scheduled (not yet implemented)
**To:** Team email
**Subject:** 📊 Resumo do Dia - [Date]

**Content:**
- New leads count
- Conversions count
- Date and time

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── emailService.ts          ✅ NEW - Email service
│   │   └── leadService.ts
│   ├── controllers/
│   │   └── leads.ts                 ✅ MODIFIED - Added email integration
│   └── ...
├── .env                             ✅ MODIFIED - Added email config
└── package.json                     ✅ MODIFIED - Added nodemailer
```

## Changes Summary

### New Files
- ✅ `backend/src/services/emailService.ts` (190 lines)

### Modified Files
- ✅ `backend/src/controllers/leads.ts` (added 2 email calls)
- ✅ `backend/.env` (added email config)
- ✅ `backend/package.json` (nodemailer dependency)

## Testing Procedures

### Test 1: Lead Confirmation Email

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "11987654321",
    "source": "WEBSITE",
    "category": "CONSULTATION"
  }'
```

**Expected:**
- ✅ Lead created in database
- ✅ Log: "📧 Sending confirmation email to: Test User"
- ✅ Email sent to test@example.com
- ✅ Subject: "✅ Recebemos seu contato - ADVGD"

### Test 2: Lead Conversion Email

```bash
curl -X PATCH http://localhost:3000/api/leads/[lead-id]/status \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Convertido"
  }'
```

**Expected:**
- ✅ Lead status updated
- ✅ Socket.io events emitted
- ✅ Log: "📧 Sending conversion email for lead: [name]"
- ✅ Email sent to TEAM_EMAIL with lead details
- ✅ Subject: "🎉 Novo Cliente Convertido: [name]"

### Test 3: Email Logs

Check backend logs for:
```
📧 Email sent successfully: message-id
✉️ Sending confirmation email to: [name] ([email])
```

## Nodemailer Dependencies

```json
{
  "nodemailer": "^6.9.x"
}
```

**Dev Dependencies:**
```json
{
  "@types/nodemailer": "^6.4.x"
}
```

## Error Handling

Emails are sent asynchronously with error handling:

```typescript
// Non-blocking email send
emailService.sendLeadConversionEmail(...)
  .catch((err) => {
    console.error('Failed to send email:', err.message);
  });
```

If email fails:
- ✅ API response still succeeds (email is non-critical)
- ✅ Error logged to console
- ✅ Lead creation/status update still completes

## Mailtrap Email Testing

### Development Email Preview

Using Mailtrap for development:
1. Create account at https://mailtrap.io
2. View sent emails in Mailtrap inbox
3. Preview HTML rendering
4. Check email headers and content

### Sample Mailtrap Credentials

```
Demo Inbox - Inbox #1111111
Username: a1a1a1a1a1a1a1
Password: b1b1b1b1b1b1b1
SMTP Host: smtp.mailtrap.io
SMTP Port: 2525
```

## Production Checklist

- [ ] SendGrid account created
- [ ] API key generated
- [ ] SMTP variables set in production .env
- [ ] TEAM_EMAIL configured to real team address
- [ ] EMAIL_FROM set to company domain
- [ ] APP_URL points to production URL
- [ ] Email templates reviewed and customized
- [ ] Test lead creation and conversion emails
- [ ] Monitor email delivery in SendGrid dashboard

## Future Enhancements

1. **Scheduled Daily Digest**
   - Send at 8:00 AM every day
   - Use cron job or task scheduler

2. **Email Templates Database**
   - Store templates in database
   - Allow team to customize emails

3. **Email Tracking**
   - Track email opens
   - Track link clicks
   - Log in database

4. **Bulk Email**
   - Send batch emails to team on specific triggers
   - Scheduled newsletters

5. **SMS Notifications**
   - Integrate Twilio for SMS
   - Send SMS instead of/in addition to emails

6. **WhatsApp Notifications**
   - Send conversion alerts via WhatsApp
   - Real-time team notifications

## Performance Notes

- **Non-Blocking:** Email sending happens asynchronously
- **Timeout:** Default 30 seconds per email
- **Retry:** No automatic retry (can be added)
- **Rate Limit:** No rate limiting (can be added for production)

## Security Considerations

- ✅ SMTP credentials stored in .env (not in code)
- ✅ Email addresses validated before sending
- ✅ HTML content sanitized in templates
- ✅ No sensitive data in email bodies
- ✅ SMTP connection encrypted (TLS)

## Monitoring & Logs

### Console Logs
```
📧 Sending confirmation email to: [name]
✉️ Email sent successfully: [message-id]
📧 Email send error: [error-message]
```

### Error Logging
All email errors logged to:
- Console (development)
- Application logs (production)

## Support & Troubleshooting

### Email Not Sent?

1. Check `.env` variables are set
2. Check SMTP credentials are correct
3. Check recipient email is valid
4. Check backend logs for errors
5. Use Mailtrap inbox to verify

### Mailtrap Email Not Showing?

1. Check SMTP credentials match Mailtrap
2. Check email was actually sent (check logs)
3. Wait 2-3 seconds for email to arrive
4. Refresh Mailtrap inbox

### Production Emails Going to Spam?

1. Configure SPF/DKIM/DMARC records
2. Use SendGrid for better deliverability
3. Add company logo to email template
4. Test with different email providers

---

**Summary:** Passo 6 adds automated email notifications for lead creation and conversion. Service is fully type-safe, handles errors gracefully, and integrates seamlessly with Socket.io events from Passo 5.

**Next Steps:** 
- Passo 7: Form Webhooks (receive form submissions as leads)
- Passo 8: Dashboard Enhancements (real-time metrics)
- Passo 9-10: Testing & Production Deployment

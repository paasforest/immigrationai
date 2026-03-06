# Email setup (Resend)

The application sends email via **Resend**. All transactional emails (applicant confirmation, client portal welcome, lead notifications, case updates, etc.) use this service.

## Why Resend

- **Already integrated** — the codebase uses the Resend API; no code change needed.
- **Good deliverability** — designed for transactional email; works well with custom domains.
- **Simple** — one API key; no SMTP to configure.
- **Free tier** — 3,000 emails/month free, then paid. Sufficient for getting started.
- **Works with your domain** — e.g. `noreply@mail.immigrationai.co.za` (subdomain) once verified in Resend.

## Setup steps

### 1. Create a Resend account

1. Go to [resend.com](https://resend.com) and sign up.
2. Verify your email if prompted.

### 2. Add and verify your domain

1. In the Resend dashboard, go to **Domains** and click **Add Domain**.
2. Enter your sending domain, e.g. **`immigrationai.co.za`** (or the root domain your host suggests).
3. Resend will show DNS records (e.g. SPF, DKIM). Add these in your DNS provider (where you manage immigrationai.co.za):
   - **MX** (if required)
   - **TXT** for SPF/DKIM as shown
4. In Resend, click **Verify**. Verification can take a few minutes up to 48 hours.

### 3. Create an API key

1. In Resend, go to **API Keys**.
2. Click **Create API Key**.
3. Name it (e.g. `ImmigrationAI Production`).
4. Copy the key (it starts with `re_`). You won’t see it again.

### 4. Set environment variables

In your **backend** `.env` (or your server’s environment):

```bash
# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@mail.immigrationai.co.za
```

- **RESEND_API_KEY** — the key you copied (required for sending).
- **FROM_EMAIL** — must be an address on a domain you’ve verified in Resend (e.g. `noreply@mail.immigrationai.co.za`).

Also ensure:

```bash
FRONTEND_URL=https://www.immigrationai.co.za
```

so links in emails (e.g. “Set up your password”, “Check my status”) point to your live site.

### 5. Restart the backend

After setting or changing env vars, restart the Node process (e.g. `pm2 restart all` or your usual deploy).

---

## Emails the app sends

| Trigger | Recipient | Purpose |
|--------|-----------|--------|
| Applicant submits Get Help | Applicant | Confirmation + reference number |
| Professional accepts lead | Applicant | “Specialist assigned” + next steps |
| Case converted (accept lead) | New client | “Your portal is ready” + set-password link |
| Case status update | Client | Status change + link to portal |
| New lead for professional | Professional | New lead notification |
| Team invite | Invitee | Invite link to join org |
| Payment proof received | Professional | Confirmation |
| Visa rules alert | Professional | Regulation change alert |

If `RESEND_API_KEY` is missing, the app logs a warning at startup and sending will fail when any of these triggers run.

---

## Troubleshooting

- **Emails not sending** — Check backend logs for `Failed to send` or `RESEND_API_KEY is not configured`. Confirm the key is set and the process was restarted.
- **“From” address rejected** — Use a `FROM_EMAIL` on a domain that is verified in Resend and matches the “From” identity Resend allows.
- **Spam / not received** — Ensure DNS (SPF/DKIM) is correctly set for your domain in Resend and that your DNS has propagated (can take up to 48 hours).

## Optional: test in development

1. Set `RESEND_API_KEY` and `FROM_EMAIL` in `backend/.env`.
2. Submit a test lead on Get Help, or accept a lead as a professional — the relevant confirmation or welcome email should be sent.
3. Check the Resend dashboard **Logs** to see sent events and any bounces or complaints.

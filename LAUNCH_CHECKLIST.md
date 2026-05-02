# MVP Launch Checklist 🚀

Follow this checklist before announcing Fito Agents MVP to the world.

## Infrastructure & Environment
- [ ] `NEXT_PUBLIC_APP_URL` is set to `https://fitoagents.com` in Firebase App Hosting.
- [ ] Firebase API keys and secrets are populated in App Hosting.
- [ ] OpenRouter API Key is added for inference.
- [ ] Stripe Secrets & Public Keys are set.
- [ ] Resend API Key is set for outbound emails.
- [ ] Cron Secret is securely generated and added.

## Stripe Configuration
- [ ] Stripe Products (Starter, Business, Advanced) created in Live Mode.
- [ ] Price IDs updated in Firebase environment variables.
- [ ] Setup Fee Price IDs updated (if applicable).
- [ ] Stripe Webhook `https://fitoagents.com/api/stripe/webhook` is created and listening for events.
- [ ] Webhook Signing Secret (`STRIPE_WEBHOOK_SECRET`) added to Firebase.

## Platform Features
- [ ] Embed script successfully loads chat widget on external test sites.
- [ ] Hosted Agent Page (`fitoagents.com/a/[slug]`) works publicly.
- [ ] User can sign up, create a business, and create an agent.
- [ ] Agent successfully processes messages and responds via OpenRouter.
- [ ] Analytics dashboard correctly aggregates local stats.

## External Integrations
- [ ] Resend domain (`fitoagents.com`) is verified.
- [ ] WordPress plugin zip is available at `/downloads/fito-agents-ai-chat.zip`.
- [ ] Support email (`hello@fitoagents.com`) is actively monitored.

## Legal & Compliance
- [ ] Privacy Policy is live (`/privacy`).
- [ ] Terms of Service is live (`/terms`).
- [ ] Refund Policy is live (`/refund`).
- [ ] Contact Page is live (`/contact`).

## Post-Launch Maintenance
- [ ] Set up the monthly cron job for usage resets (`/api/cron/reset-usage`).
- [ ] Upgrade the first user account to `owner` or `admin` in Firestore for elevated access.

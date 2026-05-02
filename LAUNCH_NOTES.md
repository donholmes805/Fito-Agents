# Fito Agents - Launch Notes & Setup Guide

This document contains everything you need to successfully launch the Fito Agents MVP.

## 1. Environment Variables
Ensure all required environment variables are set in your Firebase App Hosting configuration. 
You can find the full list of required variables in the `.env.example` file at the root of the project.

Key variables to double-check:
- **`NEXT_PUBLIC_APP_URL`**: Must be `https://fitoagents.com` in production.
- **`OPENROUTER_API_KEY`**: Required for the AI to function.
- **`STRIPE_SECRET_KEY` & `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**: Required for billing.
- **`RESEND_API_KEY` & `RESEND_FROM_EMAIL`**: Required for lead notifications and usage warnings.
- **`CRON_SECRET`**: A secure string used to authenticate automated cron jobs.

## 2. Stripe Setup
1. Create your products in Stripe: Starter, Business, and Advanced.
2. Ensure you have **recurring subscriptions** set up for each.
3. Obtain your price IDs (e.g., `price_xxx`) and add them to your environment variables.
4. If you have setup fees, create those as separate one-time prices and add them to the setup fee env variables.
5. **Webhook Setup**: 
   - Add a webhook in your Stripe Developer Dashboard pointing to: `https://fitoagents.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.
   - Copy the Signing Secret and set it as `STRIPE_WEBHOOK_SECRET` in Firebase.

## 3. Resend Setup (Emails)
1. In Resend, verify the domain `fitoagents.com` by adding the provided DNS records to your domain registrar.
2. Set `RESEND_FROM_EMAIL` to an address on your verified domain (e.g., `hello@fitoagents.com`).

## 4. Cron Jobs (Usage Resets)
To automatically reset agent usage limits on the 1st of every month (or handle backups), configure a scheduled task using Google Cloud Scheduler or an external tool like Cron-job.org.
- **URL**: `https://fitoagents.com/api/cron/reset-usage`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer YOUR_CRON_SECRET` (matching your `CRON_SECRET` env var)

## 5. First Owner Setup
1. Sign up for an account via the normal registration flow at `https://fitoagents.com/register`.
2. Go to the Firebase Console -> Firestore -> `users` collection.
3. Find your user document and change the `role` field from `business_owner` to `owner` (or `admin`).
4. You now have full platform privileges.

## 6. Integrations & URLs
- **WordPress Plugin**: Available for download directly in the dashboard at `/downloads/fito-agents-ai-chat.zip`. The plugin connects to `https://fitoagents.com`.
- **Embed Script**: Hosted at `https://fitoagents.com/embed.js`. The dashboard automatically generates the correct snippet for users.

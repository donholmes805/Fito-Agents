import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance) {
    const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
    if (!STRIPE_KEY) {
      console.warn('STRIPE_SECRET_KEY is missing from environment variables.');
    }
    // @ts-ignore
    stripeInstance = new Stripe(STRIPE_KEY, {
      apiVersion: '2026-04-22.dahlia' as any,
      appInfo: {
        name: 'Fito Agents',
        version: '0.1.0',
      },
    });
  }
  return stripeInstance;
}

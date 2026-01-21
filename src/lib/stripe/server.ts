import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

// Pricing configuration - easy to switch between lifetime and subscription
export const PRICING_CONFIG = {
  // Set to 'lifetime' for early bird deals, 'subscription' for recurring
  mode: (process.env.PRICING_MODE || "lifetime") as "lifetime" | "subscription",
  
  lifetime: {
    priceId: process.env.STRIPE_LIFETIME_PRICE_ID!,
    amount: 4900, // $49.00
    name: "Lifetime Access",
    description: "One-time payment, unlimited access forever",
  },
  
  subscription: {
    priceId: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
    amount: 900, // $9.00/month
    name: "Pro Plan",
    description: "Monthly subscription with all features",
  },
};

export function getCurrentPricing() {
  return PRICING_CONFIG[PRICING_CONFIG.mode];
}

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Price IDs (set these in Stripe dashboard)
export const STRIPE_PLANS = {
  // Monthly Plans
  starter_monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || 'price_starter_monthly',
  entry_monthly: process.env.STRIPE_ENTRY_MONTHLY_PRICE_ID || 'price_entry_monthly',
  professional_monthly: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || 'price_professional_monthly',
  enterprise_monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
  
  // Annual Plans
  starter_annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || 'price_starter_annual',
  entry_annual: process.env.STRIPE_ENTRY_ANNUAL_PRICE_ID || 'price_entry_annual',
  professional_annual: process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID || 'price_professional_annual',
  enterprise_annual: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || 'price_enterprise_annual',
  
  // Legacy plans for backward compatibility
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
};

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';



// Payment Gateway Configuration - South African Focus
export interface PaymentConfig {
  payfast: {
    merchantId: string;
    merchantKey: string;
    passphrase: string;
    sandbox: boolean;
    returnUrl: string;
    cancelUrl: string;
    notifyUrl: string;
  };
  // Local alternatives instead of PayPal
  local: {
    bankTransfer: boolean;
    eft: boolean;
    instantEft: boolean;
  };
}

// PayFast Configuration
export const payfastConfig = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passphrase: process.env.PAYFAST_PASSPHRASE || '',
  sandbox: process.env.NODE_ENV !== 'production',
  returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
  cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
  notifyUrl: `${process.env.BACKEND_URL}/api/payments/payfast/notify`,
};

// Local Payment Configuration
export const localConfig = {
  bankTransfer: true,
  eft: true,
  instantEft: true,
};

// Plan Pricing (ZAR) — must match signup page prices
export const PLAN_PRICING = {
  starter: {
    monthly: 499,
    annual: 4790,   // 499 * 12 * 0.80 (20% off)
  },
  professional: {
    monthly: 999,
    annual: 9590,   // 999 * 12 * 0.80
  },
  agency: {
    monthly: 1999,
    annual: 19190,  // 1999 * 12 * 0.80
  },
  enterprise: {
    monthly: 0,     // custom — handled manually
    annual: 0,
  },
};

// Payment Methods - Direct Bank Transfer Focus
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

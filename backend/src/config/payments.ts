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

// Plan Pricing (ZAR)
export const PLAN_PRICING = {
  starter: {
    monthly: 149,
    annual: 1490,
  },
  entry: {
    monthly: 299,
    annual: 2990,
  },
  professional: {
    monthly: 699,
    annual: 6990,
  },
  enterprise: {
    monthly: 1499,
    annual: 14990,
  },
};

// Payment Methods - Direct Bank Transfer Focus
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

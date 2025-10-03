// Paystack Payment Service
import { PAYSTACK_CONFIG } from '../config/paystack';

export interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number; // Amount in kobo (NGN) or cents
  reference: string;
  currency?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message?: string;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name?: string;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone?: string;
      metadata?: Record<string, any>;
      risk_action: string;
      international_format_phone?: string;
    };
    plan?: any;
    split: any;
    order_id?: any;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    pos_transaction_data?: any;
    source?: any;
    fees_breakdown?: any;
  };
}

class PaystackService {
  private publicKey: string;
  private secretKey: string;

  constructor() {
    this.publicKey = PAYSTACK_CONFIG.publicKey;
    this.secretKey = PAYSTACK_CONFIG.secretKey;
  }

  // Initialize payment
  async initializePayment(config: PaystackConfig): Promise<PaystackResponse> {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: config.email,
        amount: config.amount,
        reference: config.reference,
        currency: config.currency || 'NGN',
        callback_url: config.callback_url,
        metadata: config.metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Verify payment
  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Paystack verification error: ${response.statusText}`);
    }

    return response.json();
  }

  // Convert amount to kobo (for NGN) or cents
  convertToSmallestUnit(amount: number, currency: string = 'NGN'): number {
    if (currency === 'NGN') {
      return Math.round(amount * 100); // Convert to kobo
    }
    return Math.round(amount * 100); // Convert to cents for other currencies
  }

  // Get public key for frontend
  getPublicKey(): string {
    return this.publicKey;
  }

  // Create payment reference
  createReference(): string {
    return `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const paystackService = new PaystackService();

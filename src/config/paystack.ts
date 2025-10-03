// Paystack Configuration
export const PAYSTACK_CONFIG = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key_here',
  secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || 'sk_test_your_secret_key_here',
  apiUrl: 'https://api.paystack.co',
};

// Payment Link Configuration
export const PAYMENT_CONFIG = {
  linkDomain: import.meta.env.VITE_PAYMENT_LINK_DOMAIN || 'https://splitpay-amber.vercel.app',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://spleetpay-backend.onrender.com/api',
};

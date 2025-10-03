import React from 'react';
import { PaymentReceiver } from './components/PaymentReceiver';
import { AuthProvider } from './contexts/AuthContext';

// This is a separate app for handling payment receiver pages
// It will be served at routes like /p/:linkToken
function PaymentApp() {
  // Extract linkToken from URL path
  const getLinkTokenFromPath = () => {
    const path = window.location.pathname;
    const match = path.match(/^\/p\/(.+)$/);
    return match ? match[1] : null;
  };

  const linkToken = getLinkTokenFromPath();
  
  console.log('PaymentApp - Current path:', window.location.pathname);
  console.log('PaymentApp - Extracted linkToken:', linkToken);

  if (!linkToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-4">Invalid Payment Link</h1>
          <p className="text-red-700 mb-6">
            This payment link is invalid. Please check the link and try again.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider children={undefined}>
      <PaymentReceiver linkToken={linkToken} />
    </AuthProvider>
  );
}

export default PaymentApp;

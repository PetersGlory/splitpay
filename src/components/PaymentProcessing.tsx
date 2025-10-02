import React from 'react';
import { Loader2 } from 'lucide-react';

export default function PaymentProcessing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-center">
          <div className="bg-gray-100 rounded-full px-4 py-2 text-gray-600 text-sm">
            spleetpay.com
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-md mx-auto flex flex-col justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-purple-600 mx-auto mb-6 animate-spin" />
          <h1 className="text-gray-900 text-2xl mb-4">
            Processing Payment
          </h1>
          <p className="text-gray-600 mb-8">
            Please wait while we process your payment of <span className="font-semibold">₦3,450.00</span>
          </p>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-purple-700 text-sm">
              Do not close this page or navigate away during processing.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar (iOS style) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex justify-center py-2">
          <div className="w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Button } from './ui/button';
import { XCircle, RefreshCw, MessageCircle, AlertTriangle } from 'lucide-react';

interface PaymentFailureProps {
  onRetry: () => void;
  onComplete: () => void;
}

export default function PaymentFailure({ onRetry, onComplete }: PaymentFailureProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Mobile Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-red-100 p-4">
        <div className="flex items-center justify-center">
          <div className="bg-red-100 rounded-full px-4 py-2 text-red-700 text-sm font-medium">
            spleetpay.com
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-md mx-auto flex flex-col min-h-[calc(100vh-120px)]">
        {/* Failure Icon and Message */}
        <div className="text-center mb-8 flex-1 flex flex-col justify-center">
          <div className="mb-8">
            {/* Failure Animation Container */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 rounded-full w-24 h-24 mx-auto opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-red-500 to-red-600 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-lg">
                <XCircle className="h-12 w-12 text-white" />
              </div>
              <AlertTriangle className="absolute -top-2 -right-2 h-6 w-6 text-orange-500 animate-bounce" />
            </div>
            
            <h1 className="text-gray-900 text-3xl font-semibold mb-4">
              Payment Failed
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              We couldn't process your payment of <span className="font-bold text-red-600">₦3,450.00</span>. Please try again or use a different payment method.
            </p>
          </div>

          {/* Error Details Card */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-red-100 mb-6 text-left">
            <div className="flex items-center mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              <h3 className="text-red-800 font-semibold text-lg">Error Details</h3>
            </div>
            
            <p className="text-red-700 mb-4 leading-relaxed">
              Transaction declined by your bank. This could be due to insufficient funds, card restrictions, or network issues.
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-red-100 last:border-b-0">
                <span className="text-red-600 font-medium">Error Code</span>
                <span className="text-red-800 font-mono text-sm bg-red-100 px-3 py-1 rounded-lg">ERR-4001</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-red-100 last:border-b-0">
                <span className="text-red-600 font-medium">Transaction ID</span>
                <span className="text-red-800 font-mono text-sm bg-red-100 px-3 py-1 rounded-lg">TXN-001235</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-red-600 font-medium">Attempted Amount</span>
                <span className="text-red-800 font-bold">₦3,450.00</span>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-purple-100 mb-8 text-left">
            <div className="flex items-center mb-3">
              <MessageCircle className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="text-purple-800 font-semibold">Need Help?</h4>
            </div>
            <p className="text-purple-700 leading-relaxed">
              Contact your bank or try a different payment method. You can also reach out to our support team for assistance.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={onRetry}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
            size="lg"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 font-semibold py-3 rounded-xl transition-all duration-200"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Support
          </Button>

          <Button 
            onClick={onComplete}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-700 hover:bg-gray-100 font-medium py-3 rounded-xl transition-all duration-200"
          >
            Cancel Payment
          </Button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div className="flex justify-center py-3">
          <div className="w-32 h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
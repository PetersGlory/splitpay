import React from 'react';
import { Button } from './ui/button';
import { CheckCircle, Download, Share2, Sparkles } from 'lucide-react';

interface PaymentSuccessProps {
  onComplete: () => void;
  amount?: number;
  transactionId?: string;
  paymentMethod?: string;
}

export default function PaymentSuccess({ onComplete, amount = 3450, transactionId = 'TXN-001234', paymentMethod = 'Bank Transfer' }: PaymentSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50">
      {/* Mobile Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 p-4">
        <div className="flex items-center justify-center">
          <div className="bg-emerald-100 rounded-full px-4 py-2 text-emerald-700 text-sm font-medium">
            spleetpay.com
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-md mx-auto flex flex-col min-h-[calc(100vh-120px)]">
        {/* Success Icon and Message */}
        <div className="text-center mb-8 flex-1 flex flex-col justify-center">
          <div className="mb-8">
            {/* Success Animation Container */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full w-24 h-24 mx-auto opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-emerald-400 animate-bounce" />
            </div>
            
            <h1 className="text-gray-900 text-3xl font-semibold mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Your payment of <span className="font-bold text-emerald-600">₦{amount.toLocaleString()}.00</span> has been processed successfully.
            </p>
          </div>

          {/* Transaction Details Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100 mb-8 text-left">
            <div className="flex items-center mb-5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
              <h3 className="text-gray-900 font-semibold text-lg">Transaction Details</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-500 font-medium">Amount</span>
                <span className="text-gray-900 font-bold text-lg">₦{amount.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-500 font-medium">Transaction ID</span>
                <span className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-1 rounded-lg">{transactionId}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-500 font-medium">Payment Method</span>
                <span className="text-gray-900 font-semibold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-500 font-medium">Date & Time</span>
                <span className="text-gray-900 font-medium">Dec 18, 2024 2:45 PM</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-medium">Status</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-emerald-600 font-bold">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 font-semibold py-3 rounded-xl transition-all duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 font-semibold py-3 rounded-xl transition-all duration-200"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <Button 
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
            size="lg"
          >
            Done
          </Button>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100">
        <div className="flex justify-center py-3">
          <div className="w-32 h-1 bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
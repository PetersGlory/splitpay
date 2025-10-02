import React from 'react';
import { PaymentReceiver } from './PaymentReceiver';
import { Card } from './ui/card';
import { Button } from './ui/button';

// Test component to demonstrate the PaymentReceiver
// This can be accessed via /test-payment route for testing
export function PaymentReceiverTest() {
  const testLinkToken = 'test-payment-123';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <Card className="p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Payment Receiver Test</h1>
          <p className="text-muted-foreground mb-4">
            This is a test page to demonstrate the payment receiver functionality.
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Test Link Token:</strong> {testLinkToken}</p>
            <p><strong>URL Format:</strong> /p/{testLinkToken}</p>
            <p><strong>Full URL:</strong> {window.location.origin}/p/{testLinkToken}</p>
          </div>
          <div className="mt-4 space-y-2">
            <Button 
              onClick={() => window.open(`/p/${testLinkToken}`, '_blank')}
              className="w-full"
            >
              Open Payment Receiver in New Tab
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = `/p/${testLinkToken}`}
              className="w-full"
            >
              Navigate to Payment Receiver
            </Button>
          </div>
        </Card>
        
        {/* Show the PaymentReceiver component inline for testing */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 bg-primary text-primary-foreground">
            <h2 className="text-lg font-semibold">Inline Payment Receiver</h2>
            <p className="text-sm opacity-90">Testing with token: {testLinkToken}</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <PaymentReceiver linkToken={testLinkToken} />
          </div>
        </Card>
      </div>
    </div>
  );
}

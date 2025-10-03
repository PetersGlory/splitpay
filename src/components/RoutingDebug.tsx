import React from 'react';
import { Card } from './ui/card';

export function RoutingDebug() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Routing Debug Information</h1>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Current URL Information:</h3>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                <div><strong>Pathname:</strong> {window.location.pathname}</div>
                <div><strong>Host:</strong> {window.location.host}</div>
                <div><strong>Origin:</strong> {window.location.origin}</div>
                <div><strong>Full URL:</strong> {window.location.href}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Expected Behavior:</h3>
              <div className="bg-blue-50 p-3 rounded text-sm">
                <p>If you're on a <code>/p/...</code> URL, this should load the PaymentReceiver component.</p>
                <p>If you're seeing this page instead, there's a routing issue.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Test Links:</h3>
              <div className="space-y-2">
                <a 
                  href="/p/test-token-123" 
                  className="block bg-blue-600 text-white p-2 rounded text-center hover:bg-blue-700"
                >
                  Test Payment Link: /p/test-token-123
                </a>
                <a 
                  href="/payment" 
                  className="block bg-green-600 text-white p-2 rounded text-center hover:bg-green-700"
                >
                  Direct Payment Page: /payment
                </a>
                <a 
                  href="/" 
                  className="block bg-gray-600 text-white p-2 rounded text-center hover:bg-gray-700"
                >
                  Back to Home
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Vercel Configuration:</h3>
              <div className="bg-yellow-50 p-3 rounded text-sm">
                <p>The <code>vercel.json</code> should route <code>/p/*</code> to <code>/payment.html</code></p>
                <p>If this isn't working, check the Vercel deployment settings.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

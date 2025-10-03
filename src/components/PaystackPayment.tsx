import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { paystackService, PaystackConfig } from '../services/paystack';
import { PaymentAPI } from '../services/api';

interface PaystackPaymentProps {
  paymentData: any;
  linkToken: string;
  onSuccess: (transactionData: any) => void;
  onFailure: (error: string) => void;
  onCancel: () => void;
}

export function PaystackPayment({ 
  paymentData, 
  linkToken, 
  onSuccess, 
  onFailure, 
  onCancel 
}: PaystackPaymentProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    // Check if we have a reference from URL parameters (Paystack callback)
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('reference');
    const trxref = urlParams.get('trxref');
    
    if (ref || trxref) {
      const paymentRef = ref || trxref;
      setReference(paymentRef);
      handlePaymentVerification(paymentRef as string);
    }
  }, []);

  const handlePaymentVerification = async (paymentRef: string) => {
    setLoading(true);
    setError('');

    try {
      // Verify payment with our backend
      const response = await PaymentAPI.verifyPayment(
        paymentData.id,
        linkToken, // Using linkToken as participantId
        paymentRef
      );

      if (response.success) {
        onSuccess(response.data);
      } else {
        onFailure(response.error?.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      onFailure('Payment verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Initialize payment through our backend
      const response = await PaymentAPI.initializePayment(
        paymentData.id,
        linkToken, // Using linkToken as participantId
        {
          amount: paymentData.amount,
          paymentMethod: 'paystack',
          email: email.trim(),
          metadata: {
            paymentId: paymentData.id,
            linkToken: linkToken,
            description: paymentData.description,
            payerEmail: email.trim(),
          }
        }
      );

      if (response.success && response.data?.authorizationUrl) {
        // Redirect to Paystack payment page
        window.location.href = response.data?.authorizationUrl;
      } else {
        throw new Error(response.error?.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      setError('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  // Show verification status if we have a reference
  if (reference && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
          <p className="text-muted-foreground">
            Please wait while we verify your payment...
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Reference: {reference}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-border p-4">
        <div className="flex items-center justify-center">
          <div className="bg-blue-100 rounded-full px-4 py-2 text-blue-700 text-sm font-medium">
          SplitPay
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Payment Details */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">Pay with Paystack</h1>
              <p className="text-muted-foreground">Secure payment processing</p>
            </div>

            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₦{paymentData.amount.toLocaleString()}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{paymentData.description}</p>
                  </div>
                </div>

                {paymentData.user && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Requested by</p>
                      <p className="font-medium">
                        {paymentData.user.firstName} {paymentData.user.lastName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Form */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Payment Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                onClick={handlePayment}
                disabled={loading || !email.trim()}
                className="w-full h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ₦{paymentData.amount.toLocaleString()}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>

        {/* Security Notice */}
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">Secure Payment</p>
              <p className="text-xs text-green-700">
                Your payment is processed securely by Paystack. We never store your card details.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

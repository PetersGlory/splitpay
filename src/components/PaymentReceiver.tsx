import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowLeft, 
  CreditCard, 
  Building2, 
  Wallet, 
  Landmark, 
  DollarSign, 
  QrCode,
  User,
  FileText,
  Clock,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { PaymentAPI, PaymentRequest } from '../services/api';
import PaymentMethods from './PaymentMethods';
import PaymentProcessing from './PaymentProcessing';
import PaymentSuccess from './PaymentSuccess';
import PaymentFailure from './PaymentFailure';
import { PaystackPayment } from './PaystackPayment';

interface PaymentReceiverProps {
  linkToken: string;
}

type PaymentStep = 'details' | 'methods' | 'paystack' | 'processing' | 'success' | 'failure';

export function PaymentReceiver({ linkToken }: PaymentReceiverProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('details');
  const [paymentData, setPaymentData] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank-transfer');
  const [processingAmount, setProcessingAmount] = useState(0);

  // Fetch payment data on component mount
  useEffect(() => {
    const fetchPaymentData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const response = await PaymentAPI.getPaymentByLink(linkToken);
        if (response.success && response.data) {
          setPaymentData(response.data);
        } else {
          setError(response.error?.message || 'Payment request not found');
        }
      } catch (error) {
        console.error('Failed to fetch payment data:', error);
        setError('Failed to load payment request. Please check the link and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (linkToken) {
      fetchPaymentData();
    }
  }, [linkToken]);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setCurrentStep('methods');
  };

  const handlePaymentMethodConfirm = (method: string) => {
    setSelectedMethod(method);
    
    if (method === 'card' || method === 'paystack') {
      setCurrentStep('paystack');
    } else {
      handleMakePayment();
    }
  };

  const handleMakePayment = async () => {
    if (!paymentData) return;
    
    setProcessingAmount(paymentData.amount);
    setCurrentStep('processing');
    
    try {
      // For non-Paystack payment methods, use the existing API
      const response = await PaymentAPI.processParticipantPayment(
        paymentData.id,
        linkToken, // Using linkToken as participantId
        {
          amount: paymentData.amount,
          tipAmount: 0,
          paymentMethod: selectedMethod,
          paymentDetails: {
            // For bank transfer, USSD, etc.
          }
        }
      );

      if (response.success) {
        setCurrentStep('success');
      } else {
        setCurrentStep('failure');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setCurrentStep('failure');
    }
  };

  const handlePaystackSuccess = (transactionData: any) => {
    setCurrentStep('success');
  };

  const handlePaystackFailure = (error: string) => {
    console.error('Paystack payment failed:', error);
    setCurrentStep('failure');
  };

  const handlePaystackCancel = () => {
    setCurrentStep('methods');
  };

  const handleBack = () => {
    setCurrentStep('details');
  };

  const handleComplete = () => {
    // Redirect to home or close the payment window
    window.location.href = '/';
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'bank-transfer':
        return <Building2 className="w-5 h-5" />;
      case 'opay':
        return <Wallet className="w-5 h-5" />;
      case 'bank':
        return <Landmark className="w-5 h-5" />;
      case 'ussd':
        return <DollarSign className="w-5 h-5" />;
      case 'qr-code':
        return <QrCode className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Pay with Card';
      case 'bank-transfer':
        return 'Pay with Bank Transfer';
      case 'opay':
        return 'Pay with Opay';
      case 'bank':
        return 'Pay with Bank';
      case 'ussd':
        return 'Pay with USSD';
      case 'qr-code':
        return 'Pay with QR Code';
      default:
        return 'Payment Method';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading payment request...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-red-900 mb-2">Payment Request Not Found</h1>
          <p className="text-red-700 mb-4">
            {error || 'This payment link is invalid or has expired.'}
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Route to different steps
  switch (currentStep) {
    case 'methods':
      return (
        <PaymentMethods 
          onBack={handleBack}
          onPayment={handlePaymentMethodConfirm}
        />
      );
    case 'paystack':
      return (
        <PaystackPayment
          paymentData={paymentData}
          linkToken={linkToken}
          onSuccess={handlePaystackSuccess}
          onFailure={handlePaystackFailure}
          onCancel={handlePaystackCancel}
        />
      );
    case 'processing':
      return <PaymentProcessing />;
    case 'success':
      return (
        <PaymentSuccess 
          onComplete={handleComplete}
          amount={paymentData?.amount}
          transactionId={`TXN-${Date.now()}`}
          paymentMethod={getPaymentMethodLabel(selectedMethod)}
        />
      );
    case 'failure':
      return <PaymentFailure onRetry={handleBack} onComplete={handleComplete} />;
    default:
      break;
  }

  // Main payment details view
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-border p-4">
        <div className="flex items-center justify-center">
          <div className="bg-primary/10 rounded-full px-4 py-2 text-primary text-sm font-medium">
            SplitPay
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-md mx-auto">
        {/* Payment Request Details */}
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">Payment Request</h1>
              <p className="text-muted-foreground">You have been requested to make a payment</p>
            </div>

            <div className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary">
                  ₦{paymentData.amount.toLocaleString()}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{paymentData.description}</p>
                  </div>
                </div>

                {paymentData.user && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Requested by</p>
                      <p className="font-medium">
                        {paymentData.user.firstName} {paymentData.user.lastName}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant="secondary">
                      {paymentData.status === 'completed' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Security Notice */}
        <Card className="p-4 mb-6 border-green-200 bg-green-50">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">Secure Payment</p>
              <p className="text-xs text-green-700">
                Your payment is protected by bank-level security. SpleetPay never stores your card details.
              </p>
            </div>
          </div>
        </Card>


        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>Powered by SpleetPay • Secure & Fast Payments</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { ArrowLeft, Share2, Copy, MessageSquare, Mail, Check, Users, Phone, Send, Eye, CreditCard, Building2, Smartphone, CheckCircle, Wallet, Shield, TrendingUp, Clock, DollarSign, Loader2 } from 'lucide-react';
import { useCurrency } from '../App';
import { PaymentAPI, PaymentRequest, Participant } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AuthScreen } from './AuthScreen';

interface SplitPaymentProps {
  paymentData: any;
  onNavigate: (screen: string) => void;
  accountData?: any;
}

export function SplitPayment({ paymentData, onNavigate, accountData }: SplitPaymentProps) {
  const { currencySymbol } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentPaymentData, setCurrentPaymentData] = useState(paymentData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {isAuthenticated, user} = useAuth();

  if (!paymentData) {
    return null;
  }
  // Fetch real-time payment data
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!paymentData.id) return;
      
      setLoading(true);
      try {
        const response = await PaymentAPI.getPaymentRequest(paymentData.id);
        if (response.success && response.data) {
          setCurrentPaymentData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch payment data:', error);
        setError('Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchPaymentData, 30000);
    
    return () => clearInterval(interval);
  }, [paymentData.id]);

  // Use current payment data or fallback to initial data
  const paymentDataToUse = currentPaymentData || paymentData;

  const totalAmount = parseFloat(paymentDataToUse.amount);
  const participants = paymentDataToUse.participants || [];
  const paidAmount = participants.filter((p: Participant) => p.hasPaid).reduce((sum: number, p: Participant) => sum + p.amount, 0);
  const progressPercentage = (paidAmount / totalAmount) * 100;

  const getPaymentMethodIcon = (method: string) => {
    if (method?.includes('Card')) return <CreditCard className="w-4 h-4" />;
    if (method?.includes('Bank')) return <Building2 className="w-4 h-4" />;
    if (method?.includes('Mobile')) return <Smartphone className="w-4 h-4" />;
    return <CreditCard className="w-4 h-4" />;
  };
  

  const PaymentDetailsDialog = ({ participant }: { participant: any }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          <Eye className="w-3 h-3 mr-1" />
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            View detailed information about this payment transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Participant:</span>
            <span className="font-medium">{participant.isCurrentUser ? 'You' : participant.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount:</span>
            <span className="font-medium">{currencySymbol}{participant.amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment Method:</span>
            <div className="flex items-center gap-2">
              {getPaymentMethodIcon(participant.paymentMethod)}
              <span className="text-sm">{participant.paymentMethod}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Paid At:</span>
            <span className="text-sm">{participant.paidAt}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant="default" className="bg-green-500">
              <Check className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const PaymentProcessingDialog = () => (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Processing Payment</DialogTitle>
          <DialogDescription>
            Please wait while we process your payment securely.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              {paymentProcessing && (
                <div className="absolute -top-1 -right-1">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="font-medium">Securing your payment...</p>
              <p className="text-sm text-muted-foreground">This may take a few seconds</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Amount:</span>
              <span className="font-medium">{currencySymbol}{(totalAmount / participants.length).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Payment Method:</span>
              <span className="text-sm">Card ending in 4532</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const copyPaymentLink = async (participantId: string) => {
    const paymentUrl = `${process.env.PAYMENT_LINK_DOMAIN || 'https://pay.app'}/p/${participantId}`;
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(paymentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = paymentUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (fallbackErr) {
          console.error('Fallback copy failed:', fallbackErr);
          // Show the URL to user as a last resort
          alert(`Copy this link: ${paymentUrl}`);
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Show the URL to user as a fallback
      alert(`Copy this link: ${paymentUrl}`);
    }
  };

  const shareViaWhatsApp = (participant: any) => {
    const paymentUrl = `${process.env.PAYMENT_LINK_DOMAIN || 'https://pay.app'}/p/${participant.id}`;
    const message = `Hi ${participant.name}! You need to pay ${currencySymbol}${participant.amount.toFixed(2)} for "${paymentData.description}". Pay here: ${paymentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = (participant: any) => {
    const paymentUrl = `${process.env.PAYMENT_LINK_DOMAIN || 'https://pay.app'}/p/${participant.id}`;
    const subject = `Payment Request - ${paymentData.description}`;
    const body = `Hi ${participant.name},\\n\\nYou need to pay ${currencySymbol}${participant.amount.toFixed(2)} for "${paymentData.description}".\\n\\nPay here: ${paymentUrl}\\n\\nThanks!`;
    window.open(`mailto:${participant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const shareViaSMS = (participant: any) => {
    const paymentUrl = `${process.env.PAYMENT_LINK_DOMAIN || 'https://pay.app'}/p/${participant.id}`;
    const message = `Hi ${participant.name}! You need to pay ${currencySymbol}${participant.amount.toFixed(2)} for "${paymentData.description}". Pay here: ${paymentUrl}`;
    window.open(`sms:${participant.phone}?body=${encodeURIComponent(message)}`, '_blank');
  };

  const sendInvitesToAll = () => {
    const unpaidParticipants = participants.filter(p => !p.hasPaid);
    unpaidParticipants.forEach(participant => {
      if (participant.email) {
        shareViaEmail(participant);
      } else if (participant.phone) {
        shareViaSMS(participant);
      } else {
        shareViaWhatsApp(participant);
      }
    });
  };

  const handlePayNow = async (participant: any) => {
    setPaymentProcessing(true);
    setShowPaymentDialog(true);
    
    try {
      // Process payment through API
      const response = await PaymentAPI.processParticipantPayment(
        paymentDataToUse.id,
        participant.id,
        {
          amount: participant.amount,
          tipAmount: 0,
          paymentMethod: 'card',
          paymentDetails: {
            cardNumber: '4532****1234', // In real app, this would come from form
            cvv: '123',
            expiryMonth: '12',
            expiryYear: '2025'
          }
        }
      );

      if (response.success) {
        // Refresh payment data
        const refreshResponse = await PaymentAPI.getPaymentRequest(paymentDataToUse.id);
        if (refreshResponse.success && refreshResponse.data) {
          setCurrentPaymentData(refreshResponse.data);
        }
        setPaymentProcessing(false);
        setShowPaymentDialog(false);
      } else {
        setError(response.error?.message || 'Payment failed');
        setPaymentProcessing(false);
        setShowPaymentDialog(false);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setError('Payment processing failed. Please try again.');
      setPaymentProcessing(false);
      setShowPaymentDialog(false);
    }
  };

  // Note: Authentication is no longer required for viewing split payments
  // Users can view and participate in split payments without logging in
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('home')}
          className="mr-3 p-2 lg:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl">Split Payment</h1>
          <p className="text-muted-foreground lg:text-lg">Track and collect payments</p>
        </div>
      </div>

      {/* Payment Summary */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3>{paymentData.description}</h3>
              <p className="text-muted-foreground">Split between {paymentData.participants.length} people</p>
            </div>
            <Badge variant="secondary">
              {progressPercentage >= 100 ? 'Completed' : 'Collecting'}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">{currencySymbol}{totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Collected:</span>
              <span className="text-green-600">{currencySymbol}{paidAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Remaining:</span>
              <span className="text-red-600">{currencySymbol}{(totalAmount - paidAmount).toFixed(2)}</span>
            </div>
            
            <Progress value={progressPercentage} className="w-full" />
          </div>
        </div>
      </Card>

      {/* Participants Status */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3>Participants</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={sendInvitesToAll}
              className="text-primary"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Send All Invites
            </Button>
          </div>
          
          <div className="space-y-3">
            {participants.map((participant: Participant, index: number) => (
              <div key={participant.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {participant.name || `Person ${index + 1}`}
                      </p>
                      <p className="text-sm text-muted-foreground">{currencySymbol}{participant.amount.toFixed(2)}</p>
                      
                      {participant.hasPaid && participant.paymentMethod && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {getPaymentMethodIcon(participant.paymentMethod)}
                          <span>{participant.paymentMethod}</span>
                          <span>•</span>
                          <span>{participant.paidAt ? new Date(participant.paidAt).toLocaleString() : 'Recently'}</span>
                        </div>
                      )}
                      
                      {!participant.hasPaid && (participant.email || participant.phone) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {participant.email && <span>📧 {participant.email}</span>}
                          {participant.email && participant.phone && <span> • </span>}
                          {participant.phone && <span>📱 {participant.phone}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {participant.hasPaid ? (
                      <>
                        <Badge variant="default" className="bg-green-500">
                          Paid
                        </Badge>
                        <PaymentDetailsDialog participant={participant} />
                      </>
                    ) : (
                      <Badge variant="secondary">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
                
                {!participant.hasPaid && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => handlePayNow(participant)}
                      disabled={paymentProcessing}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="sm"
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Pay Now
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyPaymentLink(participant.id)}
                        className="text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Link
                      </Button>
                      
                      {participant.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareViaEmail(participant)}
                          className="text-xs"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </Button>
                      )}
                      
                      {participant.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareViaSMS(participant)}
                          className="text-xs"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          SMS
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareViaWhatsApp(participant)}
                        className="text-xs"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Account Creation Promotion - Only show when split payment is completed and user doesn't have account */}
      {progressPercentage >= 100 && !accountData && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-primary/5 border-green-200/50 animate-slideInUp">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-green-800">Split Payment Completed!</h3>
              </div>
              <Badge variant="secondary" className="bg-primary/20 text-primary">Premium</Badge>
            </div>
            
            <p className="text-sm text-green-700">
              🎉 All payments collected! Want to track future split payments and access premium features?
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-green-700">
                <Clock className="w-4 h-4" />
                <span>12 Month History</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <Wallet className="w-4 h-4" />
                <span>Virtual Wallet</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <Shield className="w-4 h-4" />
                <span>Enhanced Security</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-4 h-4" />
                <span>Payment Analytics</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => onNavigate('account-setup')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Create Free Account
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onNavigate('home')}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Individual Payment Links */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3>Individual Payment Links</h3>
          <p className="text-sm text-muted-foreground">
            Each person gets their own secure payment link
          </p>
          
          <div className="space-y-3">
            {participants.filter((p: Participant) => !p.hasPaid).map((participant: Participant, index: number) => (
              <div key={participant.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {participant.name || `Person ${index + 1}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{currencySymbol}{participant.amount.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPaymentLink(participant.id)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareViaWhatsApp(participant)}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {copied && (
        <div className="text-center">
          <p className="text-sm text-green-600">Payment link copied to clipboard!</p>
        </div>
      )}

      {/* Payment Processing Dialog */}
      <PaymentProcessingDialog />

      {/* Actions */}
      <div className="space-y-3 pb-4">
        <Button
          variant="outline"
          onClick={() => onNavigate('home')}
          className="w-full h-12"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
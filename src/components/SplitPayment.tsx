import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { ArrowLeft, Share2, Copy, MessageSquare, Mail, Check, Users, Phone, Send, Eye, CreditCard, Building2, Smartphone, CheckCircle, Wallet, Shield, TrendingUp, Clock, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { useCurrency } from '../App';
import { copyWithFallback } from '../utils/clipboard';
import { PAYSTACK_CONFIG } from '../config/paystack';
import { PaymentAPI } from '../services/api';

interface SpleetPaymentProps {
  paymentData: any;
  onNavigate: (screen: string) => void;
  accountData?: any;
}

export function SpleetPayment({ paymentData, onNavigate, accountData }: SpleetPaymentProps) {
  const { currencySymbol } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  if (!paymentData) {
    return null;
  }

  // Mock payment method data for participants who have paid
  const mockPaymentMethods = [
    'Card ending in 4532',
    'Bank Transfer - First Bank',
    'Card ending in 7891',
    'Mobile Money - MTN',
    'Bank Transfer - GTBank'
  ];

  // Add payment method details to participants
  const participantsWithPaymentDetails = paymentData.participants.map((participant: any, index: number) => ({
    ...participant,
    isCurrentUser: index === 0, // First participant is considered "You"
    paymentMethod: participant.isPayer ? mockPaymentMethods[index % mockPaymentMethods.length] : null,
    paidAt: participant.isPayer ? (() => {
      const hours = Math.floor(Math.random() * 24) + 1;
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    })() : null
  }));

  const totalAmount = parseFloat(paymentData.amount);
  const paidAmount = participantsWithPaymentDetails.filter(p => p.isPayer).length * (totalAmount / participantsWithPaymentDetails.length);
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

  const PaymentProcessingDialog = () => {
    const currentParticipant = participantsWithPaymentDetails.find(p => p.isCurrentUser);
    const participantAmount = currentParticipant ? Number(currentParticipant.amount).toFixed(2) : '0.00';
    
    return (
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              You will be redirected to Paystack to complete your payment securely.
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
                <p className="font-medium">Redirecting to Paystack...</p>
                <p className="text-sm text-muted-foreground">Secure payment processing</p>
              </div>
            </div>
            
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm">Amount:</span>
                <span className="font-medium">{currencySymbol}{participantAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Description:</span>
                <span className="text-sm text-right max-w-[200px] truncate">{paymentData.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Payment Provider:</span>
                <span className="text-sm">Paystack</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const copyPaymentLink = async (participantId: string) => {
    console.log(paymentData)
    const paymentUrl = `${participantId}`;
    const success = await copyWithFallback(paymentUrl, `Copy this link: ${paymentUrl}`);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWhatsApp = (participant: any) => {
    const paymentUrl =`${participant.participantLink}`;
    const message = `Hi ${participant.name}! You need to pay ${currencySymbol}${participant.amount.toFixed(2)} for "${paymentData.description}". Pay here: ${paymentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = (participant: any) => {
    const paymentUrl =`${participant.participantLink}`;
    const subject = `Payment Request - ${paymentData.description}`;
    const body = `Hi ${participant.name},\\n\\nYou need to pay ${currencySymbol}${participant.amount.toFixed(2)} for "${paymentData.description}".\\n\\nPay here: ${paymentUrl}\\n\\nThanks!`;
    window.open(`mailto:${participant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const shareViaSMS = (participant: any) => {
    const paymentUrl =`${participant.participantLink}`;
    const message = `Hi ${participant.name}! You need to pay ${currencySymbol}${participant.amount.toFixed(2)} for "${paymentData.description}". Pay here: ${paymentUrl}`;
    window.open(`sms:${participant.phone}?body=${encodeURIComponent(message)}`, '_blank');
  };

  const sendInvitesToAll = () => {
    const unpaidParticipants = paymentData.participants.filter(p => !p.isPayer);
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

  // Load Paystack script if not already loaded
  const loadPaystackScript = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).PaystackPop) {
        resolve((window as any).PaystackPop);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve((window as any).PaystackPop);
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  };

  // Paystack payment success callback
  const onPaystackSuccess = async (reference: any) => {
    setPaymentProcessing(false);
    setShowPaymentDialog(false);
    setPaymentError('');
    
    try {
      // Find the participant who just paid
      const currentParticipant = participantsWithPaymentDetails.find(p => p.isCurrentUser);
      
      if (currentParticipant) {
        // Verify payment with backend
        const verificationResponse = await PaymentAPI.verifyPayment(
          paymentData.id,
          currentParticipant.id,
          reference.reference
        );
        
        if (verificationResponse.success) {
          setPaymentSuccess('Payment successful! Your contribution has been recorded.');
          
          // Update participant status
          currentParticipant.isPayer = true;
          currentParticipant.paymentMethod = 'Card Payment';
          currentParticipant.paidAt = 'Just now';
          
          // Show success message for 3 seconds then refresh
          setTimeout(() => {
            setPaymentSuccess('');
            window.location.reload();
          }, 3000);
        } else {
          setPaymentError('Payment verification failed. Please contact support.');
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setPaymentError('Payment verification failed. Please contact support.');
    }
  };

  // Paystack payment close callback
  const onPaystackClose = () => {
    setPaymentProcessing(false);
    setShowPaymentDialog(false);
    setPaymentError('Payment was cancelled.');
  };

  const handlePayNow = async (participant: any) => {
    setPaymentProcessing(true);
    setShowPaymentDialog(true);
    setPaymentError('');
    setPaymentSuccess('');
    
    try {
      // Load Paystack script
      const PaystackPop = await loadPaystackScript();
      
      // Prepare payment data
      const amount = Number(participant.amount) * 100; // Convert to kobo
      const email = participant.email || accountData?.email || 'user@example.com';
      const reference = `split_payment_${participant.id}_${Date.now()}`;
      
      // Initialize Paystack payment
      const handler = (PaystackPop as any).setup({
        key: PAYSTACK_CONFIG.publicKey,
        email: email,
        amount: amount,
        currency: paymentData.currency || 'NGN',
        ref: reference,
        metadata: {
          participantId: participant.id,
          paymentRequestId: paymentData.id,
          participantName: participant.name,
          description: paymentData.description
        },
        callback: (response: any) => {
          onPaystackSuccess(response);
        },
        onClose: () => {
          onPaystackClose();
        }
      });
      
      // Open payment modal
      handler.openIframe();
      
    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
      setPaymentProcessing(false);
      setShowPaymentDialog(false);
    }
  };

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
            {participantsWithPaymentDetails.map((participant: any, index: number) => (
              <div key={participant.id} className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {participant.isCurrentUser ? (
                        <DollarSign className="w-5 h-5 text-primary" />
                      ) : (
                        <Users className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {participant.isCurrentUser ? 'You' : participant.name || `Person ${index + 1}`}
                      </p>
                      <p className="text-sm text-muted-foreground">{currencySymbol}{Number(participant.amount).toFixed(2)}</p>
                      
                      {participant.isPayer && participant.paymentMethod && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          {getPaymentMethodIcon(participant.paymentMethod)}
                          <span>{participant.paymentMethod}</span>
                          <span>•</span>
                          <span>{participant.paidAt}</span>
                        </div>
                      )}
                      
                      {!participant.isPayer && (participant.email || participant.phone) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {participant.email && <span>📧 {participant.email}</span>}
                          {participant.email && participant.phone && <span> • </span>}
                          {participant.phone && <span>📱 {participant.phone}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {participant.isPayer ? (
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
                
                {!participant.isPayer && (
                  <div className="flex gap-2 mt-3">
                    {participant.isCurrentUser ? (
                      <Button
                        onClick={() => handlePayNow(participant)}
                        disabled={paymentProcessing}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        size="sm"
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        Pay Now
                      </Button>
                    ) : (
                      <>
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
                      </>
                    )}
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
            {paymentData.participants.filter((p: any) => !p.isPayer).map((participant: any, index: number) => (
              <div key={participant.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {participant.isCurrentUser ? 'You' : participant.name || `Person ${index + 1}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{currencySymbol}{Number(participant.amount).toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPaymentLink(participant.participantLink)}
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

      {/* Payment Success Message */}
      {paymentSuccess && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">{paymentSuccess}</p>
          </div>
        </div>
      )}

      {/* Payment Error Message */}
      {paymentError && (
        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{paymentError}</p>
          </div>
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
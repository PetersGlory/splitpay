import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Share2, Copy, MessageSquare, Mail, QrCode, Check, Phone, Send, Facebook, Twitter, Clock, CheckCircle, Eye, RefreshCw, Wallet, Shield, TrendingUp } from 'lucide-react';
import { useCurrency } from '../App';

interface PaymentLinkProps {
  paymentData: any;
  onNavigate: (screen: string) => void;
  accountData?: any;
}

export function PaymentLink({ paymentData, onNavigate, accountData }: PaymentLinkProps) {
  const { currencySymbol } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [linkActivity, setLinkActivity] = useState({
    views: 0,
    lastViewed: null as string | null,
    paymentMethod: null as string | null,
    paidAt: null as string | null
  });

  if (!paymentData) {
    return null;
  }

  // Simulate real-time status updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setLinkActivity({
        views: 3,
        lastViewed: '2 minutes ago',
        paymentMethod: null,
        paidAt: null
      });
    }, 2000);

    // Simulate payment completion after some time
    const paymentTimer = setTimeout(() => {
      const shouldComplete = Math.random() > 0.7; // 30% chance of completion for demo
      if (shouldComplete) {
        setPaymentStatus('completed');
        setLinkActivity(prev => ({
          ...prev,
          paymentMethod: 'Card ending in 4532',
          paidAt: 'Just now'
        }));
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(paymentTimer);
    };
  }, []);

  const paymentUrl = `https://pay.app/link/${paymentData.id}`;

  const copyToClipboard = async () => {
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

  const shareViaWhatsApp = () => {
    const message = `Hi! Could you please pay for my ${paymentData.description}? Amount: ${currencySymbol}${paymentData.amount}. Pay here: ${paymentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Payment Request - ${paymentData.description}`;
    const body = `Hi,\n\nCould you please pay for my ${paymentData.description}?\n\nAmount: ${currencySymbol}${paymentData.amount}\nPay here: ${paymentUrl}\n\nThanks!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const shareViaSMS = () => {
    const message = `Hi! Could you please pay for my ${paymentData.description}? Amount: ${currencySymbol}${paymentData.amount}. Pay here: ${paymentUrl}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaTelegram = () => {
    const message = `Hi! Could you please pay for my ${paymentData.description}? Amount: ${currencySymbol}${paymentData.amount}. Pay here: ${paymentUrl}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(paymentUrl)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaTwitter = () => {
    const message = `Payment request: ${paymentData.description} - ${currencySymbol}${paymentData.amount}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(paymentUrl)}`, '_blank');
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(paymentUrl)}`, '_blank');
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
          <h1 className="text-2xl lg:text-3xl">Payment Link Created</h1>
          <p className="text-muted-foreground lg:text-lg">Share this link to receive payment</p>
        </div>
      </div>

      {/* Payment Details */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3>Payment Request</h3>
              <p className="text-muted-foreground">{paymentData.description}</p>
            </div>
            <Badge 
              variant={paymentStatus === 'completed' ? 'default' : 'secondary'}
              className={paymentStatus === 'completed' ? 'bg-green-500' : ''}
            >
              {paymentStatus === 'completed' ? (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Paid
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </div>
              )}
            </Badge>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg">
              <span>Amount:</span>
              <span className="font-semibold">{currencySymbol}{paymentData.amount}</span>
            </div>
            {paymentData.recipientName && (
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>For:</span>
                <span>{paymentData.recipientName}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Payment Status Tracking */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>Payment Status</h3>
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </div>
          
          <div className="space-y-3">
            {paymentStatus === 'pending' ? (
              <>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Waiting for payment</span>
                  </div>
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                
                {linkActivity.views > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Link viewed {linkActivity.views} times</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{linkActivity.lastViewed}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Payment completed!</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{linkActivity.paidAt}</span>
                </div>
                
                {linkActivity.paymentMethod && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Payment method:</span>
                    <span className="text-sm font-medium">{linkActivity.paymentMethod}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Amount received:</span>
                  <span className="text-sm font-medium text-green-600">{currencySymbol}{paymentData.amount}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Account Creation Promotion - Only show when payment is completed and user doesn't have account */}
      {paymentStatus === 'completed' && !accountData && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-primary/5 border-green-200/50 animate-slideInUp">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-green-800">Payment Successful!</h3>
              </div>
              <Badge variant="secondary" className="bg-primary/20 text-primary">Premium</Badge>
            </div>
            
            <p className="text-sm text-green-700">
              🎉 Great! Want to track all your payments and access premium features?
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

      {/* QR Code */}
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h3>QR Code</h3>
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-white border-2 border-border rounded-lg flex items-center justify-center">
              <div className="w-40 h-40 bg-gradient-to-br from-black to-gray-600 rounded-lg flex items-center justify-center">
                <QrCode className="w-20 h-20 text-white" />
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Scan this QR code to pay</p>
        </div>
      </Card>

      {/* Payment Link */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3>Payment Link</h3>
          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm text-muted-foreground truncate">
              {paymentUrl}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-sm text-green-600 text-center">Link copied to clipboard!</p>
          )}
        </div>
      </Card>

      {/* Share Options */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3>Share Payment Link</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={shareViaWhatsApp}
              >
                <MessageSquare className="w-6 h-6 mb-2 text-green-600" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={shareViaSMS}
              >
                <Phone className="w-6 h-6 mb-2 text-blue-600" />
                <span className="text-xs">SMS</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={shareViaEmail}
              >
                <Mail className="w-6 h-6 mb-2 text-red-600" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={shareViaTelegram}
              >
                <Send className="w-6 h-6 mb-2 text-blue-500" />
                <span className="text-xs">Telegram</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={shareViaTwitter}
              >
                <Twitter className="w-6 h-6 mb-2 text-blue-400" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto"
                onClick={shareViaFacebook}
              >
                <Facebook className="w-6 h-6 mb-2 text-blue-700" />
                <span className="text-xs">Facebook</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-3 pb-4">
        <Button
          onClick={() => navigator.share?.({ url: paymentUrl, title: 'Payment Request' }) || copyToClipboard()}
          className="w-full h-12"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share Link
        </Button>
        
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
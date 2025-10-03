import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle,
  Copy,
  Share2,
  Download,
  Users,
  Calendar,
  DollarSign,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import { useCurrency } from '../App';
import { PaymentRequest } from '../services/api';
import { copyWithFallback } from '../utils/clipboard';

interface TransactionDetailsProps {
  payment: PaymentRequest;
  onNavigate: (screen: string) => void;
}

export function TransactionDetails({ payment, onNavigate }: TransactionDetailsProps) {
  const { currencySymbol } = useCurrency();
  const [copiedLink, setCopiedLink] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG').format(amount);
  };

  const getProgress = () => {
    if (!payment.participants) return 0;
    const paidCount = payment.participants.filter(p => p.hasPaid).length;
    return Math.round((paidCount / payment.participants.length) * 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="gradient-success text-white border-0">Completed</Badge>;
      case 'pending':
        return <Badge className="gradient-info text-white border-0">Pending</Badge>;
      case 'partial':
        return <Badge className="gradient-warning text-white border-0">Partial</Badge>;
      case 'failed':
      case 'cancelled':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const copyToClipboard = async (text: string) => {
    const success = await copyWithFallback(text, `Copy this link: ${text}`);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-3 lg:space-y-4">
      {/* Header */}
      <div className="glass-card-strong rounded-2xl lg:rounded-3xl p-4 lg:p-6 border-white/60 shadow-lg">
        <div className="flex items-center mb-3 lg:mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('history')}
            className="mr-3 -ml-2 w-9 h-9 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg lg:text-2xl mb-1">Transaction Details</h1>
            <p className="text-xs lg:text-sm text-muted-foreground">Payment reference</p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status</span>
          {getStatusBadge(payment.status)}
        </div>
      </div>

      {/* Amount Card */}
      <Card className="glass-card-strong border-white/60 p-5 lg:p-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Total Amount</p>
          <div className="text-3xl lg:text-4xl gradient-primary bg-clip-text text-transparent mb-1">
            {currencySymbol}{formatAmount(payment.amount)}
          </div>
          <p className="text-xs text-muted-foreground">{payment.currency}</p>
        </div>
      </Card>

      {/* Payment Information */}
      <Card className="glass-card-strong border-white/60 p-4 lg:p-5">
        <h3 className="text-sm lg:text-base mb-3 lg:mb-4">Payment Information</h3>
        
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm">{payment.description}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(payment.createdAt)}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <LinkIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Payment Type</p>
                <p className="text-sm capitalize">{payment.type.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {payment.paymentLink && (
            <>
              <Separator />
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <LinkIcon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Payment Link</p>
                    <p className="text-xs text-primary truncate">{payment.paymentLink}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(payment.paymentLink!)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Participants (for group splits) */}
      {payment.type === 'group_split' && payment.participants && payment.participants.length > 0 && (
        <Card className="glass-card-strong border-white/60 p-4 lg:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm lg:text-base">Participants ({payment.participants.length})</h3>
            </div>
            <span className="text-xs text-muted-foreground">{getProgress()}% paid</span>
          </div>

          <Progress value={getProgress()} className="h-2 mb-4" />

          <div className="space-y-2">
            {payment.participants.map((participant, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 glass-card rounded-xl border-white/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs text-white ${
                    participant.hasPaid ? 'gradient-success' : 'gradient-info'
                  }`}>
                    {participant.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm">{participant.name}</p>
                    <p className="text-xs text-muted-foreground">{participant.email || participant.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">{currencySymbol}{formatAmount(participant.amount)}</p>
                  {participant.hasPaid ? (
                    <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                  ) : (
                    <Clock className="w-4 h-4 text-blue-600 ml-auto" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 lg:gap-3">
        <Button
          variant="outline"
          className="glass-card border-white/40 hover:border-primary/30 h-10 lg:h-11"
          onClick={() => payment.paymentLink && copyToClipboard(payment.paymentLink)}
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </Button>
        <Button
          variant="outline"
          className="glass-card border-white/40 hover:border-primary/30 h-10 lg:h-11"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}
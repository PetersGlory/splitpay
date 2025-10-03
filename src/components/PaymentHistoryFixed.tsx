import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LoadingSpinner } from './LoadingSpinner';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw,
  Eye,
  Share2,
  History,
  TrendingUp
} from 'lucide-react';
import { useCurrency } from '../App';
import { PaymentAPI, PaymentRequest } from '../services/api';

interface PaymentHistoryProps {
  onNavigate: (screen: string) => void;
  onViewDetails?: (payment: PaymentRequest) => void;
}

export function PaymentHistory({ onNavigate, onViewDetails }: PaymentHistoryProps) {
  const { currencySymbol } = useCurrency();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    setLoading(true);
    
    try {
      const response = await PaymentAPI.getPaymentHistory();
      
      if (response.success && response.data) {
        setPayments(response.data.payments);
      }
    } catch (error) {
      console.error('Failed to load payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPaymentHistory();
    setRefreshing(false);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getProgress = (payment: PaymentRequest) => {
    if (!payment.participants) return 0;
    const paidCount = payment.participants.filter(p => p.hasPaid).length;
    return Math.round((paidCount / payment.participants.length) * 100);
  };

  const activePayments = payments.filter(p => p.status === 'pending' || p.status === 'partial');
  const completedPayments = payments.filter(p => p.status === 'completed');
  const failedPayments = payments.filter(p => p.status === 'failed' || p.status === 'cancelled');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
      case 'partial':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="gradient-success text-white border-0 text-xs">Completed</Badge>;
      case 'pending':
        return <Badge className="gradient-info text-white border-0 text-xs">Pending</Badge>;
      case 'partial':
        return <Badge className="gradient-warning text-white border-0 text-xs">Partial</Badge>;
      case 'failed':
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const renderPaymentCard = (payment: PaymentRequest) => (
    <Card 
      key={payment.id} 
      className="glass-card-strong border-white/60 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
    >
      <div className="p-3.5 lg:p-5">
        <div className="flex items-start justify-between mb-2 lg:mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 lg:gap-2 mb-1.5 lg:mb-2">
              <h4 className="text-sm lg:text-base truncate">{payment.description}</h4>
              {getStatusBadge(payment.status)}
            </div>
            <div className="flex items-center gap-2 lg:gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span className="truncate">{formatDate(payment.createdAt)}</span>
              </span>
              {payment.type === 'group_split' && payment.participants && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {payment.participants.length} people
                </span>
              )}
            </div>
          </div>
          
          <div className="text-right flex-shrink-0">
            <div className="text-base lg:text-lg gradient-primary bg-clip-text text-transparent">
              {currencySymbol}{formatAmount(payment.amount)}
            </div>
            <div className="text-[10px] lg:text-xs text-muted-foreground">{payment.currency}</div>
          </div>
        </div>

        {payment.type === 'group_split' && payment.participants && (
          <div className="space-y-1.5 lg:space-y-2 mt-2.5 lg:mt-3 pt-2.5 lg:pt-3 border-t border-white/40">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Payment Progress</span>
              <span>{getProgress(payment)}%</span>
            </div>
            <Progress value={getProgress(payment)} className="h-1.5 lg:h-2" />
          </div>
        )}

        <div className="flex gap-2 mt-3 lg:mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 glass-card border-white/40 hover:border-primary/30 h-9 text-xs"
            onClick={() => onViewDetails?.(payment)}
          >
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
          {payment.status === 'pending' || payment.status === 'partial' ? (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 glass-card border-white/40 hover:border-primary/30 h-9 text-xs"
            >
              <Share2 className="w-3 h-3 mr-1" />
              Share Link
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading payment history..." />
      </div>
    );
  }

  return (
    <div className="space-y-3 lg:space-y-6">
      {/* Header */}
      <div className="glass-card-strong rounded-2xl lg:rounded-3xl p-4 lg:p-6 border-white/60 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('home')}
              className="mr-2 lg:mr-3 -ml-2 lg:hidden w-9 h-9 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-1.5 lg:gap-2 mb-0.5 lg:mb-1">
                <History className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                <h1 className="text-base lg:text-xl">Payment History</h1>
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground">Track all your payments</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="glass-card border-white/40 hover:border-primary/30 h-8 w-8 lg:h-9 lg:w-auto lg:px-3 p-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 lg:gap-3">
        <Card className="p-3 lg:p-4 glass-card-strong border-white/60 text-center">
          <div className="text-xl lg:text-2xl gradient-info bg-clip-text text-transparent mb-0.5 lg:mb-1">
            {activePayments.length}
          </div>
          <p className="text-[10px] lg:text-xs text-muted-foreground">Active</p>
        </Card>
        <Card className="p-3 lg:p-4 glass-card-strong border-white/60 text-center">
          <div className="text-xl lg:text-2xl gradient-success bg-clip-text text-transparent mb-0.5 lg:mb-1">
            {completedPayments.length}
          </div>
          <p className="text-[10px] lg:text-xs text-muted-foreground">Completed</p>
        </Card>
        <Card className="p-3 lg:p-4 glass-card-strong border-white/60 text-center">
          <div className="text-xl lg:text-2xl gradient-primary bg-clip-text text-transparent mb-0.5 lg:mb-1">
            {payments.length}
          </div>
          <p className="text-[10px] lg:text-xs text-muted-foreground">Total</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-card-strong border-white/60 h-9 lg:h-11 p-1">
          <TabsTrigger value="all" className="text-[10px] lg:text-xs px-1">All ({payments.length})</TabsTrigger>
          <TabsTrigger value="active" className="text-[10px] lg:text-xs px-1">Active ({activePayments.length})</TabsTrigger>
          <TabsTrigger value="completed" className="text-[10px] lg:text-xs px-1">Done ({completedPayments.length})</TabsTrigger>
          <TabsTrigger value="failed" className="text-[10px] lg:text-xs px-1">Failed ({failedPayments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2 lg:space-y-3 mt-3 lg:mt-4">
          {payments.length > 0 ? (
            payments.map(renderPaymentCard)
          ) : (
            <Card className="p-6 lg:p-8 text-center glass-card-strong border-white/60">
              <History className="w-10 h-10 lg:w-12 lg:h-12 text-muted-foreground mx-auto mb-2 lg:mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No payment history yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('home')}
                className="mt-3 lg:mt-4 glass-card border-white/40 h-9"
              >
                Create Payment
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-2 lg:space-y-3 mt-3 lg:mt-4">
          {activePayments.length > 0 ? (
            activePayments.map(renderPaymentCard)
          ) : (
            <Card className="p-6 lg:p-8 text-center glass-card-strong border-white/60">
              <Clock className="w-10 h-10 lg:w-12 lg:h-12 text-muted-foreground mx-auto mb-2 lg:mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No active payments</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-2 lg:space-y-3 mt-3 lg:mt-4">
          {completedPayments.length > 0 ? (
            completedPayments.map(renderPaymentCard)
          ) : (
            <Card className="p-6 lg:p-8 text-center glass-card-strong border-white/60">
              <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12 text-muted-foreground mx-auto mb-2 lg:mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No completed payments</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="failed" className="space-y-2 lg:space-y-3 mt-3 lg:mt-4">
          {failedPayments.length > 0 ? (
            failedPayments.map(renderPaymentCard)
          ) : (
            <Card className="p-6 lg:p-8 text-center glass-card-strong border-white/60">
              <XCircle className="w-10 h-10 lg:w-12 lg:h-12 text-muted-foreground mx-auto mb-2 lg:mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No failed payments</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
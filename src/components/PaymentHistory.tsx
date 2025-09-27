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
  Users, 
  Link as LinkIcon,
  RefreshCw,
  Eye,
  Share2
} from 'lucide-react';
import { useCurrency } from '../App';
import { PaymentAPI, PaymentRequest } from '../services/api';

interface PaymentHistoryProps {
  onNavigate: (screen: string) => void;
}

export function PaymentHistory({ onNavigate }: PaymentHistoryProps) {
  const { currencySymbol } = useCurrency();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await PaymentAPI.getPaymentHistory();
      
      if (response.success && response.data) {
        setPayments(response.data.payments);
      } else {
        setError(response.error?.message || 'Failed to load payment history');
      }
    } catch (error) {
      console.error('Failed to load payment history:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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

  // Filter payments by status
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Payment Link Sent';
      case 'partial':
        return 'Collecting Payments';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPaymentHistory();
    setRefreshing(false);
  };

  const ActivePaymentCard = ({ payment, ...props }: { payment: PaymentRequest; [key: string]: any }) => (
    <Card className="p-4 border-l-4 border-l-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{payment.description}</h4>
            {getStatusIcon(payment.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {payment.type === 'group_split' ? 'Group Split' : 'Pay for Me'}
            {payment.type === 'group_split' && payment.participants && ` • ${payment.participants.length} participants`}
          </p>
        </div>
        <Badge className={getStatusColor(payment.status)}>
          {payment.status}
        </Badge>
      </div>

      {/* Progress bar for active payments */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{getProgress(payment)}%</span>
        </div>
        <Progress value={getProgress(payment)} className="h-2" />
      </div>

      {/* Payment details for group split */}
      {payment.type === 'group_split' && payment.participants && (
        <div className="mb-3 space-y-2">
          <h5 className="text-sm font-medium">Payment Status</h5>
          {payment.participants.map((participant: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span>{participant.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{currencySymbol}{formatAmount(participant.amount)}</span>
                <Badge 
                  variant={participant.hasPaid ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {participant.hasPaid ? 'Paid' : 'Pending'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}


      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {formatDate(payment.createdAt)}
        </div>
        <div className="text-right">
          <div className="font-medium">
            {currencySymbol}{formatAmount(payment.amount)}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          View Details
        </Button>
        {payment.type === 'pay_for_me' && (
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Share2 className="w-3 h-3" />
            Share Again
          </Button>
        )}
      </div>
    </Card>
  );

  const PaymentCard = ({ payment, showDetails = false, ...props }: { payment: any; showDetails?: boolean; [key: string]: any }) => (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{payment.description}</h4>
            {getStatusIcon(payment.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {payment.type === 'group_split' ? 'Group Split' : 'Pay for Me'}
            {payment.type === 'group_split' && payment.participants && ` • ${payment.participants.length} participants`}
          </p>
        </div>
        <Badge className={getStatusColor(payment.status)}>
          {payment.status}
        </Badge>
      </div>

      {showDetails && (
        <div className="mb-3 text-sm text-muted-foreground">
          {payment.completedAt && `Completed: ${payment.completedAt}`}
          {payment.failedAt && `Failed: ${payment.failedAt}`}
          {payment.failureReason && ` - ${payment.failureReason}`}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {formatDate(payment.createdAt)}
        </div>
        <div className="text-right">
          <div className="font-medium">
            {currencySymbol}{formatAmount(payment.amount)}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('home')}
            className="lg:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl">Payment History</h1>
            <p className="text-muted-foreground lg:text-lg hidden lg:block">Track all your payment activities</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="active">Active ({activePayments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedPayments.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedPayments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activePayments.length > 0 ? (
              activePayments.map((payment) => (
                <ActivePaymentCard key={payment.id} payment={payment} />
              ))
            ) : (
              <div className="lg:col-span-2 text-center py-12 text-muted-foreground">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No active payments</p>
                <p className="text-sm">Your ongoing payments will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {completedPayments.length > 0 ? (
              completedPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} showDetails={true} />
              ))
            ) : (
              <div className="lg:col-span-2 text-center py-12 text-muted-foreground">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No completed payments</p>
                <p className="text-sm">Your successful payments will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="failed" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {failedPayments.length > 0 ? (
              failedPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} showDetails={true} />
              ))
            ) : (
              <div className="lg:col-span-2 text-center py-12 text-muted-foreground">
                <XCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No failed payments</p>
                <p className="text-sm">Failed payments will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
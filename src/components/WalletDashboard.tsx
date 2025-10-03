import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LoadingSpinner } from './LoadingSpinner';
import { 
  ArrowLeft, 
  Wallet, 
  Plus, 
  Send, 
  Download, 
  Copy, 
  Check, 
  CreditCard, 
  Building2, 
  History,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';
import { useCurrency } from '../App';
import { WalletAPI, WalletTransaction } from '../services/api';
import { copyWithFallback } from '../utils/clipboard';

interface WalletDashboardProps {
  onNavigate: (screen: string) => void;
  accountData: any;
}

export function WalletDashboard({ onNavigate, accountData }: WalletDashboardProps) {
  const { currencySymbol } = useCurrency();
  const [copied, setCopied] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (accountData) {
      loadWalletData();
    }
  }, [accountData]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [balanceResponse, transactionsResponse, statsResponse] = await Promise.all([
        WalletAPI.getBalance(),
        WalletAPI.getTransactions({ limit: 50 }),
        WalletAPI.getStats()
      ]);

      if (balanceResponse.success) {
        setWalletBalance(balanceResponse.data);
      }

      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data?.transactions || []);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!accountData) {
    return null;
  }

  if (loading) {
    return (
      <div className="lg:col-span-8 lg:col-start-3 p-4 space-y-6 lg:px-0">
        <div className="flex items-center pt-4 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('home')}
            className="mr-3 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl">Hi {accountData.firstName}! 👋</h1>
            <p className="text-muted-foreground">Manage your SplitPay wallet</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Loading wallet data..." />
        </div>
      </div>
    );
  }

  const copyAccountNumber = async () => {
    const accountNumber = accountData.wallet?.id || '1234567890';
    const success = await copyWithFallback(accountNumber, `Account Number: ${accountNumber}`);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTransactionType = (transaction: WalletTransaction) => {
    return transaction.type === 'credit' ? 'Payment Received' : 'Payment Sent';
  };

  const getTransactionIcon = (transaction: WalletTransaction) => {
    if (transaction.type === 'credit') {
      return <Download className="w-4 h-4 text-green-600" />;
    } else {
      return <Send className="w-4 h-4 text-red-600" />;
    }
  };

  const currentBalance = walletBalance?.balance || accountData.wallet?.balance || 0;

  return (
    <div className="lg:col-span-8 lg:col-start-3 p-4 space-y-6 lg:px-0">
      {/* Header */}
      <div className="flex items-center pt-4 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('home')}
          className="mr-3 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl">Hi {accountData.firstName}! 👋</h1>
          <p className="text-muted-foreground">Manage your SplitPay wallet</p>
        </div>
      </div>

      {/* Wallet Balance */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h3>Wallet Balance</h3>
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">Premium</Badge>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-3xl font-bold">{currencySymbol}{formatAmount(currentBalance)}</p>
            <p className="text-sm text-muted-foreground">Available balance</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Fund Wallet
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send Money
            </Button>
          </div>
        </div>
      </Card>

      {/* Virtual Account Details */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3>Virtual Account Number</h3>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-mono text-lg">{accountData.wallet?.id || '1234567890'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAccountNumber}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Bank: SplitPay Bank</span>
              <span>•</span>
              <span>Account Name: {accountData.firstName} {accountData.lastName}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Use this account number to receive payments directly to your SplitPay wallet
          </p>
        </div>
      </Card>

      {/* Transaction History & Analytics */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">12-Month History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3>Transaction History</h3>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.length > 0 ? (
              transactions.map((transaction) => {
                const { date, time } = formatDate(transaction.createdAt);
                return (
                  <Card key={transaction.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted rounded-full">
                          {getTransactionIcon(transaction)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{date}</span>
                            <span>•</span>
                            <span>{time}</span>
                            <span>•</span>
                            <span>{transaction.reference}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-sm ${
                          transaction.type === 'credit' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}
                          {currencySymbol}{formatAmount(transaction.amount)}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          Completed
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No transactions yet</p>
                <p className="text-sm">Your transaction history will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Total Received</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {currencySymbol}{formatAmount(stats?.totalCredits || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Last 12 months</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">Total Sent</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {currencySymbol}{formatAmount(stats?.totalDebits || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Last 12 months</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Total Transactions</span>
                </div>
                <p className="text-2xl font-bold">{(stats?.creditTransactions || 0) + (stats?.debitTransactions || 0)}</p>
                <p className="text-xs text-muted-foreground">Last 12 months</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Avg. Monthly</span>
                </div>
                <p className="text-2xl font-bold">
                  {Math.round(((stats?.creditTransactions || 0) + (stats?.debitTransactions || 0)) / 12)}
                </p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
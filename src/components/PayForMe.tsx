import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Alert } from './ui/alert';
import { ArrowLeft, DollarSign, FileText, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useCurrency } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { PaymentAPI } from '../services/api';
import { AuthScreen } from './AuthScreen';

interface PayForMeProps {
  onNavigate: (screen: string) => void;
  onPaymentData: (data: any) => void;
}

export function PayForMe({ onNavigate, onPaymentData }: PayForMeProps) {
  const { currencySymbol, currency } = useCurrency();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    recipientName: '',
    category: 'general',
    tip: '',
    includeTip: false,
    expiresInHours: 24
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { id: 'food', label: 'Food & Dining', icon: '🍽️' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'general', label: 'General', icon: '💳' },
  ];
  // Note: Authentication is no longer required for creating payment requests
  // Users can create payment links without logging in
  
  const validateForm = () => {
    if (!formData.amount) return 'Amount is required';
    if (parseFloat(formData.amount) <= 0) return 'Amount must be greater than 0';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.includeTip && formData.tip && parseFloat(formData.tip) < 0) return 'Tip amount cannot be negative';
    return null;
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await PaymentAPI.createPaymentRequest({
        type: 'pay_for_me',
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        currency: currency,
        expiresInHours: formData.expiresInHours,
        allowTips: formData.includeTip
      });

      if (response.success && response.data) {
        setSuccess('Payment request created successfully!');
        onPaymentData(response.data);
        setTimeout(() => {
          onNavigate('payment-link');
        }, 1000);
      } else {
        setError(response.error?.message || 'Failed to create payment request');
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl lg:text-3xl">Pay for Me</h1>
          <p className="text-muted-foreground lg:text-lg">Let someone else pay for your purchase</p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">

        {/* Left Column */}
        <div className="space-y-6">
          {/* Amount Input */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="pl-10 text-lg h-12"
                />
              </div>
            </div>
          </Card>

          {/* Purchase Details */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label htmlFor="description">What's this for?</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="Lunch at Pizza Palace, Movie tickets, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="pl-10 min-h-[100px] lg:min-h-[120px]"
                />
              </div>
            </div>
          </Card>

          {/* Who's Paying */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label htmlFor="recipient">Who's paying? (Optional)</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="recipient"
                  placeholder="Friend's name or leave blank"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Category Selection */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label>Category</Label>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setFormData({ ...formData, category: category.id })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.category === category.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm">{category.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Tip Section */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="includeTip">Include Tip (Optional)</Label>
                <Switch
                  id="includeTip"
                  checked={formData.includeTip}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeTip: checked, tip: checked ? formData.tip : '' })}
                />
              </div>
              {formData.includeTip && (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    id="tip"
                    type="number"
                    placeholder="0.00"
                    value={formData.tip}
                    onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
                    className="pl-10"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Error and Success Messages */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-700">{error}</p>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-green-700">{success}</p>
            </Alert>
          )}

          {/* Create Payment Link Button */}
          <div className="lg:sticky lg:top-6">
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.amount || !formData.description}
              className="w-full h-12 lg:h-14 lg:text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Payment Link'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
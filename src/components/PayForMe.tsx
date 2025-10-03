import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Alert } from './ui/alert';
import { Badge } from './ui/badge';
import { ArrowLeft, DollarSign, FileText, User, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { useCurrency } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { PaymentAPI } from '../services/api';

interface PayForMeProps {
  onNavigate: (screen: string) => void;
  onPaymentData: (data: any) => void;
}

export function PayForMe({ onNavigate, onPaymentData }: PayForMeProps) {
  const { currencySymbol, currency } = useCurrency();
  const { user } = useAuth();
  
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
    { id: 'food', label: 'Food & Dining', icon: '🍽️', gradient: 'gradient-warning' },
    { id: 'travel', label: 'Travel', icon: '✈️', gradient: 'gradient-info' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️', gradient: 'gradient-primary' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬', gradient: 'gradient-secondary' },
    { id: 'general', label: 'General', icon: '💳', gradient: 'gradient-success' },
  ];

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
      <div className="glass-card-strong rounded-3xl p-6 border-white/60 shadow-lg">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('home')}
            className="mr-3 -ml-2 lg:hidden w-9 h-9 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl lg:text-2xl">Pay for Me</h1>
              <Badge variant="secondary" className="text-xs">Popular</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Let someone else pay for your purchase</p>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">

        {/* Left Column */}
        <div className="space-y-4">
          {/* Amount Input */}
          <Card className="p-5 glass-card-strong border-white/60 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Payment Amount</Label>
                <Badge variant="outline" className="text-xs">Required</Badge>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-lg">
                  {currencySymbol}
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="pl-12 text-lg h-14 glass-card border-white/40 text-center"
                />
              </div>
              {formData.amount && parseFloat(formData.amount) > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Total: {currencySymbol}{parseFloat(formData.amount).toFixed(2)}
                </p>
              )}
            </div>
          </Card>

          {/* Purchase Details */}
          <Card className="p-5 glass-card-strong border-white/60 shadow-lg">
            <div className="space-y-3">
              <Label htmlFor="description">What's this for?</Label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="e.g., Lunch at Pizza Palace, Movie tickets..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="pl-11 min-h-[100px] glass-card border-white/40"
                />
              </div>
            </div>
          </Card>

          {/* Who's Paying */}
          <Card className="p-5 glass-card-strong border-white/60 shadow-lg">
            <div className="space-y-3">
              <Label htmlFor="recipient">Who's paying?</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="recipient"
                  placeholder="Friend's name (optional)"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="pl-11 glass-card border-white/40"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Category Selection */}
          <Card className="p-5 glass-card-strong border-white/60 shadow-lg">
            <div className="space-y-3">
              <Label>Payment Category</Label>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {categories.map((category) => {
                  const isSelected = formData.category === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isSelected
                          ? 'glass-card-strong border-primary/50 shadow-md scale-105'
                          : 'glass-card border-white/40 hover:border-primary/30 hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-lg ${category.gradient} flex items-center justify-center`}>
                          <span className="text-base">{category.icon}</span>
                        </div>
                        <span className="text-sm flex-1 text-left">{category.label}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Tip Section */}
          <Card className="p-5 glass-card-strong border-white/60 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="includeTip">Enable Tip</Label>
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <Switch
                  id="includeTip"
                  checked={formData.includeTip}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeTip: checked, tip: checked ? formData.tip : '' })}
                />
              </div>
              {formData.includeTip && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    id="tip"
                    type="number"
                    placeholder="Suggested tip amount"
                    value={formData.tip}
                    onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
                    className="pl-12 glass-card border-white/40"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Error and Success Messages */}
          {error && (
            <Alert className="border-red-200 bg-red-50/80 backdrop-blur">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50/80 backdrop-blur">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-green-700 text-sm">{success}</p>
            </Alert>
          )}

          {/* Create Payment Link Button */}
          <div className="lg:sticky lg:top-6">
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.amount || !formData.description}
              className="w-full h-12 lg:h-14 gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Payment Link
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
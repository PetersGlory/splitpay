import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Alert } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Badge } from 'lucide-react';
import { useCurrency } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { PaymentAPI } from '../services/api';
import { formatNumberWithCommas, parseFormattedNumber, handleNumericInput } from '../utils/formatNumber';

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
    category: 'general',
    includeTip: false,
    tipAmount: '',
    expiresInHours: 24
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { id: 'food', label: '🍽️ Food & Dining' },
    { id: 'travel', label: '✈️ Travel' },
    { id: 'shopping', label: '🛍️ Shopping' },
    { id: 'entertainment', label: '🎬 Entertainment' },
    { id: 'general', label: '💳 General' },
  ];

  const validateForm = () => {
    if (!formData.amount) return 'Amount is required';
    const amount = parseFormattedNumber(formData.amount);
    if (amount <= 0) return 'Amount must be greater than 0';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.includeTip && formData.tipAmount) {
      const tipAmount = parseFormattedNumber(formData.tipAmount);
      if (tipAmount < 0) return 'Tip amount cannot be negative';
    }
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
      const amount = parseFormattedNumber(formData.amount);
      const tipAmount = formData.tipAmount ? parseFormattedNumber(formData.tipAmount) : undefined;
      
      const response = await PaymentAPI.createPaymentRequest({
        type: 'pay_for_me',
        description: formData.description.trim(),
        amount: amount,
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
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Desktop Left Panel */}
      <div className="hidden lg:flex lg:flex-col lg:justify-between gradient-blue-panel text-white p-12">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="mb-12 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-4xl mb-4">Pay for Me</h1>
          <p className="text-white/90 text-lg mb-12">
            Create a payment link that someone else can use to pay on your behalf
          </p>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl mb-2">How it works</h3>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">1</div>
                  <span>Enter the amount and what it's for</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">2</div>
                  <span>Get a unique payment link</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">3</div>
                  <span>Share via WhatsApp, SMS or email</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">4</div>
                  <span>Receive payment directly to your wallet</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-white/70 text-sm">
          <p>Secure payments powered by <span className="font-bold">SpleetPay</span></p>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden px-4 py-6 border-b border-gray-200">
        <button
          onClick={() => onNavigate('home')}
          className="mb-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <h1 className="text-3xl mb-2">Pay for Me</h1>
        <p className="text-gray-600">
          Create a payment link for someone to pay on your behalf
        </p>
      </div>

      {/* Form Content */}
      <div className="p-4 lg:p-12 lg:overflow-y-auto">
        <div className="max-w-xl">
          {/* Alerts */}
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="ml-2">{error}</span>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="ml-2">{success}</span>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Amount */}
            <div>
              <Label htmlFor="amount" className="text-[15px] mb-2 block">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  {currencySymbol}
                </span>
                <Input
                  id="amount"
                  type="text"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: handleNumericInput(e.target.value) })}
                  className="pl-10 h-12 text-base border-gray-300 rounded-xl"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-[15px] mb-2 block">
                What is this payment for?
              </Label>
              <Textarea
                id="description"
                placeholder="e.g., Lunch at restaurant, Flight ticket, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px] text-base border-gray-300 rounded-xl resize-none"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/200 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-[15px] mb-2 block">Category (optional)</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category" className="h-12 text-base border-gray-300 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Allow Tips */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="tip-switch" className="text-[15px] mb-1 block">Allow tips</Label>
                  <p className="text-xs text-gray-600">Let payer add optional tip</p>
                </div>
                <Switch
                  id="tip-switch"
                  checked={formData.includeTip}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeTip: checked, tipAmount: checked ? formData.tipAmount : '' })}
                />
              </div>
              
              {formData.includeTip && (
                <div>
                  <Label htmlFor="tipAmount" className="text-[15px] mb-2 block">Suggested tip amount (optional)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {currencySymbol}
                    </span>
                    <Input
                      id="tipAmount"
                      type="text"
                      placeholder="0.00"
                      value={formData.tipAmount}
                      onChange={(e) => setFormData({ ...formData, tipAmount: handleNumericInput(e.target.value) })}
                      className="pl-10 h-12 text-base border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Expiry */}
            <div>
              <Label className="text-[15px] mb-3 block">Link expires in</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { hours: 24, label: '24 hours' },
                  { hours: 72, label: '3 days' },
                  { hours: 168, label: '7 days' }
                ].map((option) => (
                  <button
                    key={option.hours}
                    onClick={() => setFormData({ ...formData, expiresInHours: option.hours })}
                    className={`p-3 rounded-xl text-sm transition-all ${
                      formData.expiresInHours === option.hours
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 text-base bg-primary hover:bg-primary-dark text-white rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Link...
                  </>
                ) : (
                  'Create Payment Link'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
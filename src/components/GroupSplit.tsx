import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert } from './ui/alert';
import { ArrowLeft, Plus, X, Users, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useCurrency } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { PaymentAPI } from '../services/api';
import { handleNumericInput, parseFormattedNumber, formatNumberWithCommas } from '../utils/formatNumber';

interface GroupSplitProps {
  onNavigate: (screen: string) => void;
  onPaymentData: (data: any) => void;
}

export function GroupSplit({ onNavigate, onPaymentData }: GroupSplitProps) {
  const { currencySymbol, currency } = useCurrency();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    splitType: 'equal',
    expiresInHours: 48,
    participants: [
      { id: '1', name: 'You', email: user?.email || '', phone: '', amount: 0 },
      { id: '2', name: '', email: '', phone: '', amount: 0 }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addParticipant = () => {
    const newParticipant = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      amount: 0
    };
    setFormData({
      ...formData,
      participants: [...formData.participants, newParticipant]
    });
  };

  const removeParticipant = (id: string) => {
    if (formData.participants.length <= 2) return;
    setFormData({
      ...formData,
      participants: formData.participants.filter(p => p.id !== id)
    });
  };

  const updateParticipant = (id: string, field: string, value: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  const calculateSplitAmounts = () => {
    const totalAmount = parseFormattedNumber(formData.amount) || 0;
    
    if (formData.splitType === 'equal') {
      const equalAmount = totalAmount / formData.participants.length;
      return formData.participants.map(p => ({ ...p, amount: equalAmount }));
    }
    
    return formData.participants;
  };

  const validateForm = () => {
    if (!formData.amount) return 'Total amount is required';
    const amount = parseFormattedNumber(formData.amount);
    if (amount <= 0) return 'Amount must be greater than 0';
    if (!formData.description.trim()) return 'Description is required';
    
    const participantsWithoutContact = formData.participants.filter((p, index) => 
      index > 0 && !p.email?.trim() && !p.phone?.trim()
    );
    if (participantsWithoutContact.length > 0) {
      return 'All participants must have an email address or phone number';
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
      const splits = calculateSplitAmounts();
      
      const response = await PaymentAPI.createGroupSplit({
        description: formData.description.trim(),
        totalAmount: parseFormattedNumber(formData.amount),
        currency: currency,
        splitType: formData.splitType,
        expiresInHours: formData.expiresInHours,
        participants: splits.map(p => ({
          name: p.name || 'Participant',
          email: p.email,
          phone: p.phone || '',
          amount: p.amount
        }))
      });

      if (response.success && response.data) {
        setSuccess('Split payment created successfully!');
        onPaymentData(response.data);
        setTimeout(() => {
          onNavigate('split-payment');
        }, 1000);
      } else {
        setError(response.error?.message || 'Failed to create split payment');
      }
    } catch (error) {
      console.error('Split payment error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const splitAmounts = calculateSplitAmounts();
  const totalAmount = parseFloat(formData.amount) || 0;

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Desktop Left Panel */}
      <div className="hidden lg:flex lg:flex-col lg:justify-between gradient-plum text-white p-12">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="mb-12 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-4xl mb-4">Group Split Payment</h1>
          <p className="text-white/90 text-lg mb-12">
            Split bills equally or set custom amounts for each person
          </p>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-white/90">
                  <span>Total Amount</span>
                  <span className="text-xl">{currencySymbol}{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-white/90">
                  <span>Split Among</span>
                  <span className="text-xl">{formData.participants.length} people</span>
                </div>
                <div className="border-t border-white/20 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span>Per Person</span>
                    <span className="text-2xl">
                      {currencySymbol}{(totalAmount / formData.participants.length || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-white/70 text-sm">
          <p>Secure split payments powered by <span className="font-bold">SpleetPay</span></p>
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
        
        <h1 className="text-3xl mb-2">Split Payment</h1>
        <p className="text-gray-600">
          Divide a bill among multiple people
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
            {/* Total Amount */}
            <div>
              <Label htmlFor="amount" className="text-[15px] mb-2 block">Total Amount</Label>
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
                placeholder="e.g., Dinner at restaurant, Group gift, Shared expenses..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px] text-base border-gray-300 rounded-xl resize-none"
                maxLength={200}
              />
            </div>

            {/* Split Type */}
            <div>
              <Label className="text-[15px] mb-3 block">Split Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, splitType: 'equal' })}
                  className={`p-4 rounded-xl text-left transition-all ${
                    formData.splitType === 'equal'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-[15px] mb-1">Equal Split</div>
                  <div className={`text-xs ${formData.splitType === 'equal' ? 'text-white/80' : 'text-gray-600'}`}>
                    Divide equally
                  </div>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, splitType: 'custom' })}
                  className={`p-4 rounded-xl text-left transition-all ${
                    formData.splitType === 'custom'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-[15px] mb-1">Custom Split</div>
                  <div className={`text-xs ${formData.splitType === 'custom' ? 'text-white/80' : 'text-gray-600'}`}>
                    Set amounts
                  </div>
                </button>
              </div>
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-[15px]">Participants ({formData.participants.length})</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addParticipant}
                  className="h-8 px-3 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Person
                </Button>
              </div>

              <div className="space-y-3">
                {formData.participants.map((participant, index) => (
                  <div key={participant.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary-plum/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-primary-plum" />
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="space-y-3">
                          <Input
                            placeholder={index === 0 ? "You" : "Name"}
                            value={participant.name}
                            onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                            className="h-10 text-sm"
                            disabled={index === 0}
                          />
                          <Input
                            placeholder="Email address"
                            type="email"
                            value={participant.email}
                            onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                            className="h-10 text-sm"
                            // disabled={index === 0}
                          />
                          <Input
                            placeholder="Phone number (optional)"
                            type="tel"
                            value={participant.phone}
                            onChange={(e) => updateParticipant(participant.id, 'phone', e.target.value)}
                            className="h-10 text-sm"
                            // disabled={index === 0}
                          />
                        </div>
                        
                        {formData.splitType === 'equal' && (
                          <div className="text-sm text-gray-600">
                            Amount: {currencySymbol}{formatNumberWithCommas(splitAmounts[index]?.amount) || '0.00'}
                          </div>
                        )}
                        
                        {formData.splitType === 'custom' && (
                          <div>
                            <Label className="text-xs mb-1.5 block">Custom Amount</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                {currencySymbol}
                              </span>
                              <Input
                                placeholder="0.00"
                                type="text"
                                value={participant.amount > 0 ? formatNumberWithCommas(participant.amount.toString()) : ''}
                                onChange={(e) => {
                                  const value = handleNumericInput(e.target.value);
                                  const numValue = parseFormattedNumber(value);
                                  updateParticipant(participant.id, 'amount', numValue.toString());
                                }}
                                className="pl-8 h-10 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {index > 0 && (
                        <button
                          onClick={() => removeParticipant(participant.id)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry */}
            <div>
              <Label className="text-[15px] mb-3 block">Payment link expires in</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { hours: 48, label: '2 days' },
                  { hours: 120, label: '5 days' },
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
                    Creating Split...
                  </>
                ) : (
                  'Create Split Payment'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

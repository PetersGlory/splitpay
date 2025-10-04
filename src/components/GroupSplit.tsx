import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Alert } from './ui/alert';
import { Badge } from './ui/badge';
import { ArrowLeft, FileText, Plus, X, Users, Mail, Phone, Loader2, AlertCircle, CheckCircle, Sparkles, UserPlus, DollarSign } from 'lucide-react';
import { useCurrency } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { PaymentAPI } from '../services/api';

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
    tip: '',
    includeTip: false,
    expiresInHours: 48,
    participants: [
      { id: '1', name: 'You', email: user?.email || '', phone: user?.phone || '', amount: 0, isPayer: false, contactMethod: 'email' },
      { id: '2', name: '', email: '', phone: '', amount: 0, isPayer: false, contactMethod: 'email' }
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
      amount: 0,
      isPayer: false,
      contactMethod: 'email'
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
    const totalAmount = parseFloat(formData.amount) || 0;
    const tipAmount = formData.includeTip ? (parseFloat(formData.tip) || 0) : 0;
    const grandTotal = totalAmount + tipAmount;
    
    if (formData.splitType === 'equal') {
      const equalAmount = grandTotal / formData.participants.length;
      return formData.participants.map(p => ({ ...p, amount: equalAmount }));
    }
    
    // For custom split, use the amounts set by user
    return formData.participants;
  };

  const validateForm = () => {
    if (!formData.amount) return 'Total amount is required';
    if (parseFloat(formData.amount) <= 0) return 'Amount must be greater than 0';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.includeTip && formData.tip && parseFloat(formData.tip) < 0) return 'Tip amount cannot be negative';
    
    const participantsWithoutContact = formData.participants.filter((p) => 
      (!p.email?.trim() && !p.phone?.trim())
    );
    if (participantsWithoutContact.length > 0) {
      return 'All participants must have either an email or phone number';
    }
    
    // Custom split validation
    if (formData.splitType === 'custom') {
      const totalAmount = parseFloat(formData.amount) || 0;
      const tipAmount = formData.includeTip ? (parseFloat(formData.tip) || 0) : 0;
      const grandTotal = totalAmount + tipAmount;
      const sumOfAmounts = formData.participants.reduce((sum, p) => sum + (parseFloat(p.amount.toString()) || 0), 0);
      
      if (Math.abs(sumOfAmounts - grandTotal) > 0.01) {
        return `Custom amounts must total ${currencySymbol}${grandTotal.toFixed(2)}. Current total: ${currencySymbol}${sumOfAmounts.toFixed(2)}`;
      }
      
      const invalidAmounts = formData.participants.filter(p => !p.amount || parseFloat(p.amount.toString()) <= 0);
      if (invalidAmounts.length > 0) {
        return 'All participants must have a valid amount greater than 0';
      }
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
      const splitAmounts = calculateSplitAmounts();
      const participants = splitAmounts.map((participant, index) => ({
        name: index === 0 ? 'You' : (participant.name || 'Participant'),
        email: participant.email || undefined,
        phone: participant.phone || undefined,
        amount: participant.amount,
        isPayer: index === 0 // Mark the first participant (user) as the payer
      }));

      const totalAmount = parseFloat(formData.amount);
      const tipAmount = formData.includeTip ? (parseFloat(formData.tip) || 0) : 0;
      const grandTotal = totalAmount + tipAmount;

      const response = await PaymentAPI.createGroupSplit({
        description: formData.description.trim(),
        totalAmount: grandTotal,
        currency: currency,
        participants: participants,
        splitType: formData.splitType as 'equal' | 'custom',
        expiresInHours: formData.expiresInHours,
        allowTips: formData.includeTip
      });

      if (response.success && response.data) {
        setSuccess('Group split created successfully!');
        onPaymentData(response.data);
        setTimeout(() => {
          onNavigate('split-payment');
        }, 1000);
      } else {
        setError(response.error?.message || 'Failed to create group split');
      }
    } catch (error) {
      console.error('Group split creation error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const splitAmounts = calculateSplitAmounts();

  return (
    <div className="space-y-3 lg:space-y-6">
      {/* Header */}
      <div className="glass-card-strong rounded-2xl lg:rounded-3xl p-4 lg:p-6 border-white/60 shadow-lg">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('home')}
            className="mr-2 lg:mr-3 -ml-2 lg:hidden w-9 h-9 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 lg:gap-2 mb-0.5 lg:mb-1">
              <h1 className="text-base lg:text-xl">Split Payment</h1>
              <Badge variant="secondary" className="text-xs gradient-info text-white border-0">Quick</Badge>
            </div>
            <p className="text-xs lg:text-sm text-muted-foreground">Share the bill with friends</p>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-3 lg:space-y-0">

        {/* Left Column - Basic Details */}
        <div className="lg:col-span-2 space-y-3 lg:space-y-4">
          {/* Total Amount */}
          <Card className="p-4 lg:p-5 glass-card-strong border-white/60 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">Total Bill</Label>
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
            </div>
          </Card>

          {/* Description */}
          <Card className="p-4 lg:p-5 glass-card-strong border-white/60 shadow-lg">
            <div className="space-y-3">
              <Label htmlFor="description">What's this for?</Label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="e.g., Dinner at restaurant, Group trip..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="pl-11 min-h-[100px] glass-card border-white/40"
                />
              </div>
            </div>
          </Card>

          {/* Tip Section */}
          <Card className="p-4 lg:p-5 glass-card-strong border-white/60 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="includeTip">Add Tip</Label>
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
                    placeholder="Tip amount"
                    value={formData.tip}
                    onChange={(e) => setFormData({ ...formData, tip: e.target.value })}
                    className="pl-12 glass-card border-white/40"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Split Type */}
          <Card className="p-4 lg:p-5 glass-card-strong border-white/60 shadow-lg">
            <div className="space-y-3">
              <Label>Split Method</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormData({ ...formData, splitType: 'equal' })}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    formData.splitType === 'equal'
                      ? 'gradient-primary text-white shadow-md'
                      : 'glass-card border-white/40 hover:border-primary/30'
                  }`}
                >
                  <Users className={`w-5 h-5 mx-auto mb-1 ${formData.splitType === 'equal' ? 'text-white' : 'text-primary'}`} />
                  <span className="text-xs">Equal Split</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, splitType: 'custom' })}
                  className={`p-4 rounded-xl transition-all duration-300 ${
                    formData.splitType === 'custom'
                      ? 'gradient-primary text-white shadow-md'
                      : 'glass-card border-white/40 hover:border-primary/30'
                  }`}
                >
                  <Sparkles className={`w-5 h-5 mx-auto mb-1 ${formData.splitType === 'custom' ? 'text-white' : 'text-primary'}`} />
                  <span className="text-xs">Custom Split</span>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Participants */}
        <div className="lg:col-span-3 space-y-3 lg:space-y-4">
          <Card className="p-4 lg:p-5 glass-card-strong border-white/60 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <Label>Participants ({formData.participants.length})</Label>
              </div>
              <Button
                onClick={addParticipant}
                size="sm"
                variant="outline"
                className="glass-card border-white/40 hover:border-primary/30 h-8"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {formData.participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="glass-card p-4 rounded-xl border-white/40 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                      index === 0 ? 'gradient-primary' : 'gradient-info'
                    }`}>
                      <span>{index === 0 ? '👤' : index + 1}</span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {index === 0 ? (
                          <span className="font-medium">You</span>
                        ) : (
                          <Input
                            placeholder="Participant name"
                            value={participant.name}
                            onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                            className="h-9 glass-card border-white/40 text-sm flex-1"
                          />
                        )}
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeParticipant(participant.id)}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Contact Method Toggle - Show for all participants including index 0 */}
                      <div className="space-y-2">
                        <div className="flex gap-1 p-1 glass-card rounded-lg border-white/40">
                          <button
                            onClick={() => updateParticipant(participant.id, 'contactMethod', 'email')}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs transition-all ${
                              participant.contactMethod === 'email'
                                ? 'gradient-primary text-white shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </button>
                          <button
                            onClick={() => updateParticipant(participant.id, 'contactMethod', 'phone')}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs transition-all ${
                              participant.contactMethod === 'phone'
                                ? 'gradient-primary text-white shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Phone className="w-3 h-3" />
                            Phone
                          </button>
                        </div>
                        
                        {/* Contact Input - Show for all participants including index 0 */}
                        <div className="relative">
                          {participant.contactMethod === 'email' ? (
                            <>
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              <Input
                                placeholder={index === 0 ? "Your email address" : "Email address"}
                                type="email"
                                value={participant.email}
                                onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                                className="pl-9 h-9 glass-card border-white/40 text-sm"
                              />
                            </>
                          ) : (
                            <>
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                              <Input
                                placeholder={index === 0 ? "Your phone number" : "Phone number"}
                                type="tel"
                                value={participant.phone}
                                onChange={(e) => updateParticipant(participant.id, 'phone', e.target.value)}
                                className="pl-9 h-9 glass-card border-white/40 text-sm"
                              />
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Amount Display/Input */}
                      <div className="flex items-center justify-between pt-1 gap-2">
                        <span className="text-xs text-muted-foreground">Amount:</span>
                        {formData.splitType === 'custom' ? (
                          <div className="relative flex-1 max-w-[120px]">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              {currencySymbol}
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={participant.amount || ''}
                              onChange={(e) => updateParticipant(participant.id, 'amount', e.target.value)}
                              className="pl-6 pr-2 h-8 glass-card border-white/40 text-sm text-right"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-primary">
                            {currencySymbol}{splitAmounts[index]?.amount.toFixed(2) || '0.00'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <div className="mt-4 pt-4 border-t border-white/40">
                <div className="space-y-2">
                  {formData.splitType === 'equal' ? (
                    <div className="glass-card p-3 rounded-xl border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">Per Person (Equal Split)</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-primary">
                          {currencySymbol}{(splitAmounts[0]?.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card p-3 rounded-xl border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Total Assigned:</span>
                          <span className="text-sm font-medium">
                            {currencySymbol}{splitAmounts.reduce((sum, p) => sum + (p.amount || 0), 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Expected Total:</span>
                          <span className="text-sm font-medium text-primary">
                            {currencySymbol}{(parseFloat(formData.amount) + (formData.includeTip ? parseFloat(formData.tip || '0') : 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Grand Total */}
                  <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                    <span>Total Bill {formData.includeTip && '(with tip)'}</span>
                    <span>{currencySymbol}{(parseFloat(formData.amount) + (formData.includeTip ? parseFloat(formData.tip || '0') : 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
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

          {/* Create Split Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.amount || !formData.description}
            className="w-full h-11 lg:h-14 gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Split Payment
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
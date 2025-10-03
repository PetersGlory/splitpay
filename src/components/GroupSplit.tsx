import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Alert } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, DollarSign, FileText, Plus, X, Users, Mail, Phone, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
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
      { id: '1', name: 'You', email: user?.email || '', phone: user?.phone || '', amount: 0, isPayer: false },
      { id: '2', name: '', email: '', phone: '', amount: 0, isPayer: false }
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
      isPayer: false
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
    return formData.participants;
  };

  const validateForm = () => {
    if (!formData.amount) return 'Total amount is required';
    if (parseFloat(formData.amount) <= 0) return 'Amount must be greater than 0';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.includeTip && formData.tip && parseFloat(formData.tip) < 0) return 'Tip amount cannot be negative';
    
    // Check if non-"You" participants have contact info
    const participantsWithoutContact = formData.participants.filter((p, index) => 
      index > 0 && (!p.email?.trim() && !p.phone?.trim())
    );
    if (participantsWithoutContact.length > 0) {
      return 'All participants must have either an email or phone number';
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
      const participants = splitAmounts.map((participant) => ({
        name: participant.name || 'Participant',
        email: participant.email || undefined,
        phone: participant.phone || undefined,
        amount: participant.amount
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
          <h1 className="text-xl lg:text-2xl">Split Payment</h1>
          <p className="text-muted-foreground lg:text-base">Share the bill with friends</p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">

        {/* Left Column - Basic Details */}
        <div className="space-y-6">
          {/* Total Amount */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label htmlFor="amount">Total Amount</Label>
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

          {/* Description */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label htmlFor="description">What's this for?</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Textarea
                  id="description"
                  placeholder="Dinner at restaurant, Group trip, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="pl-10 min-h-[100px] lg:min-h-[120px]"
                />
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

          {/* Split Type */}
          <Card className="p-6">
            <div className="space-y-4">
              <Label>How to split?</Label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData({ ...formData, splitType: 'equal' })}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    formData.splitType === 'equal'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Split Equally</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, splitType: 'custom' })}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    formData.splitType === 'custom'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <DollarSign className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Custom Amounts</span>
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Column - Participants */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Participants ({formData.participants.length})</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addParticipant}
                  className="text-primary"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Person
                </Button>
              </div>
              
              <div className="space-y-4 max-h-[500px] lg:max-h-[600px] overflow-y-auto">
                {formData.participants.map((participant, index) => (
                  <Card key={participant.id} className="p-4 bg-muted/30">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Input
                            placeholder={index === 0 ? "You" : "Participant name"}
                            value={participant.name}
                            onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                            disabled={index === 0}
                            className="h-10 font-medium"
                          />
                          {index === 0 && (
                            <div className="mt-2">
                              <Tabs defaultValue={"email"} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 h-8 mb-1">
                                  <TabsTrigger value="email" className="text-xs">
                                    <Mail className="w-3 h-3 mr-1" />
                                    Email
                                  </TabsTrigger>
                                  <TabsTrigger value="phone" className="text-xs">
                                    <Phone className="w-3 h-3 mr-1" />
                                    Phone
                                  </TabsTrigger>
                                </TabsList>
                                <TabsContent value="email" className="mt-1">
                                  <Input
                                    type="email"
                                    placeholder="Your email"
                                    value={participant.email}
                                    onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                                    className="h-9"
                                  />
                                </TabsContent>
                                <TabsContent value="phone" className="mt-1">
                                  <Input
                                    type="tel"
                                    placeholder="Your phone"
                                    value={participant.phone}
                                    onChange={(e) => updateParticipant(participant.id, 'phone', e.target.value)}
                                    className="h-9"
                                  />
                                </TabsContent>
                              </Tabs>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">Amount</div>
                            <div className="font-medium text-sm">
                              {currencySymbol}{splitAmounts[index]?.amount.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          
                          {formData.participants.length > 2 && index > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParticipant(participant.id)}
                              className="text-destructive p-1 h-8 w-8"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {index > 0 && (
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Contact Information (Choose at least one)</Label>
                          <Tabs defaultValue="email" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-8">
                              <TabsTrigger value="email" className="text-xs">
                                <Mail className="w-3 h-3 mr-1" />
                                Email
                              </TabsTrigger>
                              <TabsTrigger value="phone" className="text-xs">
                                <Phone className="w-3 h-3 mr-1" />
                                Phone
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="email" className="mt-2">
                              <Input
                                type="email"
                                placeholder="participant@example.com"
                                value={participant.email}
                                onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                                className="h-9"
                              />
                            </TabsContent>
                            <TabsContent value="phone" className="mt-2">
                              <Input
                                type="tel"
                                placeholder="+234 801 234 5678"
                                value={participant.phone}
                                onChange={(e) => updateParticipant(participant.id, 'phone', e.target.value)}
                                className="h-9"
                              />
                            </TabsContent>
                          </Tabs>
                          
                          <div className="text-xs text-muted-foreground">
                            Payment link will be sent via {participant.email ? 'email' : ''}{participant.email && participant.phone ? ' and ' : ''}{participant.phone ? 'SMS' : ''}
                            {!participant.email && !participant.phone && 'manual sharing (add contact info)'}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
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

          {/* Create Split Button - Desktop */}
          <div className="hidden lg:block">
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.amount || !formData.description}
              className="w-full h-14 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Split Payment'
              )}
            </Button>
          </div>
        </div>

        {/* Right Column - Summary (Desktop Only) */}
        <div className="hidden lg:block space-y-6">
          {formData.amount && (
            <div className="sticky top-6">
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="space-y-4">
                  <h3 className="font-semibold text-center">Summary</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Amount:</span>
                      <span>{currencySymbol}{parseFloat(formData.amount).toFixed(2)}</span>
                    </div>
                    {formData.includeTip && formData.tip && (
                      <div className="flex justify-between text-sm">
                        <span>Tip:</span>
                        <span>{currencySymbol}{parseFloat(formData.tip).toFixed(2)}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Each person pays</p>
                      <p className="text-2xl font-bold text-primary">
                        {currencySymbol}{((parseFloat(formData.amount) + (formData.includeTip ? parseFloat(formData.tip) || 0 : 0)) / formData.participants.length).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    Split among {formData.participants.length} participants
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Summary - Mobile */}
      {formData.amount && (
        <Card className="p-6 bg-primary/5 border-primary/20 lg:hidden">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Amount:</span>
              <span>{currencySymbol}{parseFloat(formData.amount).toFixed(2)}</span>
            </div>
            {formData.includeTip && formData.tip && (
              <div className="flex justify-between text-sm">
                <span>Tip:</span>
                <span>{currencySymbol}{parseFloat(formData.tip).toFixed(2)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Each person pays</p>
              <p className="text-2xl">
                {currencySymbol}{((parseFloat(formData.amount) + (formData.includeTip ? parseFloat(formData.tip) || 0 : 0)) / formData.participants.length).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Create Split Button - Mobile */}
      <div className="pb-4 lg:hidden">
        <Button
          onClick={handleSubmit}
          disabled={loading || !formData.amount || !formData.description}
          className="w-full h-12"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Split Payment'
          )}
        </Button>
      </div>
    </div>
  );
}
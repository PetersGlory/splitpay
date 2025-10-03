import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { ArrowLeft, User, Mail, Phone, Wallet, Check, Shield, Clock, TrendingUp } from 'lucide-react';

interface AccountSetupProps {
  onNavigate: (screen: string) => void;
  onAccountCreated: (accountData: any) => void;
}

export function AccountSetup({ onNavigate, onAccountCreated }: AccountSetupProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.agreeToTerms) {
      return;
    }

    setIsLoading(true);
    
    // Simulate account creation
    setTimeout(() => {
      const accountData = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        createdAt: new Date().toISOString(),
        walletBalance: 0,
        virtualAccountNumber: `2${Math.random().toString().slice(2, 12)}`,
        accountType: 'premium'
      };
      
      onAccountCreated(accountData);
      setIsLoading(false);
      onNavigate('wallet-dashboard');
    }, 2000);
  };

  const benefits = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: '12 Month History',
      description: 'Access up to 12 months of transaction history'
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      title: 'Virtual Wallet',
      description: 'Get your own virtual account number for easy funding'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Enhanced Security',
      description: 'Advanced security features and fraud protection'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Analytics & Insights',
      description: 'Detailed spending analytics and payment insights'
    }
  ];

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
          <h1 className="text-2xl">Create SplitPay Account</h1>
          <p className="text-muted-foreground">Unlock premium features and extended history</p>
        </div>
      </div>

      {/* Benefits */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/20 text-primary">Premium</Badge>
            <h3>Account Benefits</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{benefit.title}</h4>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Account Creation Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+234 801 234 5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to SplitPay's{' '}
              <a href="#" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-12"
            disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.agreeToTerms || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </div>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Alternative */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Want to continue without an account?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => onNavigate('home')}>
            Skip for now
          </Button>
        </p>
      </div>
    </div>
  );
}
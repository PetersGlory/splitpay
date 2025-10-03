import React, { useState } from 'react';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { 
  CreditCard, 
  Building2, 
  Wallet, 
  Landmark, 
  DollarSign, 
  QrCode 
} from 'lucide-react';

interface PaymentMethodsProps {
  onBack: () => void;
  onPayment: (method: string) => void;
}

export default function PaymentMethods({ onBack, onPayment }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState('bank-transfer');

  const paymentMethods = [
    {
      id: 'card',
      label: 'Pay with Card (Paystack)',
      icon: CreditCard,
      color: 'text-purple-600',
      description: 'Visa, Mastercard, Verve'
    },
    {
      id: 'bank-transfer',
      label: 'Bank Transfer',
      icon: Building2,
      color: 'text-purple-600',
      description: 'Direct bank transfer'
    },
    {
      id: 'opay',
      label: 'Opay Wallet',
      icon: Wallet,
      color: 'text-purple-600',
      description: 'Pay with Opay account'
    },
    {
      id: 'ussd',
      label: 'USSD Code',
      icon: DollarSign,
      color: 'text-purple-600',
      description: 'Dial *737*50*amount#'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-center">
          <div className="bg-gray-100 rounded-full px-4 py-2 text-gray-600 text-sm">
            spleetpay.com
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-md mx-auto">
        <h1 className="text-gray-900 text-2xl mb-8">
          How would you like to pay?
        </h1>

        <RadioGroup 
          value={selectedMethod} 
          onValueChange={setSelectedMethod}
          className="space-y-4 mb-8"
        >
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <div key={method.id} className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedMethod === method.id 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}>
                <IconComponent className={`h-6 w-6 ${method.color}`} />
                <div className="flex-1">
                  <Label 
                    htmlFor={method.id} 
                    className="text-gray-900 cursor-pointer font-medium"
                  >
                    {method.label}
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    {method.description}
                  </p>
                </div>
                <RadioGroupItem 
                  value={method.id} 
                  id={method.id}
                  className="border-purple-300 text-purple-600"
                />
              </div>
            );
          })}
        </RadioGroup>

        {/* Make Payment Button */}
        <Button 
          onClick={() => onPayment(selectedMethod)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-lg transition-colors mb-4"
          size="lg"
        >
          Make Payment
        </Button>

        {/* Back Button */}
        <Button 
          variant="ghost"
          onClick={onBack}
          className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          Back to Payment Request
        </Button>
      </div>

      {/* Bottom Navigation Bar (iOS style) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex justify-center py-2">
          <div className="w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
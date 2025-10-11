import React from 'react';
import { Button } from './ui/button';
import { Users, Link, ArrowRight } from 'lucide-react';
import { useCurrency } from '../App';

interface HomeProps {
  onNavigate: (screen: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { currencySymbol } = useCurrency();
  
  const paymentOptions = [
    {
      id: 'pay-for-me',
      title: 'Pay for Me',
      description: 'Share a payment link for someone else to pay on your behalf',
      icon: Link,
      bgColor: 'bg-option-purple',
    },
    {
      id: 'group-split',
      title: 'Group Split Payment',
      description: 'Split bills equally or unequally among multiple people',
      icon: Users,
      bgColor: 'bg-option-blue',
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 py-6 lg:py-8">
      {/* Welcome Section */}
      <div className="px-4">
        <h1 className="text-3xl lg:text-4xl mb-3">Welcome to <span className="font-bold">SpleetPay</span></h1>
        <p className="text-gray-600 text-[15px] lg:text-base">
          Choose how you want to receive or split payments
        </p>
      </div>

      {/* Payment Options */}
      <div className="px-4 space-y-4">
        <h2 className="text-xl lg:text-2xl">Payment Options</h2>
        
        <div className="space-y-3">
          {paymentOptions.map((option, index) => (
            <button
              key={option.id}
              onClick={() => onNavigate(option.id)}
              className={`w-full ${option.bgColor} hover:opacity-80 transition-all rounded-2xl p-5 text-left border border-transparent hover:border-primary/20`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <option.icon className="w-6 h-6 text-gray-800" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] lg:text-base mb-1">{option.title}</h3>
                  <p className="text-[13px] lg:text-sm text-gray-600">{option.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

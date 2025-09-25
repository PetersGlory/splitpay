import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Users, Link, Wallet, Clock, Shield, TrendingUp } from 'lucide-react';
import { useCurrency } from '../App';

interface HomeProps {
  onNavigate: (screen: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { currencySymbol } = useCurrency();
  
  const quickActions = [
    {
      id: 'pay-for-me',
      title: 'Pay for Me',
      description: 'Share a payment link for someone else to pay',
      icon: Link,
      color: 'bg-blue-500',
    },
    {
      id: 'group-split',
      title: 'Split Payment',
      description: 'Split bills with friends and family',
      icon: Users,
      color: 'bg-green-500',
    },
  ];



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-3xl lg:text-4xl mb-4">Hi Friend! 😊👋</h1>
        <p className="text-muted-foreground text-lg">Ready to make payments simple?</p>
      </div>

      {/* Payment Options */}
      <div className="space-y-6">
        <h3 className="text-xl">Payment Options</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Card 
              key={action.id}
              className="group relative p-8 lg:p-10 cursor-pointer overflow-hidden border-0 bg-gradient-to-r from-white to-gray-50/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              onClick={() => onNavigate(action.id)}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'slideInUp 0.6s ease-out forwards'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex flex-col lg:flex-row items-center lg:items-start space-y-4 lg:space-y-0 lg:space-x-6 text-center lg:text-left">
                <div className={`p-6 lg:p-4 rounded-2xl ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-8 h-8 lg:w-7 lg:h-7" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-3 lg:mb-2 text-lg lg:text-base group-hover:text-primary transition-colors duration-300">{action.title}</h4>
                  <p className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">{action.description}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden lg:block">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-2 right-2 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Stats for Desktop */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-3 gap-6 mt-8">
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">Fast</div>
            <p className="text-muted-foreground text-sm">Quick payment links in seconds</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">Secure</div>
            <p className="text-muted-foreground text-sm">Bank-level security for all transactions</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">Simple</div>
            <p className="text-muted-foreground text-sm">No account needed to make payments</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
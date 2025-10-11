import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Shield, Zap, Users, Globe, Lock, Clock, CheckCircle, Sparkles } from 'lucide-react';

interface AboutProps {
  onNavigate: (screen: string) => void;
}

export function About({ onNavigate }: AboutProps) {
  const features = [
    {
      icon: Zap,
      title: 'Instant Payment Links',
      description: 'Create and share payment links in seconds. No complicated setup required.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      icon: Users,
      title: 'Group Split Payments',
      description: 'Split bills fairly with friends and family. Equal or custom amounts.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your transactions are protected with industry-standard encryption.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Globe,
      title: 'Multi-Currency Support',
      description: 'Accept payments in Naira, Cedi, Pounds, and Dollars seamlessly.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Clock,
      title: 'Real-Time Tracking',
      description: 'Monitor payment status instantly with live notifications.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      icon: Lock,
      title: 'No Account Required',
      description: 'Recipients can pay without creating an account or signing up.',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create Payment Request',
      description: 'Enter the amount and description for what you need paid.',
      icon: Sparkles,
    },
    {
      step: '2',
      title: 'Share the Link',
      description: 'Send via WhatsApp, SMS, email, or scan the QR code.',
      icon: Users,
    },
    {
      step: '3',
      title: 'Receive Payment',
      description: 'Get notified instantly when payment is completed.',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="space-y-6 animate-slideIn">
      {/* Header */}
      <Card className="p-6 border-white/60 shadow-lg">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              About <span className="font-bold">SpleetPay</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Simplifying payments for everyone
            </p>
          </div>
        </div>
      </Card>

      {/* Why SpleetPay */}
      <Card className="p-6 border-white/60 shadow-lg">
        <div className="mb-6">
          <h2 className="mb-2">Why <span className="font-bold">SpleetPay</span>?</h2>
          <p className="text-muted-foreground">
            <span className="font-bold">SpleetPay</span> makes it easy to request and receive payments across multiple platforms. 
            Whether you're splitting a dinner bill or collecting funds for a group gift, we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-5 border-white/60 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h4 className="mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </Card>

      {/* How It Works */}
      <Card className="p-6 border-white/60 shadow-lg">
        <div className="mb-6">
          <h2 className="mb-2">How It Works</h2>
          <p className="text-muted-foreground">
            Get started in three simple steps
          </p>
        </div>

        <div className="space-y-4">
          {howItWorks.map((item, index) => (
            <Card
              key={index}
              className="p-5 border-white/60 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl font-semibold">{item.step}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <item.icon className="w-5 h-5 text-primary" />
                    <h4>{item.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Call to Action */}
      <Card className="p-6 border-white/60 shadow-lg gradient-primary text-white">
        <div className="text-center">
          <h3 className="mb-2 text-white">Ready to Get Started?</h3>
          <p className="mb-6 text-white/90">
            Create your first payment request in seconds
          </p>
          <Button
            onClick={() => onNavigate('pay-for-me')}
            className="bg-white text-primary hover:bg-white/90"
          >
            Create Payment Request
          </Button>
        </div>
      </Card>
    </div>
  );
}
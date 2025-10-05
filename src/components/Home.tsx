import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Users, Link, Wallet, Clock, Shield, TrendingUp, Zap, ArrowRight } from 'lucide-react';
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
      gradient: 'gradient-primary',
      badge: 'Popular',
      badgeColor: 'bg-purple-500',
    },
    {
      id: 'group-split',
      title: 'Split Payment',
      description: 'Split bills with friends and family',
      icon: Users,
      gradient: 'gradient-info',
      badge: 'Quick',
      badgeColor: 'bg-blue-500',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Instant',
      description: 'Create payment links in seconds',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'Bank-level encryption',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: Clock,
      title: 'Real-time',
      description: 'Track payments instantly',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  return (
    <div className="space-y-2 lg:space-y-6 animate-slideIn">
      {/* Welcome Header */}
      <div className="glass-card-strong rounded-2xl lg:rounded-3xl p-4 lg:p-8 border-white/60 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-1 font-bold lg:mb-2">Hi Friend! 👋</h1>
            <p className="text-sm lg:text-base text-muted-foreground">Ready to make payments simple?</p>
          </div>
          <div className="hidden lg:block">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="hidden lg:grid grid-cols-3 gap-2 lg:gap-3 mt-4 lg:mt-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center"
              style={{
                animation: `slideInUp 0.6s ease-out ${index * 100}ms forwards`,
                opacity: 0
              }}
            >
              <div className={`w-8 h-8 lg:w-10 lg:h-10 ${feature.bgColor} rounded-lg lg:rounded-xl flex items-center justify-center mx-auto mb-1.5 lg:mb-2`}>
                <feature.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${feature.color}`} />
              </div>
              <p className="text-xs text-muted-foreground">{feature.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base lg:text-lg">Payment Options</h3>
          <Badge variant="secondary" className="text-xs">2 Available</Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          {quickActions.map((action, index) => (
            <Card 
              key={action.id}
              className="group relative overflow-hidden border-white/60 glass-card-strong cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              onClick={() => onNavigate(action.id)}
              style={{
                animation: `slideInUp 0.6s ease-out ${(index + 3) * 100}ms forwards`,
                opacity: 0
              }}
            >
              {/* Gradient Header */}
              <div className={`${action.gradient} p-4 lg:p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-start justify-between">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-sm rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <action.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <Badge className={`${action.badgeColor} text-white border-0 text-xs`}>
                    {action.badge}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="pt-2 pb-4 px-4 lg:pt-3 lg:pb-6 lg:px-6">
                <h4 className="mb-1 lg:mb-1.5 text-sm lg:text-base group-hover:text-primary transition-colors">{action.title}</h4>
                <p className="text-xs lg:text-sm text-muted-foreground mb-2 lg:mb-3">{action.description}</p>
                
                <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-xs lg:text-sm mr-1">Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </Card>
          ))}
        </div>
      </div>

      {/* Info Cards - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-4 pt-4">
        <Card className="p-5 glass-card border-white/60 text-center hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <h4 className="mb-1 text-sm">Fast Processing</h4>
          <p className="text-xs text-muted-foreground">Payment links created instantly</p>
        </Card>
        
        <Card className="p-5 glass-card border-white/60 text-center hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="mb-1 text-sm">100% Secure</h4>
          <p className="text-xs text-muted-foreground">Bank-level security standards</p>
        </Card>
        
        <Card className="p-5 glass-card border-white/60 text-center hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="mb-1 text-sm">No Account Needed</h4>
          <p className="text-xs text-muted-foreground">Recipients pay without signup</p>
        </Card>
      </div>
    </div>
  );
}
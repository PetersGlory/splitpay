import React from 'react';
import { Button } from './ui/button';
import { Home, CreditCard, Users, History, Sparkles } from 'lucide-react';

interface DesktopNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function DesktopNav({ currentScreen, onNavigate }: DesktopNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pay-for-me', label: 'Pay for Me', icon: CreditCard },
    { id: 'group-split', label: 'Split Payment', icon: Users },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <nav className="space-y-2">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">Navigation</h2>
        </div>
      </div>
      
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            onClick={() => onNavigate(item.id)}
            className={`w-full justify-start gap-3 h-12 transition-all duration-300 ${
              isActive 
                ? 'gradient-primary text-white shadow-lg hover:shadow-xl' 
                : 'glass-card border-white/40 hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
            {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />}
          </Button>
        );
      })}
    </nav>
  );
}
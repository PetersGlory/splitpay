import React from 'react';
import { Button } from './ui/button';
import { Home, CreditCard, Users, History } from 'lucide-react';

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
        <h2 className="text-lg font-semibold text-primary mb-4">Navigation</h2>
      </div>
      
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={currentScreen === item.id ? "default" : "ghost"}
          onClick={() => onNavigate(item.id)}
          className={`w-full justify-start gap-3 h-12 ${
            currentScreen === item.id 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          <item.icon className="w-5 h-5" />
          {item.label}
        </Button>
      ))}
    </nav>
  );
}
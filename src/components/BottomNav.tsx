import React from 'react';
import { Home, CreditCard, Users, History } from 'lucide-react';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pay-for-me', label: 'Pay for Me', icon: CreditCard },
    { id: 'group-split', label: 'Split', icon: Users },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md lg:hidden">
      <div className="mx-3 mb-2.5 glass-card-strong rounded-2xl border-white/60 shadow-2xl overflow-hidden">
        <div className="flex justify-around py-1.5">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-300 relative ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 rounded-xl" />
                )}
                <div className={`relative transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                  <item.icon className="w-5 h-5 mb-0.5" />
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
                <span className={`text-[10px] relative transition-all ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
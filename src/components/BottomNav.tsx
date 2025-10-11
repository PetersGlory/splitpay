import React from 'react';
import { Home, CreditCard, Users, History, Info } from 'lucide-react';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pay-for-me', label: 'Pay', icon: CreditCard },
    { id: 'group-split', label: 'Split', icon: Users },
    { id: 'history', label: 'History', icon: History },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-500'
              }`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
              <span className={`text-[11px] ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

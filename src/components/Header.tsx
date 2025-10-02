import React from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Wallet } from 'lucide-react';

const currencies = {
  NGN: { symbol: '₦', name: 'Nigerian Naira', code: 'NGN' },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi', code: 'GHS' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' }
};

interface HeaderProps {
  currentCurrency: keyof typeof currencies;
  onCurrencyChange: (currency: keyof typeof currencies) => void;
  accountData?: any;
  onNavigate?: (screen: string) => void;
}

export function Header({ currentCurrency, onCurrencyChange, accountData, onNavigate }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex items-center justify-between p-4 lg:px-8 max-w-none lg:max-w-none">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm lg:text-base">S</span>
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold text-primary">SpleetPay</h1>
            <p className="text-xs text-muted-foreground hidden lg:block">Simplifying payments together</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 lg:space-x-4">
          <Select value={currentCurrency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-20 lg:w-24 h-9 lg:h-10 text-sm">
              <SelectValue>
                {currencies[currentCurrency].symbol}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(currencies).map(([code, currency]) => (
                <SelectItem key={code} value={code}>
                  <div className="flex items-center space-x-2">
                    <span>{currency.symbol}</span>
                    <span className="text-xs text-muted-foreground lg:inline hidden">{currency.name}</span>
                    <span className="text-xs text-muted-foreground lg:hidden">{code}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {accountData ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('wallet-dashboard')}
              className="flex items-center space-x-2 lg:space-x-3 lg:px-4 lg:h-10"
            >
              <Avatar className="w-6 h-6 lg:w-8 lg:h-8">
                <AvatarFallback className="text-xs lg:text-sm">
                  {accountData.firstName[0]}{accountData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex lg:flex-col lg:items-start">
                <span className="text-sm font-medium">{accountData.firstName}</span>
                <span className="text-xs text-muted-foreground">Premium User</span>
              </div>
              <span className="hidden sm:inline lg:hidden text-sm">{accountData.firstName}</span>
              <Wallet className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('auth')}
              className="flex items-center space-x-2 lg:space-x-3 lg:px-4 lg:h-10"
            >
              <Wallet className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden sm:inline lg:text-sm">Access Wallet</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
import React from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Wallet, Sparkles } from 'lucide-react';
import { Badge } from './ui/badge';

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
    <header className="sticky top-0 z-50 glass-card-strong border-b border-white/40 shadow-lg">
      <div className="flex items-center justify-between px-3 py-2.5 lg:px-8 lg:py-4 max-w-none lg:max-w-none">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="w-8 h-8 lg:w-11 lg:h-11 gradient-primary rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group cursor-pointer">
            <span className="text-primary-foreground lg:text-xl group-hover:scale-110 transition-transform">S</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 lg:gap-2">
              <h1 className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">SplitPay</h1>
              <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary hidden lg:block" />
            </div>
            <p className="text-xs text-muted-foreground hidden lg:block">Simplifying payments together</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1.5 lg:space-x-3">
          <Select value={currentCurrency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-16 lg:w-28 h-8 lg:h-10 text-sm glass-card border-white/50">
              <SelectValue>
                <span className="flex items-center gap-1">
                  {currencies[currentCurrency].symbol}
                  <span className="hidden lg:inline text-xs text-muted-foreground">{currencies[currentCurrency].code}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="glass-card-strong">
              {Object.entries(currencies).map(([code, currency]) => (
                <SelectItem key={code} value={code}>
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{currency.symbol}</span>
                    <div className="flex flex-col">
                      <span className="text-xs">{code}</span>
                      <span className="text-xs text-muted-foreground hidden lg:inline">{currency.name}</span>
                    </div>
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
              className="flex items-center space-x-1.5 lg:space-x-3 glass-card border-white/40 hover:border-primary/30 hover:bg-primary/5 h-8 lg:h-10 px-2 lg:px-3"
            >
              <Avatar className="w-6 h-6 lg:w-8 lg:h-8 ring-2 ring-primary/20">
                <AvatarFallback className="text-xs gradient-primary text-white">
                  {accountData.firstName[0]}{accountData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex lg:flex-col lg:items-start">
                <span className="text-sm">{accountData.firstName}</span>
                <Badge variant="secondary" className="text-xs px-1 h-4">Pro</Badge>
              </div>
              <Wallet className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('account-setup')}
              className="flex items-center space-x-1.5 glass-card border-white/50 hover:border-primary/40 hover:bg-primary/5 h-8 lg:h-10 px-2 lg:px-3"
            >
              <User className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              <span className="hidden sm:inline text-sm">Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
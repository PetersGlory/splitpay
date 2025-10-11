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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8 lg:py-4 max-w-none lg:max-w-none">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary-plum rounded-xl flex items-center justify-center">
            <span className="text-white text-lg lg:text-xl">S</span>
          </div>
          <div>
            <h1 className="text-lg lg:text-xl"><span className="font-bold">SpleetPay</span></h1>
            <p className="text-xs text-gray-500 hidden lg:block">Split & Share Payments</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-3">
          <Select value={currentCurrency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-20 lg:w-32 h-9 lg:h-10 text-sm bg-gray-50 border-gray-200">
              <SelectValue>
                <span className="flex items-center gap-1.5">
                  {currencies[currentCurrency].symbol}
                  <span className="hidden lg:inline text-xs text-gray-600">{currencies[currentCurrency].code}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(currencies).map(([code, currency]) => (
                <SelectItem key={code} value={code}>
                  <div className="flex items-center space-x-2">
                    <span>{currency.symbol}</span>
                    <div className="flex flex-col">
                      <span className="text-sm">{code}</span>
                      <span className="text-xs text-gray-500 hidden lg:inline">{currency.name}</span>
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
              className="flex items-center space-x-2 h-9 lg:h-10 px-2 lg:px-3 hover:bg-gray-100"
            >
              <Avatar className="w-7 h-7 lg:w-8 lg:h-8">
                <AvatarFallback className="text-xs bg-primary-plum text-white">
                  {accountData.firstName[0]}{accountData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline text-sm">{accountData.firstName}</span>
              <Wallet className="w-4 h-4 text-gray-600" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate?.('account-setup')}
              className="flex items-center space-x-2 h-9 lg:h-10 px-3 hover:bg-gray-100"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

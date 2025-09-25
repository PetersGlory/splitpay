import React, { useState, createContext, useContext } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { FullPageLoader } from './components/LoadingSpinner';
import { DemoModeIndicator } from './components/DemoModeIndicator';
import { Home } from './components/Home';
import { PayForMe } from './components/PayForMe';
import { GroupSplit } from './components/GroupSplit';
import { PaymentLink } from './components/PaymentLink';
import { SplitPayment } from './components/SplitPayment';
import { PaymentHistory } from './components/PaymentHistoryFixed';
import { AccountSetup } from './components/AccountSetup';
import { WalletDashboard } from './components/WalletDashboard';
import { BottomNav } from './components/BottomNav';
import { DesktopNav } from './components/DesktopNav';
import { Header } from './components/Header';

const currencies = {
  NGN: { symbol: '₦', name: 'Nigerian Naira' },
  GHS: { symbol: '₵', name: 'Ghanaian Cedi' },
  GBP: { symbol: '£', name: 'British Pound' },
  USD: { symbol: '$', name: 'US Dollar' }
};

const CurrencyContext = createContext({
  currency: 'NGN' as keyof typeof currencies,
  currencySymbol: '₦',
  setCurrency: (currency: keyof typeof currencies) => {}
});

export const useCurrency = () => useContext(CurrencyContext);

function AppContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [paymentData, setPaymentData] = useState(null);
  const [currency, setCurrency] = useState<keyof typeof currencies>('NGN');

  // Update currency when user data loads
  React.useEffect(() => {
    if (user?.preferredCurrency && currencies[user.preferredCurrency as keyof typeof currencies]) {
      setCurrency(user.preferredCurrency as keyof typeof currencies);
    }
  }, [user]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <FullPageLoader text="Loading SpleetPay..." />;
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated || !user) {
    return <AuthScreen onAuthSuccess={() => setCurrentScreen('home')} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={setCurrentScreen} />;
      case 'pay-for-me':
        return <PayForMe onNavigate={setCurrentScreen} onPaymentData={setPaymentData} />;
      case 'group-split':
        return <GroupSplit onNavigate={setCurrentScreen} onPaymentData={setPaymentData} />;
      case 'payment-link':
        return <PaymentLink paymentData={paymentData} onNavigate={setCurrentScreen} accountData={user} />;
      case 'split-payment':
        return <SplitPayment paymentData={paymentData} onNavigate={setCurrentScreen} accountData={user} />;
      case 'history':
        return <PaymentHistory onNavigate={setCurrentScreen} />;
      case 'account-setup':
        return <AccountSetup onNavigate={setCurrentScreen} onAccountCreated={() => {}} />;
      case 'wallet-dashboard':
        return <WalletDashboard onNavigate={setCurrentScreen} accountData={user} />;
      default:
        return <Home onNavigate={setCurrentScreen} />;
    }
  };

  const currencyContextValue = {
    currency,
    currencySymbol: currencies[currency].symbol,
    setCurrency
  };

  return (
    <CurrencyContext.Provider value={currencyContextValue}>
      <div className="min-h-screen bg-background">
        <div className="w-full mx-auto min-h-screen flex flex-col">
          <Header 
            currentCurrency={currency} 
            onCurrencyChange={setCurrency}
            accountData={user}
            onNavigate={setCurrentScreen}
          />
          
          {/* Demo Mode Indicator */}
          <DemoModeIndicator />
          
          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:flex-1">
            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-border bg-muted/20 p-6">
              <DesktopNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
            </aside>
            
            {/* Desktop Main Content */}
            <main className="flex-1 p-8 overflow-auto">
              <div className="max-w-4xl mx-auto">
                {renderScreen()}
              </div>
            </main>
          </div>
          
          {/* Mobile Layout */}
          <main className="flex-1 pb-20 lg:hidden">
            <div className="max-w-md mx-auto p-4">
              {renderScreen()}
            </div>
          </main>
          
          <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
        </div>
      </div>
    </CurrencyContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
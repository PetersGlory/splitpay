import React, { useState, createContext, useContext } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { FullPageLoader } from './components/LoadingSpinner';

import { Home } from './components/Home';
import { About } from './components/About';
import { PayForMe } from './components/PayForMe';
import { GroupSplit } from './components/GroupSplit';
import { PaymentLink } from './components/PaymentLink';
import { PaymentHistory } from './components/PaymentHistoryFixed';
import { TransactionDetails } from './components/TransactionDetails';
import { AccountSetup } from './components/AccountSetup';
import { WalletDashboard } from './components/WalletDashboard';
import { BottomNav } from './components/BottomNav';
import { DesktopNav } from './components/DesktopNav';
import { Header } from './components/Header';
import { PaymentRequest } from './services/api';
import { SpleetPayment } from './components/SplitPayment';

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
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentRequest | null>(null);
  const [currency, setCurrency] = useState<keyof typeof currencies>('NGN');

  // Update currency when user data loads
  React.useEffect(() => {
    if (user?.preferredCurrency && currencies[user.preferredCurrency as keyof typeof currencies]) {
      setCurrency(user.preferredCurrency as keyof typeof currencies);
    }
  }, [user]);

  // Show loading screen while checking authentication (only on initial load)
  if (isLoading) {
    return <FullPageLoader text="Loading SpleetPay..." />;
  }

  // Protected routes that require authentication
  const protectedRoutes = ['wallet-dashboard', 'account-setup'];
  
  // If trying to access protected route without auth, show auth screen
  if (protectedRoutes.includes(currentScreen) && !isAuthenticated) {
    return (
      <AuthScreen 
        onAuthSuccess={() => setCurrentScreen('home')} 
        onNavigateHome={() => setCurrentScreen('home')}
      />
    );
  }

  const handleViewDetails = (payment: PaymentRequest) => {
    setSelectedTransaction(payment);
    setCurrentScreen('transaction-details');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigate={setCurrentScreen} />;
      case 'about':
        return <About onNavigate={setCurrentScreen} />;
      case 'pay-for-me':
        return <PayForMe onNavigate={setCurrentScreen} onPaymentData={setPaymentData} />;
      case 'group-split':
        return <GroupSplit onNavigate={setCurrentScreen} onPaymentData={setPaymentData} />;
      case 'payment-link':
        return <PaymentLink paymentData={paymentData} onNavigate={setCurrentScreen} accountData={user} />;
      case 'split-payment':
        return <SpleetPayment paymentData={paymentData} onNavigate={setCurrentScreen} accountData={user} />;
      case 'transaction-details':
        return selectedTransaction ? (
          <TransactionDetails payment={selectedTransaction} onNavigate={setCurrentScreen} />
        ) : (
          <PaymentHistory onNavigate={setCurrentScreen} onViewDetails={handleViewDetails} />
        );
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
      <div className="min-h-screen">
        <div className="w-full mx-auto min-h-screen flex flex-col">
          <Header 
            currentCurrency={currency} 
            onCurrencyChange={setCurrency}
            accountData={user}
            onNavigate={setCurrentScreen}
          />
          
          {/* Desktop Layout */}
          <div className="hidden lg:flex lg:flex-1">
            {/* Desktop Sidebar */}
            <aside className="w-64 p-6 glass-card-strong border-r border-border/50">
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
          <main className="flex-1 pb-20 lg:hidden overflow-y-auto">
            <div className="max-w-md mx-auto px-3 py-3">
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
    <AuthProvider children={undefined}>
      <AppContent />
    </AuthProvider>
  );
}
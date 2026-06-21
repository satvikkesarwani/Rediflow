import { useState, useEffect } from 'react';
import './index.css';
import { api } from './services/api';

import { HomeScreen } from './screens/HomeScreen';
import { RouteOptionsScreen } from './screens/RouteOptionsScreen';
import { RouteDetailsScreen } from './screens/RouteDetailsScreen';
import { BookingSummaryScreen } from './screens/BookingSummaryScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { JourneyPassScreen } from './screens/JourneyPassScreen';
import { LiveTrackingScreen } from './screens/LiveTrackingScreen';
import { WalletScreen } from './screens/WalletScreen';
import { CarbonDashboardScreen } from './screens/CarbonDashboardScreen';
import { Toast, useToast } from './components/Toast';

const SCREENS = {
  HOME: 'HOME',
  ROUTES: 'ROUTES',
  DETAILS: 'DETAILS',
  BOOKING: 'BOOKING',
  PAYMENT: 'PAYMENT',
  PASS: 'PASS',
  TRACKING: 'TRACKING',
  WALLET: 'WALLET',
  ECO: 'ECO',
};

export default function App() {
  // Initialize state from sessionStorage if available
  const [screen, setScreen] = useState(() => sessionStorage.getItem('app_screen') || SCREENS.HOME);
  const { toasts, addToast, removeToast } = useToast();

  // State carried through the flow, persisted in sessionStorage
  const [searchResult, setSearchResult] = useState(() => JSON.parse(sessionStorage.getItem('app_searchResult')) || null);
  const [selectedRoute, setSelectedRoute] = useState(() => JSON.parse(sessionStorage.getItem('app_selectedRoute')) || null);
  const [bookingData, setBookingData] = useState(() => JSON.parse(sessionStorage.getItem('app_bookingData')) || null);
  const [paymentResult, setPaymentResult] = useState(() => JSON.parse(sessionStorage.getItem('app_paymentResult')) || null);

  // Sync state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('app_screen', screen);
    if (searchResult) sessionStorage.setItem('app_searchResult', JSON.stringify(searchResult)); else sessionStorage.removeItem('app_searchResult');
    if (selectedRoute) sessionStorage.setItem('app_selectedRoute', JSON.stringify(selectedRoute)); else sessionStorage.removeItem('app_selectedRoute');
    if (bookingData) sessionStorage.setItem('app_bookingData', JSON.stringify(bookingData)); else sessionStorage.removeItem('app_bookingData');
    if (paymentResult) sessionStorage.setItem('app_paymentResult', JSON.stringify(paymentResult)); else sessionStorage.removeItem('app_paymentResult');
  }, [screen, searchResult, selectedRoute, bookingData, paymentResult]);
  const [walletBalance, setWalletBalance] = useState(500);

  // Sync wallet balance from backend on mount
  useEffect(() => {
    api.getWalletBalance()
      .then(data => setWalletBalance(data.balance))
      .catch(() => {/* ignore, use default */});
  }, []);

  const go = (s) => setScreen(s);

  const handleSearch = (result) => {
    setSearchResult(result);
    go(SCREENS.ROUTES);
  };

  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    go(SCREENS.DETAILS);
  };

  const handleBook = (booking, route) => {
    setBookingData(booking);
    if (route) setSelectedRoute((prev) => ({ ...prev, ...route }));
    go(SCREENS.BOOKING);
  };

  const handlePaymentSuccess = (result) => {
    setPaymentResult(result);
    go(SCREENS.PASS);
  };

  const handleStartJourney = () => go(SCREENS.TRACKING);

  const handleComplete = () => {
    setSearchResult(null);
    setSelectedRoute(null);
    setBookingData(null);
    setPaymentResult(null);
    go(SCREENS.HOME);
  };

  return (
    <div id="root">
      <div className="app-shell">
        {screen === SCREENS.HOME && (
          <HomeScreen onSearch={handleSearch} onOpenWallet={async () => {
            // refresh balance before opening wallet
            try { const d = await api.getWalletBalance(); setWalletBalance(d.balance); } catch {}
            go(SCREENS.WALLET);
          }} onOpenEco={() => go(SCREENS.ECO)} addToast={addToast} />
        )}

        {screen === SCREENS.ECO && (
          <CarbonDashboardScreen onBack={() => go(SCREENS.HOME)} />
        )}

        {screen === SCREENS.WALLET && (
          <WalletScreen 
            balance={walletBalance} 
            setBalance={setWalletBalance} 
            onBack={() => go(SCREENS.HOME)} 
            addToast={addToast} 
          />
        )}

        {screen === SCREENS.ROUTES && searchResult && (
          <RouteOptionsScreen
            routes={searchResult.routes}
            source={searchResult.source}
            destination={searchResult.destination}
            preference={searchResult.preference}
            prefId={searchResult.prefId}
            safeMode={searchResult.safeMode}
            onSelect={handleSelectRoute}
            onBack={() => go(SCREENS.HOME)}
          />
        )}

        {screen === SCREENS.DETAILS && selectedRoute && (
          <RouteDetailsScreen
            route={selectedRoute}
            onBook={handleBook}
            onBack={() => go(SCREENS.ROUTES)}
            addToast={addToast}
          />
        )}

        {screen === SCREENS.BOOKING && bookingData && selectedRoute && (
          <BookingSummaryScreen
            booking={bookingData}
            route={selectedRoute}
            onProceed={() => go(SCREENS.PAYMENT)}
            onBack={() => go(SCREENS.DETAILS)}
          />
        )}

        {screen === SCREENS.PAYMENT && bookingData && selectedRoute && (
          <PaymentScreen
            booking={bookingData}
            route={selectedRoute}
            onSuccess={handlePaymentSuccess}
            onBack={() => go(SCREENS.ROUTES)}
            addToast={addToast}
            walletBalance={walletBalance}
            setWalletBalance={setWalletBalance}
          />
        )}

        {screen === SCREENS.PASS && paymentResult && bookingData && selectedRoute && (
          <JourneyPassScreen
            passData={paymentResult}
            booking={bookingData}
            route={selectedRoute}
            onStartJourney={handleStartJourney}
            addToast={addToast}
          />
        )}

        {screen === SCREENS.TRACKING && bookingData && paymentResult && selectedRoute && (
          <LiveTrackingScreen
            booking={bookingData}
            passData={paymentResult}
            route={selectedRoute}
            onComplete={handleComplete}
            addToast={addToast}
          />
        )}

        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
}

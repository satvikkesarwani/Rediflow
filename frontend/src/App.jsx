import { useState } from 'react';
import './index.css';

import { HomeScreen } from './screens/HomeScreen';
import { RouteOptionsScreen } from './screens/RouteOptionsScreen';
import { RouteDetailsScreen } from './screens/RouteDetailsScreen';
import { BookingSummaryScreen } from './screens/BookingSummaryScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { JourneyPassScreen } from './screens/JourneyPassScreen';
import { LiveTrackingScreen } from './screens/LiveTrackingScreen';
import { Toast, useToast } from './components/Toast';

const SCREENS = {
  HOME: 'HOME',
  ROUTES: 'ROUTES',
  DETAILS: 'DETAILS',
  BOOKING: 'BOOKING',
  PAYMENT: 'PAYMENT',
  PASS: 'PASS',
  TRACKING: 'TRACKING',
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.HOME);
  const { toasts, addToast, removeToast } = useToast();

  // State carried through the flow
  const [searchResult, setSearchResult] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

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
          <HomeScreen onSearch={handleSearch} addToast={addToast} />
        )}

        {screen === SCREENS.ROUTES && searchResult && (
          <RouteOptionsScreen
            routes={searchResult.routes}
            source={searchResult.source}
            destination={searchResult.destination}
            preference={searchResult.preference}
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
          />
        )}

        {screen === SCREENS.PASS && paymentResult && bookingData && selectedRoute && (
          <JourneyPassScreen
            passData={paymentResult}
            booking={bookingData}
            route={selectedRoute}
            onStartJourney={handleStartJourney}
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

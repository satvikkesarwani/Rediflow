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
import { TripHistoryScreen } from './screens/TripHistoryScreen';
import { VoiceAssistant } from './components/VoiceAssistant';
import { prefToBackend } from './components/PreferenceSelector';
import { prefLabel } from './data/assistant';
import { carbonKg } from './data/routeMeta';
import { recordEcoTrip } from './data/eco';
import { recordTrip } from './data/history';
import { Toast, useToast } from './components/Toast';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  HISTORY: 'HISTORY',
};

export default function App() {
  // Initialize state from sessionStorage if available
  const [screen, setScreen] = useState(() => sessionStorage.getItem('app_screen') || SCREENS.HOME);
  const { toasts, addToast, removeToast } = useToast();

  // State carried through the flow, persisted in sessionStorage
  const readSession = (key) => { try { return JSON.parse(sessionStorage.getItem(key)) || null; } catch { return null; } };
  const [searchResult, setSearchResult] = useState(() => readSession('app_searchResult'));
  const [selectedRoute, setSelectedRoute] = useState(() => readSession('app_selectedRoute'));
  const [bookingData, setBookingData] = useState(() => readSession('app_bookingData'));
  const [paymentResult, setPaymentResult] = useState(() => readSession('app_paymentResult'));

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

  const [assistantOpen, setAssistantOpen] = useState(false);

  const go = (s) => setScreen(s);

  const handleSearch = (result) => {
    setSearchResult(result);
    go(SCREENS.ROUTES);
  };

  // Voice/AI assistant resolves a natural-language command into a real route search.
  const handleAssistantPlan = async ({ source, destination, prefId = 'balanced', safeMode = false }) => {
    const src = source || 'Central Railway Station';
    if (src === destination) { addToast('Pick a different destination', 'error'); return; }
    try {
      const backendPref = prefToBackend(prefId);
      const data = await api.searchRoutes(src, destination, backendPref);
      setSearchResult({ routes: data.routes, source: src, destination, preference: backendPref, prefId, safeMode });
      setAssistantOpen(false);
      go(SCREENS.ROUTES);
    } catch (e) {
      addToast(e.detail || 'No routes found for that trip', 'error');
    }
  };

  // One-shot voice booking: search → book → pay → pass, reporting each step to the
  // assistant's progress stepper. Resolves with the pass once state is ready.
  const bookViaAssistant = async ({ source, destination, prefId = 'balanced', payment = 'wallet', onProgress = () => {} }) => {
    const src = source || 'Central Railway Station';
    if (src === destination) throw { reason: 'same' };
    const backendPref = prefToBackend(prefId);

    // 1) Route
    onProgress('route', 'active');
    const data = await api.searchRoutes(src, destination, backendPref);
    const top = data.routes[0];
    const route = { ...top, source: src, destination };
    await sleep(750);
    onProgress('route', 'done', { detail: `${prefLabel(prefId)} · ₹${top.totalFareRupees} · ${top.totalTimeMinutes} min` });

    // 2) Booking
    onProgress('booking', 'active');
    const booking = await api.createBooking(top.routeId);
    await sleep(700);
    onProgress('booking', 'done', { detail: booking.bookingId });

    // 3) Payment
    onProgress('payment', 'active', { method: payment });
    let payResult;
    if (payment === 'wallet') {
      try {
        const pay = await api.pay(booking.bookingId);
        payResult = { ...pay, method: 'NCMC Wallet' };
        setWalletBalance(pay.walletBalance);
      } catch (e) {
        if (e.status === 400) {
          // Use walletBalance from the server response if available, otherwise fall back to the prop
          const currentBalance = e.walletBalance ?? walletBalance;
          onProgress('payment', 'error', { balance: currentBalance, fare: booking.totalFareRupees });
          throw { reason: 'lowbalance', fare: booking.totalFareRupees };
        }
        throw e;
      }
    } else {
      await sleep(900);
      const passId = `RF-PASS-${String(booking.bookingId).slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
      payResult = { paymentStatus: 'Success', journeyPassId: passId, walletBalance, method: payment === 'upi' ? 'UPI' : 'Card' };
    }
    await sleep(550);
    onProgress('payment', 'done', { detail: `${payResult.method} · paid ₹${booking.totalFareRupees}` });

    // 4) Pass
    onProgress('pass', 'active');
    await sleep(650);
    onProgress('pass', 'done', { detail: payResult.journeyPassId });

    // Rewards + persistence (keeps History / Carbon dashboards consistent)
    const co2 = Number(carbonKg(route)) || 2;
    const greenPoints = Math.max(5, Math.round(booking.totalFareRupees / 2));
    payResult.greenPoints = greenPoints;
    recordEcoTrip({ co2Kg: co2, points: greenPoints, moneySaved: 0, eco: route.carbonLabel === 'Low' });
    recordTrip({ passId: payResult.journeyPassId, from: src, to: destination, summary: route.summary, fare: booking.totalFareRupees, co2, status: 'Completed' });

    // Stage state for the Pass screen
    setSearchResult({ routes: data.routes, source: src, destination, preference: backendPref, prefId, safeMode: false });
    setSelectedRoute(route);
    setBookingData(booking);
    setPaymentResult(payResult);

    return { passId: payResult.journeyPassId };
  };

  const openPassFromAssistant = () => { setAssistantOpen(false); go(SCREENS.PASS); };

  const handleSelectRoute = (route) => {
    setSelectedRoute({ ...route, source: searchResult?.source, destination: searchResult?.destination });
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
            try { const d = await api.getWalletBalance(); setWalletBalance(d.balance); } catch { /* ignore, use cached balance */ }
            go(SCREENS.WALLET);
          }} onOpenEco={() => go(SCREENS.ECO)} onOpenHistory={() => go(SCREENS.HISTORY)} onOpenAssistant={() => setAssistantOpen(true)} addToast={addToast} />
        )}

        {screen === SCREENS.ECO && (
          <CarbonDashboardScreen onBack={() => go(SCREENS.HOME)} />
        )}

        {screen === SCREENS.HISTORY && (
          <TripHistoryScreen onBack={() => go(SCREENS.HOME)} />
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
            onBack={() => go(SCREENS.BOOKING)}
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

        <VoiceAssistant
          open={assistantOpen}
          onClose={() => setAssistantOpen(false)}
          onPlan={handleAssistantPlan}
          onBook={bookViaAssistant}
          onOpenPass={openPassFromAssistant}
        />

        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
}

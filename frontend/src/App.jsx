import { useState, useEffect, useRef } from 'react';
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
import { prefToBackend } from './data/preferences';
import { prefLabel } from './data/assistant';
import { carbonKg } from './data/routeMeta';
import { recordEcoTrip } from './data/eco';
import { recordTrip } from './data/history';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';

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
  const { toasts, addToast, removeToast } = useToast();

  // State carried through the flow, persisted in sessionStorage
  const readSession = (key) => { try { return JSON.parse(sessionStorage.getItem(key)) || null; } catch { return null; } };
  const [searchResult, setSearchResult] = useState(() => readSession('app_searchResult'));
  const [selectedRoute, setSelectedRoute] = useState(() => readSession('app_selectedRoute'));
  const [bookingData, setBookingData] = useState(() => readSession('app_bookingData'));
  const [paymentResult, setPaymentResult] = useState(() => readSession('app_paymentResult'));

  // Initialize screen from sessionStorage but guard against missing required state.
  // This runs synchronously during the first render (lazy initializer) so no effect needed.
  const [screen, setScreen] = useState(() => {
    const s = sessionStorage.getItem('app_screen') || SCREENS.HOME;
    const needsRoute = [SCREENS.DETAILS, SCREENS.BOOKING, SCREENS.PAYMENT, SCREENS.PASS, SCREENS.TRACKING];
    const needsBooking = [SCREENS.BOOKING, SCREENS.PAYMENT, SCREENS.PASS, SCREENS.TRACKING];
    const needsPayment = [SCREENS.PASS, SCREENS.TRACKING];
    // We can't use the state variables here yet, so read directly from sessionStorage.
    const hasRoute = !!sessionStorage.getItem('app_selectedRoute');
    const hasBooking = !!sessionStorage.getItem('app_bookingData');
    const hasPayment = !!sessionStorage.getItem('app_paymentResult');
    if (needsRoute.includes(s) && !hasRoute) return SCREENS.HOME;
    if (needsBooking.includes(s) && !hasBooking) return SCREENS.HOME;
    if (needsPayment.includes(s) && !hasPayment) return SCREENS.HOME;
    return s;
  });

  // Sync the current screen to sessionStorage on every change.
  useEffect(() => {
    sessionStorage.setItem('app_screen', screen);
  }, [screen]);

  // Sync flow data to sessionStorage whenever it changes (separate from the guard).
  useEffect(() => {
    if (searchResult) sessionStorage.setItem('app_searchResult', JSON.stringify(searchResult)); else sessionStorage.removeItem('app_searchResult');
    if (selectedRoute) sessionStorage.setItem('app_selectedRoute', JSON.stringify(selectedRoute)); else sessionStorage.removeItem('app_selectedRoute');
    if (bookingData) sessionStorage.setItem('app_bookingData', JSON.stringify(bookingData)); else sessionStorage.removeItem('app_bookingData');
    if (paymentResult) sessionStorage.setItem('app_paymentResult', JSON.stringify(paymentResult)); else sessionStorage.removeItem('app_paymentResult');
  }, [searchResult, selectedRoute, bookingData, paymentResult]);
  const [walletBalance, setWalletBalance] = useState(500);

  // Keep a ref so async callbacks always read the current balance.
  const walletBalanceRef = useRef(walletBalance);
  useEffect(() => { walletBalanceRef.current = walletBalance; }, [walletBalance]);

  // Sync wallet balance from backend on mount
  useEffect(() => {
    api.getWalletBalance()
      .then(data => setWalletBalance(data.balance))
      .catch(() => {/* ignore, use default */});
  }, []);

  const [assistantOpen, setAssistantOpen] = useState(false);

  // go() is the single point of screen transitions. It enforces guards so that
  // screens that require state never render blank (e.g. after a session restore
  // where sessionStorage was partially cleared).
  //
  // IMPORTANT: callers that set state via setSelectedRoute/setBookingData/etc.
  // and navigate in the SAME handler must pass the fresh values via `ready`,
  // because the corresponding state variables are still stale (their setters
  // haven't been applied yet within this synchronous handler). Without this the
  // guard reads the old (often null) value and bounces back to HOME.
  const go = (s, ready = {}) => {
    const route = ready.route !== undefined ? ready.route : selectedRoute;
    const booking = ready.booking !== undefined ? ready.booking : bookingData;
    const payment = ready.payment !== undefined ? ready.payment : paymentResult;
    const needsRoute = [SCREENS.DETAILS, SCREENS.BOOKING, SCREENS.PAYMENT, SCREENS.PASS, SCREENS.TRACKING];
    const needsBooking = [SCREENS.BOOKING, SCREENS.PAYMENT, SCREENS.PASS, SCREENS.TRACKING];
    const needsPayment = [SCREENS.PASS, SCREENS.TRACKING];
    if (needsRoute.includes(s) && !route) { setScreen(SCREENS.HOME); return; }
    if (needsBooking.includes(s) && !booking) { setScreen(SCREENS.HOME); return; }
    if (needsPayment.includes(s) && !payment) { setScreen(SCREENS.HOME); return; }
    setScreen(s);
  };

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
  // existingBookingId: when provided (e.g. UPI retry after wallet low-balance), the
  // createBooking step is skipped and the existing booking is reused — preventing
  // a duplicate booking for the same journey.
  const bookViaAssistant = async ({ source, destination, prefId = 'balanced', payment = 'wallet', onProgress = () => {}, existingBookingId = null }) => {
    const src = source || 'Central Railway Station';
    if (src === destination) throw { reason: 'same' };
    const backendPref = prefToBackend(prefId);

    // 1) Route
    onProgress('route', 'active');
    const data = await api.searchRoutes(src, destination, backendPref);
    if (!data.routes?.length) throw new Error('No routes found');
    const top = data.routes[0];
    const route = { ...top, source: src, destination };
    await sleep(750);
    onProgress('route', 'done', { detail: `${prefLabel(prefId)} · ₹${top.totalFareRupees} · ${top.totalTimeMinutes} min` });

    // 2) Booking — skip if we already have a booking from a previous attempt (e.g. UPI retry)
    onProgress('booking', 'active');
    let booking;
    if (existingBookingId) {
      // Reuse the existing booking; fetch full booking to get legs/ticketIds for the pass.
      try {
        booking = await api.getBooking(existingBookingId);
      } catch {
        // Fallback: reconstruct minimal stub if GET fails (should be rare in-memory)
        booking = { bookingId: existingBookingId, totalFareRupees: top.totalFareRupees, userId: 'demo-user', legs: [] };
      }
    } else {
      booking = await api.createBooking(top.routeId);
    }
    await sleep(700);
    onProgress('booking', 'done', { detail: booking.bookingId });

    // 3) Payment
    onProgress('payment', 'active', { method: payment });
    let payResult;
    if (payment === 'wallet') {
      try {
        const pay = await api.pay(booking.bookingId, 'NCMC Wallet');
        payResult = { ...pay, method: 'NCMC Wallet' };
        setWalletBalance(pay.walletBalance);
      } catch (e) {
        if (e.status === 400) {
          // Use walletBalance from the server response if available, otherwise fall back to the prop
          const currentBalance = e.walletBalance ?? walletBalanceRef.current;
          onProgress('payment', 'error', { balance: currentBalance, fare: booking.totalFareRupees });
          // Surface bookingId so the UPI retry can reuse this booking
          throw { reason: 'lowbalance', fare: booking.totalFareRupees, bookingId: booking.bookingId };
        }
        throw e;
      }
    } else {
      // Call the backend to mark the booking as paid (UPI/Card simulation).
      const upiCardMethod = payment === 'upi' ? 'UPI' : 'Card';
      try {
        const pay = await api.pay(booking.bookingId, upiCardMethod);
        payResult = { ...pay, method: upiCardMethod };
        setWalletBalance(pay.walletBalance);
      } catch (e) {
        // Only generate a local pass for network/simulation errors (no HTTP status).
        // Real 4xx/5xx server errors should surface as failures, not fake success passes.
        if (e?.status) throw e;
        await sleep(900);
        const passId = `RF-PASS-${String(booking.bookingId).slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
        payResult = { paymentStatus: 'Success', journeyPassId: passId, walletBalance: walletBalanceRef.current, method: upiCardMethod, localOnly: true };
        // Re-sync wallet balance from server since the backend may have partially mutated it
        api.getWalletBalance().then(d => setWalletBalance(d.balance)).catch(() => {});
      }
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

    return { passId: payResult.journeyPassId, bookingId: booking.bookingId };
  };

  const openPassFromAssistant = () => { setAssistantOpen(false); go(SCREENS.PASS); };

  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const handleSelectRoute = (route, routeIndex = 0) => {
    const fullRoute = { ...route, source: searchResult?.source, destination: searchResult?.destination };
    setSelectedRoute(fullRoute);
    setSelectedRouteIndex(routeIndex);
    go(SCREENS.DETAILS, { route: fullRoute });
  };

  const handleBook = (booking, route) => {
    setBookingData(booking);
    if (route) setSelectedRoute((prev) => ({ ...prev, ...route }));
    go(SCREENS.BOOKING, { booking });
  };

  const handlePaymentSuccess = (result) => {
    setPaymentResult(result);
    go(SCREENS.PASS, { payment: result });
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
          <CarbonDashboardScreen onBack={() => go(SCREENS.HOME)} greenPoints={paymentResult?.greenPoints} />
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
            routeIndex={selectedRouteIndex}
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
            onHome={() => go(SCREENS.HOME)}
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

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  // Parse JSON defensively: non-JSON bodies (e.g. HTML 502 from a proxy, FastAPI 422
  // validation errors with unexpected content-type) would throw a SyntaxError if we
  // called res.json() unconditionally before checking res.ok.
  let data;
  try {
    data = await res.json();
  } catch {
    throw { status: res.status, detail: `HTTP ${res.status}` };
  }
  if (!res.ok) throw { status: res.status, detail: data?.detail || data?.reason || data?.error || 'Unknown error', ...data };
  return data;
}

export const api = {
  getLocations: () => request('GET', '/locations'),

  getRoutePairs: () => request('GET', '/routes/pairs'),

  searchRoutes: (source, destination, preference) =>
    request('POST', '/routes/search', { source, destination, preference }),

  getRouteDetails: (routeId) => request('GET', `/routes/${routeId}`),

  getRouteExplanation: (routeId) => request('GET', `/routes/${routeId}/explanation`),

  createBooking: (routeId) =>
    request('POST', '/bookings/create', { routeId, userId: 'demo-user' }),

  getBooking: (bookingId) => request('GET', `/bookings/${bookingId}`),

  // paymentMethod defaults to 'NCMC Wallet' for wallet payments. UPI/Card callers
  // should pass the actual method so the backend payment record is correct.
  pay: (bookingId, paymentMethod = 'NCMC Wallet') =>
    request('POST', '/payments/pay', { bookingId, paymentMethod }),

  getJourneyUpdates: (bookingId) => request('GET', `/journey/${bookingId}/updates`),

  getWalletBalance: () => request('GET', '/wallet/balance?userId=demo-user'),

  addWalletMoney: (amountRupees) =>
    request('POST', '/wallet/add', { amountRupees, userId: 'demo-user' }),
};

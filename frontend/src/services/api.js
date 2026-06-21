const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw { status: res.status, detail: data.detail || data.error || 'Unknown error', ...data };
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

  pay: (bookingId) =>
    request('POST', '/payments/pay', { bookingId, paymentMethod: 'Mock NCMC Wallet' }),

  getJourneyUpdates: (bookingId) => request('GET', `/journey/${bookingId}/updates`),

  getWalletBalance: () => request('GET', '/wallet/balance?userId=demo-user'),

  addWalletMoney: (amountRupees) =>
    request('POST', '/wallet/add', { amountRupees, userId: 'demo-user' }),
};

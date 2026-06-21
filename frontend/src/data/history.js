// Persistent trip history. Seeded with a few realistic past journeys so the
// dashboard looks alive on first open, then real bookings are prepended.
const KEY = 'rf_trip_history';

const SEED = [
  { passId: 'RF-PASS-9921', from: 'Tech Park', to: 'Central Railway Station', summary: 'Metro → Bus → Walk', fare: 64, co2: 2.8, status: 'Completed', dateLabel: 'Yesterday, 6:10 PM' },
  { passId: 'RF-PASS-9847', from: 'Residential Area North', to: 'Tech Park', summary: 'Bus → Metro', fare: 48, co2: 3.4, status: 'Completed', dateLabel: '2 days ago, 9:05 AM' },
  { passId: 'RF-PASS-9710', from: 'University Campus', to: 'Shopping Mall', summary: 'Auto → Metro → Walk', fare: 72, co2: 4.1, status: 'Completed', dateLabel: 'Jun 18, 4:40 PM' },
  { passId: 'RF-PASS-9655', from: 'Airport Road', to: 'Metro Central', summary: 'Metro → Walk', fare: 35, co2: 2.2, status: 'Completed', dateLabel: 'Jun 16, 8:20 AM' },
];

export function getTrips() {
  try {
    const t = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(t)) return t;
  } catch { /* ignore */ }
  try { localStorage.setItem(KEY, JSON.stringify(SEED)); } catch { /* ignore */ }
  return [...SEED];
}

function formatNow() {
  try {
    const d = new Date();
    const time = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `Today, ${time}`;
  } catch { return 'Today'; }
}

export function recordTrip({ passId, from, to, summary, fare = 0, co2 = 0, status = 'Completed' } = {}) {
  const trips = getTrips();
  const entry = { passId, from, to, summary, fare, co2, status, dateLabel: formatNow() };
  const next = [entry, ...trips].slice(0, 30);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

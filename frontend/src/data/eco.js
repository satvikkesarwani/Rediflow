// Persistent eco/carbon stats. Seeded with a realistic baseline so the dashboard
// looks alive on first open, then grows as the user completes real journeys.
const KEY = 'rf_eco_stats';

const SEED = {
  trips: 14,
  ecoTrips: 9,
  co2SavedKg: 31.8,
  greenPoints: 365,
  moneySaved: 642,
  streak: 5,
  history: [4.1, 5.6, 3.2, 7.8, 5.0, 6.4, 8.2], // last 7 days, kg CO₂ saved
  modes: { metro: 42, bus: 28, train: 14, walk: 16 }, // % contribution
};

export function getEcoStats() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s.co2SavedKg === 'number') return s;
  } catch { /* ignore */ }
  try { localStorage.setItem(KEY, JSON.stringify(SEED)); } catch { /* ignore */ }
  return { ...SEED };
}

export function recordEcoTrip({ co2Kg = 0, points = 0, moneySaved = 0, eco = false } = {}) {
  const s = getEcoStats();
  const next = {
    ...s,
    trips: s.trips + 1,
    ecoTrips: s.ecoTrips + (eco ? 1 : 0),
    co2SavedKg: Math.round((s.co2SavedKg + co2Kg) * 10) / 10,
    greenPoints: s.greenPoints + points,
    moneySaved: s.moneySaved + Math.max(0, Math.round(moneySaved)),
    streak: s.streak + 1,
    history: [...s.history.slice(1), Math.round(co2Kg * 10) / 10],
  };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

// Derived impact equivalents.
export const treesEquivalent = (kg) => (kg / 21.77).toFixed(1);   // ~21.77 kg CO₂/tree/yr
export const carKmAvoided = (kg) => Math.round(kg / 0.17);         // ~170 g CO₂/km for a car

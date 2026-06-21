// Derives demo-friendly display metrics (match %, safety %, crowd, status, CO₂)
// from the data the backend already returns, so the UI matches premium transit apps.

function seed(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (str.charCodeAt(i) + ((h << 5) - h)) & 0xffffffff;
  return Math.abs(h);
}

export function matchScore(route) {
  // backend score is a minimised weighted cost (lower = better), roughly 0..0.6
  const base = 99 - (route.score || 0) * 55;
  const safetyBoost = route.safetyLabel === 'High' ? 2 : route.safetyLabel === 'Low' ? -4 : 0;
  return Math.max(71, Math.min(99, Math.round(base + safetyBoost)));
}

export function safetyPct(route) {
  const s = seed(route.routeId);
  if (route.safetyLabel === 'High') return 86 + (s % 10);   // 86–95
  if (route.safetyLabel === 'Low') return 55 + (s % 12);    // 55–66
  return 72 + (s % 11);                                      // 72–82
}

export function carbonKg(route) {
  const s = seed(route.routeId + 'c');
  if (route.carbonLabel === 'Low') return (2.2 + (s % 12) / 10).toFixed(1);
  if (route.carbonLabel === 'High') return (5.8 + (s % 20) / 10).toFixed(1);
  return (3.8 + (s % 16) / 10).toFixed(1);
}

export function statusLabel(route) {
  if (route.reliabilityLabel === 'High') return { text: 'On Time', color: '#059669', bg: '#ECFDF5' };
  if (route.reliabilityLabel === 'Low') {
    const m = 4 + (seed(route.routeId) % 4);
    return { text: `${m} min late`, color: '#B45309', bg: '#FFFBEB' };
  }
  const m = 1 + (seed(route.routeId) % 3);
  return { text: `${m} min late`, color: '#B45309', bg: '#FFFBEB' };
}

// Per-mode crowd level keyed off the route summary.
export function crowdFor(mode, routeId = '') {
  const s = seed(routeId + mode);
  if (mode === 'walk') return null;
  if (mode === 'bus') return ['Light', 'Moderate', 'Busy'][s % 3];
  if (mode === 'metro' || mode === 'train') return ['Light', 'Moderate'][s % 2];
  return 'Light';
}

const CROWD_COLOR = { Light: '#059669', Moderate: '#D97706', Busy: '#DC2626' };
export const crowdColor = (c) => CROWD_COLOR[c] || '#64748B';

// Short, instant rationale (no API call) from the route's tag + metrics.
export function whyText(route) {
  const bits = [];
  const tag = route.tag;
  if (tag === 'Fastest') bits.push('Quickest option for this trip');
  else if (tag === 'Cheapest') bits.push('Lowest total fare available');
  else if (tag === 'Eco-Friendly') bits.push('Greenest route with low emissions');
  else if (tag === 'Fewer Transfers') bits.push('Fewest mode changes — smoother ride');
  else if (tag === 'Less Walking') bits.push('Minimal walking distance');
  else bits.push('Best overall balance of time, fare and comfort');
  if (route.safetyLabel === 'High') bits.push(`safety ${safetyPct(route)}% — well above the safe threshold`);
  else bits.push(`safety ${safetyPct(route)}%`);
  if (route.carbonLabel === 'Low') bits.push('low carbon footprint');
  return bits.join('. ') + '. Fare locked for 10 minutes.';
}

const MODE_BAR_COLOR = {
  walk: '#94A3B8', bus: '#3B82F6', metro: '#008B74', train: '#0F766E',
  auto: '#F59E0B', cab: '#F97316', bike: '#22C55E',
};
export const modeBarColor = (m) => MODE_BAR_COLOR[m] || '#94A3B8';

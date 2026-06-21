// Lightweight on-device NLU for the RideFlow Assistant. Parses a natural-language
// command into { source, destination, prefId, safeMode } by matching the known
// stops + preference synonyms. No API key needed — works fully offline.
import { LOCATIONS } from './geo';

// Aliases so casual phrasing maps to canonical stop names.
const ALIASES = {
  'Central Railway Station': ['central', 'railway', 'station', 'railway station', 'central station'],
  'Metro Central': ['metro', 'metro central', 'metro station'],
  'City Bus Depot': ['bus depot', 'depot', 'bus stand'],
  'Tech Park': ['tech park', 'techpark', 'office', 'work', 'it park'],
  'University Campus': ['university', 'campus', 'college'],
  'Residential Area North': ['home', 'residential', 'north', 'residential area'],
  'Airport Road': ['airport', 'airport road'],
  'Shopping Mall': ['mall', 'shopping', 'shopping mall', 'market'],
};

const PREF_SYNONYMS = [
  { id: 'cheapest', words: ['cheap', 'cheapest', 'cheaper', 'budget', 'low cost', 'lowest fare', 'save money'] },
  { id: 'fastest', words: ['fast', 'fastest', 'quick', 'quickest', 'hurry', 'asap', 'soon', 'in a rush'] },
  { id: 'eco_friendly', words: ['eco', 'green', 'greenest', 'environment', 'carbon', 'sustainable'] },
  { id: 'women_safe', words: ['safe', 'safest', 'safer', 'women', 'woman', 'night', 'secure'] },
  { id: 'accessible', words: ['accessible', 'wheelchair', 'elderly', 'less walking', 'least walking', 'step free'] },
  { id: 'fewest_transfers', words: ['direct', 'fewest transfers', 'least transfers', 'fewer changes', 'no transfers', 'one mode'] },
  { id: 'balanced', words: ['balanced', 'best', 'recommended', 'optimal'] },
];

function findStop(segment) {
  const s = segment.toLowerCase();
  // longest alias match wins to avoid 'station' grabbing the wrong stop
  let best = null;
  let bestLen = 0;
  for (const loc of LOCATIONS) {
    const aliases = [loc.name.toLowerCase(), ...(ALIASES[loc.name] || [])];
    for (const a of aliases) {
      if (s.includes(a) && a.length > bestLen) { best = loc.name; bestLen = a.length; }
    }
  }
  return best;
}

export function parseCommand(text = '') {
  const lower = text.toLowerCase();

  // Intent: a "book" command runs the full booking pipeline; otherwise just plan.
  const intent = /\b(book|reserve|buy|pay|deduct|get me a ticket|purchase)\b/.test(lower) ? 'book' : 'plan';

  // Payment method (defaults to NCMC wallet for a booking command).
  let payment = 'wallet';
  if (/\b(upi|gpay|google pay|phonepe|paytm|scan|qr)\b/.test(lower)) payment = 'upi';
  else if (/\bcard\b/.test(lower)) payment = 'card';
  else if (/\b(ncmc|wallet)\b/.test(lower)) payment = 'wallet';

  // Preference
  let prefId = 'balanced';
  let safeMode = false;
  for (const p of PREF_SYNONYMS) {
    if (p.words.some((w) => lower.includes(w))) {
      prefId = p.id;
      if (p.id === 'women_safe') safeMode = true;
      break;
    }
  }
  if (lower.includes('safe')) safeMode = true;

  // Source / destination. Prefer explicit "from X to Y".
  let source = null;
  let destination;
  const fromTo = lower.match(/from (.+?) to (.+)/);
  if (fromTo) {
    source = findStop(fromTo[1]);
    destination = findStop(fromTo[2]);
  } else {
    const toMatch = lower.match(/\bto (.+)/) || lower.match(/\b(?:reach|take me to|go to|going to|towards|for)\s+(.+)/);
    destination = findStop(toMatch ? toMatch[1] : lower);
  }
  if (!destination) destination = findStop(lower);

  return { source, destination, prefId, safeMode, intent, payment, raw: text };
}

const PREF_LABEL = {
  cheapest: 'cheapest', fastest: 'fastest', eco_friendly: 'greenest',
  women_safe: 'safest', accessible: 'most accessible', fewest_transfers: 'most direct',
  balanced: 'best',
};
export const prefLabel = (id) => PREF_LABEL[id] || 'best';

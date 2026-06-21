import { Scale, Zap, Banknote, Leaf, ShieldCheck, Accessibility, Repeat, Footprints } from 'lucide-react';

// Each preference maps to a backend scoring profile. "Women Safe" additionally
// flips Safe Mode on; "Accessible" minimises walking.
export const PREFERENCES = [
  { id: 'balanced',         label: 'Balanced',       icon: Scale,         backend: 'balanced' },
  { id: 'fastest',          label: 'Fastest',        icon: Zap,           backend: 'fastest' },
  { id: 'cheapest',         label: 'Cheapest',       icon: Banknote,      backend: 'cheapest' },
  { id: 'eco_friendly',     label: 'Eco-Friendly',   icon: Leaf,          backend: 'eco_friendly' },
  { id: 'women_safe',       label: 'Women Safe',     icon: ShieldCheck,   backend: 'balanced', safe: true },
  { id: 'accessible',       label: 'Accessible',     icon: Accessibility, backend: 'least_walking' },
  { id: 'fewest_transfers', label: 'Least Transfers',icon: Repeat,        backend: 'fewest_transfers' },
  { id: 'least_walking',    label: 'Least Walking',  icon: Footprints,    backend: 'least_walking' },
];

export const prefToBackend = (id) => PREFERENCES.find((p) => p.id === id)?.backend || 'balanced';
export const prefIsSafe = (id) => !!PREFERENCES.find((p) => p.id === id)?.safe;

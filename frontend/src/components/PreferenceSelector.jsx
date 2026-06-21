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

export function PreferenceSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {PREFERENCES.map((p) => {
        const active = value === p.id;
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            style={{
              padding: '8px 13px',
              borderRadius: 20,
              border: active ? '1px solid var(--primary)' : '1px solid #e2e8f0',
              background: active ? 'var(--primary)' : 'white',
              color: active ? 'white' : '#64748B',
              fontWeight: active ? 700 : 500,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
            }}
          >
            <Icon size={14} /> {p.label}
          </button>
        );
      })}
    </div>
  );
}

import { Scale, Zap, Banknote, Footprints, Shuffle, Leaf } from 'lucide-react';

const PREFERENCES = [
  { id: 'balanced', label: 'Balanced', icon: <Scale size={14} /> },
  { id: 'fastest', label: 'Fastest', icon: <Zap size={14} /> },
  { id: 'cheapest', label: 'Cheapest', icon: <Banknote size={14} /> },
  { id: 'least_walking', label: 'Less Walking', icon: <Footprints size={14} /> },
  { id: 'fewest_transfers', label: 'Fewer Transfers', icon: <Shuffle size={14} /> },
  { id: 'eco_friendly', label: 'Eco-Friendly', icon: <Leaf size={14} /> },
];

export function PreferenceSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {PREFERENCES.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          style={{
            padding: '8px 14px',
            borderRadius: 20,
            border: value === p.id ? '1.5px solid #4F46E5' : '1.5px solid #e2e8f0',
            background: value === p.id ? '#EEF2FF' : 'white',
            color: value === p.id ? '#3730A3' : '#64748B',
            fontWeight: value === p.id ? 600 : 500,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {p.icon} {p.label}
        </button>
      ))}
    </div>
  );
}


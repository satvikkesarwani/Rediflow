import { Scale, Zap, Banknote, Footprints, Shuffle, Leaf } from 'lucide-react';

const PREFERENCES = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'fastest', label: 'Fastest' },
  { id: 'cheapest', label: 'Cheapest' },
  { id: 'least_walking', label: 'Least walking' },
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
            border: value === p.id ? '1px solid var(--primary)' : '1px solid #e2e8f0',
            background: value === p.id ? 'var(--primary)' : 'white',
            color: value === p.id ? 'white' : '#64748B',
            fontWeight: value === p.id ? 600 : 500,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}


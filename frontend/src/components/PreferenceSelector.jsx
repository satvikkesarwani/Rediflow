import { PREFERENCES } from '../data/preferences';

export function PreferenceSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {PREFERENCES.map((p) => {
        const active = value === p.id;
        const Icon = p.icon;
        return (
          <button
            key={p.id}
            className="btn-tap"
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

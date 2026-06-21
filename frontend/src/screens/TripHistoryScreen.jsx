import { getTrips } from '../data/history';
import { ArrowLeft, MapPin, Leaf, Ticket, History, Train, Bus, Car, Footprints } from 'lucide-react';

const MODE_ICON = {
  walk: <Footprints size={13} />, bus: <Bus size={13} />, metro: <Train size={13} />,
  train: <Train size={13} />, auto: <Car size={13} />, cab: <Car size={13} />,
};

export function TripHistoryScreen({ onBack }) {
  const trips = getTrips();
  const totalSpent = trips.reduce((s, t) => s + (t.fare || 0), 0);
  const totalCo2 = trips.reduce((s, t) => s + (t.co2 || 0), 0).toFixed(1);

  return (
    <div className="screen-enter" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #008B74 0%, #0F766E 100%)', padding: '20px 20px 28px', color: 'white' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={22} /> Travel History
        </h2>
        <p style={{ fontSize: 13, color: '#A7F3D0', marginTop: 4 }}>All your past journeys with RideFlow</p>
      </div>

      <div style={{ padding: '0 16px 28px', marginTop: -16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <Summary value={trips.length} label="Trips" />
          <Summary value={`₹${totalSpent}`} label="Total spent" />
          <Summary value={`${totalCo2}kg`} label="CO₂ saved" green />
        </div>

        {/* List */}
        {trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <History size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#334155', marginBottom: 8 }}>No trips yet</h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>Your completed journeys will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trips.map((t, i) => (
              <div key={t.passId || i} className="card animate-fade-in-up" style={{ borderRadius: 16, padding: 16, animationDelay: `${i * 50}ms` }}>
                {/* date + status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>{t.dateLabel}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: 12 }}>{t.status}</span>
                </div>

                {/* from -> to */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
                    <span style={{ width: 2, height: 16, background: '#E2E8F0' }} />
                    <MapPin size={12} color="#EF4444" fill="#EF4444" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{t.from}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 14 }}>{t.to}</div>
                  </div>
                </div>

                {/* modes */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {(t.summary || '').split(' → ').map((m, j) => {
                    const key = m.trim().toLowerCase().split(' ')[0];
                    return (
                      <span key={j} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '3px 9px', fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'capitalize' }}>
                        {MODE_ICON[key]} {m.trim()}
                      </span>
                    );
                  })}
                </div>

                {/* footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#059669', fontWeight: 600 }}>
                    <Leaf size={13} /> {t.co2}kg saved
                  </span>
                  {t.passId && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', fontWeight: 600 }}>
                      <Ticket size={12} /> {t.passId}
                    </span>
                  )}
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>₹{t.fare}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Summary({ value, label, green }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '14px 8px', textAlign: 'center', border: '1px solid #F1F5F9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: green ? '#059669' : '#0F172A' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  );
}

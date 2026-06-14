import { Star, Zap, Banknote, Leaf, Shuffle, Footprints, Train, Bus, Car, Bike, ArrowRight } from 'lucide-react';

const MODE_ICONS = {
  walk: <Footprints size={24} />,
  bus: <Bus size={24} />,
  metro: <Train size={24} />,
  train: <Train size={24} />,
  auto: <Car size={24} />,
  cab: <Car size={24} />,
  bike: <Bike size={24} />,
};

const getModeColor = (mode) => {
  const colors = {
    walk: '#10B981', bus: '#3B82F6', metro: '#008B74',
    train: '#0F766E', auto: '#F59E0B', cab: '#F97316', bike: '#22C55E',
  };
  return colors[mode] || '#64748B';
};

const TAG_CONFIG = {
  Balanced: { label: 'Recommended', icon: <Star size={12} fill="currentColor" />, bg: '#ECFDF5', color: '#059669', border: '#34D399' },
  Fastest: { label: 'Fastest', icon: <Zap size={12} fill="currentColor" />, bg: '#FFFBEB', color: '#D97706', border: '#FCD34D' },
  Cheapest: { label: 'Cheapest', icon: null, bg: '#F0FDF4', color: '#166534', border: '#86EFAC' },
  'Eco-Friendly': { label: 'Eco-Friendly', icon: <Leaf size={12} fill="currentColor" />, bg: '#F0FDF4', color: '#15803D', border: '#86EFAC' },
  'Less Walking': { label: 'Least Walking', icon: null, bg: '#EFF6FF', color: '#1D4ED8', border: '#93C5FD' },
  'Fewer Transfers': { label: 'Fewer Transfers', icon: null, bg: '#FFF1F2', color: '#BE123C', border: '#FDA4AF' },
  Alternative: { label: 'Alternative', icon: null, bg: '#F8FAFC', color: '#475569', border: '#CBD5E1' },
};

const BADGE_COLORS = ['#008B74', '#10B981', '#3B82F6', '#F59E0B'];

export function RouteCard({ route, index = 0, onClick, delay = 0 }) {
  const tag = TAG_CONFIG[route.tag] || TAG_CONFIG['Alternative'];
  const modes = route.summary.split(' → ');
  const letterBadge = String.fromCharCode(65 + (index % 26));
  const badgeColor = BADGE_COLORS[index % BADGE_COLORS.length];

  return (
    <div
      className="card cursor-pointer animate-fade-in-up"
      style={{
        padding: 0,
        animationDelay: `${delay}ms`,
        borderRadius: '16px',
        border: `1.5px solid ${badgeColor}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        position: 'relative'
      }}
      onClick={onClick}
    >
      {/* Letter Badge */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0,
        background: badgeColor,
        color: 'white',
        width: 36, height: 36,
        borderBottomRightRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 16
      }}>
        {letterBadge}
      </div>

      <div style={{ padding: '16px 20px 16px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', paddingTop: 2 }}>
          {route.summary}
        </div>
        <div style={{
          background: tag.bg, color: tag.color, border: `1px solid ${tag.border}`,
          padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          {tag.label} {tag.icon}
        </div>
      </div>

      {/* Mode Icons */}
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        {modes.map((m, i) => {
          const key = m.trim().toLowerCase();
          const color = getModeColor(key);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ color: color, display: 'flex', alignItems: 'center' }}>
                {MODE_ICONS[key]}
              </div>
              {i < modes.length - 1 && <ArrowRight size={18} color="#94A3B8" />}
            </div>
          );
        })}
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '0 20px 20px',
        alignItems: 'center'
      }}>
        <MetricCol value={`${route.totalTimeMinutes} min`} label="Total time" />
        <div style={{ width: 1, height: 32, background: '#E2E8F0' }} />
        <MetricCol value={`₹${route.totalFareRupees}`} label="Fare" />
        <div style={{ width: 1, height: 32, background: '#E2E8F0' }} />
        <MetricCol value={route.transferCount} label="Transfers" />
        <div style={{ width: 1, height: 32, background: '#E2E8F0' }} />
        <MetricCol value={`${route.walkingDistanceMeters > 1000 ? (route.walkingDistanceMeters/1000).toFixed(1) + ' km' : route.walkingDistanceMeters + ' m'}`} label="Walk" />
      </div>

      {/* Carbon Footer */}
      <div style={{ 
        borderTop: '1px solid #E2E8F0', 
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 6,
        color: '#059669', fontSize: 13, fontWeight: 600
      }}>
        <Leaf size={16} fill="currentColor" /> Carbon: {route.carbonLabel}
      </div>
    </div>
  );
}

function MetricCol({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

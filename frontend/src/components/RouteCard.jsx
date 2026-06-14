import { Star, Zap, Banknote, Leaf, Shuffle, Clock, Footprints, Shield, Wifi, Train, Bus, Car, Bike } from 'lucide-react';

const MODE_ICONS = {
  walk: <Footprints size={12} />,
  bus: <Bus size={12} />,
  metro: <Train size={12} />,
  train: <Train size={12} />,
  auto: <Car size={12} />,
  cab: <Car size={12} />,
  bike: <Bike size={12} />,
};

const TAG_CONFIG = {
  Recommended: { label: 'Recommended', icon: <Star size={12} />, cls: 'badge-recommended' },
  Fastest: { label: 'Fastest', icon: <Zap size={12} />, cls: 'badge-fastest' },
  Cheapest: { label: 'Cheapest', icon: <Banknote size={12} />, cls: 'badge-cheapest' },
  'Eco-Friendly': { label: 'Eco-Friendly', icon: <Leaf size={12} />, cls: 'badge-eco' },
  Alternative: { label: 'Alternative', icon: <Shuffle size={12} />, cls: 'badge-alt' },
};

const CARD_BORDER = {
  Recommended: '#4F46E5',
  Fastest: '#F59E0B',
  Cheapest: '#10B981',
  'Eco-Friendly': '#22C55E',
  Alternative: '#CBD5E1',
};

export function RouteCard({ route, onClick, delay = 0 }) {
  const tag = TAG_CONFIG[route.tag] || TAG_CONFIG['Alternative'];
  const border = CARD_BORDER[route.tag] || CARD_BORDER['Alternative'];

  const modes = route.summary.split(' → ');

  return (
    <div
      className="card cursor-pointer animate-fade-in-up"
      style={{
        borderLeft: `4px solid ${border}`,
        animationDelay: `${delay}ms`,
      }}
      onClick={onClick}
    >
      {/* Tag */}
      <div className="flex items-center justify-between mb-3">
        <span className={`badge ${tag.cls}`}>
          {tag.icon} <span style={{ marginLeft: 2 }}>{tag.label}</span>
        </span>
        <span style={{ color: '#64748B', fontSize: 13, fontWeight: 500 }}>Score: {route.score}</span>
      </div>

      {/* Mode sequence */}
      <div className="flex items-center gap-1 flex-wrap mb-4">
        {modes.map((m, i) => {
          const key = m.trim().toLowerCase();
          return (
            <span key={i} className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white mode-${key}`}
                style={{ background: getModeColor(key) }}
              >
                {MODE_ICONS[key]} {m.trim()}
              </span>
              {i < modes.length - 1 && <span style={{ color: '#94A3B8', fontSize: 12 }}>→</span>}
            </span>
          );
        })}
      </div>

      {/* Core metrics */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <MetricBox icon={<Clock size={14} />} label="Time" value={`${route.totalTimeMinutes} min`} big />
        <MetricBox icon={<Banknote size={14} />} label="Fare" value={`₹${route.totalFareRupees}`} big />
        <MetricBox icon={<Shuffle size={14} />} label="Transfers" value={`${route.transferCount}`} />
        <MetricBox icon={<Footprints size={14} />} label="Walking" value={`${route.walkingDistanceMeters}m`} />
      </div>

      {/* Labels row */}
      <div className="flex items-center gap-4 pt-3 mt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
        <LabelPill icon={<Leaf size={12} />} text={`${route.carbonLabel} carbon`} color={route.carbonLabel === 'Low' ? '#10B981' : route.carbonLabel === 'Medium' ? '#F59E0B' : '#EF4444'} />
        <LabelPill icon={<Shield size={12} />} text={`${route.safetyLabel} safety`} color={route.safetyLabel === 'High' ? '#10B981' : route.safetyLabel === 'Medium' ? '#F59E0B' : '#EF4444'} />
        <LabelPill icon={<Wifi size={12} />} text={`${route.reliabilityLabel} reliability`} color={route.reliabilityLabel === 'High' ? '#10B981' : route.reliabilityLabel === 'Medium' ? '#F59E0B' : '#EF4444'} />
      </div>

      {/* CTA */}
      <div className="flex justify-end mt-4">
        <span style={{ color: '#4F46E5', fontSize: 13, fontWeight: 600 }}>View Route →</span>
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value, big }) {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '8px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: big ? 18 : 15, fontWeight: 700, color: '#0F172A' }}>{value}</div>
    </div>
  );
}

function LabelPill({ icon, text, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color, fontWeight: 600 }}>
      {icon} {text}
    </span>
  );
}

function getModeColor(mode) {
  const colors = {
    walk: '#94A3B8', bus: '#3B82F6', metro: '#4F46E5',
    train: '#7C3AED', auto: '#F59E0B', cab: '#F97316', bike: '#22C55E',
  };
  return colors[mode] || '#64748B';
}

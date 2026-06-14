import { Star, Zap, Banknote, Leaf, Shuffle, Clock, Footprints, Shield, Wifi, Train, Bus, Car, Bike, ChevronRight } from 'lucide-react';

const MODE_ICONS = {
  walk: <Footprints size={14} />,
  bus: <Bus size={14} />,
  metro: <Train size={14} />,
  train: <Train size={14} />,
  auto: <Car size={14} />,
  cab: <Car size={14} />,
  bike: <Bike size={14} />,
};

const TAG_CONFIG = {
  Recommended: { label: 'RECOMMENDED', icon: <Star size={14} />, bg: '#EEF2FF', color: '#4F46E5', border: '#4F46E5' },
  Fastest: { label: 'FASTEST', icon: <Zap size={14} />, bg: '#FFFBEB', color: '#D97706', border: '#F59E0B' },
  Cheapest: { label: 'CHEAPEST', icon: <Banknote size={14} />, bg: '#ECFDF5', color: '#059669', border: '#10B981' },
  'Eco-Friendly': { label: 'ECO-FRIENDLY', icon: <Leaf size={14} />, bg: '#F0FDF4', color: '#15803D', border: '#22C55E' },
  Alternative: { label: 'ALTERNATIVE', icon: <Shuffle size={14} />, bg: '#F1F5F9', color: '#475569', border: '#94A3B8' },
};

export function RouteCard({ route, onClick, delay = 0 }) {
  const tag = TAG_CONFIG[route.tag] || TAG_CONFIG['Alternative'];
  const modes = route.summary.split(' → ');

  return (
    <div
      className="card cursor-pointer animate-fade-in-up"
      style={{
        borderLeft: `6px solid ${tag.border}`,
        padding: '24px 16px',
        animationDelay: `${delay}ms`,
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      }}
      onClick={onClick}
    >
      {/* Tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <span style={{ background: tag.bg, color: tag.color, border: `1px solid ${tag.color}30`, padding: '4px 12px', borderRadius: '20px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.5px' }}>
          {tag.icon} {tag.label}
        </span>
        <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '4px 12px', borderRadius: '20px', fontSize: 13, fontWeight: 700 }}>
          Score {route.score}
        </span>
      </div>

      {/* Mode sequence */}
      <div className="flex items-center gap-y-3 gap-x-2 flex-wrap mb-6">
        {modes.map((m, i) => {
          const key = m.trim().toLowerCase();
          return (
            <span key={i} className="flex items-center gap-2">
              <span
                style={{ background: getModeColor(key), color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {MODE_ICONS[key]} {m.trim()}
              </span>
              {i < modes.length - 1 && <ChevronRight size={16} color="#94A3B8" />}
            </span>
          );
        })}
      </div>

      {/* Core metrics */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <MetricBox icon={<Clock size={14} />} label="Time" value={`${route.totalTimeMinutes} min`} />
        <MetricBox icon={<Banknote size={14} />} label="Fare" value={`₹${route.totalFareRupees}`} />
        <MetricBox icon={<Shuffle size={14} />} label="Transfers" value={`${route.transferCount}`} />
        <MetricBox icon={<Footprints size={14} />} label="Walking" value={`${route.walkingDistanceMeters} m`} />
      </div>

      {/* Labels row & CTA */}
      <div className="flex flex-wrap items-center justify-between gap-y-4 pt-5" style={{ borderTop: '1px solid #F1F5F9' }}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 flex-1 min-w-0 pr-2">
          <LabelPill icon={<Leaf size={14} />} text={`${route.carbonLabel} carbon`} color={route.carbonLabel === 'Low' ? '#10B981' : route.carbonLabel === 'Medium' ? '#F59E0B' : '#EF4444'} />
          <LabelPill icon={<Shield size={14} />} text={`${route.safetyLabel} safety`} color={route.safetyLabel === 'High' ? '#10B981' : route.safetyLabel === 'Medium' ? '#F59E0B' : '#EF4444'} />
          <LabelPill icon={<Wifi size={14} />} text={`${route.reliabilityLabel} reliability`} color={route.reliabilityLabel === 'High' ? '#10B981' : route.reliabilityLabel === 'Medium' ? '#F59E0B' : '#EF4444'} />
        </div>
        <div style={{ color: '#4F46E5', fontSize: 13, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          View Route <span style={{ fontSize: 16 }}>→</span>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value }) {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '12px 10px', minWidth: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B', marginBottom: 6 }}>
        <span className="flex-shrink-0">{icon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </div>
    </div>
  );
}

function LabelPill({ icon, text, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color, fontWeight: 600, minWidth: 0, overflow: 'hidden' }}>
      <span className="flex-shrink-0 flex items-center">{icon}</span>
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
    </span>
  );
}

function getModeColor(mode) {
  const colors = {
    walk: '#94A3B8', bus: '#3B82F6', metro: '#6D28D9', // Deep purple for metro
    train: '#7C3AED', auto: '#F59E0B', cab: '#F97316', bike: '#22C55E',
  };
  return colors[mode] || '#64748B';
}

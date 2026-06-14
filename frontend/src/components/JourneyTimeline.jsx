import { useState } from 'react';
import { Footprints, Bus, Train, Car, Bike, MapPin } from 'lucide-react';

const MODE_ICONS = {
  walk: <Footprints size={12} color="white" />,
  bus: <Bus size={12} color="white" />,
  metro: <Train size={12} color="white" />,
  train: <Train size={12} color="white" />,
  auto: <Car size={12} color="white" />,
  cab: <Car size={12} color="white" />,
  bike: <Bike size={12} color="white" />,
};

const MODE_COLORS = {
  walk: '#94A3B8', bus: '#3B82F6', metro: '#4F46E5',
  train: '#7C3AED', auto: '#F59E0B', cab: '#F97316', bike: '#22C55E',
};

export function JourneyTimeline({ steps }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ padding: '8px 0' }}>
      {steps.map((step, idx) => {
        const mode = step.mode?.toLowerCase() || 'walk';
        const color = MODE_COLORS[mode] || '#64748B';
        const icon = MODE_ICONS[mode] || <Bus size={12} color="white" />;
        const isLast = idx === steps.length - 1;
        const isExpanded = expanded === idx;

        return (
          <div key={idx} className="flex gap-3" style={{ marginBottom: isLast ? 0 : 0 }}>
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center" style={{ minWidth: 24 }}>
              <div
                style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: color, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 10, flexShrink: 0,
                  boxShadow: `0 0 0 3px ${color}22`,
                  marginTop: 2,
                }}
              >
                {icon}
              </div>
              {!isLast && (
                <div style={{
                  width: 2, flex: 1, minHeight: 32,
                  background: `repeating-linear-gradient(to bottom, ${color} 0, ${color} 4px, transparent 4px, transparent 8px)`,
                  margin: '4px 0',
                }} />
              )}
            </div>

            {/* Step content */}
            <div
              style={{
                flex: 1, paddingBottom: isLast ? 0 : 20,
                cursor: 'pointer',
              }}
              onClick={() => setExpanded(isExpanded ? null : idx)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    {step.routeNumber && <span style={{ color }}>{step.routeNumber}</span>}
                    {step.lineName && <span style={{ color }}>{step.lineName}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    {step.from} → {step.to}
                  </div>
                  {step.platform && (
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <MapPin size={10} /> {step.platform}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                    {step.durationMinutes} min
                  </div>
                  <div style={{ fontSize: 13, color: step.fareRupees === 0 ? '#10B981' : '#64748B' }}>
                    {step.fareRupees === 0 ? 'Free' : `₹${step.fareRupees}`}
                  </div>
                </div>
              </div>

              {/* Expanded instruction */}
              {isExpanded && (
                <div
                  className="animate-fade-in"
                  style={{
                    marginTop: 8, padding: '10px 12px',
                    background: `${color}11`, borderRadius: 10,
                    borderLeft: `3px solid ${color}`,
                    fontSize: 13, color: '#475569', lineHeight: 1.5,
                  }}
                >
                  {step.instruction}
                  {step.distanceMeters > 0 && (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#94A3B8' }}>
                      Distance: {step.distanceMeters}m
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

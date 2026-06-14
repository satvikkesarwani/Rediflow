import { useState } from 'react';
import { Footprints, Bus, Train, Car, Bike, MapPin } from 'lucide-react';

const MODE_ICONS = {
  walk:  <Footprints size={18} color="white" />,
  bus:   <Bus size={18} color="white" />,
  metro: <Train size={18} color="white" />,
  train: <Train size={18} color="white" />,
  auto:  <Car size={18} color="white" />,
  cab:   <Car size={18} color="white" />,
  bike:  <Bike size={18} color="white" />,
};

const MODE_COLORS = {
  walk: '#10B981', bus: '#3B82F6', metro: '#008B74',
  train: '#0F766E', auto: '#F59E0B', cab: '#F97316', bike: '#22C55E',
};

// Compute cumulative arrival times starting from now
function getStepTimes(steps) {
  const now = new Date();
  const times = [];
  let cursor = new Date(now);
  for (const step of steps) {
    times.push(new Date(cursor));
    cursor = new Date(cursor.getTime() + step.durationMinutes * 60000);
  }
  return times;
}

function fmt(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function JourneyTimeline({ steps }) {
  const [expanded, setExpanded] = useState(null);
  const startTimes = getStepTimes(steps);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
      {steps.map((step, idx) => {
        const mode = step.mode?.toLowerCase() || 'walk';
        const color = MODE_COLORS[mode] || '#64748B';
        const icon = MODE_ICONS[mode] || <Bus size={18} color="white" />;
        const isLast = idx === steps.length - 1;
        const isExpanded = expanded === idx;
        const modeName = mode.charAt(0).toUpperCase() + mode.slice(1);

        // Arrival time at end of this step
        const arrivalTime = new Date(startTimes[idx].getTime() + step.durationMinutes * 60000);

        return (
          <div key={idx} style={{
            background: 'white',
            borderRadius: idx === 0 ? '16px 16px 0 0' : idx === steps.length - 1 ? '0 0 16px 16px' : '0',
            padding: '16px',
            borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
            boxShadow: idx === 0 ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
          }}>
            <div style={{ display: 'flex', gap: 14 }}>
              {/* Icon column with connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                {/* Numbered circle */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${color}40`,
                  }}>
                    {icon}
                  </div>
                  {/* Step number badge */}
                  <div style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#0F172A', color: 'white',
                    fontSize: 10, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid white',
                  }}>
                    {idx + 1}
                  </div>
                </div>
                {/* Connector line */}
                {!isLast && (
                  <div style={{ width: 2, flex: 1, minHeight: 24, background: '#E2E8F0', margin: '6px 0' }} />
                )}
                {/* Grey dot at bottom */}
                {!isLast && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#CBD5E1' }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }} onClick={() => setExpanded(isExpanded ? null : idx)}>
                {/* Row 1: Mode + duration | time badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>
                    {modeName}
                    {(step.routeNumber || step.lineName) && (
                      <span style={{ color, marginLeft: 6, fontWeight: 700 }}>
                        {step.routeNumber || step.lineName}
                      </span>
                    )}
                    <span style={{ fontWeight: 500, color: '#64748B', fontSize: 14, marginLeft: 4 }}>
                      • {step.durationMinutes} min
                    </span>
                  </div>
                  <span style={{
                    background: `${color}18`, color: color,
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                    flexShrink: 0, marginLeft: 6,
                  }}>
                    {fmt(startTimes[idx])}
                  </span>
                </div>

                {/* Row 2: From location (bold) */}
                <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', marginBottom: 4 }}>
                  {step.from}
                </div>

                {/* Platform pill */}
                {step.platform && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: '#F1F5F9', padding: '3px 10px', borderRadius: 20,
                    fontSize: 12, color: '#64748B', fontWeight: 500, marginBottom: 6,
                  }}>
                    {step.platform}
                  </div>
                )}

                {/* Row 3: To destination | arrival time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                    to {step.to}
                  </div>
                  <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 500, flexShrink: 0, marginLeft: 8 }}>
                    {fmt(arrivalTime)}
                  </div>
                </div>

                {/* Expanded: instruction */}
                {isExpanded && (
                  <div style={{
                    marginTop: 10, padding: '10px 12px',
                    background: `${color}10`, borderRadius: 10,
                    borderLeft: `3px solid ${color}`,
                    fontSize: 13, color: '#475569', lineHeight: 1.6,
                  }}>
                    {step.instruction}
                    {step.distanceMeters > 0 && (
                      <div style={{ marginTop: 4, fontSize: 12, color: '#94A3B8' }}>
                        Distance: {step.distanceMeters}m · Fare: {step.fareRupees === 0 ? 'Free' : `₹${step.fareRupees}`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

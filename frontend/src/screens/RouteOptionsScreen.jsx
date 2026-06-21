import { RouteCard } from '../components/RouteCard';
import { RideMap } from '../components/RideMap';
import { coordsFor } from '../data/geo';
import { safetyPct } from '../data/routeMeta';
import { PREFERENCES } from '../components/PreferenceSelector';
import { ChevronLeft, Map, Eye, Sparkles, ShieldCheck } from 'lucide-react';

const SAFE_THRESHOLD = 80;

function SkeletonCard() {
  return (
    <div className="card" style={{ gap: 12, display: 'flex', flexDirection: 'column', borderRadius: 18 }}>
      <div className="skeleton" style={{ height: 24, width: '40%' }} />
      <div className="skeleton" style={{ height: 40, width: '80%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 60 }} />)}
      </div>
    </div>
  );
}

export function RouteOptionsScreen({ routes, source, destination, preference, prefId, safeMode, onSelect, onBack }) {
  const prefLabel = PREFERENCES.find((p) => p.id === prefId)?.label
    || { balanced: 'Balanced', fastest: 'Fastest', cheapest: 'Cheapest', least_walking: 'Least Walking', fewest_transfers: 'Least Transfers', eco_friendly: 'Eco-Friendly' }[preference]
    || 'Balanced';

  // Safe Mode hides routes below the safety threshold.
  const all = routes || [];
  const visible = safeMode ? all.filter((r) => safetyPct(r) >= SAFE_THRESHOLD) : all;
  const hiddenCount = all.length - visible.length;

  // AI insight comparing the top two visible routes.
  let insight = '';
  if (visible.length >= 2) {
    const diff = visible[1].totalTimeMinutes - visible[0].totalTimeMinutes;
    const fareDiff = visible[1].totalFareRupees - visible[0].totalFareRupees;
    if (diff > 0) insight = `Route 1 is ${diff} min faster than the next option.`;
    else if (fareDiff > 0) insight = `Route 1 saves ₹${fareDiff} versus the next option.`;
    else insight = `Route 1 is the best overall match for "${prefLabel}".`;
  } else if (visible.length === 1) {
    insight = `Top match for "${prefLabel}" — ${visible[0].totalTimeMinutes} min, ₹${visible[0].totalFareRupees}.`;
  }

  return (
    <div className="screen-enter" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: 'white', padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronLeft size={28} color="#0F172A" />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Route Options</h2>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ padding: '14px 20px 8px' }}>
        <div style={{ fontSize: 14, color: '#334155', fontWeight: 600, marginBottom: 12 }}>
          {source} <span style={{ color: '#94A3B8' }}>→</span> {destination}
          {safeMode && <span style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--primary)', fontWeight: 700 }}><ShieldCheck size={12} /> Safe Mode</span>}
        </div>

        {/* Map preview */}
        {routes && (
          <RideMap from={coordsFor(source)} to={coordsFor(destination)} showRoute height={150} badge="Live road route" />
        )}

        {/* AI Insight */}
        {insight && (
          <div style={{ marginTop: 12, background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)', border: '1px solid #C7D2FE', borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Sparkles size={18} color="#4338CA" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#3730A3' }}>AI Insight</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '1px 6px', borderRadius: 10 }}>● LIVE</span>
              </div>
              <p style={{ fontSize: 13, color: '#4338CA', margin: '3px 0 0', lineHeight: 1.5 }}>{insight}</p>
            </div>
          </div>
        )}

        {/* Hidden routes banner */}
        {safeMode && hiddenCount > 0 && (
          <div style={{ marginTop: 12, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#92400E', fontWeight: 600 }}>
            <Eye size={15} /> {hiddenCount} route{hiddenCount > 1 ? 's' : ''} hidden due to safety preferences · showing {visible.length} of {all.length}
          </div>
        )}
      </div>

      {/* Route cards */}
      <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!routes ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <Map size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#334155' }}>No routes to show</h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>{safeMode ? 'Try turning off Safe Mode' : 'Try different locations'}</p>
          </div>
        ) : (
          visible.map((route, i) => (
            <RouteCard key={route.routeId} route={route} index={i} delay={i * 80} onClick={() => onSelect(route)} />
          ))
        )}
      </div>
    </div>
  );
}

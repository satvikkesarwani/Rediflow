import { RouteCard } from '../components/RouteCard';
import { ChevronLeft, Map } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="card" style={{ gap: 12, display: 'flex', flexDirection: 'column', borderRadius: 20 }}>
      <div className="skeleton" style={{ height: 24, width: '40%' }} />
      <div className="skeleton" style={{ height: 40, width: '80%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
        <div className="skeleton" style={{ height: 60 }} />
        <div className="skeleton" style={{ height: 60 }} />
        <div className="skeleton" style={{ height: 60 }} />
        <div className="skeleton" style={{ height: 60 }} />
      </div>
    </div>
  );
}

export function RouteOptionsScreen({ routes, source, destination, preference, onSelect, onBack }) {
  const prefLabel = {
    balanced: 'Balanced', fastest: 'Fastest', cheapest: 'Cheapest',
    least_walking: 'Less Walking', fewest_transfers: 'Fewer Transfers', eco_friendly: 'Eco-Friendly',
  }[preference] || 'Balanced';

  return (
    <div className="screen-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '20px 24px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #F1F5F9'
      }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <ChevronLeft size={28} color="#0F172A" />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Route Options</h2>
        <div style={{ width: 28 }} />
      </div>

      <div style={{ padding: '16px 24px 8px' }}>
        <div style={{ fontSize: 14, color: '#334155', fontWeight: 500 }}>
          {source} <span style={{ color: '#94A3B8' }}>→</span> {destination}
        </div>
      </div>

      {/* Route cards */}
      <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {!routes ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : routes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Map size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#334155' }}>No routes found</h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>Try different locations</p>
          </div>
        ) : (
          <>
            {routes.map((route, i) => (
              <RouteCard
                key={route.routeId}
                route={route}
                index={i}
                delay={i * 80}
                onClick={() => onSelect(route)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

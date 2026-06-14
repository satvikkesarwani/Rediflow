import { RouteCard } from '../components/RouteCard';
import { ArrowLeft, Map } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="card" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ height: 20, width: '40%' }} />
      <div className="skeleton" style={{ height: 28, width: '80%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="skeleton" style={{ height: 56 }} />
        <div className="skeleton" style={{ height: 56 }} />
        <div className="skeleton" style={{ height: 56 }} />
        <div className="skeleton" style={{ height: 56 }} />
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
    <div className="screen-enter" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        padding: '24px 20px',
        color: 'white',
      }}>
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>
          {source} <span style={{ color: '#818cf8', margin: '0 4px' }}>→</span> {destination}
        </h2>
        <p style={{ fontSize: 14, color: '#a5b4fc' }}>
          {routes ? routes.length : 0} routes found · {prefLabel}
        </p>
      </div>

      {/* Route cards */}
      <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          routes.map((route, i) => (
            <RouteCard
              key={route.routeId}
              route={route}
              delay={i * 80}
              onClick={() => onSelect(route)}
            />
          ))
        )}
      </div>
    </div>
  );
}


import { RouteCard } from '../components/RouteCard';
import { ChevronLeft, SlidersHorizontal, Map, Leaf, ChevronDown } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="card" style={{ gap: 12, display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton" style={{ height: 20, width: '40%' }} />
      <div className="skeleton" style={{ height: 28, width: '80%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
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
    <div className="screen-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: '#3730A3',
        padding: '24px 20px',
        paddingBottom: '32px',
        color: 'white',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s' }}
        >
          <ChevronLeft size={24} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{source}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ color: '#a5b4fc', fontWeight: 400 }}>→</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{destination}</span>
            </div>
          </h2>
          <p style={{ fontSize: 13, color: '#c7d2fe' }}>
            {routes ? routes.length : 0} routes found · {prefLabel}
          </p>
        </div>
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
          <>
            {routes.map((route, i) => (
              <RouteCard
                key={route.routeId}
                route={route}
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

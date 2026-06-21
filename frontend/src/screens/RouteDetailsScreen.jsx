import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { RideMap } from '../components/RideMap';
import { coordsFor } from '../data/geo';
import { Star, Leaf, ClipboardList, Shield, Wifi, ArrowLeft, Footprints, Share2, ArrowRightLeft, AlertTriangle } from 'lucide-react';

const TAG_CONFIG = {
  Balanced:          { label: 'Recommended', bg: '#ECFDF5', color: '#059669', border: '#6EE7B7' },
  Fastest:           { label: 'Fastest',     bg: '#FFFBEB', color: '#D97706', border: '#FCD34D' },
  Cheapest:          { label: 'Cheapest',    bg: '#ECFDF5', color: '#059669', border: '#6EE7B7' },
  'Eco-Friendly':    { label: 'Eco-Friendly',bg: '#F0FDF4', color: '#16A34A', border: '#86EFAC' },
  'Less Walking':    { label: 'Less Walking',bg: '#EFF6FF', color: '#2563EB', border: '#93C5FD' },
  'Fewer Transfers': { label: 'Fewer Transfers', bg: '#FFF1F2', color: '#BE123C', border: '#FDA4AF' },
  Alternative:       { label: 'Alternative', bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
};

const BADGE_COLORS = ['#008B74', '#10B981', '#3B82F6', '#F59E0B'];

export function RouteDetailsScreen({ route, routeIndex = 0, onBook, onBack, addToast }) {
  const [detail, setDetail] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [det, exp] = await Promise.all([
          api.getRouteDetails(route.routeId),
          api.getRouteExplanation(route.routeId),
        ]);
        setDetail(det);
        setExplanation(exp.explanation);
      } catch {
        addToast('Could not load route details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [route.routeId, addToast]);

  const handleBook = async () => {
    setBooking(true);
    try {
      const b = await api.createBooking(route.routeId);
      onBook(b, detail || route);
    } catch (e) {
      addToast(e.detail || 'Booking failed. Try again.', 'error');
    } finally {
      setBooking(false);
    }
  };

  const shareLocation = async () => {
    const trip = `${route.source} → ${route.destination}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'RideFlow — My live trip', text: `I'm travelling ${trip}. Track me live.` });
        return;
      } catch { /* user cancelled */ }
    }
    addToast('Live location link copied — shared with trusted contacts', 'success');
  };

  const sos = () => addToast('SOS sent · sharing live location with emergency contacts', 'error');

  const tag = TAG_CONFIG[route.tag] || TAG_CONFIG['Alternative'];
  const badgeColor = BADGE_COLORS[routeIndex % BADGE_COLORS.length];
  const letterBadge = String.fromCharCode(65 + routeIndex);

  const carbonColor = route.carbonLabel === 'Low' ? '#059669' : route.carbonLabel === 'High' ? '#DC2626' : '#D97706';

  return (
    <div className="screen-enter" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>

      {/* Simple white header */}
      <div style={{
        background: 'white',
        padding: '20px 20px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #F1F5F9',
      }}>
        <button onClick={onBack} aria-label="Go back" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft size={24} color="#0F172A" />
        </button>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>Route Details</h2>
        <div style={{ width: 32 }} />
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        {/* Route Summary Card */}
        <div style={{
          background: 'white', borderRadius: 20, padding: '18px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {/* Left: badge + route name */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: badgeColor, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 15, flexShrink: 0,
                }}>
                  {letterBadge}
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>{route.summary}</div>
              </div>
              {/* Carbon label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 42, marginBottom: 8 }}>
                <Leaf size={13} color={carbonColor} fill={carbonColor} />
                <span style={{ fontSize: 13, color: carbonColor, fontWeight: 600 }}>
                  Carbon: {route.carbonLabel}
                </span>
              </div>
              {/* Tag badge */}
              <div style={{ marginLeft: 42 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: tag.bg, color: tag.color,
                  border: `1px solid ${tag.border}`,
                  padding: '4px 12px', borderRadius: 20,
                  fontSize: 12, fontWeight: 700,
                }}>
                  {tag.label}
                </span>
              </div>
            </div>

            {/* Right: time + fare */}
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {route.totalTimeMinutes} min
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 8 }}>Total time</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                ₹{route.totalFareRupees}
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Total fare</div>
            </div>
          </div>
        </div>

        {/* Route map */}
        <div style={{ marginBottom: 16 }}>
          <RideMap from={coordsFor(route.source)} to={coordsFor(route.destination)} showRoute height={170} badge="Live road route" />
        </div>

        {/* Journey Timeline */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
          </div>
        ) : (
          <>
            {detail?.steps && <JourneyTimeline steps={detail.steps} />}

            {/* Transfer + Walk footer */}
            <div style={{
              background: 'white', borderRadius: 16, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#475569' }}>
                <ArrowRightLeft size={16} color="#64748B" /> {route.transferCount} Transfer{route.transferCount !== 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#475569' }}>
                <Footprints size={16} color="#64748B" />
                {route.walkingDistanceMeters > 1000
                  ? `${(route.walkingDistanceMeters / 1000).toFixed(1)} km Walk`
                  : `${route.walkingDistanceMeters} m Walk`}
              </div>
            </div>

            {/* Explanation - green star card */}
            {explanation && (
              <div style={{
                background: '#ECFDF5', borderRadius: 16, padding: '16px 18px',
                border: '1px solid #A7F3D0', marginBottom: 16,
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <Star size={20} color="#059669" fill="#059669" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 14, color: '#065F46', lineHeight: 1.65, margin: 0 }}>{explanation}</p>
              </div>
            )}

            {/* Carbon / Safety / Reliability */}
            <div style={{
              background: 'white', borderRadius: 20, padding: '18px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <Metric icon={<Leaf size={20} />} label="Carbon" value={route.carbonLabel || detail?.carbonLabel} />
                <Metric icon={<Shield size={20} />} label="Safety" value={route.safetyLabel || detail?.safetyLabel} />
                <Metric icon={<Wifi size={20} />} label="Reliability" value={route.reliabilityLabel || detail?.reliabilityLabel} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Safety actions + Book CTA */}
      <div style={{ padding: '14px 20px 20px', background: 'white', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <button onClick={shareLocation} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE', borderRadius: 14, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Share2 size={16} /> Share Live Location
          </button>
          <button onClick={sos} title="SOS" style={{ width: 54, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: 14, padding: '12px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            <AlertTriangle size={16} /> SOS
          </button>
        </div>
        <button
          className="btn-primary"
          id="book-journey-btn"
          onClick={handleBook}
          disabled={booking || loading}
          style={{ borderRadius: 50, padding: '16px 24px', fontSize: 16, justifyContent: 'space-between' }}
        >
          {booking
            ? <><div className="spinner" /> Creating booking...</>
            : <>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ClipboardList size={20} /> Book This Journey
                </span>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowLeft size={18} color="var(--primary)" strokeWidth={3} style={{ transform: 'rotate(180deg)' }} />
                </div>
              </>
          }
        </button>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  // Low Carbon is a positive signal (green). Low Safety or Low Reliability are both
  // negative signals that should be shown in red — not amber — to clearly communicate risk.
  const color = value === 'High' ? '#059669'
    : value === 'Low' ? (label === 'Carbon' ? '#059669' : '#DC2626')
    : '#D97706';
  return (
    <div style={{ textAlign: 'center', padding: '14px 8px', background: '#F8FAFC', borderRadius: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: '#94a3b8' }}>{icon}</div>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

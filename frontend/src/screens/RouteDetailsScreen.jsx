import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { Star, Zap, Banknote, Leaf, Lightbulb, ClipboardList, Shield, Wifi, ArrowLeft } from 'lucide-react';

const TAG_BADGE = {
  Recommended: { label: 'Recommended', icon: <Star size={12} />, bg: '#EEF2FF', color: '#3730A3' },
  Fastest: { label: 'Fastest', icon: <Zap size={12} />, bg: '#FEF3C7', color: '#B45309' },
  Cheapest: { label: 'Cheapest', icon: <Banknote size={12} />, bg: '#ECFDF5', color: '#065F46' },
  'Eco-Friendly': { label: 'Eco-Friendly', icon: <Leaf size={12} />, bg: '#F0FDF4', color: '#166534' },
};

export function RouteDetailsScreen({ route, onBook, onBack, addToast }) {
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
      } catch (e) {
        addToast('Could not load route details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [route.routeId]);

  const handleBook = async () => {
    setBooking(true);
    try {
      const booking = await api.createBooking(route.routeId);
      onBook(booking, detail || route);
    } catch (e) {
      addToast(e.detail || 'Booking failed. Try again.', 'error');
    } finally {
      setBooking(false);
    }
  };

  const tag = TAG_BADGE[route.tag] || TAG_BADGE['Recommended'];

  return (
    <div className="screen-enter" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        padding: '24px 20px 28px',
        color: 'white',
      }}>
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span
            style={{ background: tag.bg, color: tag.color, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {tag.icon} {tag.label}
          </span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{route.summary}</h2>
        <p style={{ fontSize: 14, color: '#a5b4fc' }}>
          {route.totalTimeMinutes} min · ₹{route.totalFareRupees} · {route.transferCount} transfer(s)
        </p>
      </div>

      <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 16 }} />)}
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div className="card animate-fade-in-up">
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
                Journey Timeline
              </h3>
              {detail?.steps && <JourneyTimeline steps={detail.steps} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94A3B8', marginTop: 16 }}>
                <Lightbulb size={14} color="#f59e0b" /> Tap any step to see instructions
              </div>
            </div>

            {/* Explanation */}
            {explanation && (
              <div
                className="animate-fade-in-up stagger-2"
                style={{
                  background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                  borderRadius: 16, padding: '20px',
                  border: '1px solid #C7D2FE',
                }}
              >
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#3730A3', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
                  <Lightbulb size={16} /> Why this route?
                </h3>
                <p style={{ fontSize: 14, color: '#312e81', lineHeight: 1.6 }}>{explanation}</p>
              </div>
            )}

            {/* Route summary metrics */}
            <div className="card animate-fade-in-up stagger-3">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Metric icon={<Leaf size={24} />} label="Carbon" value={route.carbonLabel || detail?.carbonLabel} />
                <Metric icon={<Shield size={24} />} label="Safety" value={route.safetyLabel || detail?.safetyLabel} />
                <Metric icon={<Wifi size={24} />} label="Reliability" value={route.reliabilityLabel || detail?.reliabilityLabel} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Book CTA */}
      <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
        <button className="btn-primary" id="book-journey-btn" onClick={handleBook} disabled={booking || loading}>
          {booking ? <><div className="spinner" /> Creating booking...</> : <><ClipboardList size={20} /> Book This Journey</>}
        </button>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  const color = value === 'High' ? '#10B981' : value === 'Low' ? (label === 'Carbon' ? '#10B981' : '#EF4444') : '#F59E0B';
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px', background: '#f8fafc', borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: '#64748B' }}>{icon}</div>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}


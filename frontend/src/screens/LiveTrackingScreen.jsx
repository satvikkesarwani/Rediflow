import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Bus, Rocket, MapPin, Clock, Car, PartyPopper, Train, Map, AlertTriangle, Check, Bell, Hourglass, Ticket } from 'lucide-react';

const UPDATE_TYPE_CONFIG = {
  arrival: { icon: <Bus size={16} />, color: '#3B82F6' },
  departure: { icon: <Rocket size={16} />, color: '#4F46E5' },
  platform: { icon: <MapPin size={16} />, color: '#7C3AED' },
  delay: { icon: <Clock size={16} />, color: '#F59E0B' },
  last_mile: { icon: <Car size={16} />, color: '#F59E0B' },
  completed: { icon: <PartyPopper size={16} />, color: '#10B981' },
};

const MODE_ICONS = { 
  walk: <MapPin size={16} />, 
  bus: <Bus size={16} />, 
  metro: <Train size={16} />, 
  auto: <Car size={16} />, 
  train: <Train size={16} />, 
  cab: <Car size={16} /> 
};

export function LiveTrackingScreen({ booking, passData, route, onComplete, addToast }) {
  const [updates, setUpdates] = useState([]);
  const [allUpdates, setAllUpdates] = useState([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [eta, setEta] = useState(route.totalTimeMinutes + 5);
  const [showDelay, setShowDelay] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef(null);
  const etaRef = useRef(null);

  useEffect(() => {
    // Fetch updates
    api.getJourneyUpdates(booking.bookingId)
      .then((data) => {
        setAllUpdates(data.updates || []);
        setStarted(true);
      })
      .catch(() => addToast('Could not load journey updates', 'error'));
  }, []);

  // Sequential update reveal
  useEffect(() => {
    if (!started || allUpdates.length === 0) return;

    const revealNext = () => {
      setVisibleCount((prev) => {
        const next = prev + 1;
        const upd = allUpdates[prev];

        if (upd?.type === 'delay') setShowDelay(true);
        if (upd?.type === 'completed') {
          setCompleted(true);
          clearInterval(timerRef.current);
          clearInterval(etaRef.current);
        }

        return next;
      });
    };

    // First update immediately
    revealNext();

    timerRef.current = setInterval(revealNext, 9000);
    etaRef.current = setInterval(() => setEta((e) => Math.max(0, e - 1)), 30000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(etaRef.current);
    };
  }, [started, allUpdates]);

  // Auto-dismiss delay banner
  useEffect(() => {
    if (showDelay) {
      const t = setTimeout(() => setShowDelay(false), 10000);
      return () => clearTimeout(t);
    }
  }, [showDelay]);

  const visible = allUpdates.slice(0, visibleCount);
  const currentIdx = visibleCount > 0 ? visibleCount - 1 : 0;

  const routeModes = route.summary.split(' → ').map(m => m.trim().toLowerCase());
  const currentModeIdx = Math.min(Math.floor(currentIdx / 1.5), routeModes.length - 1);

  if (completed && visibleCount >= allUpdates.length) {
    return (
      <div className="screen-enter" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: 'linear-gradient(135deg, #ECFDF5, #F0FDF4)' }}>
        <div className="animate-scale-in" style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <PartyPopper size={80} color="#059669" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#065F46', marginBottom: 8 }}>Journey Complete!</h2>
          <p style={{ color: '#047857', fontSize: 15, marginBottom: 8 }}>You have arrived at your destination.</p>
          <div style={{ background: 'white', padding: '16px', borderRadius: 16, marginTop: 24, marginBottom: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #d1fae5' }}>
            <p style={{ color: '#047857', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>Booking ID:</span> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{booking.bookingId}</span></span>
              <div style={{ height: 1, background: '#e5e7eb' }} />
              <span style={{ display: 'flex', justifyContent: 'space-between' }}><span>Journey Pass:</span> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{passData.journeyPassId}</span></span>
            </p>
          </div>
          <button className="btn-primary" id="plan-another-btn" onClick={onComplete}
            style={{ background: 'linear-gradient(135deg, #059669, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Map size={20} /> Plan Another Journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-enter" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        padding: '24px 20px', color: 'white',
      }}>
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Live Journey</h2>
          <p style={{ fontSize: 14, color: '#a5b4fc', marginTop: 4 }}>{route.summary}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, background: 'rgba(0,0,0,0.1)', padding: '12px 16px', borderRadius: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>ETA</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={20} color="#a5b4fc" /> {eta} <span style={{ fontSize: 14, fontWeight: 600 }}>min</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Booking ID</p>
            <p style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: 'white', marginTop: 4 }}>{booking.bookingId}</p>
          </div>
        </div>
      </div>

      {/* Delay alert banner */}
      {showDelay && (
        <div className="animate-fade-in" style={{
          background: '#FEF3C7', padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '2px solid #F59E0B',
        }}>
          <AlertTriangle size={20} color="#d97706" />
          <span style={{ fontSize: 13, color: '#B45309', fontWeight: 600 }}>
            Minor delay detected · ETA updated by +5 min
          </span>
        </div>
      )}

      {/* Journey legs progress */}
      <div style={{ padding: '20px', background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
          Journey Legs
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {routeModes.map((mode, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i < currentModeIdx ? '#10B981' : i === currentModeIdx ? '#4F46E5' : '#E2E8F0',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: i === currentModeIdx ? '0 0 0 4px rgba(79,70,229,0.2)' : 'none',
                transition: 'all 0.4s ease',
              }}>
                {i < currentModeIdx ? <Check size={16} strokeWidth={3} /> : MODE_ICONS[mode] || <Bus size={16} />}
              </div>
              {i < routeModes.length - 1 && (
                <div style={{
                  flex: 1, height: 4, marginLeft: 4, marginRight: 2,
                  background: i < currentModeIdx ? '#10B981' : '#E2E8F0',
                  borderRadius: 2, transition: 'background 0.4s ease',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live updates feed */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', background: '#f8fafc' }}>
        <p style={{ fontSize: 11, color: '#94A3B8', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>
          Live Updates
        </p>

        {!started && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: 76, borderRadius: 16, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 76, borderRadius: 16 }} />
            <div
              style={{ fontSize: 14, color: '#64748b', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#64748b' }} />
              Starting journey...
            </div>
          </div>
        )}

        {visible.map((upd, i) => {
          const isLast = i === visible.length - 1;
          const cfg = UPDATE_TYPE_CONFIG[upd.type] || { icon: <Bell size={16} />, color: '#64748B' };

          return (
            <div
              key={i}
              className="animate-slide-right"
              style={{
                display: 'flex', gap: 16, alignItems: 'center',
                padding: '16px', borderRadius: 16,
                background: isLast ? 'white' : '#F1F5F9',
                border: isLast ? `1.5px solid ${cfg.color}44` : '1.5px solid transparent',
                boxShadow: isLast ? '0 4px 12px rgba(0,0,0,0.03)' : 'none',
                opacity: isLast ? 1 : 0.75,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: isLast ? `${cfg.color}15` : '#E2E8F0',
                color: isLast ? cfg.color : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {isLast ? cfg.icon : <Check size={18} strokeWidth={2.5} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, color: isLast ? '#0F172A' : '#64748B', lineHeight: 1.45, fontWeight: isLast ? 600 : 400 }}>
                  {upd.message}
                </p>
                <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4, textTransform: 'capitalize', fontWeight: 500 }}>
                  {upd.type.replace('_', ' ')}
                </p>
              </div>
              {isLast && (
                <div style={{ fontSize: 10, background: cfg.color, color: 'white', padding: '4px 10px', borderRadius: 20, fontWeight: 800, flexShrink: 0, letterSpacing: '0.5px' }}>
                  NOW
                </div>
              )}
            </div>
          );
        })}

        {/* Future updates (greyed out) */}
        {allUpdates.slice(visibleCount, visibleCount + 2).map((upd, i) => (
          <div key={`future-${i}`} style={{
            display: 'flex', gap: 16, alignItems: 'center',
            padding: '12px 16px', borderRadius: 16,
            background: 'transparent', border: '1.5px dashed #cbd5e1',
            opacity: 0.5,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Hourglass size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: '#64748b' }}>{upd.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div style={{ padding: '16px 20px', background: 'white', borderTop: '1px solid #F1F5F9', boxShadow: '0 -4px 12px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ticket size={14} /> Pass <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{passData.journeyPassId}</span>
          </span>
          <span style={{ fontWeight: 500, background: '#f1f5f9', padding: '4px 10px', borderRadius: 12 }}>
            Update {Math.min(visibleCount, allUpdates.length)} / {allUpdates.length}
          </span>
        </div>
      </div>
    </div>
  );
}

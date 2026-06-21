import { useState } from 'react';
import { Star, Zap, Leaf, Shield, Repeat, ChevronDown } from 'lucide-react';
import { matchScore, safetyPct, carbonKg, statusLabel, crowdFor, crowdColor, whyText, modeBarColor } from '../data/routeMeta';

const TAG_CONFIG = {
  Balanced: { label: 'Recommended', icon: <Star size={11} fill="currentColor" />, bg: '#EEF2FF', color: '#4338CA' },
  Fastest: { label: 'Fastest', icon: <Zap size={11} fill="currentColor" />, bg: '#FFFBEB', color: '#D97706' },
  Cheapest: { label: 'Cheapest', icon: null, bg: '#F0FDF4', color: '#166534' },
  'Eco-Friendly': { label: 'Eco', icon: <Leaf size={11} fill="currentColor" />, bg: '#F0FDF4', color: '#15803D' },
  'Less Walking': { label: 'Least Walking', icon: null, bg: '#EFF6FF', color: '#1D4ED8' },
  'Fewer Transfers': { label: 'Fewer Transfers', icon: null, bg: '#FFF1F2', color: '#BE123C' },
  Alternative: { label: 'Alternative', icon: null, bg: '#F8FAFC', color: '#475569' },
};

export function RouteCard({ route, index = 0, onClick, delay = 0 }) {
  const [showWhy, setShowWhy] = useState(false);
  const tag = TAG_CONFIG[route.tag] || TAG_CONFIG.Alternative;
  const modes = route.summary.split(' → ').map((m) => m.trim().toLowerCase());
  const score = matchScore(route);
  const status = statusLabel(route);
  const isTop = index === 0;

  return (
    <div
      className="card animate-fade-in-up"
      style={{ padding: 0, animationDelay: `${delay}ms`, borderRadius: 18, border: isTop ? '1.5px solid var(--primary)' : '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer' }}
    >
      <div onClick={onClick} style={{ padding: '16px 18px' }}>
        {/* Top row: score + tags + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>
              {score}
            </div>
            <div style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#1E293B', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: tag.bg, color: tag.color, padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 700 }}>
            {tag.icon} {tag.label}
          </div>
          {isTop && route.tag !== 'Fastest' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 700 }}>Fastest</div>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: status.color }}>{status.text}</div>
        </div>

        {/* time + fare */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>{route.totalTimeMinutes} min</div>
          <div style={{ fontSize: 13, color: '#64748B' }}>Total <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>₹{route.totalFareRupees}</span></div>
        </div>

        {/* mode progress bar */}
        <div style={{ display: 'flex', gap: 3, margin: '10px 0 12px' }}>
          {modes.map((m, i) => (
            <div key={i} style={{ flex: m === 'walk' ? 0.6 : 1, height: 6, borderRadius: 4, background: modeBarColor(m) }} />
          ))}
        </div>

        {/* mode chips with crowd */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {modes.map((m, i) => {
            const crowd = crowdFor(m, route.routeId);
            return (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: '#334155', textTransform: 'capitalize' }}>
                {m}{crowd && <span style={{ color: crowdColor(crowd), fontWeight: 700 }}>· {crowd}</span>}
              </span>
            );
          })}
        </div>

        {/* metrics row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: '#475569', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={14} color="#059669" /> {safetyPct(route)}%</span>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Leaf size={14} color="#059669" /> {carbonKg(route)}kg</span>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Repeat size={14} color="#64748B" /> {route.transferCount}</span>
        </div>
      </div>

      {/* Why recommended */}
      <div style={{ borderTop: '1px solid #F1F5F9', padding: '12px 18px' }}>
        <button onClick={(e) => { e.stopPropagation(); setShowWhy((v) => !v); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#4338CA', fontSize: 13, fontWeight: 700, padding: 0 }}>
          Why Recommended? <ChevronDown size={15} style={{ transform: showWhy ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
        {showWhy && (
          <p className="animate-fade-in" style={{ marginTop: 10, fontSize: 13, color: '#475569', lineHeight: 1.6, background: '#F8FAFC', borderRadius: 12, padding: '12px 14px' }}>
            {whyText(route)}
          </p>
        )}
      </div>
    </div>
  );
}

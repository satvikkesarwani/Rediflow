import { getEcoStats, treesEquivalent, carKmAvoided } from '../data/eco';
import { ArrowLeft, Leaf, TreePine, Car, Award, Flame, TrendingUp, Train, Bus, Footprints, Gift } from 'lucide-react';

const MODE_META = {
  metro: { label: 'Metro', color: '#008B74', icon: <Train size={14} /> },
  bus: { label: 'Bus', color: '#3B82F6', icon: <Bus size={14} /> },
  train: { label: 'Train', color: '#0F766E', icon: <Train size={14} /> },
  walk: { label: 'Walk', color: '#22C55E', icon: <Footprints size={14} /> },
};

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function CarbonDashboardScreen({ onBack, greenPoints }) {
  const stats = getEcoStats();
  const points = greenPoints ?? stats.greenPoints;
  const trees = treesEquivalent(stats.co2SavedKg);
  const carKm = carKmAvoided(stats.co2SavedKg);
  const maxBar = Math.max(...stats.history, 1);

  const badges = [
    { label: 'Eco Warrior', icon: <Leaf size={18} />, unlocked: stats.co2SavedKg >= 25 },
    { label: '10 Green Trips', icon: <Award size={18} />, unlocked: stats.ecoTrips >= 10 },
    { label: 'Tree Hugger', icon: <TreePine size={18} />, unlocked: Number(trees) >= 1 },
    { label: '5-Day Streak', icon: <Flame size={18} />, unlocked: stats.streak >= 5 },
  ];

  return (
    <div className="screen-enter" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #008B74 0%, #0F766E 100%)', padding: '20px 20px 28px', color: 'white' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Leaf size={22} /> Carbon Dashboard
        </h2>
        <p style={{ fontSize: 13, color: '#A7F3D0', marginTop: 4 }}>Your green impact with RideFlow</p>
      </div>

      <div style={{ padding: '0 16px 28px', marginTop: -16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Hero CO2 saved */}
        <div className="animate-fade-in-up" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: 20, padding: '24px 20px', border: '1px solid #a7f3d0', textAlign: 'center', boxShadow: '0 8px 24px rgba(16,185,129,0.12)' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(0,139,116,0.15)' }}>
            <Leaf size={30} color="var(--primary)" fill="var(--primary)" />
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, color: '#065F46', lineHeight: 1 }}>{stats.co2SavedKg}<span style={{ fontSize: 20, fontWeight: 700 }}> kg</span></div>
          <div style={{ fontSize: 13, color: '#047857', fontWeight: 600, marginTop: 6 }}>CO₂ saved vs travelling by car</div>
        </div>

        {/* Equivalents */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <StatCard icon={<TreePine size={20} color="#16A34A" />} value={trees} label="Trees / yr" />
          <StatCard icon={<Car size={20} color="#F59E0B" />} value={carKm} label="Car km cut" />
          <StatCard icon={<Gift size={20} color="var(--primary)" />} value={points} label="Green pts" />
        </div>

        {/* Weekly chart */}
        <div className="card" style={{ borderRadius: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A' }}>This week</h3>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#059669' }}><TrendingUp size={14} /> kg CO₂ saved</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 110 }}>
            {stats.history.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8' }}>{v}</div>
                <div style={{ width: '100%', maxWidth: 26, height: `${(v / maxBar) * 80}px`, background: 'linear-gradient(180deg, #10B981, #008B74)', borderRadius: 6, transition: 'height 0.4s' }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>{DAYS[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trip stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <StatCard value={stats.trips} label="Total trips" />
          <StatCard value={stats.ecoTrips} label="Eco trips" />
          <StatCard value={`₹${stats.moneySaved}`} label="Money saved" />
        </div>

        {/* Mode breakdown */}
        <div className="card" style={{ borderRadius: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>How you travel green</h3>
          <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 14 }}>
            {Object.entries(stats.modes).map(([m, pct]) => (
              <div key={m} style={{ width: `${pct}%`, background: MODE_META[m]?.color || '#94A3B8' }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(stats.modes).map(([m, pct]) => (
              <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#475569' }}>
                <span style={{ color: MODE_META[m]?.color }}>{MODE_META[m]?.icon}</span>
                {MODE_META[m]?.label || m} <span style={{ color: '#94A3B8' }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="card" style={{ borderRadius: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', marginBottom: 14 }}>Achievements</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {badges.map((b) => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', borderRadius: 14, background: b.unlocked ? '#ECFDF5' : '#F8FAFC', border: `1px solid ${b.unlocked ? '#A7F3D0' : '#E2E8F0'}`, opacity: b.unlocked ? 1 : 0.55 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: b.unlocked ? 'var(--primary)' : '#CBD5E1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{b.icon}</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: b.unlocked ? '#065F46' : '#94A3B8' }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)', border: '1px solid #C7D2FE', borderRadius: 14, padding: '14px 16px' }}>
          <Gift size={20} color="#4338CA" />
          <div style={{ fontSize: 13, color: '#3730A3', fontWeight: 600 }}>Redeem <b>{points} green points</b> for metro passes & ride discounts.</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '14px 8px', textAlign: 'center', border: '1px solid #F1F5F9', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      {icon && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{icon}</div>}
      <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  );
}

import { QrCode } from '../components/QrCode';
import { Bus, Train, Car, Play, Ticket, Scissors, Download, Share2 } from 'lucide-react';

const MODE_ICONS = {
  walk: null,
  bus: <Bus size={14} />,
  metro: <Train size={14} />,
  train: <Train size={14} />,
  auto: <Car size={14} />,
  cab: <Car size={14} />
};

export function JourneyPassScreen({ passData, booking, route, onStartJourney, addToast }) {
  const bookableLegs = booking.legs.filter((l) => l.mode !== 'walk');
  const qrPayload = `RIDEFLOW|PASS:${passData.journeyPassId}|${route.source}>${route.destination}|FARE:${booking.totalFareRupees}|${booking.legs.map((l) => l.ticketId).filter(Boolean).join(',')}`;

  const shareTicket = async () => {
    const text = `RideFlow Pass ${passData.journeyPassId} · ${route.source} → ${route.destination} · ₹${booking.totalFareRupees}`;
    if (navigator.share) { try { await navigator.share({ title: 'RideFlow Journey Pass', text }); return; } catch { /* cancelled */ } }
    addToast && addToast('Ticket link copied to clipboard', 'success');
  };
  const downloadTicket = () => addToast && addToast('Ticket saved to your device', 'success');

  return (
    <div className="screen-enter" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #008B74 0%, #0F766E 30%, #F8FAFC 60%)' }}>
      {/* Top area */}
      <div style={{ padding: '40px 20px 20px', color: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>Your Journey Pass</h2>
        <p style={{ fontSize: 14, opacity: 0.8, fontWeight: 400 }}>Show this at each leg of your journey</p>
      </div>

      {/* Pass card */}
      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          className="animate-scale-in"
          style={{
            background: 'white', borderRadius: 24, padding: '28px 24px',
            boxShadow: '0 20px 60px rgba(0, 139, 116, 0.15)',
            border: '1px solid #A7F3D0',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top circle cutouts */}
          <div style={{ position: 'absolute', top: '50%', left: -16, width: 32, height: 32, background: '#F8FAFC', borderRadius: '50%', transform: 'translateY(-50%)', boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.03)' }} />
          <div style={{ position: 'absolute', top: '50%', right: -16, width: 32, height: 32, background: '#F8FAFC', borderRadius: '50%', transform: 'translateY(-50%)', boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.03)' }} />
          
          {/* Pass ID */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>Pass ID</p>
            <p style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>
              {passData.journeyPassId}
            </p>
          </div>

          {/* QR Code */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 20, border: '2px solid #A7F3D0' }}>
              <QrCode text={qrPayload} size={160} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 2, background: 'repeating-linear-gradient(90deg, #E2E8F0 0, #E2E8F0 6px, transparent 6px, transparent 12px)' }} />
            <Scissors size={18} color="#CBD5E1" style={{ transform: 'rotate(-90deg)' }} />
            <div style={{ flex: 1, height: 2, background: 'repeating-linear-gradient(90deg, #E2E8F0 0, #E2E8F0 6px, transparent 6px, transparent 12px)' }} />
          </div>

          {/* Journey summary */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Journey Summary</p>
            <p style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{route.source} <span style={{ color: '#CBD5E1', margin: '0 4px' }}>→</span> {route.destination}</p>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>{route.summary}</p>
            <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 16, marginTop: 8 }}>Total: ₹{booking.totalFareRupees}</p>
          </div>

          {/* Ticket IDs */}
          <div>
            <p style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Leg Tickets</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bookableLegs.map((leg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '8px 12px', borderRadius: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', textTransform: 'capitalize', fontWeight: 600 }}>
                    {MODE_ICONS[leg.mode] || <Ticket size={14} />} {leg.mode}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                    {leg.ticketId}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket actions + Start Journey */}
      <div style={{ padding: '20px 20px 32px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <button onClick={downloadTicket} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'white', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: 14, padding: '13px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Download size={16} /> Download
          </button>
          <button onClick={shareTicket} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'white', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: 14, padding: '13px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <Share2 size={16} /> Share Ticket
          </button>
        </div>
        <button className="btn-primary" id="start-journey-btn" onClick={onStartJourney} style={{ height: 56, fontSize: 18 }}>
          <Play fill="white" size={20} /> Start Journey
        </button>
      </div>
    </div>
  );
}

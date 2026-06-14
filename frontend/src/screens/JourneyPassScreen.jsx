import { useEffect, useRef } from 'react';
import { Bus, Train, Car, Play, Ticket, Scissors } from 'lucide-react';

const MODE_ICONS = {
  walk: null,
  bus: <Bus size={14} />,
  metro: <Train size={14} />,
  train: <Train size={14} />,
  auto: <Car size={14} />,
  cab: <Car size={14} />
};

function QRCode({ text, size = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = size;
    ctx.clearRect(0, 0, s, s);

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, s, s);

    // Simulate QR pattern using text hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);

    const cells = 21;
    const cell = Math.floor(s / cells);
    const pad = (s - cells * cell) / 2;

    ctx.fillStyle = '#0F172A';
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        // Finder patterns
        const inCorner = (r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7);
        let fill = false;
        if (inCorner) {
          const lr = r < 7 ? r : cells - 1 - r;
          const lc = c < 7 ? c : cells - 1 - c;
          fill = lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
        } else {
          const bit = (hash >> ((r * cells + c) % 32)) & 1;
          fill = bit === ((r + c) % 2 === 0 ? 1 : 0);
        }
        if (fill) {
          ctx.fillRect(pad + c * cell, pad + r * cell, cell - 1, cell - 1);
        }
      }
    }
  }, [text, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ borderRadius: 8, display: 'block' }}
    />
  );
}

export function JourneyPassScreen({ passData, booking, route, onStartJourney }) {
  const bookableLegs = booking.legs.filter((l) => l.mode !== 'walk');

  return (
    <div className="screen-enter" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 30%, #F8FAFC 60%)' }}>
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
            boxShadow: '0 20px 60px rgba(49, 46, 129, 0.15)',
            border: '1px solid #e0e7ff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Top circle cutouts */}
          <div style={{ position: 'absolute', top: '50%', left: -16, width: 32, height: 32, background: '#f8fafc', borderRadius: '50%', transform: 'translateY(-50%)', boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.03)' }} />
          <div style={{ position: 'absolute', top: '50%', right: -16, width: 32, height: 32, background: '#f8fafc', borderRadius: '50%', transform: 'translateY(-50%)', boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.03)' }} />
          
          {/* Pass ID */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <p style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>Pass ID</p>
            <p style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 800, color: '#312e81', letterSpacing: '1px' }}>
              {passData.journeyPassId}
            </p>
          </div>

          {/* QR Code */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 20, border: '2px solid #E0E7FF' }}>
              <QRCode text={passData.journeyPassId} size={160} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 2, background: 'repeating-linear-gradient(90deg, #e2e8f0 0, #e2e8f0 6px, transparent 6px, transparent 12px)' }} />
            <Scissors size={18} color="#cbd5e1" style={{ transform: 'rotate(-90deg)' }} />
            <div style={{ flex: 1, height: 2, background: 'repeating-linear-gradient(90deg, #e2e8f0 0, #e2e8f0 6px, transparent 6px, transparent 12px)' }} />
          </div>

          {/* Journey summary */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Journey Summary</p>
            <p style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{route.source} <span style={{ color: '#cbd5e1', margin: '0 4px' }}>→</span> {route.destination}</p>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>{route.summary}</p>
            <p style={{ color: '#4f46e5', fontWeight: 800, fontSize: 16, marginTop: 8 }}>Total: ₹{booking.totalFareRupees}</p>
          </div>

          {/* Ticket IDs */}
          <div>
            <p style={{ fontSize: 11, color: '#94A3B8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>Leg Tickets</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bookableLegs.map((leg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', textTransform: 'capitalize', fontWeight: 600 }}>
                    {MODE_ICONS[leg.mode] || <Ticket size={14} />} {leg.mode}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#4F46E5' }}>
                    {leg.ticketId}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Start Journey */}
      <div style={{ padding: '24px 20px 32px' }}>
        <button className="btn-primary" id="start-journey-btn" onClick={onStartJourney} style={{ height: 56, fontSize: 18 }}>
          <Play fill="white" size={20} /> Start Journey
        </button>
      </div>
    </div>
  );
}

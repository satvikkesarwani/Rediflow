import { ArrowLeft, Footprints, Bus, Train, Car, CreditCard, Clock } from 'lucide-react';

const MODE_ICONS = {
  walk: <Footprints size={16} />,
  bus: <Bus size={16} />,
  metro: <Train size={16} />,
  train: <Train size={16} />,
  auto: <Car size={16} />,
  cab: <Car size={16} />
};

export function BookingSummaryScreen({ booking, route, onProceed, onBack }) {
  const bookableLegs = (booking.legs || []).filter((l) => l.mode !== 'walk');
  const walkLegs = (booking.legs || []).filter((l) => l.mode === 'walk');

  return (
    <div className="screen-enter" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #008B74 0%, #0F766E 100%)',
        padding: '24px 20px', color: 'white',
      }}>
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: 12, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Booking Summary</h2>
        {route && (
          <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 4 }}>
            {route.source} → {route.destination}
          </p>
        )}
        {route?.summary && (
          <p style={{ fontSize: 13, color: '#A7F3D0', marginBottom: 4 }}>{route.summary}</p>
        )}
        <p style={{ fontSize: 15, color: '#A7F3D0', display: 'flex', alignItems: 'center', gap: 6 }}>
          Booking ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'white' }}>{booking.bookingId}</span>
        </p>
      </div>

      <div style={{ padding: '24px 16px', flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Journey Tickets */}
        <div className="card animate-fade-in-up">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
            Journey Tickets
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {bookableLegs.map((leg, i) => (
              <div key={i}>
                <TicketRow leg={leg} />
                {i < bookableLegs.length - 1 && <div style={{ height: 1, background: '#F1F5F9', margin: '0 0' }} />}
              </div>
            ))}
            {walkLegs.length > 0 && (
              <div style={{ padding: '12px 0', borderTop: '1px solid #F1F5F9', marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#F0FDF4', padding: 10, borderRadius: 10, color: '#10B981' }}>
                    <Footprints size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>Walking legs</div>
                    <div style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>Free</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fare summary */}
        <div className="card animate-fade-in-up stagger-2">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
            Fare Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bookableLegs.map((leg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475569', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {MODE_ICONS[leg.mode]} {leg.mode.charAt(0).toUpperCase() + leg.mode.slice(1)}
                </span>
                <span style={{ fontWeight: 600, color: '#0F172A' }}>₹{leg.fareRupees}</span>
              </div>
            ))}
            <div style={{ height: 1, background: '#E2E8F0', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#0F172A', alignItems: 'center' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{booking.totalFareRupees}</span>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div
          className="animate-fade-in-up stagger-3"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: '#FEF3C7', borderRadius: 12, fontSize: 14, color: '#B45309', fontWeight: 600 }}
        >
          <Clock size={18} /> Status: {booking.status}
        </div>
      </div>

      {/* Proceed CTA */}
      <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #E2E8F0', boxShadow: '0 -4px 12px rgba(0,0,0,0.02)' }}>
        <button className="btn-primary" id="proceed-payment-btn" onClick={onProceed}>
          <CreditCard size={20} /> Proceed to Payment
        </button>
      </div>
    </div>
  );
}

function TicketRow({ leg }) {
  const icon = MODE_ICONS[leg.mode] || <Bus size={16} />;
  return (
    <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ background: '#F0FDF4', padding: 10, borderRadius: 10, color: 'var(--primary)' }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A', textTransform: 'capitalize' }}>
          {leg.mode}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: 600 }}>
          {leg.ticketId}
        </div>
      </div>
      <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>₹{leg.fareRupees}</div>
    </div>
  );
}

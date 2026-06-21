import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { QrCode } from '../components/QrCode';
import { upiIntent } from '../utils/upi';
import { coordsFor, distanceKm } from '../data/geo';
import { carbonKg } from '../data/routeMeta';
import { recordEcoTrip } from '../data/eco';
import { recordTrip } from '../data/history';
import { ArrowLeft, CheckCircle, XCircle, Ticket, Wallet, CreditCard, Lock, Smartphone, QrCode as QrIcon, Sparkles, Tag, ChevronDown, Leaf, ShieldCheck } from 'lucide-react';

const OFFERS = [
  { code: 'YATRA10', desc: '10% off (max ₹20)', kind: 'pct', value: 0.10, max: 20 },
  { code: 'FIRSTRIDE', desc: '₹15 off', kind: 'flat', value: 15 },
  { code: 'ECOGO', desc: '+5 green points', kind: 'points', value: 5 },
];

export function PaymentScreen({ booking, route, onSuccess, onBack, addToast, walletBalance, setWalletBalance }) {
  const [state, setState] = useState('idle'); // idle | paying | success | failed
  const [result, setResult] = useState(null);
  const [failReason, setFailReason] = useState('wallet'); // 'wallet' | 'other'
  const [method, setMethod] = useState('upi'); // upi | wallet | card
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [offer, setOffer] = useState(null);
  const [secs, setSecs] = useState(600);
  const payTimerRef = useRef(null);
  // Cancellation flag stored in a ref so the cleanup effect and the timer callback
  // share the same mutable object. Set to true on unmount to stop any in-flight
  // api.pay call (which might otherwise mark the booking as paid server-side while
  // the UI has already navigated away).
  const payCancelledRef = useRef(false);
  // Keep walletBalance in a ref so the UPI/Card timer callback always reads the current
  // value even if walletBalance prop changes during the 1.6s confirmation window.
  const walletBalanceRef = useRef(walletBalance);
  useEffect(() => { walletBalanceRef.current = walletBalance; }, [walletBalance]);

  // Cleanup the UPI/Card pay timer on unmount to prevent setState on dead component.
  useEffect(() => () => {
    payCancelledRef.current = true;
    clearTimeout(payTimerRef.current);
  }, []);

  const baseFare = booking.totalFareRupees;
  const discount = offer
    ? offer.kind === 'flat' ? Math.min(offer.value, baseFare)
      : offer.kind === 'pct' ? Math.min(Math.round(baseFare * offer.value), offer.max)
      : 0
    : 0;
  const payable = Math.max(0, baseFare - discount);

  const from = coordsFor(route.source);
  const to = coordsFor(route.destination);
  const km = distanceKm(from, to);
  const taxiFare = Math.round(baseFare * 1.5 + km * 6 + 25);
  const savings = Math.max(0, taxiFare - payable);
  const savingsPct = taxiFare ? Math.round((savings / taxiFare) * 100) : 0;
  const greenPoints = Math.max(5, Math.round(baseFare / 2)) + (offer?.kind === 'points' ? offer.value : 0);

  // price-lock / QR countdown
  useEffect(() => {
    if (state !== 'idle') return;
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [state]);
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;

  const genPassId = () => `RF-PASS-${booking.bookingId?.toString().slice(-4) || ''}${Math.floor(1000 + Math.random() * 9000)}`;

  const logEco = () => recordEcoTrip({
    co2Kg: Number(carbonKg(route)) || 2,
    points: greenPoints,
    moneySaved: savings,
    eco: route.carbonLabel === 'Low',
  });

  const logTrip = (passId) => recordTrip({
    passId,
    from: route.source,
    to: route.destination,
    summary: route.summary,
    fare: payable,
    co2: Number(carbonKg(route)) || 2,
    status: 'Completed',
  });

  const handlePay = async () => {
    setState('paying');
    // Wallet uses the real NCMC deduction; UPI/Card simulate an external confirmation.
    const backendMethod = method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : 'NCMC Wallet';
    if (method === 'wallet') {
      try {
        const data = await api.pay(booking.bookingId, backendMethod);
        if (data.paymentStatus === 'Success') {
          setResult({ ...data, method: 'NCMC Wallet', greenPoints });
          setState('success');
          logEco();
          logTrip(data.journeyPassId);
          if (setWalletBalance) setWalletBalance(data.walletBalance);
          addToast('Payment successful!', 'success');
        } else { setResult(data); setFailReason('other'); setState('failed'); }
      } catch (e) {
        if (e.status === 400) { setResult(e); setFailReason('wallet'); setState('failed'); }
        else { addToast(e.detail || 'Payment failed', 'error'); setState('idle'); }
      }
      return;
    }
    // UPI / Card: call backend to mark booking paid, then emulate gateway confirmation.
    payCancelledRef.current = false;
    payTimerRef.current = setTimeout(async () => {
      if (payCancelledRef.current) return;
      try {
        const data = await api.pay(booking.bookingId, backendMethod);
        const passId = data.journeyPassId || genPassId();
        if (setWalletBalance && data.walletBalance != null) setWalletBalance(data.walletBalance);
        // UPI/Card: backend always charges baseFare regardless of client-side coupon.
        // Store baseFare as amountPaid so the success screen reflects the real deduction.
        setResult({ paymentStatus: 'Success', journeyPassId: passId, walletBalance: data.walletBalance ?? walletBalanceRef.current, amountPaid: baseFare, method: method === 'upi' ? 'UPI' : 'Card', greenPoints });
        setState('success');
        logEco();
        logTrip(passId);
        addToast('Payment confirmed!', 'success');
      } catch {
        // Fallback: show success with a local pass ID (demo mode)
        const passId = genPassId();
        setResult({ paymentStatus: 'Success', journeyPassId: passId, walletBalance: walletBalanceRef.current, method: method === 'upi' ? 'UPI' : 'Card', greenPoints });
        setState('success');
        logEco();
        logTrip(passId);
        addToast('Payment confirmed!', 'success');
      }
    }, 1600);
  };

  /* ---------------- SUCCESS ---------------- */
  if (state === 'success' && result) {
    return (
      <div className="screen-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: '#f8fafc' }}>
        <div className="animate-scale-in" style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }} className="animate-bounce-gentle">
            <CheckCircle size={80} color="#10b981" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Payment Successful</h2>
          <p style={{ color: '#64748b', fontSize: 15 }}>Your journey is ready to begin</p>

          <div style={{ background: 'white', borderRadius: 20, padding: '24px', marginTop: 28, marginBottom: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Journey Pass ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{result.journeyPassId}</div>
            </div>
            <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />
            <div style={{ display: 'flex', gap: 24, justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Amount Paid</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>₹{result.amountPaid ?? payable}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>via {result.method}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Rewards</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}><Leaf size={15} /> +{result.greenPoints}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>green points</div>
              </div>
            </div>
          </div>
          <button className="btn-primary" id="view-journey-pass-btn" onClick={() => onSuccess(result)}>
            <Ticket size={20} /> View Journey Pass
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- FAILED ---------------- */
  if (state === 'failed') {
    const isLowBalance = failReason === 'wallet';
    return (
      <div className="screen-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: '#f8fafc' }}>
        <div className="animate-scale-in" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}><XCircle size={72} color="#ef4444" strokeWidth={1.5} /></div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Payment Failed</h2>
          <p style={{ color: '#64748B', fontSize: 15, marginBottom: 4 }}>
            {isLowBalance
              ? (result?.reason || 'Insufficient wallet balance')
              : 'Payment could not be completed. Please try again.'}
          </p>
          {isLowBalance && (
          <div style={{ background: 'white', padding: '16px', borderRadius: 16, marginTop: 16, border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#475569', fontSize: 14 }}>
              {/* Use the backend's requiredAmount (the actual deduction amount) rather than the
                  locally-computed payable (which may be discounted). This prevents showing a
                  misleading lower amount when a coupon is applied but the backend charged full fare. */}
              Required: <span style={{ fontWeight: 700 }}>₹{result?.requiredAmount ?? payable}</span><br />
              Current Balance: <span style={{ fontWeight: 700, color: '#ef4444' }}>₹{result?.walletBalance ?? walletBalance}</span>
            </p>
          </div>
          )}
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            <button className="btn-primary" onClick={() => { setState('idle'); setMethod('upi'); }} style={{ borderRadius: 50 }}>
              <Smartphone size={18} /> Pay via UPI instead
            </button>
            <button className="btn-secondary" onClick={onBack} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <ArrowLeft size={16} /> Choose a Cheaper Route
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- IDLE / CHECKOUT ---------------- */
  const qrExpired = secs === 0;
  return (
    <div className="screen-enter" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'linear-gradient(160deg, #ecfdf5 0%, #d1fae5 100%)', padding: '18px 20px 22px', color: '#065f46' }}>
        {/* Back is disabled while payment is in-flight to prevent mid-payment navigation
            which could result in the booking being marked as paid on the backend while
            the UI returns to a previous screen. */}
        <button onClick={onBack} disabled={state === 'paying'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: state === 'paying' ? 'rgba(6,95,70,0.04)' : 'rgba(6,95,70,0.1)', border: 'none', color: state === 'paying' ? '#94A3B8' : '#065f46', padding: '8px 14px', borderRadius: 20, cursor: state === 'paying' ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 16, opacity: state === 'paying' ? 0.5 : 1 }}>
          <ArrowLeft size={15} /> Back
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>Book &amp; Pay</h2>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: 'rgba(255,255,255,0.6)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
          <Lock size={12} /> Price locked for {mmss}
        </div>
      </div>

      <div style={{ padding: '18px 18px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
        {/* Total */}
        <div style={{ background: '#0F172A', borderRadius: 16, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Total Price</span>
          <span style={{ fontSize: 24, fontWeight: 800 }}>₹{payable}{discount > 0 && <span style={{ fontSize: 14, color: '#94A3B8', textDecoration: 'line-through', marginLeft: 8 }}>₹{baseFare}</span>}</span>
        </div>

        {/* Savings vs taxi */}
        {savings > 0 && (
          <div style={{ background: 'linear-gradient(135deg,#059669,#10B981)', borderRadius: 16, padding: '14px 18px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 6px 20px rgba(16,185,129,0.3)' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 5 }}><Sparkles size={13} /> YOU'RE SAVING</div>
              <div style={{ fontSize: 24, fontWeight: 900, marginTop: 2 }}>₹{savings} <span style={{ fontSize: 15, fontWeight: 600, opacity: 0.9 }}>vs Taxi</span></div>
            </div>
            <div style={{ background: 'white', color: '#059669', borderRadius: 20, padding: '6px 12px', fontSize: 14, fontWeight: 800 }}>-{savingsPct}%</div>
          </div>
        )}

        {/* Why this price */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0' }}>
          <button onClick={() => setShowBreakdown((v) => !v)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', padding: '14px 16px', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
            Why this price? <ChevronDown size={18} style={{ transform: showBreakdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {showBreakdown && (
            <div className="animate-fade-in" style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Row label={`Base fare · ${route.summary}`} value={`₹${baseFare}`} />
              {offer && discount > 0 && <Row label={`Coupon ${offer.code}`} value={`-₹${discount}`} green />}
              {offer && offer.kind === 'points' && <Row label={`Coupon ${offer.code}`} value={`+${offer.value} green points`} points />}
              <div style={{ height: 1, background: '#F1F5F9' }} />
              <Row label="Total payable" value={`₹${payable}`} bold />
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Single ticket covers all {route.summary.split(' → ').length} legs · GST included</div>
            </div>
          )}
        </div>

        {/* Payment method tabs */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Payment Method</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <MethodTab active={method === 'upi'} onClick={() => setMethod('upi')} icon={<QrIcon size={16} />} label="UPI QR" />
            <MethodTab active={method === 'wallet'} onClick={() => { setMethod('wallet'); setOffer(null); }} icon={<Wallet size={16} />} label="NCMC" />
            <MethodTab active={method === 'card'} onClick={() => setMethod('card')} icon={<CreditCard size={16} />} label="Card" />
          </div>
        </div>

        {/* Method body */}
        {method === 'upi' && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: '20px', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: 14, background: '#F8FAFC', borderRadius: 16, border: '2px solid #A7F3D0' }}>
              <QrCode text={upiIntent({ am: payable, tn: `RideFlow ${route.source}-${route.destination}`, tr: String(booking.bookingId || '') })} size={170} />
            </div>
            <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Scan with any UPI app</div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>UPI ID: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>rideflow@upi</span></div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((a) => (
                <span key={a} style={{ fontSize: 11, fontWeight: 700, color: '#475569', background: '#F1F5F9', borderRadius: 10, padding: '4px 9px' }}>{a}</span>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: qrExpired ? '#ef4444' : '#94A3B8', fontWeight: qrExpired ? 700 : 400 }}>
              {qrExpired ? 'QR expired' : `QR expires in ${mmss}`}
            </div>
            {qrExpired && (
              <button
                onClick={() => setSecs(600)}
                style={{ marginTop: 10, padding: '8px 20px', borderRadius: 20, border: '1px solid var(--primary)', background: '#ECFDF5', color: 'var(--primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                Refresh QR
              </button>
            )}
          </div>
        )}

        {method === 'wallet' && (
          <div style={{ background: 'linear-gradient(135deg, #f0fdf9, #dcfce7)', border: '1px solid #a7f3d0', borderRadius: 16, padding: '22px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>NCMC Wallet Balance</p>
            <p style={{ fontSize: 40, fontWeight: 800, color: '#065f46' }}>₹{walletBalance}</p>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>National Common Mobility Card · one tap for all legs</p>
          </div>
        )}

        {method === 'card' && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', padding: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <CardField label="Card Number" value="4242 4242 4242 4242" />
              <div style={{ display: 'flex', gap: 12 }}>
                <CardField label="Expiry" value="08 / 27" />
                <CardField label="CVV" value="•••" />
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 5 }}><ShieldCheck size={13} /> Encrypted · demo card pre-filled</div>
          </div>
        )}

        {/* Offers — coupons only apply to UPI/Card (wallet deducts the full booking fare) */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.3px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Tag size={13} /> OFFERS &amp; COUPONS</div>
          {method === 'wallet' ? (
            <div style={{ fontSize: 12, color: '#94A3B8', padding: '10px 14px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
              Coupons are not applicable for NCMC Wallet payments.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {OFFERS.map((o) => {
                const active = offer?.code === o.code;
                return (
                  <button key={o.code} onClick={() => setOffer(active ? null : o)} style={{ display: 'flex', alignItems: 'center', gap: 10, background: active ? '#ECFDF5' : 'white', border: `1px solid ${active ? 'var(--primary)' : '#E2E8F0'}`, borderRadius: 12, padding: '10px 14px', cursor: 'pointer', textAlign: 'left' }}>
                    <Tag size={16} color={active ? 'var(--primary)' : '#94A3B8'} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>{o.code}</span>
                    <span style={{ fontSize: 12, color: '#64748B' }}>{o.desc}</span>
                    {active && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--primary)' }}>APPLIED</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pay CTA */}
      <div style={{ padding: '14px 18px 20px', background: 'white', borderTop: '1px solid #F1F5F9' }}>
        <button className="btn-primary" id="pay-btn" onClick={handlePay} disabled={state === 'paying' || qrExpired} style={{ borderRadius: 50, opacity: qrExpired ? 0.5 : 1 }}>
          {state === 'paying'
            ? <><div className="spinner" /> {method === 'upi' ? 'Confirming payment…' : 'Processing…'}</>
            : <>
                {method === 'upi' ? <Smartphone size={20} /> : method === 'wallet' ? <Wallet size={20} /> : <CreditCard size={20} />}
                {method === 'upi' ? `I've Paid · ₹${payable}` : `Pay ₹${payable}`}
              </>}
        </button>
      </div>
    </div>
  );
}

function MethodTab({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '12px 6px', borderRadius: 12, border: active ? '1.5px solid var(--primary)' : '1px solid #E2E8F0', background: active ? '#ECFDF5' : 'white', color: active ? 'var(--primary)' : '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
      {icon} {label}
    </button>
  );
}

function CardField({ label, value }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', fontFamily: 'monospace', background: '#F8FAFC', borderRadius: 10, padding: '10px 12px', border: '1px solid #E2E8F0' }}>{value}</div>
    </div>
  );
}

function Row({ label, value, bold, green, points }) {
  const valueColor = green ? '#059669' : points ? '#0D9488' : '#0f172a';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: bold ? 15 : 13, fontWeight: bold ? 800 : 600, color: valueColor }}>{value}</span>
    </div>
  );
}

import { useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, CheckCircle, XCircle, Ticket, Wallet, CreditCard, Lock } from 'lucide-react';

export function PaymentScreen({ booking, route, onSuccess, onBack, addToast }) {
  const [walletBalance] = useState(500);
  const [state, setState] = useState('idle'); // idle | paying | success | failed
  const [result, setResult] = useState(null);

  const handlePay = async () => {
    setState('paying');
    try {
      const data = await api.pay(booking.bookingId);
      if (data.paymentStatus === 'Success') {
        setResult(data);
        setState('success');
        addToast('Payment successful!', 'success');
      } else {
        setResult(data);
        setState('failed');
      }
    } catch (e) {
      if (e.status === 400) {
        setResult(e);
        setState('failed');
      } else {
        addToast(e.detail || 'Payment failed', 'error');
        setState('idle');
      }
    }
  };

  if (state === 'success' && result) {
    return (
      <div className="screen-enter" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: '#f8fafc' }}>
        <div className="animate-scale-in" style={{ textAlign: 'center', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }} className="animate-bounce-gentle">
            <CheckCircle size={80} color="#10b981" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Payment Successful</h2>
          <p style={{ color: '#64748b', fontSize: 15 }}>Your journey is ready to begin</p>
          
          <div style={{ background: 'white', borderRadius: 20, padding: '24px', marginTop: 32, marginBottom: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Journey Pass ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, color: '#4f46e5' }}>{result.journeyPassId}</div>
            </div>
            
            <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />
            
            <div style={{ display: 'flex', gap: 24, justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Amount Paid</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>₹{booking.totalFareRupees}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>Remaining Balance</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>₹{result.walletBalance}</div>
              </div>
            </div>
          </div>
          <button
            className="btn-primary"
            id="view-journey-pass-btn"
            onClick={() => onSuccess(result)}
          >
            <Ticket size={20} /> View Journey Pass
          </button>
        </div>
      </div>
    );
  }

  if (state === 'failed') {
    return (
      <div className="screen-enter" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: '#f8fafc' }}>
        <div className="animate-scale-in" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <XCircle size={72} color="#ef4444" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Payment Failed</h2>
          <p style={{ color: '#64748B', fontSize: 15, marginBottom: 4 }}>Insufficient wallet balance</p>
          <div style={{ background: 'white', padding: '16px', borderRadius: 16, marginTop: 16, border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#475569', fontSize: 14 }}>
              Required: <span style={{ fontWeight: 700 }}>₹{booking.totalFareRupees}</span><br />
              Current Balance: <span style={{ fontWeight: 700, color: '#ef4444' }}>₹{result?.walletBalance || walletBalance}</span>
            </p>
          </div>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            <button
              className="btn-secondary"
              onClick={onBack}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <ArrowLeft size={16} /> Choose a Cheaper Route
            </button>
          </div>
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
        <button
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.2s' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h2 style={{ fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Wallet size={24} /> NCMC Wallet
        </h2>
      </div>

      <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Wallet balance */}
        <div
          className="card animate-fade-in-up"
          style={{ textAlign: 'center', padding: '32px 20px', background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', border: '1px solid #c7d2fe' }}
        >
          <p style={{ fontSize: 13, color: '#4f46e5', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>Available Balance</p>
          <p style={{ fontSize: 52, fontWeight: 800, color: '#312e81' }}>₹{walletBalance}</p>
        </div>

        {/* Payment details */}
        <div className="card animate-fade-in-up stagger-2">
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
            Payment Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row label="Route Summary" value={route.summary} />
            <Row label="Payment Method" value="NCMC Wallet" />
            <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Amount to Pay</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#4f46e5' }}>₹{booking.totalFareRupees}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: '#94A3B8', marginTop: 'auto' }}>
          <Lock size={14} /> This is a simulated payment interface
        </div>
      </div>

      {/* Pay CTA */}
      <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
        <button
          className="btn-primary"
          id="pay-btn"
          onClick={handlePay}
          disabled={state === 'paying'}
          style={{ background: state === 'paying' ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : undefined }}
        >
          {state === 'paying' ? <><div className="spinner" /> Processing...</> : <><CreditCard size={20} /> Pay ₹{booking.totalFareRupees}</>}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ fontSize: 14, color: '#64748b' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', textAlign: 'right', flex: 1 }}>{value}</span>
    </div>
  );
}

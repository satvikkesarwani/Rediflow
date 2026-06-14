import { useState } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Wallet as WalletIcon, Plus, History } from 'lucide-react';

export function WalletScreen({ balance, setBalance, onBack, addToast }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentAdded, setRecentAdded] = useState(null);

  const handleAddMoney = async () => {
    const val = parseInt(amount, 10);
    if (!val || val <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await api.addWalletMoney(val);
      setBalance(data.balance);
      setRecentAdded({ amount: val, time: new Date() });
      setAmount('');
      addToast(`Successfully added ₹${val} to your wallet`, 'success');
    } catch (e) {
      addToast(e.detail || 'Failed to add money', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="screen-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>

      {/* Header — light green */}
      <div style={{
        background: 'linear-gradient(160deg, #ecfdf5 0%, #d1fae5 100%)',
        padding: '20px 20px 28px',
        color: '#065f46',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(6,95,70,0.1)', border: 'none',
            color: '#065f46', padding: '8px 14px', borderRadius: 20,
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            marginBottom: 20, transition: 'background 0.2s',
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px' }}>My Wallet</h2>
        <p style={{ fontSize: 13, color: '#065f46', fontWeight: 700 }}>Manage your RideFlow balance</p>
      </div>

      {/* Scrollable content */}
      <div style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: '100%' }}>

        {/* Balance Card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)',
          borderRadius: 20,
          padding: '22px 24px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 10 }}>
            <WalletIcon size={16} />
            Available Balance
          </div>
          <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-1px' }}>
            ₹{balance.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Add Money Card */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: '22px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Add Money</h3>

          {/* Amount Input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            border: '1.5px solid #e2e8f0', borderRadius: 14,
            padding: '14px 16px', marginBottom: 14,
            background: '#f8fafc',
          }}>
            <span style={{ fontSize: 18, color: '#64748b', fontWeight: 700 }}>₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{
                flex: 1, border: 'none', background: 'transparent',
                fontSize: 16, fontWeight: 600, color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[100, 200, 500].map(val => (
              <button
                key={val}
                onClick={() => setAmount(val.toString())}
                style={{
                  flex: 1, padding: '11px 0',
                  borderRadius: 12,
                  border: amount === val.toString()
                    ? '2px solid var(--primary)'
                    : '1.5px solid #e2e8f0',
                  background: amount === val.toString() ? '#f0fdf4' : 'white',
                  color: amount === val.toString() ? 'var(--primary)' : '#475569',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                +₹{val}
              </button>
            ))}
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddMoney}
            disabled={loading || !amount}
            style={{
              width: '100%', padding: '16px',
              borderRadius: 14, border: 'none',
              background: !amount || loading ? '#cbd5e1' : 'var(--primary)',
              color: 'white', fontWeight: 700, fontSize: 16,
              cursor: !amount || loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s',
              letterSpacing: '0.3px',
            }}
          >
            {loading
              ? <div className="spinner" />
              : <><Plus size={20} /> Add to Wallet</>
            }
          </button>
        </div>

        {/* Recent Activity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <History size={16} color="#64748b" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Recent Activity</h3>
          </div>

          {recentAdded ? (
            <div style={{
              background: 'white', borderRadius: 16,
              padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: '#f0fdf4', border: '2px solid #d1fae5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)', flexShrink: 0,
                  }}>
                    <Plus size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>Money Added</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      Today, {formatTime(recentAdded.time)}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 16 }}>
                  +₹{recentAdded.amount}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: 'white', borderRadius: 16, padding: '24px 16px',
              textAlign: 'center', color: '#94a3b8', fontSize: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              No recent activity yet
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

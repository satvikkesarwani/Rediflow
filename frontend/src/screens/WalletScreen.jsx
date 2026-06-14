import { useState } from 'react';
import { ArrowLeft, Wallet as WalletIcon, Plus, History } from 'lucide-react';

export function WalletScreen({ balance, setBalance, onBack, addToast }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMoney = () => {
    const val = parseInt(amount, 10);
    if (!val || val <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      setBalance(prev => prev + val);
      setAmount('');
      setLoading(false);
      addToast(`Successfully added ₹${val} to your wallet`, 'success');
    }, 1000);
  };

  return (
    <div className="screen-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
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
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>My Wallet</h2>
        <p style={{ fontSize: 14, color: '#a5b4fc' }}>Manage your RideFlow balance</p>
      </div>

      <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Balance Card */}
        <div className="card animate-fade-in-up" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)', color: 'white', padding: '24px', borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c7d2fe', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
            <WalletIcon size={18} /> Available Balance
          </div>
          <div style={{ fontSize: 36, fontWeight: 800 }}>₹{balance.toLocaleString()}</div>
        </div>

        {/* Add Money Section */}
        <div className="card animate-fade-in-up stagger-2" style={{ padding: '24px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 16 }}>Add Money</h3>
          
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: '#64748B', fontWeight: 600 }}>₹</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              style={{
                width: '100%', padding: '16px 16px 16px 36px', borderRadius: 14,
                border: '1px solid #cbd5e1', fontSize: 16, color: '#0F172A',
                background: '#f8fafc', outline: 'none', fontWeight: 600,
                transition: 'border-color 0.2s',
              }}
            />
          </div>

          {/* Quick Amount Buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {[100, 200, 500].map(val => (
              <button 
                key={val}
                onClick={() => setAmount(val.toString())}
                style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                +₹{val}
              </button>
            ))}
          </div>

          <button 
            className="btn-primary" 
            onClick={handleAddMoney}
            disabled={loading || !amount}
            style={{ padding: '16px', borderRadius: 14, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
          >
            {loading ? <div className="spinner" /> : <><Plus size={20} /> Add to Wallet</>}
          </button>
        </div>

        {/* Recent Transactions Placeholder */}
        <div className="animate-fade-in-up stagger-3" style={{ padding: '0 4px' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#334155', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <History size={16} color="#64748B" /> Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Mock Transaction */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>Money Added</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>Yesterday, 10:42 AM</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: '#10B981', fontSize: 15 }}>+₹500</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

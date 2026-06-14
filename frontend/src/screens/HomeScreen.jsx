import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PreferenceSelector } from '../components/PreferenceSelector';
import { Wallet, MapPin, ChevronRight, ChevronDown, Train, Bus, Car, Footprints } from 'lucide-react';

export function HomeScreen({ onSearch, onOpenWallet, addToast }) {
  const [locations, setLocations] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [preference, setPreference] = useState('balanced');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getLocations()
      .then((data) => {
        const locs = data.locations || [];
        setLocations(locs);
        if (locs.length >= 2) {
          setSource(locs[0].name);
          const techPark = locs.find(l => l.name.toLowerCase() === 'tech park');
          setDestination(techPark ? techPark.name : locs[1].name);
        }
      })
      .catch(() => addToast('Could not load locations', 'error'));
  }, []);

  const handleSearch = async () => {
    if (!source || !destination) {
      addToast('Please select source and destination', 'error');
      return;
    }
    if (source === destination) {
      addToast('Source and destination cannot be the same', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await api.searchRoutes(source, destination, preference);
      onSearch({ routes: data.routes, source, destination, preference });
    } catch (e) {
      addToast(e.detail || 'No routes found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    width: '100%',
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    color: '#0F172A',
    outline: 'none',
    background: 'transparent',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
  };

  return (
    <div className="screen-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
      
      {/* App Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px', zIndex: 10, background: 'white' }}>
        <div style={{ width: 24 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
            <MapPin size={22} strokeWidth={2.5} />
          </div>
          RideFlow
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onOpenWallet}>
          <Wallet size={24} color="#0F172A" />
        </button>
      </div>

      {/* Hero Content */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero — white background, illustration on the right, text on the left */}
        <div style={{
          position: 'relative',
          height: 220,
          background: '#f0f7f4',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-start',
          padding: '28px 24px 0',
        }}>
          {/* Illustration — right-side only */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '65%',
            backgroundImage: 'url(/src/assets/hero-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 55%',
            backgroundRepeat: 'no-repeat',
          }} />
          {/* Gradient fade: illustration bleeds into bg from left */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '65%',
            background: 'linear-gradient(to right, #f0f7f4 0%, #f0f7f450 30%, transparent 60%)',
          }} />

          {/* Title — left side, clearly readable on light bg */}
          <h1 style={{
            position: 'relative',
            zIndex: 2,
            fontSize: 30,
            fontWeight: 900,
            color: '#0F172A',
            lineHeight: 1.2,
            maxWidth: 175,
            margin: 0,
            letterSpacing: '-0.5px',
          }}>
            Plan your<br />journey
          </h1>
        </div>

        {/* Main Card — overlaps hero from below */}
        <div style={{ 
          background: 'white', 
          borderRadius: 24, 
          margin: '-28px 16px 24px', 
          padding: '24px 20px', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
          display: 'flex', 
          flexDirection: 'column', 
          gap: 24,
          position: 'relative',
          zIndex: 10
        }}>
          
          {/* From / To Dropdowns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
            {/* Timeline connection line */}
            <div style={{ position: 'absolute', left: 11, top: 24, bottom: 24, width: 2, background: '#E2E8F0', zIndex: 0 }} />
            
            {/* From */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginBottom: 2 }}>From</div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="" disabled>Select departure</option>
                    {locations.map((loc) => (
                      <option key={loc.locationId} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} color="#94A3B8" style={{ flexShrink: 0, pointerEvents: 'none', marginLeft: -20 }} />
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: '#F1F5F9', marginLeft: 40 }} />

            {/* To */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={14} color="white" fill="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600, marginBottom: 2 }}>To</div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="" disabled>Select destination</option>
                    {locations.map((loc) => (
                      <option key={loc.locationId} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} color="#94A3B8" style={{ flexShrink: 0, pointerEvents: 'none', marginLeft: -20 }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: '#F1F5F9' }} />

          {/* Preferences */}
          <div>
            <div style={{ fontSize: 14, color: '#64748B', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              Route preference <span style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid #94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#94A3B8', fontWeight: 700 }}>i</span>
            </div>
            <PreferenceSelector value={preference} onChange={setPreference} />
          </div>

          {/* Transport Modes */}
          <div>
            <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, marginBottom: 14, textAlign: 'center', letterSpacing: '0.3px' }}>Available modes</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
              {[
                { icon: <Train size={22} />, label: 'Metro' },
                { icon: <Bus size={22} />, label: 'Bus' },
                { icon: <Train size={22} strokeWidth={1.8} />, label: 'Train' },
                { icon: <Car size={22} />, label: 'Auto' },
                { icon: <Footprints size={22} />, label: 'Walk' },
              ].map(m => (
                <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    background: '#f0fdf9',
                    color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {m.icon}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button
            className="btn-primary"
            onClick={handleSearch}
            disabled={loading}
            style={{ marginTop: 8, justifyContent: 'space-between', padding: '14px 14px 14px 24px' }}
          >
            {loading ? <div className="spinner" /> : <span style={{ fontSize: 18, fontWeight: 700 }}>Find Routes</span>}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={20} color="var(--primary)" strokeWidth={3} />
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}

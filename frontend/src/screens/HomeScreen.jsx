import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PreferenceSelector } from '../components/PreferenceSelector';
import { Train, MapPin, Search, Navigation } from 'lucide-react';

const QUICK_ROUTES = [
  { source: 'Central Railway Station', destination: 'Tech Park' },
  { source: 'Residential Area North', destination: 'University Campus' },
];

export function HomeScreen({ onSearch, addToast }) {
  const [locations, setLocations] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [preference, setPreference] = useState('balanced');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.getLocations()
      .then((data) => setLocations(data.locations || []))
      .catch(() => addToast('Could not load locations', 'error'));
  }, []);

  const validate = () => {
    const errs = {};
    if (!source) errs.source = 'Please select a source';
    if (!destination) errs.destination = 'Please select a destination';
    if (source && destination && source === destination)
      errs.destination = 'Source and destination must be different';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSearch = async () => {
    if (!validate()) return;
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

  const quickFill = (s, d) => { setSource(s); setDestination(d); setErrors({}); };

  return (
    <div className="screen-enter" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        padding: '56px 24px 40px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)',
        }} />

        <Train size={42} strokeWidth={1.5} style={{ marginBottom: 16, color: '#818cf8' }} />
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: '-1px' }}>RideFlow</h1>
        <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.5, maxWidth: 300, fontWeight: 400 }}>
          Smart multi-modal journeys for every commuter.
        </p>
      </div>

      {/* Form */}
      <div style={{ padding: '32px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Source */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
            <MapPin size={16} /> Where are you?
          </label>
          <select
            id="source-select"
            value={source}
            onChange={(e) => { setSource(e.target.value); setErrors({}); }}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 14,
              border: `1px solid ${errors.source ? '#EF4444' : '#cbd5e1'}`,
              fontSize: 15, color: source ? '#0F172A' : '#94A3B8',
              background: '#f8fafc', outline: 'none',
              appearance: 'none', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            <option value="">Select source location</option>
            {locations.map((l) => (
              <option key={l.locationId} value={l.name}>{l.name}</option>
            ))}
          </select>
          {errors.source && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>{errors.source}</p>}
        </div>

        {/* Destination */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
            <Navigation size={16} /> Where do you want to go?
          </label>
          <select
            id="destination-select"
            value={destination}
            onChange={(e) => { setDestination(e.target.value); setErrors({}); }}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 14,
              border: `1px solid ${errors.destination ? '#EF4444' : '#cbd5e1'}`,
              fontSize: 15, color: destination ? '#0F172A' : '#94A3B8',
              background: '#f8fafc', outline: 'none',
              appearance: 'none', cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
          >
            <option value="">Select destination</option>
            {locations.map((l) => (
              <option key={l.locationId} value={l.name}>{l.name}</option>
            ))}
          </select>
          {errors.destination && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 6 }}>{errors.destination}</p>}
        </div>

        {/* Preference */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12, display: 'block' }}>
            Route preference
          </label>
          <PreferenceSelector value={preference} onChange={setPreference} />
        </div>

        {/* CTA */}
        <button
          id="find-routes-btn"
          className="btn-primary"
          onClick={handleSearch}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? (
            <><div className="spinner" /> Planning...</>
          ) : (
            <><Search size={20} /> Find Routes</>
          )}
        </button>

        {/* Quick routes */}
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600, marginBottom: 12, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Popular routes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {QUICK_ROUTES.map((r, i) => (
              <button
                key={i}
                onClick={() => quickFill(r.source, r.destination)}
                style={{
                  padding: '12px 16px', borderRadius: 12,
                  border: '1px solid #e2e8f0', background: 'white',
                  fontSize: 14, color: '#334155', fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <MapPin size={16} color="#818cf8" />
                <span>{r.source} <span style={{color: '#94a3b8', margin: '0 4px'}}>→</span> {r.destination}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

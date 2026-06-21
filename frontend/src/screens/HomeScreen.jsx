import { useState, useEffect, useMemo } from 'react';
import heroBg from '../assets/hero-bg.png';
import { api } from '../services/api';
import { PreferenceSelector } from '../components/PreferenceSelector';
import { prefToBackend, prefIsSafe } from '../data/preferences';
import { RideMap } from '../components/RideMap';
import { LOCATIONS, coordsFor } from '../data/geo';
import {
  Wallet, MapPin, ChevronRight, ChevronDown, Train, Bus, Car, Footprints,
  ArrowRightLeft, Clock, Calendar, ShieldCheck, History, Leaf, Sparkles,
} from 'lucide-react';

const RECENT_KEY = 'rf_recent_searches';

export function HomeScreen({ onSearch, onOpenWallet, onOpenEco, onOpenHistory, onOpenAssistant, addToast }) {
  const [locations, setLocations] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [preference, setPreference] = useState('balanced');
  const [loading, setLoading] = useState(false);
  const [mapTarget, setMapTarget] = useState('to'); // which field a map tap fills
  const [when, setWhen] = useState('now'); // 'now' | 'later'
  // Derive safeMode from preference during render rather than syncing via an effect.
  // This avoids a synchronous setState inside a useEffect body (ESLint set-state-in-effect)
  // while keeping the behavior identical: Women Safe preference always enables safe mode,
  // but the user can also toggle it independently.
  const [localSafeMode, setLocalSafeMode] = useState(false);
  const safeMode = prefIsSafe(preference) || localSafeMode;

  // Initialise recent searches directly in useState to avoid a sync setState in useEffect.
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
  });

  useEffect(() => {
    api.getLocations()
      .then((data) => {
        const locs = data.locations || [];
        setLocations(locs.length ? locs : LOCATIONS.map((l, i) => ({ locationId: `L${i}`, ...l })));
        if (locs.length >= 2) {
          setSource(locs[0].name);
          const techPark = locs.find((l) => l.name.toLowerCase() === 'tech park');
          setDestination(techPark ? techPark.name : locs[1].name);
        }
      })
      .catch(() => {
        // offline fallback to static list so the map still works
        setLocations(LOCATIONS.map((l, i) => ({ locationId: `L${i}`, ...l })));
        setSource('Central Railway Station');
        setDestination('Tech Park');
      });
  }, []);

  const handleMapPick = (name) => {
    if (mapTarget === 'from') { setSource(name); setMapTarget('to'); addToast(`Origin set to ${name}`, 'success'); }
    else { setDestination(name); setMapTarget('from'); addToast(`Destination set to ${name}`, 'success'); }
  };

  const swap = () => { setSource(destination); setDestination(source); };

  const saveRecent = (s, d) => {
    const next = [{ source: s, destination: d }, ...recent.filter((r) => !(r.source === s && r.destination === d))].slice(0, 3);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const runSearch = async (s = source, d = destination) => {
    if (!s || !d) { addToast('Please select source and destination', 'error'); return; }
    if (s === d) { addToast('Source and destination cannot be the same', 'error'); return; }
    // Schedule Later: show informational toast but proceed with the live route search.
    // The feature flag (when === 'later') is preserved for future date-picker integration.
    if (when === 'later') { addToast('Scheduled departure is coming soon — showing live routes for now', 'info'); }
    setLoading(true);
    try {
      const backendPref = prefToBackend(preference);
      const data = await api.searchRoutes(s, d, backendPref);
      saveRecent(s, d);
      onSearch({ routes: data.routes, source: s, destination: d, preference: backendPref, prefId: preference, safeMode });
    } catch (e) {
      addToast(e.detail || 'No routes found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    width: '100%', border: 'none', fontSize: 16, fontWeight: 600, color: '#0F172A',
    outline: 'none', background: 'transparent', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
  };

  const fromCoords = coordsFor(source);
  const toCoords = coordsFor(destination);
  // Memoize selectable markers so the array reference is stable between renders.
  // Without this, every parent re-render creates a new array reference, which makes
  // JSON.stringify(selectable) in RideMap's effect dependency produce a new string
  // value on every render — triggering repeated OSRM fetches and visible map flicker.
  const selectableMarkers = useMemo(
    () => locations
      .map((l) => ({ name: l.name, lat: l.latitude ?? coordsFor(l.name)?.lat, lng: l.longitude ?? coordsFor(l.name)?.lng }))
      .filter((l) => l.lat && l.lng),
    [locations]
  );

  return (
    <div className="screen-enter" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'white' }}>

      {/* App Bar — logo left, actions right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 18px 14px', zIndex: 10, background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 19, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
          <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
            <MapPin size={22} strokeWidth={2.5} />
          </div>
          RideFlow
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-tap" title="RideFlow Assistant — talk to plan" onClick={onOpenAssistant} style={{ background: 'linear-gradient(135deg,#008B74,#10B981)', border: 'none', cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(0,139,116,0.35)' }}>
            <Sparkles size={19} color="white" />
          </button>
          <IconBtn title="Travel History" onClick={onOpenHistory}><History size={19} color="var(--primary)" /></IconBtn>
          <IconBtn title="Carbon Dashboard" onClick={onOpenEco}><Leaf size={19} color="var(--primary)" /></IconBtn>
          <IconBtn title="Wallet" onClick={onOpenWallet}><Wallet size={19} color="var(--primary)" /></IconBtn>
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero */}
        <div style={{ position: 'relative', height: 160, background: '#f0f7f4', overflow: 'hidden', display: 'flex', alignItems: 'flex-start', padding: '28px 24px 0' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '65%', backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center 55%', backgroundRepeat: 'no-repeat' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '65%', background: 'linear-gradient(to right, #f0f7f4 0%, #f0f7f450 30%, transparent 60%)' }} />
          <h1 style={{ position: 'relative', zIndex: 2, fontSize: 28, fontWeight: 900, color: '#0F172A', lineHeight: 1.2, maxWidth: 175, margin: 0, letterSpacing: '-0.5px' }}>
            Plan your<br />journey
          </h1>
        </div>

        {/* Main Card */}
        <div style={{ background: 'white', borderRadius: 24, margin: '-28px 16px 24px', padding: '22px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', zIndex: 10 }}>

          {/* From / To with swap */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 11, top: 24, bottom: 24, width: 2, background: '#E2E8F0', zIndex: 0 }} />
              {/* From */}
              <FieldRow
                dot={<div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} /></div>}
                label="From" active={mapTarget === 'from'} onActivate={() => setMapTarget('from')}>
                <select value={source} onChange={(e) => setSource(e.target.value)} style={selectStyle}>
                  <option value="" disabled>Select departure</option>
                  {locations.map((loc) => <option key={loc.locationId} value={loc.name}>{loc.name}</option>)}
                </select>
              </FieldRow>
              <div style={{ height: 1, background: '#F1F5F9', marginLeft: 40 }} />
              {/* To */}
              <FieldRow
                dot={<div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={14} color="white" fill="white" /></div>}
                label="To" active={mapTarget === 'to'} onActivate={() => setMapTarget('to')}>
                <select value={destination} onChange={(e) => setDestination(e.target.value)} style={selectStyle}>
                  <option value="" disabled>Select destination</option>
                  {locations.map((loc) => <option key={loc.locationId} value={loc.name}>{loc.name}</option>)}
                </select>
              </FieldRow>
            </div>
            <button onClick={swap} title="Swap" style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #E2E8F0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <ArrowRightLeft size={16} color="var(--primary)" />
            </button>
          </div>

          {/* Map with destination selection */}
          <div>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={13} /> Tap a stop on the map to set <span style={{ color: 'var(--primary)' }}>{mapTarget === 'from' ? 'origin' : 'destination'}</span>
            </div>
            <RideMap
              from={fromCoords}
              to={toCoords}
              selectable={selectableMarkers}
              onPick={handleMapPick}
              showRoute={!!(fromCoords && toCoords)}
              height={200}
              allowLocate
              badge={fromCoords && toCoords ? 'Live road route' : 'Pick on map'}
            />
          </div>

          {/* Leave Now / Schedule */}
          <div style={{ display: 'flex', gap: 10 }}>
            <TimeBtn active={when === 'now'} onClick={() => setWhen('now')} icon={<Clock size={15} />} label="Leave Now" />
            <TimeBtn active={when === 'later'} onClick={() => setWhen('later')} icon={<Calendar size={15} />} label="Schedule Later" />
          </div>

          {/* Safe Mode toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: safeMode ? '#ecfdf5' : '#F8FAFC', border: `1px solid ${safeMode ? '#a7f3d0' : '#E2E8F0'}`, borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={20} color={safeMode ? 'var(--primary)' : '#94A3B8'} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Safe Mode</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Filters safer routes & shares live location</div>
              </div>
            </div>
            <button onClick={() => setLocalSafeMode((v) => !v)} style={{ width: 46, height: 26, borderRadius: 20, border: 'none', cursor: 'pointer', background: safeMode ? 'var(--primary)' : '#CBD5E1', position: 'relative', transition: 'all 0.2s' }}>
              <span style={{ position: 'absolute', top: 3, left: safeMode ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          {/* Preferences */}
          <div>
            <div style={{ fontSize: 14, color: '#64748B', fontWeight: 600, marginBottom: 12 }}>Route preference</div>
            <PreferenceSelector value={preference} onChange={setPreference} />
          </div>

          {/* Modes */}
          <div>
            <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, marginBottom: 12, textAlign: 'center', letterSpacing: '0.3px' }}>Available modes</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
              {[
                { icon: <Train size={20} />, label: 'Metro' },
                { icon: <Bus size={20} />, label: 'Bus' },
                { icon: <Train size={20} strokeWidth={1.8} />, label: 'Train' },
                { icon: <Car size={20} />, label: 'Auto' },
                { icon: <Footprints size={20} />, label: 'Walk' },
              ].map((m) => (
                <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#f0fdf9', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <button className="btn-primary" onClick={() => runSearch()} disabled={loading} style={{ marginTop: 4, justifyContent: 'space-between', padding: '14px 14px 14px 24px' }}>
            {loading ? <div className="spinner" /> : <span style={{ fontSize: 18, fontWeight: 700 }}>Find Routes</span>}
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={20} color="var(--primary)" strokeWidth={3} />
            </div>
          </button>

          {/* Recent searches */}
          {recent.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.3px' }}>
                <History size={13} /> RECENT SEARCHES
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recent.map((r, i) => (
                  <button key={i} onClick={() => { setSource(r.source); setDestination(r.destination); runSearch(r.source, r.destination); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', textAlign: 'left' }}>
                    <MapPin size={14} color="#94A3B8" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{r.source}</span>
                    <ChevronRight size={13} color="#CBD5E1" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{r.destination}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldRow({ dot, label, active, onActivate, children }) {
  return (
    <div onClick={onActivate} style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1, cursor: 'pointer' }}>
      {dot}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: active ? 'var(--primary)' : '#64748B', fontWeight: 600, marginBottom: 2 }}>{label}{active ? ' • tap map' : ''}</div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {children}
          <ChevronDown size={16} color="#94A3B8" style={{ flexShrink: 0, pointerEvents: 'none', marginLeft: -20 }} />
        </div>
      </div>
    </div>
  );
}

function IconBtn({ title, onClick, children }) {
  return (
    <button className="btn-tap" title={title} onClick={onClick} style={{ background: '#f0fdf9', border: '1px solid #d1fae5', cursor: 'pointer', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}>
      {children}
    </button>
  );
}

function TimeBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px 8px', borderRadius: 12, border: active ? '1px solid var(--primary)' : '1px solid #E2E8F0', background: active ? 'var(--primary)' : 'white', color: active ? 'white' : '#475569', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
      {icon} {label}
    </button>
  );
}

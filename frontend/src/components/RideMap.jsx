import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair } from 'lucide-react';

// Colored teardrop pin matching RideFlow's palette.
function pinIcon(color, glyph = '') {
  return L.divIcon({
    className: 'rf-pin',
    html: `<div style="
      width:26px;height:26px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      box-shadow:0 3px 8px rgba(0,0,0,0.3);border:2.5px solid #fff;
      display:flex;align-items:center;justify-content:center;">
      <span style="transform:rotate(45deg);color:#fff;font-size:11px;font-weight:800;">${glyph}</span>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });
}

function dotIcon(color, selected) {
  const size = selected ? 16 : 12;
  return L.divIcon({
    className: 'rf-dot',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Tappable stop marker (used on the home map for picking origin/destination).
function stopIcon() {
  return L.divIcon({
    className: 'rf-stop',
    html: `<div style="width:18px;height:18px;border-radius:50%;cursor:pointer;
      background:#0D9488;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);
      transition:transform .15s;"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

async function fetchOsrmRoute(from, to) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes[0]) {
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      return { coords, distance: data.routes[0].distance, duration: data.routes[0].duration };
    }
  } catch {
    /* fall through to straight line */
  }
  return null;
}

/**
 * Reusable Leaflet map.
 * Props:
 *  - from, to: {lat,lng} endpoints (optional)
 *  - selectable: array of {name, lat, lng} markers the user can tap
 *  - onPick(name): called when a selectable marker is tapped
 *  - showRoute: draw live OSRM road route between from & to
 *  - height: map height (default 220)
 *  - allowLocate: show "Locate Me" button
 *  - onLocate({lat,lng}): called after geolocation succeeds
 *  - badge: small label text shown top-left
 */
export function RideMap({
  from, to, selectable = [], onPick, showRoute = false,
  height = 220, allowLocate = false, onLocate, badge,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({ markers: [], route: null });
  const [locating, setLocating] = useState(false);

  // init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    // Pan/scroll gestures are disabled so the map never steals page scroll
    // inside the scrollable app shell. Users select via marker tap + zoom buttons.
    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    }).setView([18.53, 73.87], 12);
    map.zoomControl.setPosition('topright');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OSM',
    }).addTo(map);
    mapRef.current = map;
    // size fix after layout settles
    setTimeout(() => map.invalidateSize(), 150);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // render markers + route whenever inputs change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // clear old layers
    layersRef.current.markers.forEach((m) => map.removeLayer(m));
    layersRef.current.markers = [];
    if (layersRef.current.route) { map.removeLayer(layersRef.current.route); layersRef.current.route = null; }

    const bounds = [];

    // selectable location dots
    selectable.forEach((loc) => {
      const isEndpoint =
        (from && from.lat === loc.lat && from.lng === loc.lng) ||
        (to && to.lat === loc.lat && to.lng === loc.lng);
      if (isEndpoint) return; // endpoints get teardrop pins below
      const m = L.marker([loc.lat, loc.lng], { icon: onPick ? stopIcon() : dotIcon('#94A3B8', false), interactive: true })
        .addTo(map)
        .bindTooltip(onPick ? `Tap to set: ${loc.name}` : loc.name, { direction: 'top', offset: [0, -8] });
      if (onPick) m.on('click', () => onPick(loc.name));
      layersRef.current.markers.push(m);
      bounds.push([loc.lat, loc.lng]);
    });

    if (from) {
      const m = L.marker([from.lat, from.lng], { icon: pinIcon('#008B74', 'A') }).addTo(map);
      layersRef.current.markers.push(m);
      bounds.push([from.lat, from.lng]);
    }
    if (to) {
      const m = L.marker([to.lat, to.lng], { icon: pinIcon('#EF4444', 'B') }).addTo(map);
      layersRef.current.markers.push(m);
      bounds.push([to.lat, to.lng]);
    }

    // route
    let cancelled = false;
    const drawRoute = async () => {
      if (showRoute && from && to) {
        const osrm = await fetchOsrmRoute(from, to);
        if (cancelled || !mapRef.current) return;
        const latlngs = osrm ? osrm.coords : [[from.lat, from.lng], [to.lat, to.lng]];
        const line = L.polyline(latlngs, {
          color: '#008B74', weight: 5, opacity: 0.85,
          dashArray: osrm ? null : '8,8',
        }).addTo(map);
        layersRef.current.route = line;
        map.fitBounds(line.getBounds(), { padding: [36, 36], maxZoom: 15 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 14);
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
      }
    };
    drawRoute();
    return () => { cancelled = true; };
  }, [from, to, showRoute, JSON.stringify(selectable)]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocating(false);
        if (mapRef.current) {
          mapRef.current.setView([here.lat, here.lng], 14);
          L.marker([here.lat, here.lng], { icon: dotIcon('#3B82F6', true) })
            .addTo(mapRef.current)
            .bindTooltip('You are here', { direction: 'top' });
        }
        onLocate && onLocate(here);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div style={{ position: 'relative', height, borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
      {badge && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 500,
          background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: '5px 12px',
          fontSize: 11, fontWeight: 700, color: 'var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)' }} />
          {badge}
        </div>
      )}
      {allowLocate && (
        <button
          onClick={handleLocate}
          style={{
            position: 'absolute', bottom: 12, left: 10, zIndex: 500,
            background: 'white', border: 'none', borderRadius: 20, padding: '8px 12px',
            fontSize: 12, fontWeight: 700, color: '#0F172A', boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          }}
        >
          <Crosshair size={14} color="var(--primary)" /> {locating ? 'Locating…' : 'Locate Me'}
        </button>
      )}
    </div>
  );
}

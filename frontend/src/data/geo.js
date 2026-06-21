// Static coordinates for the 8 RideFlow locations (mirrors backend/data/locations.json).
// Used so any screen can resolve a location name → {lat, lng} without an extra fetch.
export const LOCATIONS = [
  { name: 'Central Railway Station', type: 'railway_station', lat: 18.5294, lng: 73.8742 },
  { name: 'Metro Central',           type: 'metro_station',   lat: 18.5201, lng: 73.8567 },
  { name: 'City Bus Depot',          type: 'bus_depot',       lat: 18.5158, lng: 73.8431 },
  { name: 'Tech Park',               type: 'tech_hub',        lat: 18.5632, lng: 73.9165 },
  { name: 'University Campus',       type: 'university',      lat: 18.4566, lng: 73.8501 },
  { name: 'Residential Area North',  type: 'residential',     lat: 18.5890, lng: 73.8822 },
  { name: 'Airport Road',            type: 'airport_road',    lat: 18.5788, lng: 73.9094 },
  { name: 'Shopping Mall',           type: 'commercial',      lat: 18.5345, lng: 73.8901 },
];

const BY_NAME = LOCATIONS.reduce((acc, l) => { acc[l.name.toLowerCase()] = l; return acc; }, {});

export function coordsFor(name) {
  if (!name) return null;
  const l = BY_NAME[name.toLowerCase()];
  return l ? { lat: l.lat, lng: l.lng } : null;
}

// Straight-line distance in km (haversine) — handy for "savings vs taxi" and map fitting.
export function distanceKm(a, b) {
  if (!a || !b) return 0;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

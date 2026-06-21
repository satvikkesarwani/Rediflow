// Builds a standard UPI intent string that any UPI app can scan.
export function upiIntent({ pa = 'rideflow@upi', pn = 'RideFlow', am, tn = 'RideFlow Journey', tr }) {
  const params = new URLSearchParams({ pa, pn, am: String(am), cu: 'INR', tn });
  if (tr) params.set('tr', tr);
  return `upi://pay?${params.toString()}`;
}

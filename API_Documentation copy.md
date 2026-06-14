# RideFlow API Documentation

Base URL: `http://localhost:8000`

## 1. Get Locations
**Endpoint:** `GET /locations`
**Description:** Fetches all available pre-defined locations for routing.
**Response:**
```json
{
  "locations": [
    {
      "locationId": "L1",
      "name": "Central Railway Station",
      "type": "Transit Hub"
    }
  ]
}
```

## 2. Search Routes
**Endpoint:** `POST /routes/search`
**Description:** Returns ranked route options between two points based on user preference.
**Request Body:**
```json
{
  "source": "Central Railway Station",
  "destination": "Tech Park",
  "preference": "fastest" // Enum: balanced, fastest, cheapest, eco, least_walking, fewest_transfers
}
```
**Response:**
```json
{
  "routes": [
    {
      "routeId": "RF-R1",
      "summary": "Walk → Bus → Metro → Auto",
      "totalTimeMinutes": 54,
      "totalFareRupees": 82,
      "transferCount": 2,
      "totalWalkingMeters": 650,
      "carbonLabel": "Low",
      "safetyLabel": "Medium",
      "reliabilityLabel": "High",
      "tag": "Recommended",
      "score": 0.32
    }
  ]
}
```

## 3. Get Route Details
**Endpoint:** `GET /routes/{routeId}`
**Description:** Fetches step-by-step navigation instructions for a specific route.
**Response:**
```json
{
  "routeId": "RF-R1",
  ... (summary metrics),
  "steps": [
    {
      "stepNumber": 1,
      "from_": "Central Railway Station",
      "to": "Bus Stop A",
      "mode": "walk",
      "durationMinutes": 6,
      "distanceMeters": 400,
      "fareRupees": 0,
      "instruction": "Walk to Bus Stop A outside the main gate."
    }
  ]
}
```

## 4. Get Route Explanation
**Endpoint:** `GET /routes/{routeId}/explanation`
**Description:** Returns an AI-style, rule-based natural language explanation for why this route was selected or ranked a certain way compared to others.
**Response:**
```json
{
  "routeId": "RF-R1",
  "tag": "Recommended",
  "explanation": "This route offers the best overall balance. While it costs ₹82, it saves 24 minutes compared to the cheapest option. It requires fewer transfers than the fastest route."
}
```

## 5. Create Booking
**Endpoint:** `POST /bookings/create`
**Description:** Mocks the creation of a booking, generating ticket IDs for all chargeable transit legs.
**Request Body:**
```json
{
  "routeId": "RF-R1",
  "userId": "demo-user"
}
```
**Response:**
```json
{
  "bookingId": "RF-BKG-1001",
  "status": "pending_payment",
  "tickets": [
    {
      "legId": "LEG-BUS-01",
      "mode": "bus",
      "ticketId": "TKT-BUS-9281",
      "fareRupees": 15
    }
  ]
}
```

## 6. Process Payment
**Endpoint:** `POST /payments/pay`
**Description:** Deducts funds from a mock wallet and generates a Journey Pass ID.
**Request Body:**
```json
{
  "bookingId": "RF-BKG-1001",
  "paymentMethod": "Mock NCMC Wallet"
}
```
**Response:**
```json
{
  "status": "success",
  "journeyPassId": "PASS-8192-XXXX",
  "walletBalanceRemaining": 418
}
```

## 7. Get Live Updates
**Endpoint:** `GET /journey/{bookingId}/updates`
**Description:** Returns a sequence of live journey tracking updates for the front-end simulation.
**Response:**
```json
{
  "updates": [
    {
      "timestamp": "2026-06-10T12:00:00Z",
      "message": "Bus arriving in 4 minutes.",
      "type": "arrival"
    }
  ]
}
```

# RideFlow API Documentation

Base URL: `http://localhost:8000`

## 1. Get Locations
* **Endpoint:** `GET /locations`
* **Description:** Fetches all available pre-defined locations for routing.
* **Response:**
```json
{
  "locations": [
    {
      "locationId": "L1",
      "name": "Central Railway Station",
      "type": "Transit Hub"
    },
    {
      "locationId": "L2",
      "name": "Tech Park",
      "type": "Business District"
    }
  ]
}
```

---

## 2. Search Routes
* **Endpoint:** `POST /routes/search`
* **Description:** Returns preference-scored and ranked route options between origin and destination.
* **Request Body:**
```json
{
  "source": "Central Railway Station",
  "destination": "Tech Park",
  "preference": "cheapest" // Enum: balanced, fastest, cheapest, eco_friendly, least_walking, fewest_transfers
}
```
* **Response:**
```json
{
  "routes": [
    {
      "routeId": "RF-R2",
      "summary": "Walk → Train → Bus → Walk",
      "totalTimeMinutes": 68,
      "totalFareRupees": 54,
      "transferCount": 2,
      "totalWalkingMeters": 1200,
      "walkingDistanceMeters": 1200,
      "carbonLabel": "Low",
      "safetyLabel": "Medium",
      "reliabilityLabel": "High",
      "tag": "Cheapest",
      "score": 0.1205
    }
  ]
}
```

---

## 3. Get Route Details
* **Endpoint:** `GET /routes/{routeId}`
* **Description:** Fetches detailed step-by-step metadata and instruction set for a specific route.
* **Response:**
```json
{
  "routeId": "RF-R2",
  "source": "Central Railway Station",
  "destination": "Tech Park",
  "summary": "Walk → Train → Bus → Walk",
  "totalTimeMinutes": 68,
  "totalFareRupees": 54,
  "transferCount": 2,
  "totalWalkingMeters": 1200,
  "carbonLabel": "Low",
  "safetyLabel": "Medium",
  "reliabilityLabel": "High",
  "tag": "Cheapest",
  "score": 0.1205,
  "steps": [
    {
      "stepNumber": 1,
      "mode": "walk",
      "from": "Central Railway Station",
      "to": "Central Station Train Platform 1",
      "routeNumber": null,
      "lineName": null,
      "platform": null,
      "durationMinutes": 5,
      "fareRupees": 0,
      "distanceMeters": 300,
      "instruction": "Walk to Central Station Train Platform 1."
    },
    {
      "stepNumber": 2,
      "mode": "train",
      "from": "Central Station Train Platform 1",
      "to": "City Bus Depot – Bay 5",
      "routeNumber": "Local 47",
      "lineName": "Suburban Line",
      "platform": "Platform 1",
      "durationMinutes": 25,
      "fareRupees": 18,
      "distanceMeters": 8000,
      "instruction": "Take local Train Local 47 towards City Bus Depot."
    }
  ]
}
```

---

## 4. Get Route Explanation
* **Endpoint:** `GET /routes/{routeId}/explanation`
* **Description:** Returns a relative natural language explanation comparing this route to others.
* **Response:**
```json
{
  "routeId": "RF-R2",
  "tag": "Cheapest",
  "explanation": "This is the most affordable route at ₹54. It completes the journey in 68 min at ₹54 with 2 transfer(s) and 1200m of walking. It is 26 min slower than the fastest route but saves ₹76 in fare. Note: This route involves 1200m of walking."
}
```

---

## 5. Create Booking
* **Endpoint:** `POST /bookings/create`
* **Description:** Prepares the multi-modal booking, creating ticket references for all legs.
* **Request Body:**
```json
{
  "routeId": "RF-R2",
  "userId": "demo-user"
}
```
* **Response:**
```json
{
  "bookingId": "RF-BKG-1001",
  "routeId": "RF-R2",
  "userId": "demo-user",
  "status": "Pending Payment",
  "legs": [
    {
      "legId": "LEG-W2",
      "mode": "walk",
      "ticketId": null,
      "fareRupees": 0
    },
    {
      "legId": "LEG-T1",
      "mode": "train",
      "ticketId": "TRN-RF-8968",
      "fareRupees": 18
    },
    {
      "legId": "LEG-B2",
      "mode": "bus",
      "ticketId": "BUS-RF-7095",
      "fareRupees": 36
    }
  ],
  "totalFareRupees": 54
}
```

---

## 6. Process Payment
* **Endpoint:** `POST /payments/pay`
* **Description:** Deducts funds from the simulated NCMC wallet and updates booking status to Paid.
* **Request Body:**
```json
{
  "bookingId": "RF-BKG-1001",
  "paymentMethod": "Mock NCMC Wallet"
}
```
* **Response:**
```json
{
  "paymentStatus": "Success",
  "journeyPassId": "RF-PASS-4837",
  "qrCodeText": "RF-PASS-4837",
  "walletBalance": 446
}
```

---

## 7. Get Live Updates
* **Endpoint:** `GET /journey/{bookingId}/updates`
* **Description:** Returns the simulated timeline sequences of ETA delays and vehicle arrival alerts.
* **Response:**
```json
{
  "bookingId": "RF-BKG-1001",
  "currentStep": 1,
  "updates": [
    {
      "order": 1,
      "message": "Local Train 47 arriving at Platform 1 in 6 minutes. Please proceed to the platform.",
      "type": "arrival",
      "delayMinutes": 0
    },
    {
      "order": 2,
      "message": "You are on board Local Train 47. Next major stop: City Bus Depot. Ride for 25 minutes.",
      "type": "departure",
      "delayMinutes": 0
    }
  ]
}
```

---

## 8. Wallet Balance & Management

### Get Balance
* **Endpoint:** `GET /wallet/balance?userId=demo-user`
* **Response:**
```json
{
  "userId": "demo-user",
  "balance": 500
}
```

### Add Balance
* **Endpoint:** `POST /wallet/add`
* **Request Body:**
```json
{
  "amountRupees": 100,
  "userId": "demo-user"
}
```
* **Response:**
```json
{
  "userId": "demo-user",
  "balance": 600
}
```

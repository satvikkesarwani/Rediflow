# RideFlow System Architecture

RideFlow is designed using a decoupled client-server architecture. For the hackathon MVP, the data tier relies on standard JSON config configurations loaded directly into memory at startup.

---

## 🗺️ System Architecture Diagram

<div align="center">
  <img src="docs/screenshots/architecture.png" width="100%" alt="RideFlow System Architecture Diagram" style="box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 12px; margin-bottom: 20px;"/>
</div>

---

## 🧬 Component Deep-Dive

### 1. Frontend Client (React SPA)
The client interface is designed around a mobile-first `app-shell` frame styled with unified CSS variables matching a premium dark green theme.
* **Component Views:** Screens include `HomeScreen.jsx` (origin/destination input), `RouteOptionsScreen.jsx` (compares scored cards), `RouteDetailsScreen.jsx` (step-by-step navigation + explainability card), `BookingSummaryScreen.jsx` (review ticket logs), `PaymentScreen.jsx` (NCMC wallet checkout), `JourneyPassScreen.jsx` (unified QR scanner pass), and `LiveTrackingScreen.jsx` (real-time notification list).
* **API Service (`api.js`):** Encapsulates raw REST HTTP operations into asynchronous modular functions using `fetch`.
* **State Management:** Manages local screens, booking details, and wallet structures React-side to ensure responsive interface transitions.

### 2. Backend Server (FastAPI REST API)
A high-performance asynchronous REST API running on **FastAPI** and served locally via **Uvicorn**.
* **API Controllers (`app/routes/`):**
  - `search.py`: Handles search options, caches results dynamically, and returns formatted details.
  - `booking.py`: Manages the multi-modal booking state machine and generates unique ticket codes.
  - `payment.py`: Coordinates wallet adjustments and creates digital passes.
  - `journey.py`: Maps routes to specific live updates patterns and injects active ticket IDs.
* **Scoring & Optimization Engine (`app/services/scoring.py`):**
  Normalizes transit metrics using relative scale normalization. Applies specific weights for routing preferences:
  $$\text{Normalized Metric} = \frac{x - x_{min}}{x_{max} - x_{min}}$$
  Scores are adjusted with additive penalties for low safety, variable reliability, or high carbon configurations.
* **Explainability Module (`app/services/explanation.py`):**
  Performs dynamic mathematical ranking calculations against the optimal routes (Fastest, Cheapest) to generate relative natural language trade-off summaries.

### 3. Data Tier (Mock JSON Store)
Static JSON configurations acting as a read-only local store.
* `locations.json`: Predefined station nodes and types.
* `routes.json`: Consolidated multi-modal route metadata linking legs.
* `transport_legs.json`: Leg-specific distance, fare, carbon emissions, and reliability ratings.
* `live_updates.json`: Real-time incident logs, platform information, and ETA alert timelines.

---

## 📈 Scalability Roadmap (To Production)

```
[GTFS Live Feeds] ──┐
                     ├──> [OpenTripPlanner Engine] ──> [RideFlow Scoring Engine] ──> [Client UI]
[OpenStreetMap]   ───┘
```

1. **Routing Graph Engine:** Replace pre-calculated JSON nodes with an active **OpenTripPlanner (OTP)** or **OSRM** container to calculate real-time multi-modal paths using municipal GTFS (General Transit Feed Specification) feeds and OpenStreetMap data.
2. **ACID Transaction Database:** Move in-memory dictionaries to **PostgreSQL** (handling bookings, NCMC wallets, and transactions with transaction-level locking) and **Redis** (storing user sessions and live-update ETA queues).
3. **Gateway Integrations:** Replace simulated wallet modules with the real National Common Mobility Card (NCMC) ISO 8583 banking standards, UPI endpoints, and transit API integrations (e.g. Ola, Uber, Metro ticketing APIs).

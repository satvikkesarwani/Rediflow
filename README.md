# RideFlow

**[🔗 Watch the 3-5 Minute Video Demo Here](https://youtu.be/G32DoH6ffR8)**

## 1. Project Title
RideFlow - Intelligent Multi-Modal Journey Planner for Indian Urban Commuters

## 2. Problem Statement
Urban commuters in Indian cities often face the challenge of navigating fragmented public transit systems. They have to juggle multiple apps to figure out the fastest, cheapest, or most comfortable routes that might involve a mix of buses, metros, auto-rickshaws, and walking. Buying separate tickets for each mode of transport and dealing with unexpected delays adds friction and stress to the daily commute.

## 3. Solution Overview
RideFlow is a unified, multi-modal journey planning application. It computes the best possible routes from point A to point B by combining various transportation modes. By utilizing a custom ranking engine, it factors in travel time, fare, number of transfers, walking distance, safety, reliability, and carbon emissions. It also offers a seamless unified ticketing experience with a single "Journey Pass" and real-time live journey tracking.

## 4. MVP Features
- **Source and Destination Input:** Intuitive dropdown selection with predefined locations.
- **Preference-Based Ranking:** Select between Balanced, Fastest, Cheapest, Least Walking, Fewest Transfers, and Eco-Friendly.
- **Multi-Modal Options:** Combines Walking, Bus, Metro, Auto, and Cab options seamlessly.
- **Route Summary Cards:** Clean overview of Time, Fare, Transfers, Walking distance, Carbon, Safety, and Reliability.
- **Dynamic Route Ranking System:** A weighted formula calculating the best routes based on user preference.
- **Detailed Journey Steps:** Expandable step-by-step navigation for the selected route.
- **AI-Style Route Explanation:** Rule-based explanations comparing the selected route against alternatives.
- **Mock Booking & Ticketing:** Generates individual ticket IDs for each journey leg.
- **Mock NCMC Wallet Payment:** Simulated wallet deduction flow.
- **Unified Journey Pass:** A single digital pass with a simulated QR code.
- **Simulated Live Updates:** Sequential live-tracking feed demonstrating real-time arrival, departure, and delay alerts.

## 5. Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS v4, Lucide React (for professional SVG icons).
- **Backend:** Python 3, FastAPI, Uvicorn, Pydantic.
- **Data Layer:** Static JSON (Mock Database).

## 6. Architecture Explanation
The architecture follows a decoupled client-server model:
- **Client (Frontend):** A React single-page application (SPA). It maintains application state locally and communicates with the backend via REST APIs. The UI is designed with a mobile-first `app-shell` approach, ensuring it looks like a native mobile app even on desktop browsers.
- **Server (Backend):** A FastAPI server that handles routing logic. At startup, it loads static mock data into memory. When a search is requested, the `scoring.py` engine computes weights based on user preferences and ranks the routes. `explanation.py` generates natural language justifications for the routes.

## 7. Setup Instructions
Ensure you have Node.js (v18+) and Python (v3.9+) installed on your machine. We recommend using `uv` or `pip` for Python dependency management.

1. Clone or download the repository.
2. Navigate to the project root directory.

## 8. How to Run Backend
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   uv venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   uv pip install -r requirements.txt
   ```
4. Start the FastAPI server (make sure to set explicit UTF-8 encoding on Windows to support Unicode in JSON):
   ```bash
   # On Windows PowerShell:
   $env:PYTHONIOENCODING='utf-8'; uvicorn app.main:app --reload --port 8000
   # On macOS/Linux:
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will be available at `http://localhost:8000`.

## 9. How to Run Frontend
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000` (or `http://localhost:5173`).

## 10. API Endpoints
- `GET /` : Health check.
- `GET /locations` : Retrieves the list of available locations.
- `POST /routes/search` : Expects `{source, destination, preference}` and returns ranked multi-modal routes.
- `GET /routes/{routeId}` : Returns full step-by-step breakdown of a specific route.
- `GET /routes/{routeId}/explanation` : Returns a rule-based AI explanation comparing the route to alternatives.
- `POST /bookings/create` : Expects `{routeId, userId}` and generates ticket IDs for all transport legs.
- `POST /payments/pay` : Expects `{bookingId, paymentMethod}` and returns payment success with a Journey Pass ID.
- `GET /journey/{bookingId}/updates` : Retrieves the live tracking sequence of events.

## 11. Demo Flow
To experience the complete flow of the application:
1. Open the app and select **Central Railway Station** as the source and **Tech Park** as the destination.
2. Change the route preference (e.g., from Balanced to Fastest) to see the route ranking order dynamically update.
3. Select the top recommended route to view the detailed step-by-step journey instructions and read the generated explanation ("Why this route?").
4. Click **Book This Journey** to view the booking summary and generated mock ticket IDs.
5. Proceed to **Payment** and pay via the mock NCMC wallet.
6. View the unified **Journey Pass** with the QR code placeholder.
7. Click **Start Journey** to enter the **Live Tracking** screen, where updates (like delays or arrivals) will automatically appear every ~10 seconds.

## 12. What is Real vs Simulated
- **Real:** The route ranking algorithm (dynamic scoring formula based on real numeric weights), frontend UI state management, API request/response lifecycles, and component rendering.
- **Simulated (Mocked):** The database (JSON files), the payment gateway (no actual funds transferred), the live tracking timeline (pre-scripted events delayed by `setInterval`), and the AI explanations (rule-based logic mimicking an LLM output). Route definitions are hard-coded paths between predefined nodes rather than generated dynamically via a graph traversal algorithm like A* or Dijkstra's.

## 13. Future Scope
The following features were considered out of scope for the MVP but are planned for future production releases:
- **Dynamic Routing Graph:** Implement Dijkstra's or A* algorithm with real city transit data (GTFS) instead of hardcoded paths.
- **Payment Integration:** Real NCMC payment and Real UPI payment gateways.
- **API Integrations:** Real Ola/Uber/Rapido booking and real ticket booking with transport authorities.
- **Real-Time Data:** Full real-time vehicle tracking and live GPS integration.
- **Mapping & Navigation:** Full map-based navigation.
- **Contextual Data:** Real safety/crime data integration and real carbon emissions API.
- **Accessibility & Localization:** Full multilingual support and full accessibility database.
- **Administration & Security:** Admin dashboard, OTP login, production authentication, and production payment security.

## 14. Known Limitations
- Searching for routes outside of the predefined mock data pairs (e.g., random unlinked locations) will return a "No routes found" error.
- The QR code on the Journey Pass is a visual placeholder generated via a canvas hash algorithm, not a cryptographically signed ticket.
- Wallet balance is localized to the frontend state and resets upon refreshing the app.

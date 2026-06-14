# RideFlow - Problem Understanding Note

## 🚇 The Core Problem: Fragmentation in Indian Transit
Daily commuting in Indian metro cities (e.g., Delhi, Mumbai, Bengaluru) is a multi-modal puzzle. Commuters rarely rely on a single mode of transport to get from residential sectors to commercial hubs (like Tech Parks). A typical journey involves:
1. **First Mile:** Walking or hailing an auto-rickshaw to the nearest metro/suburban rail station.
2. **Line Haul:** Taking a high-capacity rail or metro across the city.
3. **Last Mile:** Catching a city feeder bus, auto, e-rickshaw, or walking to the final destination.

This fragmentation leads to three major commuter friction points:
* **Cognitive Load & Decision Fatigue:** It is hard to compare multi-modal transit options across cost, speed, transfer overhead, physical exertion, safety, and reliability. 
* **App and Ticket Fragmentation:** Commuters must jump between navigation apps, government ticketing portals (metro/bus), and ride-hailing apps (autos/cabs) to purchase separate single-use tickets.
* **Unpredictability & Anxiety:** Real-time delay information, platform assignments, and vehicle statuses are scattered, making transfers highly stressful.

---

## 🎯 Our Goal: Unified Multi-Modal Orchestration
**RideFlow** acts as a single pane of glass that plans, optimizes, books, and tracks a commuter's entire multi-modal transit path. We replace multiple tickets and applications with a single, unified digital "Journey Pass" (single QR) and a synchronized live guidance feed.

---

## 🏗️ MVP Objectives & Evaluation Metrics
To successfully demonstrate a high-impact MVP within the hackathon timeline, the project addresses four key pillars:

### 1. Functionality & Technical Depth (Scoring & Explainability Engine)
* **Optimization Algorithm:** We implement a normalized multi-criteria routing algorithm (`scoring.py`) to rank routes based on user preferences (Balanced, Fastest, Cheapest, Eco-Friendly, etc.). Different units (rupees, minutes, meters) are normalized, and penalties are dynamically added for safety, carbon emissions, and variable reliability.
* **Algorithmic Transparency:** An AI-style explanation generator (`explanation.py`) compares the chosen route's performance against optimal alternatives, producing clear, relative trade-off summaries (e.g., *"Saves ₹76 but adds 26 minutes"*).

### 2. Innovation & Usability (Unified NCMC Ticketing & Premium UI)
* **Unified Ticketing:** Rather than booking separate tickets, the booking engine (`booking.py`) packages all transport legs into distinct mock tickets underneath a single `bookingId`.
* **NCMC Integration:** The payment controller (`payment.py`) simulates a single-click deduction from an integrated National Common Mobility Card (NCMC) wallet, issuing a unified Journey Pass QR code.
* **Premium Usability:** The client UI features a mobile-first responsive app-shell container, sleek dark green styling, custom scrollbars, and micro-interactions designed to elevate the user experience.

### 3. Scalability & Real-World Applicability
* **Standardized JSON Schemas:** Our JSON configuration files mirror standard **GTFS (General Transit Feed Specification)** formats, ensuring the routing model can easily ingest real-world schedules.
* **Path to Production:** The architecture is designed to easily scale by replacing the static query maps with an active **OpenTripPlanner (OTP)** routing engine, using a relational **PostgreSQL** database for ACID transactions, and linking real payment gateways.

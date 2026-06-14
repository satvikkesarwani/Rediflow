# RideFlow - Demo Video & Presentation Script

This script guides you through demonstrating the RideFlow application for a demo video or live presentation. It focuses on highlighting the user journey, technical depth, and UI details.

---

## ⚙️ Setup
1. Start the backend server: `uvicorn app.main:app --reload --port 8000`
2. Start the frontend client: `npm run dev` in the frontend directory.
3. Open `http://localhost:3000` (or `http://localhost:5173`).
4. *Tip:* Present in a desktop browser; the app will automatically center itself inside a mobile bezel shell to mimic a premium native mobile application.

---

## 📱 Step 1: The Search Screen
* **Action:** 
  On the home screen, observe the default values:
  - **Source:** Central Railway Station
  - **Destination:** Tech Park (pre-filled by the default location loader)
  - **Preference:** Balanced
* **Talking Point:** 
  > *"RideFlow is designed as a single, unified interface for Indian urban commuters. Instead of forcing commuters to plan directions on maps, book cabs on one app, and check metro lines on another, we unify planning, ticketing, and live tracking. Notice that on app load, RideFlow automatically highlights the commute from Central Railway Station to the Tech Park business hub."*
* **Action:** 
  Click **Find Routes**.

---

## 📱 Step 2: Route Options & Scoring Engine
* **Action:** 
  Point to the three options displayed. Detail the details on the first card: **A: Auto → Metro → Walk (Recommended)**.
* **Talking Point:** 
  > *"The routes here are computed and ranked by our backend's multi-criteria scoring algorithm. Because we searched under the 'Balanced' preference, the algorithm normalized travel times, ticket costs, transfers, and safety factors to recommend Option A. Let's switch preferences to see the algorithm in action."*
* **Action:** 
  Click the **Back** arrow at the top-left of the bezel, select **Cheapest**, and click **Find Routes** again.
* **Talking Point:** 
  > *"By selecting 'Cheapest', the backend scoring engine recalculates the weights, making fare cost the dominant factor. Notice that Option B: Walk → Train → Bus → Walk—which costs only ₹54—has now floated to the very top with the 'Cheapest' badge."*
* **Action:** 
  Click on **Route B (Cheapest)**.

---

## 📱 Step 3: Granular Steps & Explainability
* **Action:** 
  Scroll through the step-by-step timeline of instructions. Point to the train platform details and the bus bay numbers.
* **Talking Point:** 
  > *"On this screen, we provide the commuter with detailed transit steps, such as taking local Train 47 from Platform 1 and boarding Bus 241A at Bay 5. At the bottom, our AI-style Explainability Card summarizes why this route was recommended, explaining that while it is 26 minutes slower than the fastest option, it saves the commuter ₹76 in total fares. This transparency builds trust."*
* **Action:** 
  Click **Book This Journey**.

---

## 📱 Step 4: Booking Summary & Tickets
* **Action:** 
  Point out the **Booking ID** (`RF-BKG-1001`) and the generated individual ticket numbers for each leg:
  - **Train Leg:** `TRN-RF-8968` (₹18)
  - **Bus Leg:** `BUS-RF-7095` (₹36)
* **Talking Point:** 
  > *"RideFlow simplifies fragmented ticketing. Instead of navigating separate booking systems, our ticketing engine generates all required sub-ticket identifiers for the bus and train rail segments simultaneously, grouping them under a single booking."*
* **Action:** 
  Click **Proceed to Payment**.

---

## 📱 Step 5: NCMC Wallet Payment
* **Action:** 
  Point to the **NCMC Wallet Balance** (starts at ₹500) and the total cost (₹54).
* **Talking Point:** 
  > *"RideFlow simulates integration with the National Common Mobility Card (NCMC) wallet. We tap into this central transit balance, deducting the exact total fare of ₹54 with a single click."*
* **Action:** 
  Click **Pay ₹54**.

---

## 📱 Step 6: The Digital Journey Pass
* **Action:** 
  On successful checkout, display the **Journey Pass** with QR code and active tickets.
* **Talking Point:** 
  > *"Once paid, the commuter receives a unified digital Journey Pass. This single QR code aggregates all their active tickets, allowing them to pass through metro turnstiles and bus checkers with a single scan."*
* **Action:** 
  Click **Start Journey**.

---

## 📱 Step 7: Live Journey Tracking & Updates
* **Action:** 
  Let the live journey screen sit for a few seconds. Watch the status bar change and updates roll in.
* **Talking Point:** 
  > *"As the commuter begins their trip, the app transitions into an active tracking screen. This simulates updates from live vehicle GPS feeds. As the user moves, they receive alerts about train arrivals (Local Train 47 in 6 minutes), platform details, and bus boarding notifications. The progress bar updates automatically."*
* **Action:** 
  Observe the final "Journey Completed" timeline update.
* **Talking Point:** 
  > *"With real-time guidance and unified ticketing, RideFlow takes the stress out of urban multi-modal commutes. Thank you!"*

# RideFlow - Demo Script

## Setup
1. Ensure the Backend is running on port 8000 (`uvicorn app.main:app`).
2. Ensure the Frontend is running on port 3000 (`npm run dev`).
3. Open `http://localhost:3000` in your web browser. For the best visual experience on a desktop monitor, the app will automatically render inside a mobile-sized frame constraint.

## Step 1: The Search Experience
*Action:* On the **Home Screen**, select the following:
- **Source:** Central Railway Station
- **Destination:** Tech Park
- **Preference:** Balanced

*Talking Point:* "RideFlow acts as a single pane of glass for urban commuters. Instead of just showing map directions, we allow users to optimize their journey based on what matters to them—be it speed, cost, or carbon footprint."

*Action:* Click **Find Routes**.

## Step 2: Evaluating Options
*Action:* On the **Route Options** screen, observe the three cards.

*Talking Point:* "The scoring engine has ranked the routes based on our 'Balanced' preference. Notice the top route has a 'Recommended' tag. It shows the exact mix of transport modes, total time, fare, and even carbon/safety scores."

*Action:* Click the **Back** button, change the preference to **Cheapest**, and click **Find Routes** again.

*Talking Point:* "By switching to 'Cheapest', the backend scoring algorithm dynamically recalculates the weights. A bus-heavy route now floats to the top."

## Step 3: Deep Dive & AI Explanation
*Action:* Click on the **Top Route** card.

*Talking Point:* "This is the Route Details screen. The commuter gets a step-by-step breakdown of exactly where to walk, which bus to catch, and what platform to stand on for the Metro."

*Action:* Scroll down to the **"Why this route?"** card.

*Talking Point:* "This is our AI explanation engine. It doesn't just show numbers; it generates a human-readable justification for *why* it ranked this route highly compared to the alternatives, building trust with the user."

## Step 4: The Unified Booking Flow
*Action:* Click **Book This Journey**.

*Talking Point:* "Normally, a commuter would have to open three different apps to book a cab, buy a metro ticket, and pay for a bus. RideFlow handles it all at once."

*Action:* On the **Booking Summary**, point out the distinct ticket IDs generated for the Bus, Metro, and Auto legs. Click **Proceed to Payment**.

## Step 5: Frictionless Payment
*Action:* On the **Payment Screen**, point out the mock NCMC (National Common Mobility Card) Wallet balance.

*Talking Point:* "We deduct the exact unified fare from a central wallet. No switching to UPI apps or carrying loose change."

*Action:* Click **Pay ₹82**.

## Step 6: The Journey Pass
*Action:* Once successful, you arrive at the **Journey Pass Screen**.

*Talking Point:* "The user now has a single, unified digital pass. This QR code represents their entire multi-modal journey, validated across different transport networks."

## Step 7: Live Tracking & Updates
*Action:* Click **Start Journey**.

*Talking Point:* "During the commute, the app switches to a live orchestration mode."

*Action:* Let the screen sit for a few seconds. An update will pop up (e.g., 'Bus arriving in 4 minutes').

*Talking Point:* "We simulate real-time transit APIs here. If a bus is delayed, or a platform changes, the user gets a unified push notification and timeline update right here, reducing anxiety and uncertainty."

*Action:* Wait for the final "Journey Completed" notification to appear.

*Talking Point:* "And that concludes the seamless, end-to-end RideFlow experience!"

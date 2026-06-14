"""
Rule-based Route Explanation Engine
Generates 2-4 sentence human-readable explanations grounded only in route data.
"""


def generate_explanation(route: dict, all_routes: list[dict]) -> str:
    parts = []

    sorted_by_time = sorted(all_routes, key=lambda r: r["totalTimeMinutes"])
    sorted_by_fare = sorted(all_routes, key=lambda r: r["totalFareRupees"])

    time_rank = next((i for i, r in enumerate(sorted_by_time) if r["routeId"] == route["routeId"]), 0)
    fare_rank = next((i for i, r in enumerate(sorted_by_fare) if r["routeId"] == route["routeId"]), 0)

    tag = route.get("tag", "")

    # Opening sentence by tag
    if tag == "Recommended":
        parts.append(
            "This route offers the best overall balance of time, cost, and walking distance."
        )
    elif tag == "Fastest":
        slowest = sorted_by_time[-1]
        saved = slowest["totalTimeMinutes"] - route["totalTimeMinutes"]
        parts.append(
            f"This is the fastest available route, completing the journey in {route['totalTimeMinutes']} minutes."
        )
        if saved > 0 and len(all_routes) > 1:
            second_fastest = sorted_by_time[1] if sorted_by_time[0]["routeId"] == route["routeId"] else sorted_by_time[0]
            diff = abs(route["totalTimeMinutes"] - second_fastest["totalTimeMinutes"])
            if diff > 0:
                parts.append(f"It saves {diff} minutes compared to the next fastest option.")
    elif tag == "Cheapest":
        parts.append(
            f"This is the most affordable route at ₹{route['totalFareRupees']}."
        )
        if len(all_routes) > 1:
            others = [r for r in sorted_by_fare if r["routeId"] != route["routeId"]]
            if others:
                saved = others[0]["totalFareRupees"] - route["totalFareRupees"]
                if saved > 0:
                    parts.append(f"It costs ₹{saved} less than the next cheapest option.")
    elif tag == "Eco-Friendly":
        parts.append(
            f"This route has a low carbon footprint, making it the most environmentally friendly option."
        )
    else:
        parts.append(
            f"This is an alternative route for this journey."
        )

    # Core metrics sentence
    parts.append(
        f"It completes the journey in {route['totalTimeMinutes']} min at ₹{route['totalFareRupees']} "
        f"with {route['transferCount']} transfer(s) and {route['totalWalkingMeters']}m of walking."
    )

    # Time rank comparison (for non-fastest routes)
    if tag not in ("Fastest",) and time_rank > 0:
        faster_route = sorted_by_time[0]
        time_diff = route["totalTimeMinutes"] - faster_route["totalTimeMinutes"]
        fare_diff = faster_route["totalFareRupees"] - route["totalFareRupees"]
        if time_diff > 0:
            if fare_diff > 0:
                parts.append(
                    f"It is {time_diff} min slower than the fastest route but saves ₹{fare_diff} in fare."
                )
            else:
                parts.append(
                    f"It is {time_diff} min slower than the fastest route."
                )

    # Reliability
    rel = route.get("reliabilityLabel", "Medium")
    if rel == "High":
        parts.append("The services on this route have high historical reliability.")
    elif rel == "Low":
        parts.append("Note: This route includes services with variable reliability; allow extra time.")

    # Walking note
    if route["totalWalkingMeters"] > 800:
        parts.append(f"Note: This route involves {route['totalWalkingMeters']}m of walking.")

    return " ".join(parts)

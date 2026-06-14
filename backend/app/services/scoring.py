"""
Route Scoring Engine
Implements preference-based weighted scoring formula from the SRD.
"""

PREFERENCE_WEIGHTS = {
    "balanced":          {"time": 0.25, "fare": 0.20, "transfers": 0.15, "walking": 0.15, "reliability": 0.10, "carbon": 0.10, "safety": 0.05},
    "fastest":           {"time": 0.50, "fare": 0.10, "transfers": 0.15, "walking": 0.10, "reliability": 0.10, "carbon": 0.03, "safety": 0.02},
    "cheapest":          {"time": 0.10, "fare": 0.55, "transfers": 0.10, "walking": 0.10, "reliability": 0.08, "carbon": 0.05, "safety": 0.02},
    "least_walking":     {"time": 0.15, "fare": 0.15, "transfers": 0.15, "walking": 0.45, "reliability": 0.05, "carbon": 0.03, "safety": 0.02},
    "fewest_transfers":  {"time": 0.15, "fare": 0.15, "transfers": 0.50, "walking": 0.10, "reliability": 0.05, "carbon": 0.03, "safety": 0.02},
    "eco_friendly":      {"time": 0.15, "fare": 0.10, "transfers": 0.10, "walking": 0.10, "reliability": 0.05, "carbon": 0.45, "safety": 0.05},
}

RELIABILITY_PENALTY = {"High": 0.00, "Medium": 0.05, "Low": 0.15}
CARBON_PENALTY = {"Low": 0.00, "Medium": 0.05, "High": 0.12}
SAFETY_PENALTY = {"High": 0.00, "Medium": 0.04, "Low": 0.10}


def _normalize(values: list[float]) -> list[float]:
    min_v = min(values)
    max_v = max(values)
    if max_v == min_v:
        return [0.0] * len(values)
    return [(v - min_v) / (max_v - min_v) for v in values]


def _score_to_label(score: int, thresholds: list, labels: list) -> str:
    for i, t in enumerate(thresholds):
        if score <= t:
            return labels[i]
    return labels[-1]


def carbon_label(score: int) -> str:
    if score <= 33:
        return "Low"
    elif score <= 66:
        return "Medium"
    return "High"


def safety_label(score: int) -> str:
    if score >= 75:
        return "High"
    elif score >= 50:
        return "Medium"
    return "Low"


def reliability_label(score: int) -> str:
    if score >= 80:
        return "High"
    elif score >= 60:
        return "Medium"
    return "Low"


def compute_route_labels(routes: list[dict], legs_map: dict) -> list[dict]:
    """Add carbonLabel, safetyLabel, reliabilityLabel to each route dict."""
    enriched = []
    for route in routes:
        route_legs = [legs_map.get(lid) for lid in route["legs"] if legs_map.get(lid)]
        if not route_legs:
            avg_carbon = 50
            avg_safety = 70
            avg_reliability = 70
        else:
            avg_carbon = sum(l["carbonScore"] for l in route_legs) // len(route_legs)
            avg_safety = sum(l["safetyScore"] for l in route_legs) // len(route_legs)
            avg_reliability = sum(l["reliabilityScore"] for l in route_legs) // len(route_legs)

        r = dict(route)
        r["carbonLabel"] = carbon_label(avg_carbon)
        r["safetyLabel"] = safety_label(avg_safety)
        r["reliabilityLabel"] = reliability_label(avg_reliability)
        enriched.append(r)
    return enriched


def score_and_rank(routes: list[dict], preference: str, legs_map: dict) -> list[dict]:
    """Score, rank, and tag routes based on user preference, returning exactly 4 options."""
    preference = preference.lower().replace("-", "_")
    if preference not in PREFERENCE_WEIGHTS:
        preference = "balanced"

    weights = PREFERENCE_WEIGHTS[preference]

    # Enrich with labels
    routes = compute_route_labels(routes, legs_map)

    # Extract raw values
    times = [r["totalTimeMinutes"] for r in routes]
    fares = [r["totalFareRupees"] for r in routes]
    transfers = [r["transferCount"] for r in routes]
    walkings = [r["totalWalkingMeters"] for r in routes]

    norm_times = _normalize(times)
    norm_fares = _normalize(fares)
    norm_transfers = _normalize(transfers)
    norm_walkings = _normalize(walkings)

    scored = []
    for i, route in enumerate(routes):
        rel_penalty = RELIABILITY_PENALTY[route["reliabilityLabel"]]
        car_penalty = CARBON_PENALTY[route["carbonLabel"]]
        saf_penalty = SAFETY_PENALTY[route["safetyLabel"]]

        score = (
            weights["time"] * norm_times[i]
            + weights["fare"] * norm_fares[i]
            + weights["transfers"] * norm_transfers[i]
            + weights["walking"] * norm_walkings[i]
            + weights["reliability"] * rel_penalty
            + weights["carbon"] * car_penalty
            + weights["safety"] * saf_penalty
        )
        r = dict(route)
        r["score"] = round(score, 4)
        scored.append(r)

    # Sort routes by score so scored[0] is the absolute best for the current preference
    scored.sort(key=lambda r: r["score"])

    # Define preference string to display tag mapping
    PREF_TO_TAG = {
        "balanced": "Balanced",
        "fastest": "Fastest",
        "cheapest": "Cheapest",
        "least_walking": "Less Walking",
        "fewest_transfers": "Fewer Transfers",
        "eco_friendly": "Eco-Friendly"
    }

    top_tag = PREF_TO_TAG.get(preference, "Balanced")
    
    # We want exactly 4 routes in a specific tag order.
    desired_tags_order = [top_tag]
    for fallback in ["Balanced", "Cheapest", "Fastest", "Alternative"]:
        if fallback not in desired_tags_order and len(desired_tags_order) < 4:
            desired_tags_order.append(fallback)

    def get_best_for_tag(pool, tag):
        if not pool:
            return None
        if tag == "Balanced":
            return min(pool, key=lambda r: r["score"])
        elif tag == "Fastest":
            return min(pool, key=lambda r: r["totalTimeMinutes"])
        elif tag == "Cheapest":
            return min(pool, key=lambda r: r["totalFareRupees"])
        elif tag == "Less Walking":
            return min(pool, key=lambda r: r["totalWalkingMeters"])
        elif tag == "Fewer Transfers":
            return min(pool, key=lambda r: r["transferCount"])
        elif tag == "Eco-Friendly":
            return min(pool, key=lambda r: (0 if r["carbonLabel"] == "Low" else 1 if r["carbonLabel"] == "Medium" else 2))
        else: # Alternative
            return pool[0]

    selected_routes = []
    used_route_ids = set()

    for tag in desired_tags_order:
        pool = [r for r in scored if r["routeId"] not in used_route_ids]
        if not pool:
            break
        
        if tag == top_tag:
            best_route = pool[0]
        else:
            best_route = get_best_for_tag(pool, tag)
            
        r = dict(best_route)
        r["tag"] = tag
        selected_routes.append(r)
        used_route_ids.add(r["routeId"])

    return selected_routes

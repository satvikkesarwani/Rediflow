from fastapi import APIRouter, HTTPException
from app.models.route_models import SearchRequest, RouteSearchResponse, RouteDetail, ExplanationResponse, Step
from app.services.mock_data_loader import get_routes_for_pair, get_route_by_id, get_legs
from app.services.scoring import score_and_rank, compute_route_labels
from app.services.explanation import generate_explanation
from app.services.route_engine import expand_route_steps

router = APIRouter()

# In-memory cache of last scored routes (for explanation endpoint)
_scored_cache: dict[str, list[dict]] = {}


def _build_legs_map() -> dict:
    return {leg["legId"]: leg for leg in get_legs()}


@router.post("/routes/search", response_model=RouteSearchResponse)
def search_routes(req: SearchRequest):
    if req.source.lower() == req.destination.lower():
        raise HTTPException(status_code=400, detail="Source and destination cannot be the same.")

    raw_routes = get_routes_for_pair(req.source, req.destination)
    if not raw_routes:
        raise HTTPException(status_code=404, detail="No routes found for the given source-destination pair.")

    legs_map = _build_legs_map()
    scored = score_and_rank(raw_routes, req.preference, legs_map)

    # Cache for explanation use
    cache_key = f"{req.source.lower()}:{req.destination.lower()}"
    _scored_cache[cache_key] = scored

    # Normalise field names for Pydantic
    cards = []
    for r in scored:
        walking = r.get("totalWalkingMeters", r.get("walkingDistanceMeters", 0))
        cards.append({
            "routeId": r["routeId"],
            "summary": r["summary"],
            "totalTimeMinutes": r["totalTimeMinutes"],
            "totalFareRupees": r["totalFareRupees"],
            "transferCount": r["transferCount"],
            "walkingDistanceMeters": walking,
            "totalWalkingMeters": walking,
            "carbonLabel": r["carbonLabel"],
            "safetyLabel": r["safetyLabel"],
            "reliabilityLabel": r["reliabilityLabel"],
            "tag": r["tag"],
            "score": r["score"],
        })

    return RouteSearchResponse(routes=cards)


@router.get("/routes/{routeId}", response_model=RouteDetail)
def get_route_detail(routeId: str):
    route = get_route_by_id(routeId)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found.")

    legs_map = _build_legs_map()
    enriched = compute_route_labels([route], legs_map)[0]
    enriched.setdefault("tag", "Route")
    enriched.setdefault("score", 0.0)

    raw_steps = expand_route_steps(route)
    steps = [
        Step(
            stepNumber=s["stepNumber"],
            from_=s["from"],
            to=s["to"],
            mode=s["mode"],
            routeNumber=s.get("routeNumber"),
            lineName=s.get("lineName"),
            platform=s.get("platform"),
            durationMinutes=s["durationMinutes"],
            fareRupees=s["fareRupees"],
            distanceMeters=s["distanceMeters"],
            instruction=s["instruction"],
        )
        for s in raw_steps
    ]

    return RouteDetail(
        routeId=enriched["routeId"],
        source=enriched["source"],
        destination=enriched["destination"],
        summary=enriched["summary"],
        totalTimeMinutes=enriched["totalTimeMinutes"],
        totalFareRupees=enriched["totalFareRupees"],
        transferCount=enriched["transferCount"],
        totalWalkingMeters=enriched["totalWalkingMeters"],
        carbonLabel=enriched["carbonLabel"],
        safetyLabel=enriched["safetyLabel"],
        reliabilityLabel=enriched["reliabilityLabel"],
        tag=enriched["tag"],
        score=enriched["score"],
        steps=steps,
    )


@router.get("/routes/{routeId}/explanation", response_model=ExplanationResponse)
def get_explanation(routeId: str):
    route = get_route_by_id(routeId)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found.")

    legs_map = _build_legs_map()
    enriched_route = compute_route_labels([route], legs_map)[0]

    # Try to find cached scored context for comparison
    cache_key = f"{route['source'].lower()}:{route['destination'].lower()}"
    all_scored = _scored_cache.get(cache_key)
    if all_scored:
        # Find this route in the scored list to get its tag
        this_scored = next((r for r in all_scored if r["routeId"] == routeId), None)
        if this_scored:
            enriched_route = this_scored
        all_routes = all_scored
    else:
        raw_routes = get_routes_for_pair(route["source"], route["destination"])
        all_routes = compute_route_labels(raw_routes, legs_map)
        enriched_route.setdefault("tag", "Route")
        enriched_route.setdefault("score", 0.0)

    explanation = generate_explanation(enriched_route, all_routes)

    return ExplanationResponse(
        routeId=routeId,
        tag=enriched_route.get("tag", "Route"),
        explanation=explanation,
    )

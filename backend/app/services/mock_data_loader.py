import json
import os
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data"

_locations = None
_stops = None
_legs = None
_routes = None
_last_mile = None
_live_updates = None


def _load(filename: str) -> list:
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)


def load_all():
    global _locations, _stops, _legs, _routes, _last_mile, _live_updates
    _locations = _load("locations.json")
    _stops = _load("stops.json")
    _legs = _load("transport_legs.json")
    _routes = _load("routes.json")
    _last_mile = _load("last_mile_options.json")
    _live_updates = _load("live_updates.json")


def get_locations() -> list:
    return _locations or []


def get_stops() -> list:
    return _stops or []


def get_legs() -> list:
    return _legs or []


def get_routes() -> list:
    return _routes or []


def get_last_mile() -> list:
    return _last_mile or []


def get_live_updates() -> list:
    return _live_updates or []


def get_leg_by_id(leg_id: str) -> dict | None:
    for leg in (get_legs()):
        if leg["legId"] == leg_id:
            return leg
    return None


def get_route_by_id(route_id: str) -> dict | None:
    for route in get_routes():
        if route["routeId"] == route_id:
            return route
    return None


def get_routes_for_pair(source: str, destination: str) -> list:
    return [
        r for r in get_routes()
        if r["source"].lower() == source.lower()
        and r["destination"].lower() == destination.lower()
    ]

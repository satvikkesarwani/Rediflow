"""
Route Engine - assembles full step-by-step route details from leg IDs.
"""
from app.services.mock_data_loader import get_leg_by_id


def expand_route_steps(route: dict) -> list[dict]:
    """Expand a route's leg IDs into full step objects."""
    steps = []
    step_num = 1
    for leg_id in route["legs"]:
        leg = get_leg_by_id(leg_id)
        if not leg:
            continue

        step = {
            "stepNumber": step_num,
            "mode": leg["mode"],
            "from": leg["from"],
            "to": leg["to"],
            "routeNumber": leg.get("routeNumber"),
            "lineName": leg.get("lineName"),
            "platform": leg.get("platform"),
            "durationMinutes": leg["durationMinutes"],
            "fareRupees": leg["fareRupees"],
            "distanceMeters": leg["distanceMeters"],
            "instruction": leg["instruction"],
        }
        steps.append(step)
        step_num += 1
    return steps

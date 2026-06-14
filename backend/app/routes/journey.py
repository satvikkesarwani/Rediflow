from fastapi import APIRouter, HTTPException
from app.services.mock_data_loader import get_live_updates
from app.routes.booking import bookings

router = APIRouter()


def _get_pattern_for_booking(booking_id: str) -> str:
    """Determine which update pattern to use based on the booking's route."""
    booking = bookings.get(booking_id)
    if not booking:
        return "PAT-DEFAULT"

    route_id = booking.get("routeId", "")
    # Map route IDs to patterns
    pattern_map = {
        "RF-R1": "PAT-DEFAULT",
        "RF-R2": "PAT-TRAIN-BUS",
        "RF-R3": "PAT-AUTO-METRO",
    }
    return pattern_map.get(route_id, "PAT-DEFAULT")


@router.get("/journey/{bookingId}/updates")
def get_journey_updates(bookingId: str):
    booking = bookings.get(bookingId)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    pattern_id = _get_pattern_for_booking(bookingId)
    all_updates = get_live_updates()
    pattern = next((p for p in all_updates if p["patternId"] == pattern_id), None)

    if not pattern:
        pattern = all_updates[0] if all_updates else {"updates": []}

    # Inject actual ticket IDs into last_mile messages
    updates = []
    for upd in pattern.get("updates", []):
        msg = upd["message"]
        # Replace generic ticket ref with actual auto ticket if available
        if upd["type"] == "last_mile":
            auto_leg = next(
                (leg for leg in booking.get("legs", []) if leg["mode"] == "auto" and leg.get("ticketId")),
                None
            )
            if auto_leg:
                msg = msg.replace("AUTO-RF", auto_leg["ticketId"])
        updates.append({
            "order": upd["order"],
            "message": msg,
            "type": upd["type"],
            "delayMinutes": upd.get("delayMinutes", 0),
        })

    return {
        "bookingId": bookingId,
        "currentStep": 1,
        "updates": updates,
    }

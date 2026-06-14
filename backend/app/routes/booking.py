import random
from fastapi import APIRouter, HTTPException
from app.models.booking_models import BookingRequest, BookingResponse, TicketLeg
from app.services.mock_data_loader import get_route_by_id, get_leg_by_id

router = APIRouter()

# In-memory booking store
bookings: dict[str, dict] = {}
_booking_counter = 1000


def _gen_ticket_id(mode: str) -> str:
    num = random.randint(1000, 9999)
    prefix = {
        "bus": "BUS-RF",
        "metro": "MTR-RF",
        "auto": "AUTO-RF",
        "cab": "CAB-RF",
        "train": "TRN-RF",
    }.get(mode, "TKT-RF")
    return f"{prefix}-{num}"


@router.post("/bookings/create", response_model=BookingResponse)
def create_booking(req: BookingRequest):
    global _booking_counter

    route = get_route_by_id(req.routeId)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found.")

    _booking_counter += 1
    booking_id = f"RF-BKG-{_booking_counter}"

    legs = []
    for leg_id in route["legs"]:
        leg = get_leg_by_id(leg_id)
        if not leg:
            continue
        mode = leg["mode"]
        ticket_id = _gen_ticket_id(mode) if mode != "walk" else None
        legs.append(TicketLeg(
            legId=leg_id,
            mode=mode,
            ticketId=ticket_id,
            fareRupees=leg["fareRupees"],
        ))

    booking = {
        "bookingId": booking_id,
        "routeId": req.routeId,
        "userId": req.userId,
        "status": "Pending Payment",
        "legs": [l.model_dump() for l in legs],
        "totalFareRupees": route["totalFareRupees"],
    }
    bookings[booking_id] = booking

    return BookingResponse(**booking)

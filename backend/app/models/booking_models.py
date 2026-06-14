from pydantic import BaseModel
from typing import Optional


class BookingRequest(BaseModel):
    routeId: str
    userId: str = "demo-user"


class TicketLeg(BaseModel):
    legId: str
    mode: str
    ticketId: Optional[str] = None
    fareRupees: int


class BookingResponse(BaseModel):
    bookingId: str
    routeId: str
    userId: str
    status: str
    legs: list[TicketLeg]
    totalFareRupees: int

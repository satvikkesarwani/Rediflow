from pydantic import BaseModel
from typing import Optional


class PaymentRequest(BaseModel):
    bookingId: str
    paymentMethod: str = "Mock NCMC Wallet"


class PaymentSuccessResponse(BaseModel):
    paymentStatus: str = "Success"
    journeyPassId: str
    qrCodeText: str
    walletBalance: int


class PaymentFailureResponse(BaseModel):
    paymentStatus: str = "Failed"
    reason: str
    walletBalance: int
    requiredAmount: int

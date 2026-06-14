import random
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.models.payment_models import PaymentRequest, PaymentSuccessResponse, PaymentFailureResponse
from app.routes.booking import bookings

router = APIRouter()

# In-memory wallet
wallet_balances: dict[str, int] = {"demo-user": 500}

# Payment records
payments: dict[str, dict] = {}


def _gen_pass_id() -> str:
    num = random.randint(1000, 9999)
    return f"RF-PASS-{num}"


@router.post("/payments/pay")
def pay(req: PaymentRequest):
    booking = bookings.get(req.bookingId)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    user_id = booking["userId"]
    balance = wallet_balances.get(user_id, 500)
    amount = booking["totalFareRupees"]

    if balance < amount:
        return JSONResponse(
            status_code=400,
            content=PaymentFailureResponse(
                paymentStatus="Failed",
                reason="Insufficient wallet balance.",
                walletBalance=balance,
                requiredAmount=amount,
            ).model_dump()
        )

    # Deduct
    wallet_balances[user_id] = balance - amount
    pass_id = _gen_pass_id()

    # Update booking status
    booking["status"] = "Paid"
    booking["journeyPassId"] = pass_id

    payment = {
        "paymentId": f"PAY-{req.bookingId}",
        "bookingId": req.bookingId,
        "method": req.paymentMethod,
        "amountRupees": amount,
        "status": "Success",
        "journeyPassId": pass_id,
        "qrCodeText": pass_id,
        "walletBalanceAfterRupees": wallet_balances[user_id],
    }
    payments[req.bookingId] = payment

    return PaymentSuccessResponse(
        paymentStatus="Success",
        journeyPassId=pass_id,
        qrCodeText=pass_id,
        walletBalance=wallet_balances[user_id],
    )


@router.get("/wallet/balance")
def get_balance(userId: str = "demo-user"):
    return {"userId": userId, "balance": wallet_balances.get(userId, 500)}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.mock_data_loader import load_all, get_locations, get_routes
from app.routes import search, booking, payment, journey

app = FastAPI(
    title="RideFlow API",
    description="Intelligent multi-modal journey planner for Indian urban commuters",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    load_all()
    print("RideFlow data loaded successfully.")


@app.get("/")
def health_check():
    return {"status": "ok", "service": "RideFlow API", "version": "1.0.0"}


@app.get("/locations")
def list_locations():
    return {"locations": get_locations()}


@app.get("/routes/pairs")
def list_route_pairs():
    """Returns all valid source→destination pairs that have route data."""
    pairs = {}
    for r in get_routes():
        src = r["source"]
        dst = r["destination"]
        if src not in pairs:
            pairs[src] = set()
        pairs[src].add(dst)
    return {"pairs": {k: list(v) for k, v in pairs.items()}}


app.include_router(search.router)
app.include_router(booking.router)
app.include_router(payment.router)
app.include_router(journey.router)

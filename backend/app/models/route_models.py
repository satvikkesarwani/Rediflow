from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class SearchRequest(BaseModel):
    source: str
    destination: str
    preference: str = "balanced"


class RouteCard(BaseModel):
    routeId: str
    summary: str
    totalTimeMinutes: int
    totalFareRupees: int
    transferCount: int
    walkingDistanceMeters: int = 0
    totalWalkingMeters: int = 0
    carbonLabel: str
    safetyLabel: str
    reliabilityLabel: str
    tag: str
    score: float

    def __init__(self, **data):
        # Accept either field name
        if 'totalWalkingMeters' in data and 'walkingDistanceMeters' not in data:
            data['walkingDistanceMeters'] = data['totalWalkingMeters']
        elif 'walkingDistanceMeters' in data and 'totalWalkingMeters' not in data:
            data['totalWalkingMeters'] = data['walkingDistanceMeters']
        super().__init__(**data)



class RouteSearchResponse(BaseModel):
    routes: list[RouteCard]


class Step(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    stepNumber: int
    mode: str
    from_: str = Field(serialization_alias='from')
    to: str
    routeNumber: Optional[str] = None
    lineName: Optional[str] = None
    platform: Optional[str] = None
    durationMinutes: int
    fareRupees: int
    distanceMeters: int
    instruction: str


class RouteDetail(BaseModel):
    routeId: str
    source: str
    destination: str
    summary: str
    totalTimeMinutes: int
    totalFareRupees: int
    transferCount: int
    totalWalkingMeters: int
    walkingDistanceMeters: int = 0
    carbonLabel: str
    safetyLabel: str
    reliabilityLabel: str
    tag: str
    score: float
    steps: list[Step]


class ExplanationResponse(BaseModel):
    routeId: str
    tag: str
    explanation: str

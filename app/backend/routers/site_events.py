import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from models.repro_requests import Repro_requests
from models.site_events import Site_events
from schemas.auth import UserResponse
from services.site_events import Site_eventsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/site_events", tags=["site_events"])

ALLOWED_EVENTS = {"visit", "form_start"}


class EventIn(BaseModel):
    """Anonymous funnel event. No personal data is stored."""

    event_type: str = Field(..., max_length=32)
    session_id: Optional[str] = Field(None, max_length=64)
    language: Optional[str] = Field(None, max_length=8)
    path: Optional[str] = Field(None, max_length=200)


class EventAck(BaseModel):
    ok: bool


class StatsResponse(BaseModel):
    visits: int
    form_starts: int
    submissions: int
    conversion_rate: float
    form_start_rate: float


@router.post("", response_model=EventAck, status_code=201)
async def track_event(event: EventIn, db: AsyncSession = Depends(get_db)):
    """Public endpoint: record an anonymous visit or form-start event."""
    if event.event_type not in ALLOWED_EVENTS:
        raise HTTPException(status_code=400, detail="Unsupported event type")
    try:
        await Site_eventsService(db).create(event.model_dump())
        return EventAck(ok=True)
    except Exception as e:
        logger.error(f"Error recording event: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not record event")


@router.get("/stats", response_model=StatsResponse)
async def funnel_stats(
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(get_admin_user),
):
    """Admin-only: visit, form-start and submission counters."""
    try:
        async def count_events(event_type: str) -> int:
            q = select(func.count(Site_events.id)).where(Site_events.event_type == event_type)
            return int((await db.execute(q)).scalar() or 0)

        visits = await count_events("visit")
        form_starts = await count_events("form_start")
        submissions = int((await db.execute(select(func.count(Repro_requests.id)))).scalar() or 0)
        conversion = round(submissions / visits * 100, 1) if visits else 0.0
        start_rate = round(form_starts / visits * 100, 1) if visits else 0.0
        return StatsResponse(
            visits=visits,
            form_starts=form_starts,
            submissions=submissions,
            conversion_rate=conversion,
            form_start_rate=start_rate,
        )
    except Exception as e:
        logger.error(f"Error computing stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not load stats")

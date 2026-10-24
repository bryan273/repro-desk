import logging
import re
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_admin_user
from schemas.auth import UserResponse
from services.repro_requests import Repro_requestsService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/repro_requests", tags=["repro_requests"])

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ALLOWED_PLANS = {"student", "lab", "team"}
ALLOWED_LANGS = {"en", "zh"}


class Repro_requestsData(BaseModel):
    """Public submission payload."""

    paper_link: str = Field(..., min_length=4, max_length=500)
    claim: str = Field(..., min_length=5, max_length=4000)
    email: str = Field(..., max_length=254)
    language: Optional[str] = "en"
    plan: Optional[str] = "student"

    @field_validator("paper_link")
    @classmethod
    def _check_link(cls, v: str) -> str:
        v = v.strip()
        if not (v.startswith("http://") or v.startswith("https://") or v.lower().startswith("doi:") or v.startswith("10.")):
            raise ValueError("paper_link must be a URL or DOI")
        return v

    @field_validator("email")
    @classmethod
    def _check_email(cls, v: str) -> str:
        v = v.strip()
        if not EMAIL_RE.match(v):
            raise ValueError("Invalid email address")
        return v

    @field_validator("claim")
    @classmethod
    def _check_claim(cls, v: str) -> str:
        return v.strip()


class Repro_requestsResponse(BaseModel):
    id: int
    paper_link: str
    claim: str
    email: str
    language: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubmitResponse(BaseModel):
    id: int
    status: str


class Repro_requestsListResponse(BaseModel):
    items: List[Repro_requestsResponse]
    total: int
    skip: int
    limit: int


class StatusUpdate(BaseModel):
    status: str


@router.post("", response_model=SubmitResponse, status_code=201)
async def create_repro_request(data: Repro_requestsData, db: AsyncSession = Depends(get_db)):
    """Public endpoint: save a reproduction request. Never returns other submissions."""
    payload = data.model_dump()
    payload["language"] = payload.get("language") if payload.get("language") in ALLOWED_LANGS else "en"
    payload["plan"] = payload.get("plan") if payload.get("plan") in ALLOWED_PLANS else "student"
    payload["status"] = "new"
    try:
        result = await Repro_requestsService(db).create(payload)
        if not result:
            raise HTTPException(status_code=400, detail="Failed to save request")
        return SubmitResponse(id=result.id, status=result.status or "new")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating repro request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not save request")


@router.get("", response_model=Repro_requestsListResponse)
async def list_repro_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(get_admin_user),
):
    """Admin-only: list all requests, newest first."""
    query_dict = {"status": status} if status else None
    try:
        return await Repro_requestsService(db).get_list(skip=skip, limit=limit, query_dict=query_dict, sort="-created_at")
    except Exception as e:
        logger.error(f"Error listing repro requests: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not load requests")


@router.put("/{id}", response_model=Repro_requestsResponse)
async def update_repro_request_status(
    id: int,
    body: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: UserResponse = Depends(get_admin_user),
):
    """Admin-only: update a request's status."""
    if body.status not in {"new", "in_review", "done", "declined"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await Repro_requestsService(db).update(id, {"status": body.status})
    if not result:
        raise HTTPException(status_code=404, detail="Request not found")
    return result

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select, Session, delete

from db import get_session
from models import Meeting, MeetingSlot, PollResponse, SlotVote
from routers.auth import require_user, require_admin

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


class SlotIn(BaseModel):
    start_utc: datetime
    end_utc: datetime
    label: str


class MeetingIn(BaseModel):
    title: str
    description: str = ""
    deadline: Optional[datetime] = None
    timezone: str = "Australia/Melbourne"
    slots: list[SlotIn]


@router.get("/admin/analytics-data")
def analytics(
    session: Session = Depends(get_session),
    user=Depends(require_admin),
):
    meetings = session.exec(select(Meeting)).all()
    total_responses = len(session.exec(select(PollResponse)).all())
    open_count = sum(1 for m in meetings if m.status == "open")
    closed_count = sum(1 for m in meetings if m.status in ("closed", "finalized"))

    by_meeting = []
    for m in meetings:
        cnt = len(
            session.exec(select(PollResponse).where(PollResponse.meeting_id == m.id)).all()
        )
        by_meeting.append({"title": m.title, "responses": cnt, "status": m.status})

    return {
        "total_meetings": len(meetings),
        "total_responses": total_responses,
        "open_polls": open_count,
        "closed_polls": closed_count,
        "by_meeting": by_meeting,
    }


@router.post("")
def create_meeting(
    data: MeetingIn,
    session: Session = Depends(get_session),
    user=Depends(require_admin),
):
    meeting = Meeting(
        title=data.title,
        description=data.description,
        created_by=user.id,
        deadline=data.deadline,
        timezone=data.timezone,
    )
    session.add(meeting)
    session.flush()
    for s in data.slots:
        session.add(
            MeetingSlot(
                meeting_id=meeting.id,
                start_utc=s.start_utc,
                end_utc=s.end_utc,
                label=s.label,
            )
        )
    session.commit()
    session.refresh(meeting)
    return _meeting_detail(meeting, session)


@router.get("")
def list_meetings(
    session: Session = Depends(get_session),
    user=Depends(require_user),
):
    if user.role == "admin":
        meetings = session.exec(select(Meeting).order_by(Meeting.created_at.desc())).all()
    else:
        meetings = session.exec(
            select(Meeting)
            .where(Meeting.status == "open")
            .order_by(Meeting.created_at.desc())
        ).all()
    return [_meeting_summary(m, session) for m in meetings]


@router.get("/{meeting_id}")
def get_meeting(
    meeting_id: int,
    session: Session = Depends(get_session),
    user=Depends(require_user),
):
    meeting = session.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return _meeting_detail(meeting, session)


@router.put("/{meeting_id}/finalize")
def finalize_meeting(
    meeting_id: int,
    slot_id: int,
    session: Session = Depends(get_session),
    user=Depends(require_admin),
):
    meeting = session.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.status = "finalized"
    meeting.finalized_slot_id = slot_id
    session.add(meeting)
    session.commit()
    return {"ok": True}


@router.put("/{meeting_id}/close")
def close_meeting(
    meeting_id: int,
    session: Session = Depends(get_session),
    user=Depends(require_admin),
):
    meeting = session.get(Meeting, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    meeting.status = "closed"
    session.add(meeting)
    session.commit()
    return {"ok": True}


@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: int,
    session: Session = Depends(get_session),
    user=Depends(require_admin),
):
    resp_ids = [
        r.id
        for r in session.exec(
            select(PollResponse).where(PollResponse.meeting_id == meeting_id)
        ).all()
    ]
    if resp_ids:
        session.exec(delete(SlotVote).where(SlotVote.response_id.in_(resp_ids)))
    session.exec(delete(PollResponse).where(PollResponse.meeting_id == meeting_id))
    session.exec(delete(MeetingSlot).where(MeetingSlot.meeting_id == meeting_id))
    session.exec(delete(Meeting).where(Meeting.id == meeting_id))
    session.commit()
    return {"ok": True}


# ── Helpers ────────────────────────────────────────────────────────────────
def _meeting_summary(meeting: Meeting, session: Session) -> dict:
    response_count = len(
        session.exec(
            select(PollResponse).where(PollResponse.meeting_id == meeting.id)
        ).all()
    )
    return {
        "id": meeting.id,
        "title": meeting.title,
        "description": meeting.description,
        "status": meeting.status,
        "public_token": meeting.public_token,
        "deadline": meeting.deadline,
        "created_at": meeting.created_at,
        "response_count": response_count,
    }


def _meeting_detail(meeting: Meeting, session: Session) -> dict:
    slots = session.exec(
        select(MeetingSlot)
        .where(MeetingSlot.meeting_id == meeting.id)
        .order_by(MeetingSlot.start_utc)
    ).all()
    return {
        **_meeting_summary(meeting, session),
        "timezone": meeting.timezone,
        "finalized_slot_id": meeting.finalized_slot_id,
        "slots": [
            {
                "id": s.id,
                "start_utc": s.start_utc,
                "end_utc": s.end_utc,
                "label": s.label,
            }
            for s in slots
        ],
    }

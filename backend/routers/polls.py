from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from sqlmodel import select, Session, delete

from db import get_session
from models import Meeting, MeetingSlot, PollResponse, SlotVote
from ws_manager import manager

router = APIRouter(tags=["polls"])


class VoteIn(BaseModel):
    slot_id: int
    status: str  # yes | no | maybe


class RespondIn(BaseModel):
    respondent_name: str
    respondent_email: str = ""
    votes: list[VoteIn]


@router.get("/api/polls/{token}")
def get_poll(token: str, session: Session = Depends(get_session)):
    meeting = session.exec(select(Meeting).where(Meeting.public_token == token)).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Poll not found")
    slots = session.exec(
        select(MeetingSlot)
        .where(MeetingSlot.meeting_id == meeting.id)
        .order_by(MeetingSlot.start_utc)
    ).all()
    return {
        "id": meeting.id,
        "title": meeting.title,
        "description": meeting.description,
        "deadline": meeting.deadline,
        "status": meeting.status,
        "timezone": meeting.timezone,
        "slots": [
            {
                "id": s.id,
                "label": s.label,
                "start_utc": s.start_utc,
                "end_utc": s.end_utc,
            }
            for s in slots
        ],
    }


@router.post("/api/polls/{token}/respond")
async def submit_response(
    token: str,
    data: RespondIn,
    session: Session = Depends(get_session),
):
    meeting = session.exec(select(Meeting).where(Meeting.public_token == token)).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Poll not found")
    if meeting.status != "open":
        raise HTTPException(status_code=400, detail="Poll is closed")

    # Replace existing response for same email
    if data.respondent_email:
        prev = session.exec(
            select(PollResponse).where(
                PollResponse.meeting_id == meeting.id,
                PollResponse.respondent_email == data.respondent_email,
            )
        ).first()
        if prev:
            session.exec(delete(SlotVote).where(SlotVote.response_id == prev.id))
            session.delete(prev)
            session.flush()

    response = PollResponse(
        meeting_id=meeting.id,
        respondent_name=data.respondent_name,
        respondent_email=data.respondent_email,
    )
    session.add(response)
    session.flush()

    for vote in data.votes:
        session.add(
            SlotVote(response_id=response.id, slot_id=vote.slot_id, status=vote.status)
        )
    session.commit()

    results = _compute_results(meeting.id, session)
    await manager.broadcast(token, {"type": "update", "results": results})
    return {"ok": True}


@router.get("/api/polls/{token}/results")
def get_results(token: str, session: Session = Depends(get_session)):
    meeting = session.exec(select(Meeting).where(Meeting.public_token == token)).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Poll not found")
    return _compute_results(meeting.id, session)


@router.websocket("/ws/polls/{token}")
async def poll_ws(token: str, websocket: WebSocket):
    await manager.connect(token, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(token, websocket)


def _compute_results(meeting_id: int, session: Session) -> dict:
    responses = session.exec(
        select(PollResponse).where(PollResponse.meeting_id == meeting_id)
    ).all()
    slots = session.exec(
        select(MeetingSlot)
        .where(MeetingSlot.meeting_id == meeting_id)
        .order_by(MeetingSlot.start_utc)
    ).all()

    slot_votes: dict[int, dict] = {
        slot.id: {"yes": [], "maybe": [], "no": []} for slot in slots
    }

    for resp in responses:
        for vote in session.exec(
            select(SlotVote).where(SlotVote.response_id == resp.id)
        ).all():
            if vote.slot_id in slot_votes and vote.status in slot_votes[vote.slot_id]:
                slot_votes[vote.slot_id][vote.status].append(resp.respondent_name)

    return {
        "total_responses": len(responses),
        "respondents": [
            {
                "name": r.respondent_name,
                "email": r.respondent_email,
                "at": r.created_at,
            }
            for r in responses
        ],
        "slots": [
            {
                "id": slot.id,
                "label": slot.label,
                "start_utc": slot.start_utc,
                "end_utc": slot.end_utc,
                "yes_count": len(slot_votes[slot.id]["yes"]),
                "maybe_count": len(slot_votes[slot.id]["maybe"]),
                "no_count": len(slot_votes[slot.id]["no"]),
                "yes_names": slot_votes[slot.id]["yes"],
                "maybe_names": slot_votes[slot.id]["maybe"],
            }
            for slot in slots
        ],
    }

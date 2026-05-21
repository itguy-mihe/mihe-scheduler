from __future__ import annotations
import secrets
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str
    password_hash: str
    role: str = Field(default="user")  # "admin" | "user"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Meeting(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str = Field(default="")
    created_by: int = Field(foreign_key="user.id")
    deadline: Optional[datetime] = None
    status: str = Field(default="open")  # open | closed | finalized
    public_token: str = Field(
        default_factory=lambda: secrets.token_urlsafe(16),
        unique=True,
        index=True,
    )
    timezone: str = Field(default="Australia/Melbourne")
    finalized_slot_id: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MeetingSlot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meeting_id: int = Field(foreign_key="meeting.id")
    start_utc: datetime
    end_utc: datetime
    label: str


class PollResponse(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    meeting_id: int = Field(foreign_key="meeting.id")
    respondent_name: str
    respondent_email: str = Field(default="")
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SlotVote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    response_id: int = Field(foreign_key="pollresponse.id")
    slot_id: int = Field(foreign_key="meetingslot.id")
    status: str  # yes | no | maybe

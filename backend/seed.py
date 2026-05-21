"""Run once to create an admin user and sample meeting.

Usage:
    cd backend
    python seed.py
"""
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from sqlmodel import Session, select

from db import engine, init_db
from models import Meeting, MeetingSlot, User

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def seed():
    init_db()
    with Session(engine) as session:
        # Create admin user
        if not session.exec(select(User).where(User.email == "admin@mihe.edu.au")).first():
            admin = User(
                email="admin@mihe.edu.au",
                name="MIHE Admin",
                password_hash=pwd_context.hash("admin123"),
                role="admin",
            )
            session.add(admin)
            session.flush()
            print(f"Created admin: admin@mihe.edu.au / admin123")
        else:
            admin = session.exec(select(User).where(User.email == "admin@mihe.edu.au")).first()
            print("Admin already exists")

        # Create a sample meeting
        if not session.exec(select(Meeting)).first():
            now = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            monday = now + timedelta(days=(7 - now.weekday()))
            meeting = Meeting(
                title="Weekly Team Sync",
                description="Let us find the best time for our weekly team check-in.",
                created_by=admin.id,
                deadline=monday + timedelta(days=5),
                timezone="Australia/Melbourne",
            )
            session.add(meeting)
            session.flush()

            for day in range(5):
                for hour in (9, 11, 14):
                    start = monday + timedelta(days=day, hours=hour)
                    end = start + timedelta(hours=1)
                    session.add(
                        MeetingSlot(
                            meeting_id=meeting.id,
                            start_utc=start,
                            end_utc=end,
                            label=start.strftime("%a %d %b %I:%M %p") + " – " + end.strftime("%I:%M %p AEST"),
                        )
                    )
            print(f"Created sample meeting. Token: {meeting.public_token}")
        else:
            print("Meetings already exist")

        session.commit()
    print("Seed complete.")


if __name__ == "__main__":
    seed()

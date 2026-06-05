import os
from sqlmodel import create_engine, SQLModel, Session

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./scheduler.db")
# SQLAlchemy 2.x dropped support for the legacy "postgres://" scheme
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

# MIHE Meeting Scheduler

A modern full-stack collaborative meeting poll system (Doodle/Calendly-style) built for Melbourne Institute of Higher Education.

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | FastAPI, SQLModel, WebSockets, Uvicorn  |
| Frontend | React 18, Vite, Tailwind CSS            |
| Database | SQLite (dev) → PostgreSQL (prod)        |
| Auth     | Session-based (itsdangerous)            |

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:  venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Seed admin user + sample meeting
python seed.py

# Start API server
uvicorn main:app --reload --port 8000
```

Default admin credentials: `admin@mihe.edu.au` / `admin123`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Features

- **Admin dashboard** — create polls, view responses, close/finalize meetings
- **Public vote page** — no login required, click slots to mark Yes / Maybe / No
- **Live results** — WebSocket push updates, animated availability bars, respondent avatars
- **Analytics** — response counts, completion rates, per-meeting breakdown
- **Shareable links** — one-click copy, works without authentication
- **Timezone support** — Australian & international timezones
- **Mobile responsive** — full Tailwind responsive grid

## Project Structure

```
mihe-scheduler/
├── backend/
│   ├── main.py              # FastAPI app + middleware
│   ├── models.py            # SQLModel ORM models
│   ├── db.py                # DB engine + session
│   ├── ws_manager.py        # WebSocket connection manager
│   ├── seed.py              # Dev seed data
│   ├── requirements.txt
│   └── routers/
│       ├── auth.py          # Login / logout / me / register
│       ├── meetings.py      # CRUD + analytics (admin)
│       └── polls.py         # Public poll + voting + WebSocket
└── frontend/
    ├── src/
    │   ├── api/client.js    # Axios + API helpers
    │   ├── context/AuthContext.jsx
    │   ├── hooks/useWebSocket.js
    │   ├── components/      # Navbar, Layout, PollCard, Skeletons
    │   └── pages/           # Login, Dashboard, CreateMeeting, VotePoll, PollResults, Analytics
    ├── tailwind.config.js
    └── vite.config.js       # Proxy /api and /ws to :8000
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | — | Login |
| POST | /api/auth/logout | session | Logout |
| GET | /api/auth/me | session | Current user |
| POST | /api/auth/register | — | Register |
| GET | /api/meetings | admin | List all meetings |
| POST | /api/meetings | admin | Create meeting |
| GET | /api/meetings/{id} | user | Get meeting detail |
| PUT | /api/meetings/{id}/finalize | admin | Finalize a slot |
| PUT | /api/meetings/{id}/close | admin | Close poll |
| DELETE | /api/meetings/{id} | admin | Delete meeting |
| GET | /api/meetings/admin/analytics-data | admin | Analytics |
| GET | /api/polls/{token} | — | Get public poll |
| POST | /api/polls/{token}/respond | — | Submit votes |
| GET | /api/polls/{token}/results | — | Get results |
| WS | /ws/polls/{token} | — | Live updates |

## Production Deployment

1. Set `ENV=production` and a strong `SECRET_KEY` in `.env`
2. Switch to PostgreSQL: `DATABASE_URL=postgresql://...`
3. Build the frontend: `cd frontend && npm run build`
4. Run backend: `uvicorn main:app --host 0.0.0.0 --port 8000`

The backend serves the built React app from `../frontend/dist` in production mode.

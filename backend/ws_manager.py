from collections import defaultdict
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self._rooms: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, token: str, ws: WebSocket):
        await ws.accept()
        self._rooms[token].append(ws)

    def disconnect(self, token: str, ws: WebSocket):
        try:
            self._rooms[token].remove(ws)
        except ValueError:
            pass

    async def broadcast(self, token: str, payload: dict):
        dead = []
        for ws in list(self._rooms[token]):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(token, ws)


manager = ConnectionManager()

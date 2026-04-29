from pathlib import Path
import sqlite3
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "dayddy_events.sqlite3"

DEFAULT_EVENT_CATEGORIES = [
    "Festival",
    "Birthday",
    "Social",
    "Anniversary",
    "Ceremony",
    "Party",
    "Workshop",
    "Concert",
    "Travel",
    "Date",
    "Sport",
    "Movie",
]

app = FastAPI(title="Dayddy Events API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EventCreate(BaseModel):
    title: str
    event_date: str = ""
    event_time: str = ""
    tag: str = "general"
    reminder: int = 1
    notes: str = ""


class EventUpdate(EventCreate):
    id: int


class CategoryCreate(BaseModel):
    name: str


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                event_date TEXT,
                event_time TEXT,
                tag TEXT DEFAULT 'general',
                reminder INTEGER DEFAULT 1,
                notes TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS event_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TEXT DEFAULT (datetime('now'))
            )
            """
        )
        existing_count = conn.execute("SELECT COUNT(*) FROM event_categories").fetchone()[0]
        if existing_count == 0:
            conn.executemany(
                "INSERT INTO event_categories(name) VALUES (?)",
                [(name,) for name in DEFAULT_EVENT_CATEGORIES],
            )
        conn.commit()


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def row_to_event(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "event_date": row["event_date"],
        "event_time": row["event_time"],
        "tag": row["tag"],
        "reminder": row["reminder"],
        "notes": row["notes"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def row_to_category(row: sqlite3.Row) -> dict:
    return {
        "label": row["name"],
        "icon": "tag-outline",
    }


@app.get("/api/events")
def get_events() -> list[dict]:
    with get_db_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM events ORDER BY event_date ASC, event_time ASC, id ASC"
        ).fetchall()
        return [row_to_event(row) for row in rows]


@app.get("/api/events/{event_id}")
def get_event(event_id: int) -> dict | None:
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM events WHERE id = ? LIMIT 1", (event_id,)).fetchone()
        if row is None:
            return None
        return row_to_event(row)


@app.post("/api/events", status_code=201)
def create_event(payload: EventCreate) -> dict:
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO events (title, event_date, event_time, tag, reminder, notes)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                payload.title,
                payload.event_date,
                payload.event_time,
                payload.tag,
                payload.reminder,
                payload.notes,
            ),
        )
        conn.commit()
        return {"id": cursor.lastrowid, "affected": cursor.rowcount}


@app.put("/api/events/{event_id}")
def update_event(event_id: int, payload: EventUpdate) -> dict:
    if payload.id != event_id:
        raise HTTPException(status_code=400, detail="Payload id does not match route id")

    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            UPDATE events
            SET title = ?, event_date = ?, event_time = ?, tag = ?, reminder = ?, notes = ?, updated_at = datetime('now')
            WHERE id = ?
            """,
            (
                payload.title,
                payload.event_date,
                payload.event_time,
                payload.tag,
                payload.reminder,
                payload.notes,
                event_id,
            ),
        )
        conn.commit()
        return {"id": event_id, "affected": cursor.rowcount}


@app.delete("/api/events/{event_id}")
def delete_event(event_id: int) -> dict:
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM events WHERE id = ?", (event_id,))
        conn.commit()
        return {"id": event_id, "affected": cursor.rowcount}


@app.get("/api/event-categories")
def get_event_categories() -> list[dict]:
    with get_db_connection() as conn:
        rows = conn.execute("SELECT name FROM event_categories ORDER BY name ASC").fetchall()
        return [row_to_category(row) for row in rows]


@app.post("/api/event-categories", status_code=201)
def create_event_category(payload: CategoryCreate) -> dict:
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required")

    with get_db_connection() as conn:
        conn.execute("INSERT OR IGNORE INTO event_categories (name) VALUES (?)", (name,))
        conn.commit()
        return {"name": name}


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}

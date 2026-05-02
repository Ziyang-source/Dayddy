from pathlib import Path
import sqlite3
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "dayddy_events.sqlite3"

DEFAULT_TASK_CATEGORIES = [
    "Assignment",
    "Part-time",
    "Study",
    "Fun Time",
    "Social",
    "Gym",
    "Food",
    "Sleep",
]

DEFAULT_EVENT_CATEGORIES = [
    "Birthday",
    "Social",
    "Anniversary",
    "Ceremony",
    "Party",
    "Concert",
]

app = FastAPI(title="Dayddy API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskCreate(BaseModel):
    user_id: int
    title: str
    description: str = ""
    due_date: str = ""
    due_time: str = ""
    priority: str
    tag: str
    reminder: int = 1
    completed: int = 0


class TaskUpdate(TaskCreate):
    id: int


class TaskCompleteUpdate(BaseModel):
    completed: int


class EventCreate(BaseModel):
    user_id: int
    title: str
    event_date: str
    event_time: str
    tag: str
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
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                due_date TEXT,
                due_time TEXT,
                priority TEXT DEFAULT 'medium',
                tag TEXT DEFAULT 'general',
                reminder INTEGER DEFAULT 1,
                completed INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
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

        task_columns = [row[1] for row in conn.execute("PRAGMA table_info(tasks)").fetchall()]
        if "user_id" not in task_columns:
            conn.execute("ALTER TABLE tasks ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0")

        event_columns = [row[1] for row in conn.execute("PRAGMA table_info(events)").fetchall()]
        if "user_id" not in event_columns:
            conn.execute("ALTER TABLE events ADD COLUMN user_id INTEGER NOT NULL DEFAULT 0")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TEXT DEFAULT (datetime('now'))
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

        task_category_count = conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
        if task_category_count == 0:
            conn.executemany(
                "INSERT INTO categories(name) VALUES (?)",
                [(name,) for name in DEFAULT_TASK_CATEGORIES],
            )

        event_category_count = conn.execute("SELECT COUNT(*) FROM event_categories").fetchone()[0]
        if event_category_count == 0:
            conn.executemany(
                "INSERT INTO event_categories(name) VALUES (?)",
                [(name,) for name in DEFAULT_EVENT_CATEGORIES],
            )

        conn.commit()


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def row_to_task(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "title": row["title"],
        "description": row["description"],
        "due_date": row["due_date"],
        "due_time": row["due_time"],
        "priority": row["priority"],
        "tag": row["tag"],
        "reminder": row["reminder"],
        "completed": row["completed"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def row_to_event(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "user_id": row["user_id"],
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


def parse_completed_only(completed_only: Optional[bool]) -> Optional[int]:
    if completed_only is None:
        return None
    return 1 if completed_only else 0


def validate_user_id(user_id: int) -> int:
    if user_id <= 0:
        raise HTTPException(status_code=400, detail="user_id must be a positive integer")
    return user_id


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/tasks")
def get_tasks(user_id: int, completed_only: Optional[bool] = None) -> list[dict]:
    uid = validate_user_id(user_id)
    with get_db_connection() as conn:
        query = "SELECT * FROM tasks WHERE user_id = ?"
        params: list[int] = [uid]
        completed_value = parse_completed_only(completed_only)
        if completed_value is not None:
            query += " AND completed = ?"
            params.append(completed_value)
        query += " ORDER BY created_at DESC, id DESC"
        rows = conn.execute(query, tuple(params)).fetchall()
        return [row_to_task(row) for row in rows]


@app.get("/api/tasks/{task_id}")
def get_task(task_id: int, user_id: int) -> dict | None:
    uid = validate_user_id(user_id)
    with get_db_connection() as conn:
        row = conn.execute(
            "SELECT * FROM tasks WHERE id = ? AND user_id = ? LIMIT 1",
            (task_id, uid),
        ).fetchone()
        if row is None:
            return None
        return row_to_task(row)


@app.post("/api/tasks", status_code=201)
def create_task(payload: TaskCreate) -> dict:
    uid = validate_user_id(payload.user_id)
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO tasks (user_id, title, description, due_date, due_time, priority, tag, reminder, completed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                uid,
                payload.title,
                payload.description,
                payload.due_date,
                payload.due_time,
                payload.priority,
                payload.tag,
                payload.reminder,
                payload.completed,
            ),
        )
        conn.commit()
        return {"id": cursor.lastrowid, "affected": cursor.rowcount}


@app.put("/api/tasks/{task_id}")
def update_task(task_id: int, payload: TaskUpdate) -> dict:
    if payload.id != task_id:
        raise HTTPException(status_code=400, detail="Payload id does not match route id")

    uid = validate_user_id(payload.user_id)

    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            UPDATE tasks
            SET title = ?, description = ?, due_date = ?, due_time = ?, priority = ?, tag = ?, reminder = ?, completed = ?, updated_at = datetime('now')
            WHERE id = ? AND user_id = ?
            """,
            (
                payload.title,
                payload.description,
                payload.due_date,
                payload.due_time,
                payload.priority,
                payload.tag,
                payload.reminder,
                payload.completed,
                task_id,
                uid,
            ),
        )
        conn.commit()
        return {"id": task_id, "affected": cursor.rowcount}


@app.patch("/api/tasks/{task_id}/complete")
def set_task_complete(task_id: int, payload: TaskCompleteUpdate, user_id: int) -> dict:
    uid = validate_user_id(user_id)
    with get_db_connection() as conn:
        cursor = conn.execute(
            "UPDATE tasks SET completed = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
            (payload.completed, task_id, uid),
        )
        conn.commit()
        return {"id": task_id, "affected": cursor.rowcount}


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, user_id: int) -> dict:
    uid = validate_user_id(user_id)
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM tasks WHERE id = ? AND user_id = ?", (task_id, uid))
        conn.commit()
        return {"id": task_id, "affected": cursor.rowcount}


@app.get("/api/categories")
def get_categories() -> list[dict]:
    with get_db_connection() as conn:
        rows = conn.execute("SELECT name FROM categories ORDER BY name ASC").fetchall()
        return [row_to_category(row) for row in rows]


@app.post("/api/categories", status_code=201)
def create_category(payload: CategoryCreate) -> dict:
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required")

    with get_db_connection() as conn:
        conn.execute("INSERT OR IGNORE INTO categories (name) VALUES (?)", (name,))
        conn.commit()
        return {"name": name}


@app.get("/api/events")
def get_events(user_id: int) -> list[dict]:
    uid = validate_user_id(user_id)
    with get_db_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM events WHERE user_id = ? ORDER BY event_date ASC, event_time ASC, id ASC",
            (uid,),
        ).fetchall()
        return [row_to_event(row) for row in rows]


@app.get("/api/events/{event_id}")
def get_event(event_id: int, user_id: int) -> dict | None:
    uid = validate_user_id(user_id)
    with get_db_connection() as conn:
        row = conn.execute(
            "SELECT * FROM events WHERE id = ? AND user_id = ? LIMIT 1",
            (event_id, uid),
        ).fetchone()
        if row is None:
            return None
        return row_to_event(row)


@app.post("/api/events", status_code=201)
def create_event(payload: EventCreate) -> dict:
    uid = validate_user_id(payload.user_id)
    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO events (user_id, title, event_date, event_time, tag, reminder, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                uid,
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

    uid = validate_user_id(payload.user_id)

    with get_db_connection() as conn:
        cursor = conn.execute(
            """
            UPDATE events
            SET title = ?, event_date = ?, event_time = ?, tag = ?, reminder = ?, notes = ?, updated_at = datetime('now')
            WHERE id = ? AND user_id = ?
            """,
            (
                payload.title,
                payload.event_date,
                payload.event_time,
                payload.tag,
                payload.reminder,
                payload.notes,
                event_id,
                uid,
            ),
        )
        conn.commit()
        return {"id": event_id, "affected": cursor.rowcount}


@app.delete("/api/events/{event_id}")
def delete_event(event_id: int, user_id: int) -> dict:
    uid = validate_user_id(user_id)
    with get_db_connection() as conn:
        cursor = conn.execute("DELETE FROM events WHERE id = ? AND user_id = ?", (event_id, uid))
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
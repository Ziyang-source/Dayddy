import axios from 'axios';
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
SQLite.DEBUG(__DEV__);

const DATABASE_NAME = 'dayddy.db';
const EVENT_API_BASE_URL = 'http://127.0.0.1:8000/api';
const eventApi = axios.create({
  baseURL: EVENT_API_BASE_URL,
  timeout: 5000,
});
let dbInstance = null;

export const getDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await SQLite.openDatabase({
    name: DATABASE_NAME,
    location: 'default',
  });

  await initDatabase(dbInstance);
  return dbInstance;
};

export const initDatabase = async (db) => {
  await db.transaction((tx) => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT    NOT NULL,
        description TEXT,
        due_date    TEXT,
        due_time    TEXT,
        priority    TEXT    DEFAULT 'medium',
        tag         TEXT    DEFAULT 'general',
        reminder    INTEGER DEFAULT 1,
        completed   INTEGER DEFAULT 0,
        created_at  TEXT    DEFAULT (datetime('now')),
        updated_at  TEXT    DEFAULT (datetime('now'))
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT    NOT NULL,
        event_date  TEXT,
        event_time  TEXT,
        tag         TEXT    DEFAULT 'general',
        reminder    INTEGER DEFAULT 1,
        notes       TEXT,
        created_at  TEXT    DEFAULT (datetime('now')),
        updated_at  TEXT    DEFAULT (datetime('now'))
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS categories (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL UNIQUE,
        created_at  TEXT    DEFAULT (datetime('now'))
      );
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS event_categories (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL UNIQUE,
        created_at  TEXT    DEFAULT (datetime('now'))
      );
    `);
  });
  console.log('[DB] Database tables initialized');
};

export const createTask = async (task) => {
  const db = await getDB();
  const {
    title,
    description = '',
    due_date = '',
    due_time = '',
    priority = 'medium',
    tag = 'general',
    reminder = 1,
  } = task;

  const [result] = await db.executeSql(
    `INSERT INTO tasks (title, description, due_date, due_time, priority, tag, reminder)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, due_date, due_time, priority, tag, reminder],
  );
  
  return result.insertId;
};

export const updateTask = async (taskId, task) => {
  const db = await getDB();
  const {
    title,
    description = '',
    due_date = '',
    due_time = '',
    priority = 'medium',
    tag = 'general',
    reminder = 1,
  } = task;

  await db.executeSql(
    `UPDATE tasks
     SET title = ?, description = ?, due_date = ?, due_time = ?, priority = ?, tag = ?, reminder = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [title, description, due_date, due_time, priority, tag, reminder, taskId],
  );
};

export const getTasks = async (completedOnly = null) => {
  const db = await getDB();
  let query = 'SELECT * FROM tasks';
  const params = [];

  if (completedOnly !== null) {
    query += ' WHERE completed = ?';
    params.push(completedOnly ? 1 : 0);
  }
  query += ' ORDER BY created_at DESC';

  const [results] = await db.executeSql(query, params);
  return rowsToArray(results);
};

export const getTaskById = async (id) => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT * FROM tasks WHERE id = ? LIMIT 1', [id]);
  const rows = rowsToArray(results);
  return rows.length > 0 ? rows[0] : null;
};

export const toggleTaskComplete = async (id) => {
  const db = await getDB();
  await db.executeSql(
    'UPDATE tasks SET completed = 1 - completed, updated_at = datetime("now") WHERE id = ?',
    [id]
  );
};

export const deleteTask = async (id) => {
  const db = await getDB();
  await db.executeSql('DELETE FROM tasks WHERE id = ?', [id]);
};

const rowsToArray = (results) => {
  const arr = [];
  for (let i = 0; i < results.rows.length; i++) {
    arr.push(results.rows.item(i));
  }
  return arr;
};

export const createCategory = async (categoryName) => {
  const db = await getDB();

  if (!categoryName || !categoryName.trim()) {
    return null;
  }

  await db.executeSql(
    'INSERT OR IGNORE INTO categories (name) VALUES (?)',
    [categoryName.trim()],
  );

  return categoryName.trim();
};

export const getCategories = async () => {
  const db = await getDB();
  const [results] = await db.executeSql(
    'SELECT name FROM categories ORDER BY name ASC',
  );

  const categories = rowsToArray(results).map((item) => ({
    label: item.name,
    icon: 'tag-outline',
  }));

  return categories;
};

const normalizeEvent = (event = {}) => ({
  title: event.title,
  event_date: event.event_date ?? '',
  event_time: event.event_time ?? '',
  tag: event.tag ?? 'general',
  reminder: event.reminder ?? 1,
  notes: event.notes ?? '',
});

const createEventLocal = async (event) => {
  const db = await getDB();
  const payload = normalizeEvent(event);

  const [result] = await db.executeSql(
    `INSERT INTO events (title, event_date, event_time, tag, reminder, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [payload.title, payload.event_date, payload.event_time, payload.tag, payload.reminder, payload.notes],
  );

  return result.insertId;
};

const getEventsLocal = async () => {
  const db = await getDB();
  const [results] = await db.executeSql(
    'SELECT * FROM events ORDER BY event_date ASC, event_time ASC',
  );
  return rowsToArray(results);
};

const getEventByIdLocal = async (id) => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT * FROM events WHERE id = ? LIMIT 1', [id]);
  const rows = rowsToArray(results);
  return rows.length > 0 ? rows[0] : null;
};

const updateEventLocal = async (eventId, event) => {
  const db = await getDB();
  const payload = normalizeEvent(event);

  await db.executeSql(
    `UPDATE events
     SET title = ?, event_date = ?, event_time = ?, tag = ?, reminder = ?, notes = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [payload.title, payload.event_date, payload.event_time, payload.tag, payload.reminder, payload.notes, eventId],
  );
};

const deleteEventLocal = async (id) => {
  const db = await getDB();
  await db.executeSql('DELETE FROM events WHERE id = ?', [id]);
};

const getEventCategoriesLocal = async () => {
  const db = await getDB();
  const [results] = await db.executeSql(
    'SELECT name FROM event_categories ORDER BY name ASC',
  );

  return rowsToArray(results).map((item) => ({
    label: item.name,
    icon: 'tag-outline',
  }));
};

const createEventCategoryLocal = async (categoryName) => {
  const db = await getDB();

  if (!categoryName || !categoryName.trim()) {
    return null;
  }

  await db.executeSql(
    'INSERT OR IGNORE INTO event_categories (name) VALUES (?)',
    [categoryName.trim()],
  );

  return categoryName.trim();
};

const withEventFallback = async (remoteCall, localCall) => {
  try {
    return await remoteCall();
  } catch (error) {
    console.warn('[DB] Event cloud request failed, falling back to local SQLite.', error?.message || error);
    return localCall();
  }
};

export const createEvent = async (event) => {
  return withEventFallback(
    async () => {
      const response = await eventApi.post('/events', normalizeEvent(event));
      return response.data?.id ?? null;
    },
    () => createEventLocal(event),
  );
};

export const getEvents = async () => {
  return withEventFallback(
    async () => {
      const response = await eventApi.get('/events');
      return response.data || [];
    },
    () => getEventsLocal(),
  );
};

export const getEventById = async (id) => {
  return withEventFallback(
    async () => {
      const response = await eventApi.get(`/events/${id}`);
      return response.data || null;
    },
    () => getEventByIdLocal(id),
  );
};

export const updateEvent = async (eventId, event) => {
  return withEventFallback(
    async () => {
      const response = await eventApi.put(`/events/${eventId}`, {id: eventId, ...normalizeEvent(event)});
      return response.data || null;
    },
    () => updateEventLocal(eventId, event),
  );
};

export const deleteEvent = async (id) => {
  return withEventFallback(
    async () => {
      const response = await eventApi.delete(`/events/${id}`);
      return response.data || null;
    },
    () => deleteEventLocal(id),
  );
};

export const getEventCategories = async () => {
  return withEventFallback(
    async () => {
      const response = await eventApi.get('/event-categories');
      return response.data || [];
    },
    () => getEventCategoriesLocal(),
  );
};

export const createEventCategory = async (categoryName) => {
  return withEventFallback(
    async () => {
      const response = await eventApi.post('/event-categories', {name: categoryName.trim()});
      return response.data?.name ?? categoryName.trim();
    },
    () => createEventCategoryLocal(categoryName),
  );
};
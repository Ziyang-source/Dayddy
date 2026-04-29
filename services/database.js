import axios from 'axios';
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
SQLite.DEBUG(__DEV__);

const DATABASE_NAME = 'dayddy.db';
const API_BASE_URL = 'http://127.0.0.1:8000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
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

const rowsToArray = (results) => {
  const arr = [];
  for (let i = 0; i < results.rows.length; i++) {
    arr.push(results.rows.item(i));
  }
  return arr;
};

const withFallback = async (scope, remoteCall, localCall) => {
  try {
    return await remoteCall();
  } catch (error) {
    console.warn(`[DB] ${scope} cloud request failed, falling back to local SQLite.`, error?.message || error);
    return localCall();
  }
};

const normalizeTask = (task = {}) => ({
  title: task.title,
  description: task.description ?? '',
  due_date: task.due_date ?? '',
  due_time: task.due_time ?? '',
  priority: task.priority ?? 'medium',
  tag: task.tag ?? 'general',
  reminder: task.reminder ?? 1,
  completed: task.completed ?? 0,
});

const normalizeEvent = (event = {}) => ({
  title: event.title,
  event_date: event.event_date ?? '',
  event_time: event.event_time ?? '',
  tag: event.tag ?? 'general',
  reminder: event.reminder ?? 1,
  notes: event.notes ?? '',
});

const createTaskLocal = async (task) => {
  const db = await getDB();
  const payload = normalizeTask(task);

  const [result] = await db.executeSql(
    `INSERT INTO tasks (title, description, due_date, due_time, priority, tag, reminder, completed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.title,
      payload.description,
      payload.due_date,
      payload.due_time,
      payload.priority,
      payload.tag,
      payload.reminder,
      payload.completed,
    ],
  );

  return result.insertId;
};

const updateTaskLocal = async (taskId, task) => {
  const db = await getDB();
  const payload = normalizeTask(task);

  await db.executeSql(
    `UPDATE tasks
     SET title = ?, description = ?, due_date = ?, due_time = ?, priority = ?, tag = ?, reminder = ?, completed = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [
      payload.title,
      payload.description,
      payload.due_date,
      payload.due_time,
      payload.priority,
      payload.tag,
      payload.reminder,
      payload.completed,
      taskId,
    ],
  );
};

const getTasksLocal = async (completedOnly = null) => {
  const db = await getDB();
  let query = 'SELECT * FROM tasks';
  const params = [];

  if (completedOnly !== null) {
    query += ' WHERE completed = ?';
    params.push(completedOnly ? 1 : 0);
  }

  query += ' ORDER BY created_at DESC, id DESC';
  const [results] = await db.executeSql(query, params);
  return rowsToArray(results);
};

const getTaskByIdLocal = async (id) => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT * FROM tasks WHERE id = ? LIMIT 1', [id]);
  const rows = rowsToArray(results);
  return rows.length > 0 ? rows[0] : null;
};

const toggleTaskCompleteLocal = async (id) => {
  const db = await getDB();
  await db.executeSql(
    'UPDATE tasks SET completed = 1 - completed, updated_at = datetime("now") WHERE id = ?',
    [id],
  );
};

const deleteTaskLocal = async (id) => {
  const db = await getDB();
  await db.executeSql('DELETE FROM tasks WHERE id = ?', [id]);
};

const createCategoryLocal = async (categoryName) => {
  const db = await getDB();

  if (!categoryName || !categoryName.trim()) {
    return null;
  }

  await db.executeSql('INSERT OR IGNORE INTO categories (name) VALUES (?)', [categoryName.trim()]);
  return categoryName.trim();
};

const getCategoriesLocal = async () => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT name FROM categories ORDER BY name ASC');

  return rowsToArray(results).map((item) => ({
    label: item.name,
    icon: 'tag-outline',
  }));
};

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

const getEventsLocal = async () => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT * FROM events ORDER BY event_date ASC, event_time ASC, id ASC');
  return rowsToArray(results);
};

const getEventByIdLocal = async (id) => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT * FROM events WHERE id = ? LIMIT 1', [id]);
  const rows = rowsToArray(results);
  return rows.length > 0 ? rows[0] : null;
};

const deleteEventLocal = async (id) => {
  const db = await getDB();
  await db.executeSql('DELETE FROM events WHERE id = ?', [id]);
};

const createEventCategoryLocal = async (categoryName) => {
  const db = await getDB();

  if (!categoryName || !categoryName.trim()) {
    return null;
  }

  await db.executeSql('INSERT OR IGNORE INTO event_categories (name) VALUES (?)', [categoryName.trim()]);
  return categoryName.trim();
};

const getEventCategoriesLocal = async () => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT name FROM event_categories ORDER BY name ASC');

  return rowsToArray(results).map((item) => ({
    label: item.name,
    icon: 'tag-outline',
  }));
};

export const createTask = async (task) => {
  return withFallback(
    'Task create',
    async () => {
      const response = await api.post('/tasks', normalizeTask(task));
      return response.data?.id ?? null;
    },
    () => createTaskLocal(task),
  );
};

export const updateTask = async (taskId, task) => {
  return withFallback(
    'Task update',
    async () => {
      const response = await api.put(`/tasks/${taskId}`, {id: taskId, ...normalizeTask(task)});
      return response.data || null;
    },
    () => updateTaskLocal(taskId, task),
  );
};

export const getTasks = async (completedOnly = null) => {
  return withFallback(
    'Task fetch',
    async () => {
      const params = completedOnly === null ? {} : {completed_only: Boolean(completedOnly)};
      const response = await api.get('/tasks', {params});
      return response.data || [];
    },
    () => getTasksLocal(completedOnly),
  );
};

export const getTaskById = async (id) => {
  return withFallback(
    'Task fetch by id',
    async () => {
      const response = await api.get(`/tasks/${id}`);
      return response.data || null;
    },
    () => getTaskByIdLocal(id),
  );
};

export const toggleTaskComplete = async (id) => {
  return withFallback(
    'Task toggle complete',
    async () => {
      const currentResponse = await api.get(`/tasks/${id}`);
      const currentTask = currentResponse.data;
      if (!currentTask) {
        return null;
      }

      const nextCompleted = currentTask.completed === 1 ? 0 : 1;
      await api.patch(`/tasks/${id}/complete`, {completed: nextCompleted});
      return nextCompleted;
    },
    () => toggleTaskCompleteLocal(id),
  );
};

export const deleteTask = async (id) => {
  return withFallback(
    'Task delete',
    async () => {
      const response = await api.delete(`/tasks/${id}`);
      return response.data || null;
    },
    () => deleteTaskLocal(id),
  );
};

export const createCategory = async (categoryName) => {
  return withFallback(
    'Task category create',
    async () => {
      const response = await api.post('/categories', {name: categoryName.trim()});
      return response.data?.name ?? categoryName.trim();
    },
    () => createCategoryLocal(categoryName),
  );
};

export const getCategories = async () => {
  return withFallback(
    'Task category fetch',
    async () => {
      const response = await api.get('/categories');
      return response.data || [];
    },
    () => getCategoriesLocal(),
  );
};

export const createEvent = async (event) => {
  return withFallback(
    'Event create',
    async () => {
      const response = await api.post('/events', normalizeEvent(event));
      return response.data?.id ?? null;
    },
    () => createEventLocal(event),
  );
};

export const updateEvent = async (eventId, event) => {
  return withFallback(
    'Event update',
    async () => {
      const response = await api.put(`/events/${eventId}`, {id: eventId, ...normalizeEvent(event)});
      return response.data || null;
    },
    () => updateEventLocal(eventId, event),
  );
};

export const getEvents = async () => {
  return withFallback(
    'Event fetch',
    async () => {
      const response = await api.get('/events');
      return response.data || [];
    },
    () => getEventsLocal(),
  );
};

export const getEventById = async (id) => {
  return withFallback(
    'Event fetch by id',
    async () => {
      const response = await api.get(`/events/${id}`);
      return response.data || null;
    },
    () => getEventByIdLocal(id),
  );
};

export const deleteEvent = async (id) => {
  return withFallback(
    'Event delete',
    async () => {
      const response = await api.delete(`/events/${id}`);
      return response.data || null;
    },
    () => deleteEventLocal(id),
  );
};

export const getEventCategories = async () => {
  return withFallback(
    'Event category fetch',
    async () => {
      const response = await api.get('/event-categories');
      return response.data || [];
    },
    () => getEventCategoriesLocal(),
  );
};

export const createEventCategory = async (categoryName) => {
  return withFallback(
    'Event category create',
    async () => {
      const response = await api.post('/event-categories', {name: categoryName.trim()});
      return response.data?.name ?? categoryName.trim();
    },
    () => createEventCategoryLocal(categoryName),
  );
};
import AsyncStorage from '@react-native-async-storage/async-storage';
import SQLite from 'react-native-sqlite-storage';

import {dataApi} from './apiService';

SQLite.enablePromise(true);
SQLite.DEBUG(__DEV__);

const DATABASE_NAME = 'dayddy.db';

let dbInstance = null;

export const getDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await SQLite.openDatabase({
    name: DATABASE_NAME,
    location: 'default',
  });

  await initDatabase(dbInstance);
  return dbInstance;
};

const ensureColumnExists = async (db, tableName, columnName, columnType) => {
  const [result] = await db.executeSql(`PRAGMA table_info(${tableName})`);
  const columns = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    columns.push(result.rows.item(i).name);
  }

  if (!columns.includes(columnName)) {
    await db.executeSql(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
  }
};

export const initDatabase = async (db) => {
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL DEFAULT 0,
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

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL DEFAULT 0,
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

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL UNIQUE,
      created_at  TEXT    DEFAULT (datetime('now'))
    );
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS event_categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL UNIQUE,
      created_at  TEXT    DEFAULT (datetime('now'))
    );
  `);

  await ensureColumnExists(db, 'tasks', 'user_id', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumnExists(db, 'events', 'user_id', 'INTEGER NOT NULL DEFAULT 0');

  console.log('[DB] Database tables initialized');
};

const rowsToArray = (results) => {
  const arr = [];
  for (let i = 0; i < results.rows.length; i += 1) {
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

const parseUserId = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const getCurrentUserId = async () => {
  const stored = await AsyncStorage.getItem('userId');
  return parseUserId(stored);
};

const getCloudUserId = async () => {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Missing user_id for cloud request.');
  }
  return userId;
};

const getScopedLocalUserId = async () => {
  const userId = await getCurrentUserId();
  return userId || 0;
};

const normalizeTask = (task = {}, userId = 0) => ({
  user_id: userId,
  title: task.title,
  description: task.description ?? '',
  due_date: task.due_date ?? '',
  due_time: task.due_time ?? '',
  priority: task.priority ?? 'medium',
  tag: task.tag ?? 'general',
  reminder: task.reminder ?? 1,
  completed: task.completed ?? 0,
});

const normalizeEvent = (event = {}, userId = 0) => ({
  user_id: userId,
  title: event.title,
  event_date: event.event_date ?? '',
  event_time: event.event_time ?? '',
  tag: event.tag ?? 'general',
  reminder: event.reminder ?? 1,
  notes: event.notes ?? '',
});

const createTaskLocal = async (task, userId) => {
  const db = await getDB();
  const payload = normalizeTask(task, userId);

  const [result] = await db.executeSql(
    `INSERT INTO tasks (user_id, title, description, due_date, due_time, priority, tag, reminder, completed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.user_id,
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

const updateTaskLocal = async (taskId, task, userId) => {
  const db = await getDB();
  const payload = normalizeTask(task, userId);

  await db.executeSql(
    `UPDATE tasks
     SET title = ?, description = ?, due_date = ?, due_time = ?, priority = ?, tag = ?, reminder = ?, completed = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`,
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
      userId,
    ],
  );
};

const getTasksLocal = async (completedOnly = null, userId = 0) => {
  const db = await getDB();
  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [userId];

  if (completedOnly !== null) {
    query += ' AND completed = ?';
    params.push(completedOnly ? 1 : 0);
  }

  query += ' ORDER BY created_at DESC, id DESC';
  const [results] = await db.executeSql(query, params);
  return rowsToArray(results);
};

const getTaskByIdLocal = async (id, userId = 0) => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT * FROM tasks WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
  const rows = rowsToArray(results);
  return rows.length > 0 ? rows[0] : null;
};

const toggleTaskCompleteLocal = async (id, userId = 0) => {
  const db = await getDB();
  await db.executeSql(
    'UPDATE tasks SET completed = 1 - completed, updated_at = datetime("now") WHERE id = ? AND user_id = ?',
    [id, userId],
  );
};

const deleteTaskLocal = async (id, userId = 0) => {
  const db = await getDB();
  await db.executeSql('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
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

const createEventLocal = async (event, userId) => {
  const db = await getDB();
  const payload = normalizeEvent(event, userId);

  const [result] = await db.executeSql(
    `INSERT INTO events (user_id, title, event_date, event_time, tag, reminder, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.user_id,
      payload.title,
      payload.event_date,
      payload.event_time,
      payload.tag,
      payload.reminder,
      payload.notes,
    ],
  );

  return result.insertId;
};

const updateEventLocal = async (eventId, event, userId) => {
  const db = await getDB();
  const payload = normalizeEvent(event, userId);

  await db.executeSql(
    `UPDATE events
     SET title = ?, event_date = ?, event_time = ?, tag = ?, reminder = ?, notes = ?, updated_at = datetime('now')
     WHERE id = ? AND user_id = ?`,
    [
      payload.title,
      payload.event_date,
      payload.event_time,
      payload.tag,
      payload.reminder,
      payload.notes,
      eventId,
      userId,
    ],
  );
};

const getEventsLocal = async (userId = 0) => {
  const db = await getDB();
  const [results] = await db.executeSql(
    'SELECT * FROM events WHERE user_id = ? ORDER BY event_date ASC, event_time ASC, id ASC',
    [userId],
  );
  return rowsToArray(results);
};

const getEventByIdLocal = async (id, userId = 0) => {
  const db = await getDB();
  const [results] = await db.executeSql('SELECT * FROM events WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
  const rows = rowsToArray(results);
  return rows.length > 0 ? rows[0] : null;
};

const deleteEventLocal = async (id, userId = 0) => {
  const db = await getDB();
  await db.executeSql('DELETE FROM events WHERE id = ? AND user_id = ?', [id, userId]);
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

const syncTasksToLocal = async (tasks, userId) => {
  const db = await getDB();
  await db.executeSql('DELETE FROM tasks WHERE user_id = ?', [userId]);

  for (const task of tasks) {
    await db.executeSql(
      `INSERT OR REPLACE INTO tasks
       (id, user_id, title, description, due_date, due_time, priority, tag, reminder, completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        userId,
        task.title,
        task.description ?? '',
        task.due_date ?? '',
        task.due_time ?? '',
        task.priority ?? 'medium',
        task.tag ?? 'general',
        task.reminder ?? 1,
        task.completed ?? 0,
        task.created_at ?? null,
        task.updated_at ?? null,
      ],
    );
  }
};

const syncEventsToLocal = async (events, userId) => {
  const db = await getDB();
  await db.executeSql('DELETE FROM events WHERE user_id = ?', [userId]);

  for (const event of events) {
    await db.executeSql(
      `INSERT OR REPLACE INTO events
       (id, user_id, title, event_date, event_time, tag, reminder, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.id,
        userId,
        event.title,
        event.event_date ?? '',
        event.event_time ?? '',
        event.tag ?? 'general',
        event.reminder ?? 1,
        event.notes ?? '',
        event.created_at ?? null,
        event.updated_at ?? null,
      ],
    );
  }
};

export const syncCloudDataAfterLogin = async (explicitUserId) => {
  const userId = parseUserId(explicitUserId) || (await getCloudUserId());

  const [tasksResponse, eventsResponse] = await Promise.all([
    dataApi.get('/tasks', {params: {user_id: userId}}),
    dataApi.get('/events', {params: {user_id: userId}}),
  ]);

  const cloudTasks = tasksResponse.data || [];
  const cloudEvents = eventsResponse.data || [];

  await syncTasksToLocal(cloudTasks, userId);
  await syncEventsToLocal(cloudEvents, userId);

  return {
    tasks: cloudTasks.length,
    events: cloudEvents.length,
  };
};

export const createTask = async (task) => {
  if (!task?.title || !String(task.title).trim()) {
    throw new Error('Task title is required.');
  }

  return withFallback(
    'Task create',
    async () => {
      const userId = await getCloudUserId();
      const response = await dataApi.post('/tasks', normalizeTask(task, userId));
      return response.data?.id ?? null;
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return createTaskLocal(task, localUserId);
    },
  );
};

export const updateTask = async (taskId, task) => {
  return withFallback(
    'Task update',
    async () => {
      const userId = await getCloudUserId();
      const response = await dataApi.put(`/tasks/${taskId}`, {id: taskId, ...normalizeTask(task, userId)});
      return response.data || null;
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return updateTaskLocal(taskId, task, localUserId);
    },
  );
};

export const getTasks = async (completedOnly = null) => {
  return withFallback(
    'Task fetch',
    async () => {
      const userId = await getCloudUserId();
      const params = {
        user_id: userId,
        ...(completedOnly === null ? {} : {completed_only: Boolean(completedOnly)}),
      };
      const response = await dataApi.get('/tasks', {params});
      return response.data || [];
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return getTasksLocal(completedOnly, localUserId);
    },
  );
};

export const getTaskById = async (id) => {
  return withFallback(
    'Task fetch by id',
    async () => {
      const userId = await getCloudUserId();
      const response = await dataApi.get(`/tasks/${id}`, {params: {user_id: userId}});
      return response.data || null;
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return getTaskByIdLocal(id, localUserId);
    },
  );
};

export const toggleTaskComplete = async (id) => {
  return withFallback(
    'Task toggle complete',
    async () => {
      const userId = await getCloudUserId();
      const currentResponse = await dataApi.get(`/tasks/${id}`, {params: {user_id: userId}});
      const currentTask = currentResponse.data;
      if (!currentTask) {
        return null;
      }

      const nextCompleted = currentTask.completed === 1 ? 0 : 1;
      await dataApi.patch(`/tasks/${id}/complete`, {completed: nextCompleted}, {params: {user_id: userId}});
      return nextCompleted;
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return toggleTaskCompleteLocal(id, localUserId);
    },
  );
};

export const deleteTask = async (id) => {
  return withFallback(
    'Task delete',
    async () => {
      const userId = await getCloudUserId();
      const response = await dataApi.delete(`/tasks/${id}`, {params: {user_id: userId}});
      return response.data || null;
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return deleteTaskLocal(id, localUserId);
    },
  );
};

export const createCategory = async (categoryName) => {
  return withFallback(
    'Task category create',
    async () => {
      const response = await dataApi.post('/categories', {name: categoryName.trim()});
      return response.data?.name ?? categoryName.trim();
    },
    () => createCategoryLocal(categoryName),
  );
};

export const getCategories = async () => {
  return withFallback(
    'Task category fetch',
    async () => {
      const response = await dataApi.get('/categories');
      return response.data || [];
    },
    () => getCategoriesLocal(),
  );
};

export const createEvent = async (event) => {
  if (!event?.title || !String(event.title).trim()) {
    throw new Error('Event title is required.');
  }

  return withFallback(
    'Event create',
    async () => {
      const userId = await getCloudUserId();
      const response = await dataApi.post('/events', normalizeEvent(event, userId));
      return response.data?.id ?? null;
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return createEventLocal(event, localUserId);
    },
  );
};

export const updateEvent = async (eventId, event) => {
  return withFallback(
    'Event update',
    async () => {
      const userId = await getCloudUserId();
      const response = await dataApi.put(`/events/${eventId}`, {id: eventId, ...normalizeEvent(event, userId)});
      return response.data || null;
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return updateEventLocal(eventId, event, localUserId);
    },
  );
};

export const getEvents = async () => {
  return withFallback(
    'Event fetch',
    async () => {
      const userId = await getCloudUserId();
      const response = await dataApi.get('/events', {params: {user_id: userId}});
      return response.data || [];
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return getEventsLocal(localUserId);
    },
  );
};

export const getEventById = async (id) => {
  return withFallback(
    'Event fetch by id',
    async () => {
      const userId = await getCloudUserId();
      const response = await dataApi.get(`/events/${id}`, {params: {user_id: userId}});
      return response.data || null;
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return getEventByIdLocal(id, localUserId);
    },
  );
};

export const deleteEvent = async (id) => {
  return withFallback(
    'Event delete',
    async () => {
      const userId = await getCloudUserId();
      const response = await dataApi.delete(`/events/${id}`, {params: {user_id: userId}});
      return response.data || null;
    },
    async () => {
      const localUserId = await getScopedLocalUserId();
      return deleteEventLocal(id, localUserId);
    },
  );
};

export const getEventCategories = async () => {
  return withFallback(
    'Event category fetch',
    async () => {
      const response = await dataApi.get('/event-categories');
      return response.data || [];
    },
    () => getEventCategoriesLocal(),
  );
};

export const createEventCategory = async (categoryName) => {
  return withFallback(
    'Event category create',
    async () => {
      const response = await dataApi.post('/event-categories', {name: categoryName.trim()});
      return response.data?.name ?? categoryName.trim();
    },
    () => createEventCategoryLocal(categoryName),
  );
};

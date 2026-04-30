import axios from 'axios';

const CLOUD_HOST = '172.30.224.1'; 
const FALLBACK_API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const authApi = axios.create({
  baseURL: `http://${CLOUD_HOST}:5001/api`, // Updated to 5001
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export const dataApi = axios.create({
  baseURL: `http://${CLOUD_HOST}:8000/api`, 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export async function loginToAuth(payload) {
  const response = await authApi.post('/login', payload);
  return response.data;
}

export async function registerToAuth(payload) {
  const response = await authApi.post('/register', payload);
  return response.data;
}

export async function syncProfileToCloud(profile) {
  const response = await axios.post(`${FALLBACK_API_BASE_URL}/users`, profile, {
    timeout: 5000,
  });
  return response.data;
}

export async function fetchAdminDashboardData() {
  const [usersResponse, todosResponse, postsResponse] = await Promise.all([
    axios.get(`${FALLBACK_API_BASE_URL}/users`, { timeout: 5000 }),
    axios.get(`${FALLBACK_API_BASE_URL}/todos`, { timeout: 5000 }),
    axios.get(`${FALLBACK_API_BASE_URL}/posts`, { timeout: 5000 }),
  ]);

  const users = usersResponse.data || [];
  const todos = todosResponse.data || [];
  const posts = postsResponse.data || [];

  const completedCount = todos.filter(item => item.completed).length;
  const completionRate = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  return {
    stats: {
      users: users.length,
      events: posts.length,
      tasksCompleted: completedCount,
      completionRate,
    },
    activityData: [12, 18, 16, 25, 21, 28, 30],
  };
}
import axios from 'axios';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export async function syncProfileToCloud(profile) {
  const response = await axios.post(`${API_BASE_URL}/users`, profile, {
    timeout: 5000,
  });
  return response.data;
}

export async function fetchAdminDashboardData() {
  const [usersResponse, todosResponse, postsResponse] = await Promise.all([
    axios.get(`${API_BASE_URL}/users`, { timeout: 5000 }),
    axios.get(`${API_BASE_URL}/todos`, { timeout: 5000 }),
    axios.get(`${API_BASE_URL}/posts`, { timeout: 5000 }),
  ]);

  const users = usersResponse.data || [];
  const todos = todosResponse.data || [];
  const posts = postsResponse.data || [];

  const completedCount = todos.filter(item => item.completed).length;
  const completionRate = todos.length
    ? Math.round((completedCount / todos.length) * 100)
    : 0;

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

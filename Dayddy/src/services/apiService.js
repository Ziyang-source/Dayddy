import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLOUD_HOST = '172.30.224.1'; 
const FALLBACK_API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const authApi = axios.create({
  baseURL: `http://${CLOUD_HOST}:5001/api`, 
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

export const syncProfileToCloud = async (profile) => {
  try {
    const oldEmail = await AsyncStorage.getItem('userEmail');
    const response = await authApi.put('/users/update', {
      name: profile.name,
      email: profile.email,
      oldEmail: oldEmail
    });
    
    return response.data;
  } catch (error) {
    console.error('Sync Profile Error:', error);
    throw error;
  }
};

export const getUserStats = async (email) => {
  try {
    const response = await dataApi.get(`/user/stats?email=${encodeURIComponent(email)}`);
    console.log("Profile Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Stats Error:", error);
    return { totalTasks: 0, totalEvents: 0 };
  }
};

export async function fetchAdminDashboardData() {
  try {
    const userRes = await axios.get(`http://172.30.224.1:5001/api/users`);
    
    const pythonStatsRes = await dataApi.get('/admin/stats'); 

    return {
      stats: {
        users: userRes.data.length,
        events: pythonStatsRes.data.stats.events,
        tasksCompleted: pythonStatsRes.data.stats.tasksCompleted,
        completionRate: pythonStatsRes.data.stats.completionRate,
      },
      activityData: pythonStatsRes.data.activityData,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
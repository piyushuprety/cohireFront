import axios from 'axios';
import { authService } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const taskService = {
  getTasks: async (page = 1, search = '', status = '') => {
    try {
      const response = await api.get('/tasks', {
        params: {
          page,
          limit: 5,
          search,
          status
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch tasks';
    }
  },

  createTask: async (task) => {
    try {
      const response = await api.post('/tasks', task);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create task';
    }
  },

  updateTask: async (id, task) => {
    try {
      const response = await api.put(`/tasks/${id}`, task);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update task';
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete task';
    }
  },

  importTasks: async (sheetUrl) => {
    try {
      const response = await api.post('/tasks/import', { sheetUrl });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to import tasks';
    }
  }
};

export default taskService; 
import axios from 'axios';
import {
  User,
  Lead,
  CallRecord,
  DashboardMetrics,
  CallTrend,
  RegisterUserData,
  CallStatus,
  ResponseStatus
} from '../types/types';

// Create axios instance with base URL and default headers
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
  withCredentials: true, // Enable cookies for cross-origin requests if needed
});

// Add request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('crm_user');
          window.location.href = '/';
          break;
        case 403:
          console.error('Access forbidden:', error.response.data);
          break;
        case 404:
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
      }
    } else if (error.request) {
      console.error('Network error - no response received');
    } else {
      console.error('Request configuration error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/users/login', { email, password });
    return response.data;
  },
  register: async (userData: RegisterUserData) => {
    const response = await apiClient.post('/users/register', userData);
    return response.data;
  },
  getUserProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },
  updateUserProfile: async (userData: Partial<User>) => {
    const response = await apiClient.put('/users/profile', userData);
    return response.data;
  },
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },
};

// Leads API
export const leadsAPI = {
  getLeads: async () => {
    const response = await apiClient.get('/leads');
    return response.data;
  },
  getLeadById: async (id: string) => {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data;
  },
  createLead: async (leadData: Partial<Lead>) => {
    const response = await apiClient.post('/leads', leadData);
    return response.data;
  },
  updateLead: async (id: string, leadData: Partial<Lead>) => {
    const response = await apiClient.put(`/leads/${id}`, leadData);
    return response.data;
  },
  deleteLead: async (id: string) => {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  },
  updateLeadStatus: async (
    id: string,
    statusData: { callStatus: CallStatus; responseStatus: ResponseStatus }
  ) => {
    const response = await apiClient.put(`/leads/${id}/status`, statusData);
    return response.data;
  },
};

// Call Records API
export const callRecordsAPI = {
  getCallRecords: async () => {
    const response = await apiClient.get('/call-records');
    return response.data;
  },
  getCallRecordById: async (id: string) => {
    const response = await apiClient.get(`/call-records/${id}`);
    return response.data;
  },
  createCallRecord: async (callData: {
    leadId: string;
    callStatus: CallStatus;
    responseStatus: ResponseStatus;
  }) => {
    const response = await apiClient.post('/call-records', callData);
    return response.data;
  },
  getCallRecordsByLead: async (leadId: string) => {
    const response = await apiClient.get(`/call-records/lead/${leadId}`);
    return response.data;
  },
  getDashboardMetrics: async () => {
    const response = await apiClient.get('/call-records/metrics');
    return response.data as DashboardMetrics;
  },
  getCallTrends: async () => {
    const response = await apiClient.get('/call-records/trends');
    return response.data as CallTrend[];
  },
};

export default apiClient;

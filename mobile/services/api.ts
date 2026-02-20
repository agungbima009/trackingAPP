import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/config/api.config';
import {
  AuthResponse,
  CurrentUserResponse,
  AuthMessageResponse,
  RefreshTokenResponse,
  LoginRequest,
  RegisterRequest,
  GetMyTasksResponse,
  StartTaskResponse,
  CompleteTaskResponse,
  RecordLocationResponse,
  RecordBatchLocationsResponse,
  BatchLocationRequest,
  GetMyLocationsResponse,
  GetTaskLocationsResponse,
  GetRouteResponse,
  LocationStatisticsResponse,
  UserProfile,
} from '@/types';

// API Base URL is imported from config/api.config.ts
// Uncomment the appropriate URL based on your device

// Log the API base URL for debugging
console.log('API_BASE_URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Log detailed error information
    console.log('=== API Error ===');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Response status:', error.response?.status);
    console.log('Response data:', error.response?.data);
    console.log('Request URL:', error.config?.url);
    console.log('Request baseURL:', error.config?.baseURL);
    console.log('=================');

    if (error.response?.status === 401) {
      // Token expired or invalid
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userEmail');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.error('Error clearing storage:', e);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Login with email and password
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      });

      // Save token and user data
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('userEmail', email);
        if (response.data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }

      return response.data;
    } catch (error: any) {
      console.log('=== Login Error Details ===');
      console.log('Error type:', error.constructor.name);
      console.log('Error message:', error.message);
      console.log('Error code:', error.code); // ECONNREFUSED, ECONNABORTED, etc
      console.log('Response:', error.response);
      console.log('Request:', error.request);
      console.log('===========================');

      // Provide more detailed error messages
      let errorMessage = 'Login failed. Please try again.';

      if (error.code === 'ECONNREFUSED') {
        errorMessage = `Cannot connect to server at ${API_BASE_URL}. Make sure backend is running.`;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Server is not responding (check if backend is running).';
      } else if (error.message === 'Network Error') {
        errorMessage = `Network Error: Cannot reach ${API_BASE_URL}. Check:\n1. Backend is running (php artisan serve)\n2. IP address is correct\n3. Device and server are on same network`;
      } else if (error.response?.status === 422) {
        errorMessage = error.response?.data?.message || 'Validation error';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      throw new Error(errorMessage);
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    try {
      const response = await api.get<CurrentUserResponse>('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  // Logout
  logout: async (): Promise<AuthMessageResponse> => {
    try {
      const response = await api.post<AuthMessageResponse>('/auth/logout');
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('user');
      return response.data;
    } catch (error: any) {
      // Clear local storage even if API call fails
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('user');
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  },

  // Refresh token
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    try {
      const response = await api.post<RefreshTokenResponse>('/auth/refresh-token');
      if (response.data.token) {
        await AsyncStorage.setItem('userToken', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to refresh token');
    }
  },

  // Register new user
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
        password_confirmation: password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },
};

// Employee Tasks API calls
export const tasksAPI = {
  // Get my tasks
  getMyTasks: async (
    status?: string,
    date?: string
  ): Promise<GetMyTasksResponse> => {
    try {
      const params: any = {};
      if (status) params.status = status;
      if (date) params.date = date;

      const response = await api.get<GetMyTasksResponse>('/my-tasks', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
    }
  },

  // Start task
  startTask: async (assignmentId: string): Promise<StartTaskResponse> => {
    try {
      const response = await api.put<StartTaskResponse>(
        `/my-tasks/${assignmentId}/start`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to start task');
    }
  },

  // Complete task
  completeTask: async (assignmentId: string): Promise<CompleteTaskResponse> => {
    try {
      const response = await api.put<CompleteTaskResponse>(
        `/my-tasks/${assignmentId}/complete`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to complete task');
    }
  },

  // Get my task statistics
  getMyStatistics: async (): Promise<any> => {
    try {
      const response = await api.get('/my-tasks/statistics');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  },

  // Get task assignment details with team members
  getTakenTaskDetail: async (takenTaskId: string): Promise<any> => {
    try {
      const response = await api.get(`/my-tasks/${takenTaskId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch task assignment');
    }
  },
};

// Location Tracking API calls
export const locationsAPI = {
  // Record single location
  recordLocation: async (
    takenTaskId: string,
    latitude: number,
    longitude: number,
    accuracy?: number,
    address?: string
  ): Promise<RecordLocationResponse> => {
    try {
      const response = await api.post<RecordLocationResponse>('/locations', {
        taken_task_id: takenTaskId,
        latitude,
        longitude,
        accuracy: accuracy || 0,
        address: address || '',
        tracking_status: 'auto',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to record location');
    }
  },

  // Record multiple locations in batch
  recordBatchLocations: async (
    locations: BatchLocationRequest[]
  ): Promise<RecordBatchLocationsResponse> => {
    try {
      const response = await api.post<RecordBatchLocationsResponse>(
        '/locations/batch',
        {
          locations,
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to record locations'
      );
    }
  },

  // Get my locations
  getMyLocations: async (page = 1, perPage = 50): Promise<GetMyLocationsResponse> => {
    try {
      const response = await api.get<GetMyLocationsResponse>('/locations/my', {
        params: {
          page,
          per_page: perPage,
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch locations');
    }
  },

  // Get locations for a task
  getTaskLocations: async (
    takenTaskId: string
  ): Promise<GetTaskLocationsResponse> => {
    try {
      const response = await api.get<GetTaskLocationsResponse>(
        `/locations/tasks/${takenTaskId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch task locations'
      );
    }
  },

  // Get route for a task
  getTaskRoute: async (takenTaskId: string, userId?: string): Promise<GetRouteResponse> => {
    try {
      const params: any = {};
      if (userId) params.user_id = userId;

      const response = await api.get<GetRouteResponse>(
        `/locations/tasks/${takenTaskId}/route`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch route');
    }
  },

  // Get location statistics
  getLocationStatistics: async (
    startDate?: string,
    endDate?: string
  ): Promise<LocationStatisticsResponse> => {
    try {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get<LocationStatisticsResponse>(
        '/locations/my/statistics',
        { params }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch statistics'
      );
    }
  },
};

// User Profile API calls
export const profileAPI = {
  // Get current user profile
  getProfile: async (): Promise<CurrentUserResponse> => {
    try {
      const response = await api.get<CurrentUserResponse>('/auth/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  // Update profile
  updateProfile: async (
    name?: string,
    phoneNumber?: string,
    department?: string,
    position?: string,
    address?: string
  ): Promise<CurrentUserResponse> => {
    try {
      const data: any = {};
      if (name) data.name = name;
      if (phoneNumber) data.phone_number = phoneNumber;
      if (department) data.department = department;
      if (position) data.position = position;
      if (address) data.address = address;

      const response = await api.put<CurrentUserResponse>('/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },
};

// Report API calls
export const reportsAPI = {
  // Create a new report
  createReport: async (
    takenTaskId: string,
    report: string,
    photos: string[]
  ): Promise<any> => {
    try {
      const response = await api.post('/reports', {
        taken_task_id: takenTaskId,
        report: report,
        photos: photos, // Array of base64 encoded images
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to create report'
      );
    }
  },

  // Get my reports
  getMyReports: async (
    startDate?: string,
    endDate?: string,
    perPage: number = 15
  ): Promise<any> => {
    try {
      const params: any = { per_page: perPage };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/reports/my', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch reports'
      );
    }
  },

  // Get report details
  getReportDetails: async (reportId: string): Promise<any> => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch report details'
      );
    }
  },

  // Update report
  updateReport: async (
    reportId: string,
    report: string,
    photos?: string[]
  ): Promise<any> => {
    try {
      const data: any = { report };
      if (photos) {
        data.photos = photos;
      }

      const response = await api.put(`/reports/${reportId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update report'
      );
    }
  },

  // Get my report statistics
  getMyStatistics: async (): Promise<any> => {
    try {
      const response = await api.get('/reports/statistics/my');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch statistics'
      );
    }
  },
};

export default api;

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Don't send cookies, we use Bearer tokens
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION SERVICES
// ============================================

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Login response with token and user data
 */
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise} Registration response
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

/**
 * Logout user (current device)
 * @returns {Promise} Logout response
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Logout from all devices
 * @returns {Promise} Logout response
 */
export const logoutAll = async () => {
  try {
    await api.post('/auth/logout-all');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

/**
 * Get current user
 * @returns {Promise} Current user data
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Refresh authentication token
 * @returns {Promise} New token
 */
export const refreshToken = async () => {
  const response = await api.post('/auth/refresh-token');
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

// ============================================
// USER MANAGEMENT SERVICES (Admin)
// ============================================

/** * Create new user (Admin only)
 * @param {Object} userData - New user data (name, email, password, role)
 * @returns {Promise} Created user
 */
export const createUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

/** * Get all users (Admin)
 * @param {Object} filters - Query parameters
 * @returns {Promise} Users list
 */
export const getUsers = async (filters = {}) => {
  const response = await api.get('/admin/users', { params: filters });
  return response.data;
};

/**
 * Get user details
 * @param {string} userId - User ID
 * @returns {Promise} User details
 */
export const getUserDetails = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise} Updated user
 */
export const updateUserProfile = async (userId, userData) => {
  const response = await api.put(`/profile/${userId}`, userData);
  return response.data;
};

/**
 * Update user status
 * @param {string} userId - User ID
 * @param {string} status - New status (active/inactive)
 * @returns {Promise} Updated user
 */
export const updateUserStatus = async (userId, status) => {
  const response = await api.put(`/admin/users/${userId}/status`, { status });
  return response.data;
};

/**
 * Delete user (Superadmin only)
 * @param {string} userId - User ID
 * @returns {Promise} Delete response
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

/**
 * Get departments list
 * @returns {Promise} Departments
 */
export const getDepartments = async () => {
  const response = await api.get('/admin/departments');
  return response.data;
};

// ============================================
// TASK MANAGEMENT SERVICES (Admin)
// ============================================

/**
 * Get all tasks
 * @param {Object} filters - Query parameters
 * @returns {Promise} Tasks list
 */
export const getTasks = async (filters = {}) => {
  const response = await api.get('/admin/tasks', { params: filters });
  return response.data;
};

/**
 * Create new task
 * @param {Object} taskData - Task data
 * @returns {Promise} Created task
 */
export const createTask = async (taskData) => {
  const response = await api.post('/admin/tasks', taskData);
  return response.data;
};

/**
 * Get task details
 * @param {string} taskId - Task ID
 * @returns {Promise} Task details
 */
export const getTaskDetails = async (taskId) => {
  const response = await api.get(`/admin/tasks/${taskId}`);
  return response.data;
};

/**
 * Update task
 * @param {string} taskId - Task ID
 * @param {Object} taskData - Updated task data
 * @returns {Promise} Updated task
 */
export const updateTask = async (taskId, taskData) => {
  const response = await api.put(`/admin/tasks/${taskId}`, taskData);
  return response.data;
};

/**
 * Delete task
 * @param {string} taskId - Task ID
 * @returns {Promise} Delete response
 */
export const deleteTask = async (taskId) => {
  const response = await api.delete(`/admin/tasks/${taskId}`);
  return response.data;
};

/**
 * Assign task to users
 * @param {string} taskId - Task ID
 * @param {Array} userIds - Array of user IDs
 * @param {string} startTime - Start time (ISO format)
 * @param {string} date - Date (Y-m-d)
 * @returns {Promise} Assignment data
 */
export const assignTask = async (taskId, userIds, startTime, date) => {
  const response = await api.post(`/admin/tasks/${taskId}/assign`, {
    user_ids: userIds,
    start_time: startTime,
    date: date
  });
  return response.data;
};

/**
 * Get task statistics
 * @returns {Promise} Task statistics
 */
export const getTaskStatistics = async () => {
  const response = await api.get('/admin/tasks/statistics');
  return response.data;
};

/**
 * Get tasks by location
 * @returns {Promise} Tasks grouped by location
 */
export const getTasksByLocation = async () => {
  const response = await api.get('/admin/tasks/by-location');
  return response.data;
};

/**
 * Mark task as completed (admin action after report submitted)
 * @param {string} taskId - Task ID
 * @returns {Promise} Updated task
 */
export const markTaskAsCompleted = async (taskId) => {
  const response = await api.post(`/admin/tasks/${taskId}/mark-completed`);
  return response.data;
};

// ============================================
// TASK ASSIGNMENT SERVICES (Admin)
// ============================================

/**
 * Get all assignments
 * @param {Object} filters - Query parameters
 * @returns {Promise} Assignments list
 */
export const getAssignments = async (filters = {}) => {
  const response = await api.get('/admin/assignments', { params: filters });
  return response.data;
};

/**
 * Create assignment
 * @param {Object} assignmentData - Assignment data
 * @returns {Promise} Created assignment
 */
export const createAssignment = async (assignmentData) => {
  const response = await api.post('/admin/assignments', assignmentData);
  return response.data;
};

/**
 * Get assignment details
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise} Assignment details
 */
export const getAssignmentDetails = async (assignmentId) => {
  const response = await api.get(`/admin/assignments/${assignmentId}`);
  return response.data;
};

/**
 * Update assignment
 * @param {string} assignmentId - Assignment ID
 * @param {Object} assignmentData - Updated assignment data
 * @returns {Promise} Updated assignment
 */
export const updateAssignment = async (assignmentId, assignmentData) => {
  const response = await api.put(`/admin/assignments/${assignmentId}`, assignmentData);
  return response.data;
};

/**
 * Cancel assignment
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise} Updated assignment
 */
export const cancelAssignment = async (assignmentId) => {
  const response = await api.put(`/admin/assignments/${assignmentId}/cancel`);
  return response.data;
};

/**
 * Delete assignment
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise} Delete response
 */
export const deleteAssignment = async (assignmentId) => {
  const response = await api.delete(`/admin/assignments/${assignmentId}`);
  return response.data;
};

/**
 * Get user statistics
 * @param {string} userId - User ID
 * @returns {Promise} User statistics
 */
export const getUserStatistics = async (userId) => {
  const response = await api.get(`/admin/users/${userId}/statistics`);
  return response.data;
};

// ============================================
// EMPLOYEE TASK SERVICES
// ============================================

/**
 * Get my tasks (Employee)
 * @param {Object} filters - Query parameters
 * @returns {Promise} My tasks list
 */
export const getMyTasks = async (filters = {}) => {
  const response = await api.get('/my-tasks', { params: filters });
  return response.data;
};

/**
 * Start task (Employee)
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise} Updated assignment
 */
export const startTask = async (assignmentId) => {
  const response = await api.put(`/my-tasks/${assignmentId}/start`);
  return response.data;
};

/**
 * Complete task (Employee)
 * @param {string} assignmentId - Assignment ID
 * @returns {Promise} Updated assignment
 */
export const completeTask = async (assignmentId) => {
  const response = await api.put(`/my-tasks/${assignmentId}/complete`);
  return response.data;
};

// ============================================
// LOCATION TRACKING SERVICES
// ============================================

/**
 * Record single location (Employee)
 * @param {Object} locationData - Location data
 * @returns {Promise} Created location
 */
export const recordLocation = async (locationData) => {
  const response = await api.post('/locations', locationData);
  return response.data;
};

/**
 * Record multiple locations (Employee)
 * @param {Array} locations - Array of location data
 * @returns {Promise} Created locations
 */
export const recordBatchLocations = async (locations) => {
  const response = await api.post('/locations/batch', { locations });
  return response.data;
};

/**
 * Get my location history (Employee)
 * @param {Object} filters - Query parameters
 * @returns {Promise} My locations
 */
export const getMyLocations = async (filters = {}) => {
  const response = await api.get('/locations/my', { params: filters });
  return response.data;
};

/**
 * Get my location statistics (Employee)
 * @param {Object} dateRange - Date range filters
 * @returns {Promise} Location statistics
 */
export const getMyLocationStatistics = async (dateRange = {}) => {
  const response = await api.get('/locations/my/statistics', { params: dateRange });
  return response.data;
};

/**
 * Get task locations (Employee)
 * @param {string} takenTaskId - Taken task ID
 * @returns {Promise} Task locations
 */
export const getTaskLocations = async (takenTaskId) => {
  const response = await api.get(`/locations/tasks/${takenTaskId}`);
  return response.data;
};

/**
 * Get task route (Employee)
 * @param {string} takenTaskId - Taken task ID
 * @returns {Promise} Task route with statistics
 */
export const getTaskRoute = async (takenTaskId) => {
  const response = await api.get(`/locations/tasks/${takenTaskId}/route`);
  return response.data;
};

// ============================================
// ADMIN LOCATION MANAGEMENT SERVICES
// ============================================

/**
 * Get current locations for task (Admin)
 * @param {string} takenTaskId - Taken task ID
 * @returns {Promise} Current locations
 */
export const getCurrentTaskLocations = async (takenTaskId) => {
  const response = await api.get(`/admin/locations/tasks/${takenTaskId}/current`);
  return response.data;
};

/**
 * Get task location statistics (Admin)
 * @param {string} takenTaskId - Taken task ID
 * @returns {Promise} Location statistics
 */
export const getTaskLocationStatistics = async (takenTaskId) => {
  const response = await api.get(`/admin/locations/tasks/${takenTaskId}/statistics`);
  return response.data;
};

/**
 * Get user location statistics (Admin)
 * @param {string} userId - User ID
 * @param {Object} dateRange - Date range filters
 * @returns {Promise} User location statistics
 */
export const getUserLocationStatistics = async (userId, dateRange = {}) => {
  const response = await api.get(`/admin/locations/users/${userId}/statistics`, { params: dateRange });
  return response.data;
};

/**
 * Find nearby locations (Admin)
 * @param {Object} params - Search parameters (latitude, longitude, radius, etc.)
 * @returns {Promise} Nearby locations
 */
export const findNearbyLocations = async (params) => {
  const response = await api.get('/admin/locations/nearby', { params });
  return response.data;
};

/**
 * Delete location record (Admin)
 * @param {string} locationId - Location ID
 * @returns {Promise} Delete response
 */
export const deleteLocation = async (locationId) => {
  const response = await api.delete(`/admin/locations/${locationId}`);
  return response.data;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Test API connection
 * @returns {Promise} Connection test response
 */
export const testConnection = async () => {
  const response = await api.get('/test');
  return response.data;
};

/**
 * Get stored token
 * @returns {string|null} Stored token
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get stored user
 * @returns {Object|null} Stored user object
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  return !!getToken();
};

export default api;

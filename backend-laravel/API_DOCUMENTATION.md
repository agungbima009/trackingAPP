# TrackingAPP API Documentation

## Overview

This Laravel backend provides a comprehensive employee tracking system with task management, location tracking, and reporting capabilities. It uses **Laravel Sanctum** for API authentication and **Spatie Laravel Permission** for role-based access control (RBAC).

## Base URL

- Local: `http://localhost:8000/api`
- Production: Update in `.env` file

## Default Test Accounts

After running `php artisan db:seed`, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@trackingapp.com | password123 |
| Admin | admin@trackingapp.com | password123 |
| Employee | michael@trackingapp.com | password123 |

**Note:** 11 total users are seeded (1 superadmin, 2 admins, 8 employees)

## Authentication Flow

### Token-Based Authentication (Recommended for Mobile & SPA)

1. User registers or logs in
2. Server returns an API token
3. Client stores the token securely
4. Client includes token in `Authorization` header for subsequent requests

```
Authorization: Bearer <your-token-here>
```

## API Endpoints

### 🔓 Public Routes

#### Test Connection
```http
GET /api/test
```

**Response:**
```json
{
  "message": "API Connected"
}
``` 

---

### 🔐 Authentication Routes

#### Register
```http
POST /api/auth/register
```

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roles": [
      {
        "id": 3,
        "name": "user"
      }
    ],
    "permissions": []
  },
  "token": "1|xxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer"
}
```

---

#### Login
```http
POST /api/auth/login
```

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roles": [
      {
        "id": 3,
        "name": "user",
        "permissions": []
      }
    ],
    "permissions": []
  },
  "token": "2|xxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer"
}
```

---

### 🔒 Protected Routes (Require Authentication)

All protected routes require the `Authorization` header:
```
Authorization: Bearer <token>
```

#### Get Current User
```http
GET /api/auth/me
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roles": [...],
    "permissions": [...]
  }
}
```

---

#### Logout (Current Device)
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

#### Logout All Devices
```http
POST /api/auth/logout-all
```

**Response (200):**
```json
{
  "message": "Logged out from all devices successfully"
}
```

---

#### Refresh Token
```http
POST /api/auth/refresh-token
```

**Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "token": "3|xxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer"
}
```

---

### 👑 Admin Routes (Require 'admin' Role)

All admin routes require authentication + 'admin' role.

#### Get All Roles
```http
GET /api/admin/roles
```

**Response (200):**
```json
{
  "roles": [
    {
      "id": 1,
      "name": "admin",
      "permissions": [...]
    }
  ]
}
```

---

#### Create Role
```http
POST /api/admin/roles
```

**Body:**
```json
{
  "name": "moderator",
  "permissions": ["view users", "edit users"]
}
```

---

#### Get All Permissions
```http
GET /api/admin/permissions
```

---

#### Create Permission
```http
POST /api/admin/permissions
```

**Body:**
```json
{
  "name": "manage products"
}
```

---

#### Assign Role to User
```http
POST /api/admin/users/{userId}/roles
```

**Body:**
```json
{
  "role": "moderator"
}
```

---

#### Remove Role from User
```http
DELETE /api/admin/users/{userId}/roles
```

**Body:**
```json
{
  "role": "moderator"
}
```

---

#### Give Permission to User
```http
POST /api/admin/users/{userId}/permissions
```

**Body:**
```json
{
  "permission": "view users"
}
```

---

#### Revoke Permission from User
```http
DELETE /api/admin/users/{userId}/permissions
```

**Body:**
```json
{
  "permission": "view users"
}
```

---

#### Sync Role Permissions
```http
POST /api/admin/roles/{roleId}/permissions
```

**Body:**
```json
{
  "permissions": ["view users", "edit users", "delete users"]
}
```

---

## 👥 User Management Routes

### Get All Users
```http
GET /api/admin/users
```

**Query Parameters:**
- `per_page` (optional): Number of items per page (default: 15)
- `page` (optional): Page number
- `search` (optional): Search by name or email
- `department` (optional): Filter by department
- `status` (optional): Filter by status (active/inactive)
- `role` (optional): Filter by role

**Response (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "id": "uuid-here",
      "name": "Michael Smith",
      "email": "michael@trackingapp.com",
      "phone_number": "+1234567893",
      "department": "Sales",
      "position": "Sales Representative",
      "status": "active",
      "roles": ["employee"],
      "created_at": "2026-02-18T10:00:00.000000Z"
    }
  ],
  "total": 11,
  "per_page": 15
}
```

---

### Get User Details
```http
GET /api/admin/users/{id}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid-here",
    "name": "Michael Smith",
    "email": "michael@trackingapp.com",
    "phone_number": "+1234567893",
    "department": "Sales",
    "position": "Sales Representative",
    "address": "321 Field Road, Sales Town, ST 45678",
    "avatar": null,
    "status": "active",
    "roles": ["employee"],
    "permissions": [],
    "last_login_at": null,
    "created_at": "2026-02-18T10:00:00.000000Z"
  }
}
```

---

### Update User Profile
```http
PUT /api/profile/{id}
```

**Body:**
```json
{
  "name": "Michael Smith Jr.",
  "phone_number": "+1234567893",
  "department": "Sales",
  "position": "Senior Sales Representative",
  "address": "321 Field Road, Sales Town, ST 45678"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": { /* updated user data */ }
}
```

---

### Update User Status
```http
PUT /api/admin/users/{id}/status
```

**Body:**
```json
{
  "status": "inactive"
}
```

**Response (200):**
```json
{
  "message": "User status updated successfully",
  "user": { /* updated user data */ }
}
```

---

### Upload Avatar
```http
POST /api/profile/{id}/avatar
```

**Body (multipart/form-data):**
```
avatar: [image file]
```

**Response (200):**
```json
{
  "message": "Avatar uploaded successfully",
  "avatar_url": "/storage/avatars/filename.jpg"
}
```

---

### Delete User (Superadmin only)
```http
DELETE /api/admin/users/{id}
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### Get Departments
```http
GET /api/admin/departments
```

**Response (200):**
```json
{
  "departments": [
    {
      "name": "Sales",
      "count": 3
    },
    {
      "name": "Operations",
      "count": 3
    },
    {
      "name": "Logistics",
      "count": 2
    }
  ]
}
```

---

## 📋 Task Management Routes

### Get All Tasks
```http
GET /api/admin/tasks
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, in_progress, completed, cancelled)
- `location` (optional): Filter by location
- `search` (optional): Search in title/description
- `sort_by` (optional): Sort field (default: created_at)
- `sort_order` (optional): asc/desc (default: desc)
- `per_page` (optional): Items per page (default: 15)

**Response (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "task_id": "uuid-here",
      "title": "Client Meeting - Downtown Office",
      "description": "Meet with potential client...",
      "location": "123 Business Plaza, Downtown, City Center",
      "status": "pending",
      "created_at": "2026-02-18T10:00:00.000000Z",
      "taken_tasks": []
    }
  ],
  "total": 15,
  "per_page": 15
}
```

---

### Create Task
```http
POST /api/admin/tasks
```

**Body:**
```json
{
  "title": "New Task Title",
  "description": "Detailed description of the task",
  "location": "123 Main Street, City",
  "status": "pending"
}
```

**Validation Rules:**
- `title`: required, string, max 255 characters
- `description`: required, string
- `location`: required, string, max 255 characters
- `status`: required, one of: pending, in_progress, completed, cancelled

**Response (201):**
```json
{
  "message": "Task created successfully",
  "task": {
    "task_id": "uuid-here",
    "title": "New Task Title",
    "description": "Detailed description...",
    "location": "123 Main Street, City",
    "status": "pending",
    "created_at": "2026-02-18T10:00:00.000000Z",
    "updated_at": "2026-02-18T10:00:00.000000Z"
  }
}
```

---

### Get Task Details
```http
GET /api/admin/tasks/{id}
```

**Response (200):**
```json
{
  "task": {
    "task_id": "uuid-here",
    "title": "Client Meeting - Downtown Office",
    "description": "Meet with potential client...",
    "location": "123 Business Plaza, Downtown",
    "status": "in_progress",
    "created_at": "2026-02-18T10:00:00.000000Z",
    "taken_tasks": [
      {
        "taken_task_id": "uuid-here",
        "user_ids": ["user-uuid-1", "user-uuid-2"],
        "status": "in_progress",
        "start_time": "2026-02-18T08:00:00.000000Z",
        "end_time": null
      }
    ]
  },
  "statistics": {
    "total_assignments": 1,
    "completed": 0,
    "in_progress": 1,
    "pending": 0
  }
}
```

---

### Update Task
```http
PUT /api/admin/tasks/{id}
```

**Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "location": "Updated location",
  "status": "in_progress"
}
```

**Response (200):**
```json
{
  "message": "Task updated successfully",
  "task": { /* updated task data */ }
}
```

---

### Delete Task
```http
DELETE /api/admin/tasks/{id}
```

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

---

### Assign Task to Users
```http
POST /api/admin/tasks/{id}/assign
```

**Body:**
```json
{
  "user_ids": ["uuid-1", "uuid-2"],
  "start_time": "2026-02-18T08:00:00Z",
  "date": "2026-02-18"
}
```

**Response (201):**
```json
{
  "message": "Task assigned successfully",
  "assignment": {
    "taken_task_id": "uuid-here",
    "task_id": "task-uuid",
    "user_ids": ["uuid-1", "uuid-2"],
    "start_time": "2026-02-18T08:00:00.000000Z",
    "status": "pending",
    "date": "2026-02-18"
  }
}
```

---

### Get Task Statistics
```http
GET /api/admin/tasks/statistics
```

**Response (200):**
```json
{
  "total_tasks": 15,
  "pending": 6,
  "in_progress": 5,
  "completed": 4,
  "cancelled": 0,
  "completion_rate": 26.67
}
```

---

### Get Tasks by Location
```http
GET /api/admin/tasks/by-location
```

**Response (200):**
```json
{
  "locations": [
    {
      "location": "Downtown, City Center",
      "count": 3
    },
    {
      "location": "North District",
      "count": 2
    }
  ]
}
```

---

## 🎯 Task Assignment Routes

### Get All Assignments
```http
GET /api/admin/assignments
```

**Query Parameters:**
- `status` (optional): pending, in_progress, completed, cancelled
- `user_id` (optional): Filter by user
- `task_id` (optional): Filter by task
- `date` (optional): Filter by date (Y-m-d)
- `per_page` (optional): Items per page (default: 15)

**Response (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "taken_task_id": "uuid-here",
      "task_id": "task-uuid",
      "user_ids": ["user-uuid-1"],
      "start_time": "2026-02-18T08:00:00.000000Z",
      "end_time": null,
      "date": "2026-02-18",
      "status": "in_progress",
      "task": {
        "title": "Client Meeting",
        "location": "Downtown"
      },
      "users": [
        {
          "id": "user-uuid-1",
          "name": "Michael Smith"
        }
      ]
    }
  ],
  "total": 15
}
```

---

### Create Assignment
```http
POST /api/admin/assignments
```

**Body:**
```json
{
  "task_id": "task-uuid",
  "user_ids": ["user-uuid-1", "user-uuid-2"],
  "start_time": "2026-02-18T08:00:00Z",
  "date": "2026-02-18"
}
```

**Response (201):**
```json
{
  "message": "Task assignment created successfully",
  "assignment": { /* assignment data */ }
}
```

---

### Get Assignment Details
```http
GET /api/admin/assignments/{id}
```

**Response (200):**
```json
{
  "assignment": {
    "taken_task_id": "uuid-here",
    "task": { /* task details */ },
    "users": [ /* user details */ ],
    "start_time": "2026-02-18T08:00:00.000000Z",
    "end_time": null,
    "date": "2026-02-18",
    "status": "in_progress",
    "locations": [ /* location tracking data */ ]
  }
}
```

---

### Update Assignment
```http
PUT /api/admin/assignments/{id}
```

**Body:**
```json
{
  "user_ids": ["user-uuid-1"],
  "start_time": "2026-02-18T09:00:00Z",
  "end_time": "2026-02-18T17:00:00Z",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "message": "Assignment updated successfully",
  "assignment": { /* updated assignment */ }
}
```

---

### Cancel Assignment
```http
PUT /api/admin/assignments/{id}/cancel
```

**Response (200):**
```json
{
  "message": "Task assignment cancelled successfully",
  "assignment": { /* updated assignment */ }
}
```

---

### Delete Assignment
```http
DELETE /api/admin/assignments/{id}
```

**Response (200):**
```json
{
  "message": "Assignment deleted successfully"
}
```

---

### Get User Statistics
```http
GET /api/admin/users/{userId}/statistics
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Michael Smith"
  },
  "statistics": {
    "total_assignments": 5,
    "completed": 2,
    "in_progress": 2,
    "pending": 1,
    "completion_rate": 40,
    "average_completion_time_hours": 6.5
  }
}
```

---

## 👤 Employee Task Routes

### Get My Tasks
```http
GET /api/my-tasks
```

**Query Parameters:**
- `status` (optional): Filter by status
- `date` (optional): Filter by date

**Response (200):**
```json
{
  "tasks": [
    {
      "taken_task_id": "uuid-here",
      "task": {
        "task_id": "task-uuid",
        "title": "Client Meeting",
        "description": "Meet with client...",
        "location": "Downtown"
      },
      "start_time": "2026-02-18T08:00:00.000000Z",
      "end_time": null,
      "date": "2026-02-18",
      "status": "in_progress"
    }
  ]
}
```

---

### Start Task
```http
PUT /api/my-tasks/{id}/start
```

**Response (200):**
```json
{
  "message": "Task started successfully",
  "assignment": {
    "taken_task_id": "uuid",
    "status": "in_progress",
    "start_time": "2026-02-18T08:30:00.000000Z"
  }
}
```

---

### Complete Task
```http
PUT /api/my-tasks/{id}/complete
```

**Response (200):**
```json
{
  "message": "Task completed successfully",
  "assignment": {
    "taken_task_id": "uuid",
    "status": "completed",
    "end_time": "2026-02-18T17:00:00.000000Z"
  }
}
```

---

## 📍 Location Tracking Routes

### Record Location (Employee)
```http
POST /api/locations
```

**Body:**
```json
{
  "taken_task_id": "uuid-here",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10.5,
  "address": "123 Main St, City",
  "tracking_status": "auto"
}
```

**Validation Rules:**
- `taken_task_id`: required, must exist
- `latitude`: required, numeric, between -90 and 90
- `longitude`: required, numeric, between -180 and 180
- `accuracy`: optional, numeric
- `address`: optional, string
- `tracking_status`: optional, one of: auto, manual (default: auto)

**Response (201):**
```json
{
  "message": "Location recorded successfully",
  "location": {
    "location_id": "uuid-here",
    "taken_task_id": "uuid",
    "user_id": "user-uuid",
    "latitude": 40.7128,
    "longitude": -74.006,
    "accuracy": 10.5,
    "address": "123 Main St, City",
    "tracking_status": "auto",
    "recorded_at": "2026-02-18T10:30:00.000000Z"
  }
}
```

---

### Record Multiple Locations (Batch)
```http
POST /api/locations/batch
```

**Body:**
```json
{
  "locations": [
    {
      "taken_task_id": "uuid",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 10.5,
      "recorded_at": "2026-02-18T10:00:00Z"
    },
    {
      "taken_task_id": "uuid",
      "latitude": 40.7138,
      "longitude": -74.0070,
      "accuracy": 12.0,
      "recorded_at": "2026-02-18T10:05:00Z"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "2 locations recorded successfully",
  "locations": [ /* array of created locations */ ]
}
```

---

### Get My Locations
```http
GET /api/locations/my
```

**Query Parameters:**
- `taken_task_id` (optional): Filter by task
- `start_date` (optional): Date range start
- `end_date` (optional): Date range end
- `per_page` (optional): Items per page (default: 50)

**Response (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "location_id": "uuid",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 10.5,
      "address": "123 Main St",
      "tracking_status": "auto",
      "recorded_at": "2026-02-18T10:30:00.000000Z",
      "taken_task": {
        "taken_task_id": "uuid",
        "task": {
          "title": "Client Meeting"
        }
      }
    }
  ],
  "total": 95
}
```

---

### Get Task Locations
```http
GET /api/locations/tasks/{takenTaskId}
```

**Query Parameters:**
- `per_page` (optional): Items per page (default: 100)

**Response (200):**
```json
{
  "data": [
    {
      "location_id": "uuid",
      "user_id": "user-uuid",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 10.5,
      "recorded_at": "2026-02-18T10:30:00.000000Z",
      "user": {
        "id": "uuid",
        "name": "Michael Smith"
      }
    }
  ]
}
```

---

### Get Route/Path for Task
```http
GET /api/locations/tasks/{takenTaskId}/route
```

**Response (200):**
```json
{
  "route": [
    {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "recorded_at": "2026-02-18T08:00:00.000000Z"
    },
    {
      "latitude": 40.7138,
      "longitude": -74.0070,
      "recorded_at": "2026-02-18T08:15:00.000000Z"
    }
  ],
  "statistics": {
    "total_points": 15,
    "duration_hours": 8.5,
    "start_time": "2026-02-18T08:00:00.000000Z",
    "end_time": "2026-02-18T16:30:00.000000Z"
  }
}
```

---

### Get My Location Statistics
```http
GET /api/locations/my/statistics
```

**Query Parameters:**
- `start_date` (optional): Date range start
- `end_date` (optional): Date range end

**Response (200):**
```json
{
  "statistics": {
    "total_locations": 95,
    "total_tasks": 5,
    "auto_tracked": 80,
    "manual_tracked": 15,
    "average_accuracy": 15.3,
    "date_range": {
      "start": "2026-02-11",
      "end": "2026-02-18"
    }
  }
}
```

---

## 🔐 Admin Location Management Routes

### Get Current Locations for Task
```http
GET /api/admin/locations/tasks/{takenTaskId}/current
```

**Response (200):**
```json
{
  "current_locations": [
    {
      "user": {
        "id": "uuid",
        "name": "Michael Smith"
      },
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "accuracy": 10.5,
        "recorded_at": "2026-02-18T10:30:00.000000Z"
      }
    }
  ]
}
```

---

### Get Task Location Statistics
```http
GET /api/admin/locations/tasks/{takenTaskId}/statistics
```

**Response (200):**
```json
{
  "statistics": {
    "total_locations": 47,
    "users_tracking": 2,
    "duration_hours": 8.5,
    "average_accuracy": 12.3,
    "first_location": "2026-02-18T08:00:00.000000Z",
    "latest_location": "2026-02-18T16:30:00.000000Z"
  }
}
```

---

### Get User Location Statistics (Admin)
```http
GET /api/admin/locations/users/{userId}/statistics
```

**Query Parameters:**
- `start_date` (optional): Date range start
- `end_date` (optional): Date range end

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Michael Smith"
  },
  "statistics": {
    "total_locations": 95,
    "total_tasks": 5,
    "auto_tracked": 80,
    "manual_tracked": 15,
    "average_accuracy": 15.3
  }
}
```

---

### Find Nearby Locations
```http
GET /api/admin/locations/nearby
```

**Query Parameters:**
- `latitude`: required, center latitude
- `longitude`: required, center longitude
- `radius`: optional, radius in kilometers (default: 5)
- `start_date` (optional): Filter by date range
- `end_date` (optional): Filter by date range

**Response (200):**
```json
{
  "locations": [
    {
      "location_id": "uuid",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "distance_km": 2.3,
      "user": {
        "name": "Michael Smith"
      },
      "taken_task": {
        "task": {
          "title": "Client Meeting"
        }
      },
      "recorded_at": "2026-02-18T10:30:00.000000Z"
    }
  ]
}
```

---

### Delete Location Record
```http
DELETE /api/admin/locations/{locationId}
```

**Response (200):**
```json
{
  "message": "Location record deleted successfully"
}
```

---

## Frontend Integration

### React.js (Web)

```javascript
// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Task Management (Admin)
export const getTasks = async (filters = {}) => {
  const response = await api.get('/admin/tasks', { params: filters });
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await api.post('/admin/tasks', taskData);
  return response.data;
};

export const assignTask = async (taskId, userIds, startTime, date) => {
  const response = await api.post(`/admin/tasks/${taskId}/assign`, {
    user_ids: userIds,
    start_time: startTime,
    date: date
  });
  return response.data;
};

// Employee Tasks
export const getMyTasks = async () => {
  const response = await api.get('/my-tasks');
  return response.data;
};

export const startTask = async (assignmentId) => {
  const response = await api.put(`/my-tasks/${assignmentId}/start`);
  return response.data;
};

export const completeTask = async (assignmentId) => {
  const response = await api.put(`/my-tasks/${assignmentId}/complete`);
  return response.data;
};

// Location Tracking
export const recordLocation = async (locationData) => {
  const response = await api.post('/locations', locationData);
  return response.data;
};

export const getMyLocations = async () => {
  const response = await api.get('/locations/my');
  return response.data;
};

export const getTaskRoute = async (takenTaskId) => {
  const response = await api.get(`/locations/tasks/${takenTaskId}/route`);
  return response.data;
};

export default api;
```

**Example Usage in React Component:**

```javascript
// TaskList.jsx
import { useEffect, useState } from 'react';
import { getTasks } from './api';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await getTasks({ status: 'pending' });
      setTasks(data.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Tasks</h1>
      {tasks.map(task => (
        <div key={task.task_id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <span>Status: {task.status}</span>
        </div>
      ))}
    </div>
  );
}
```

---

### React Native (Mobile)

```javascript
// api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Change to your server IP for mobile testing
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

// Authentication
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('token', response.data.token);
  await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data;
};

export const logout = async () => {
  await api.post('/auth/logout');
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

// Employee Tasks
export const getMyTasks = async (filters = {}) => {
  const response = await api.get('/my-tasks', { params: filters });
  return response.data;
};

export const startTask = async (assignmentId) => {
  const response = await api.put(`/my-tasks/${assignmentId}/start`);
  return response.data;
};

export const completeTask = async (assignmentId) => {
  const response = await api.put(`/my-tasks/${assignmentId}/complete`);
  return response.data;
};

// Location Tracking
export const recordLocation = async (locationData) => {
  const response = await api.post('/locations', locationData);
  return response.data;
};

export const recordBatchLocations = async (locations) => {
  const response = await api.post('/locations/batch', { locations });
  return response.data;
};

export const getMyLocations = async () => {
  const response = await api.get('/locations/my');
  return response.data;
};

export const getTaskRoute = async (takenTaskId) => {
  const response = await api.get(`/locations/tasks/${takenTaskId}/route`);
  return response.data;
};

export default api;
```

**Example Usage with Location Tracking:**

```javascript
// LocationTracking.js
import * as Location from 'expo-location';
import { useEffect, useState, useRef } from 'react';
import { recordLocation, recordBatchLocations } from './api';

function LocationTracking({ takenTaskId }) {
  const [tracking, setTracking] = useState(false);
  const locationQueue = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }
  };

  const startTracking = async () => {
    setTracking(true);
    
    // Record location every 5 minutes
    intervalRef.current = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const locationData = {
          taken_task_id: takenTaskId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          tracking_status: 'auto'
        };

        // Add to queue
        locationQueue.current.push(locationData);

        // Send batch if queue has 5+ locations
        if (locationQueue.current.length >= 5) {
          await recordBatchLocations(locationQueue.current);
          locationQueue.current = [];
        } else {
          // Send single location
          await recordLocation(locationData);
        }
      } catch (error) {
        console.error('Error recording location:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  };

  const stopTracking = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Send remaining locations in queue
    if (locationQueue.current.length > 0) {
      await recordBatchLocations(locationQueue.current);
      locationQueue.current = [];
    }
    
    setTracking(false);
  };

  return { tracking, startTracking, stopTracking };
}

export default LocationTracking;
```

**Example Task Screen:**

```javascript
// TaskScreen.js
import { View, Text, Button, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { getMyTasks, startTask, completeTask } from './api';
import LocationTracking from './LocationTracking';

function TaskScreen() {
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const { tracking, startTracking, stopTracking } = LocationTracking({
    takenTaskId: activeTask?.taken_task_id
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getMyTasks();
    setTasks(data.tasks);
  };

  const handleStartTask = async (task) => {
    await startTask(task.taken_task_id);
    setActiveTask(task);
    await startTracking();
    loadTasks();
  };

  const handleCompleteTask = async (task) => {
    await stopTracking();
    await completeTask(task.taken_task_id);
    setActiveTask(null);
    loadTasks();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>My Tasks</Text>
      {tracking && <Text style={{ color: 'green' }}>📍 Tracking Active</Text>}
      
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.taken_task_id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10, padding: 15, backgroundColor: '#f5f5f5' }}>
            <Text style={{ fontWeight: 'bold' }}>{item.task.title}</Text>
            <Text>{item.task.description}</Text>
            <Text>Location: {item.task.location}</Text>
            <Text>Status: {item.status}</Text>
            
            {item.status === 'pending' && (
              <Button title="Start Task" onPress={() => handleStartTask(item)} />
            )}
            {item.status === 'in_progress' && (
              <Button title="Complete Task" onPress={() => handleCompleteTask(item)} />
            )}
          </View>
        )}
      />
    </View>
  );
}

export default TaskScreen;
```

---

## Permissions & Roles

### Default Roles (After Seeding)

1. **superadmin** - Full access to everything including user deletion
2. **admin** - Can manage users, tasks, assignments, and view all location data
3. **employee** - Can view and manage own tasks, submit location tracking

### Default Permissions

**User Management:**
- `view users`, `create users`, `edit users`, `delete users`

**Role Management:**
- `view roles`, `create roles`, `edit roles`, `delete roles`

**Permission Management:**
- `view permissions`, `create permissions`, `edit permissions`, `delete permissions`

**Task Management:**
- `view tasks`, `create tasks`, `edit tasks`, `delete tasks`
- `assign tasks`, `view own tasks`, `manage own tasks`

**Location Tracking:**
- `view locations`, `create locations`, `edit locations`, `delete locations`
- `view own locations`, `create own locations`

**Reports:**
- `view reports`, `create reports`, `export reports`

**Dashboard & Settings:**
- `view dashboard`, `view analytics`, `manage settings`, `view settings`

### Role-Permission Mapping

**Superadmin:**
- All permissions

**Admin:**
- `view users`, `create users`, `edit users`
- `view tasks`, `create tasks`, `edit tasks`, `delete tasks`, `assign tasks`
- `view locations`, `view reports`, `export reports`
- `view dashboard`, `view analytics`, `view settings`

**Employee:**
- `view own tasks`, `manage own tasks`
- `view own locations`, `create own locations`
- `view reports`, `create reports`
- `view dashboard`

### Using Permissions in Routes

```php
// Require specific role
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin only routes
});

// Require specific permission
Route::middleware(['auth:sanctum', 'permission:edit users'])->group(function () {
    // Routes for users with 'edit users' permission
});

// Require role OR permission
Route::middleware(['auth:sanctum', 'role_or_permission:admin|edit users'])->group(function () {
    // Routes for admins OR users with 'edit users' permission
});
```

### Checking Permissions in Controllers

```php
// Check if user has permission
if ($request->user()->can('edit users')) {
    // User has permission
}

// Check if user has role
if ($request->user()->hasRole('admin')) {
    // User is admin
}

// Check if user has any of the roles
if ($request->user()->hasAnyRole(['admin', 'moderator'])) {
    // User is admin or moderator
}
```

---

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend-laravel
composer install
```

### 2. Configure Environment
```bash
cp .env.example .env
php artisan key:generate
```

Update `.env` with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=trackingapp
DB_USERNAME=your_username
DB_PASSWORD=your_password

FRONTEND_URL=http://localhost:3000
```

### 3. Run Migrations & Seeders
```bash
php artisan migrate:fresh --seed
```

This will create all tables and seed the database with:
- **Roles & Permissions**: superadmin, admin, employee roles with appropriate permissions
- **Users**: 11 users (1 superadmin, 2 admins, 8 employees)
- **Tasks**: 15 sample tasks with various statuses
- **Task Assignments**: Tasks assigned to employees with realistic dates
- **Locations**: 95+ location tracking records with GPS coordinates
- **Reports**: Sample reports for completed tasks

### Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@trackingapp.com | password123 |
| Admin | admin@trackingapp.com | password123 |
| Employee | michael@trackingapp.com | password123 |

**Additional employees:**
- emily@trackingapp.com
- david@trackingapp.com
- jennifer@trackingapp.com
- robert@trackingapp.com
- lisa@trackingapp.com
- james@trackingapp.com
- maria@trackingapp.com

All passwords are: `password123`

### 4. Start Server
```bash
php artisan serve
```

API will be available at `http://localhost:8000/api`

### 5. Test API Connection
```bash
curl http://localhost:8000/api/test
```

Should return:
```json
{
  "message": "API Connected"
}
```

---

## Error Responses

### Validation Error (422)
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthenticated."
}
```

### Forbidden (403)
```json
{
  "message": "This action is unauthorized."
}
```

### Not Found (404)
```json
{
  "message": "Resource not found."
}
```

---

## Security Best Practices

1. **Never expose tokens** - Store securely on client side
2. **Use HTTPS in production** - Tokens should only be transmitted over secure connections
3. **Implement token refresh** - Regularly refresh tokens for better security
4. **Rate limiting** - Laravel Sanctum includes rate limiting by default
5. **Validate all inputs** - Use Laravel's validation rules
6. **Use environment variables** - Never hardcode sensitive data

---

## Testing

### Testing with Thunder Client / Postman

#### 1. Test Connection
```http
GET http://localhost:8000/api/test
```

#### 2. Login as Admin
```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "admin@trackingapp.com",
  "password": "password123"
}
```

**Save the token from response!**

#### 3. Get All Tasks (with token)
```http
GET http://localhost:8000/api/admin/tasks
Authorization: Bearer YOUR_TOKEN_HERE
```

#### 4. Create a New Task
```http
POST http://localhost:8000/api/admin/tasks
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "New Field Visit",
  "description": "Visit customer site for installation",
  "location": "456 Customer Street, City",
  "status": "pending"
}
```

#### 5. Assign Task to Employee
```http
POST http://localhost:8000/api/admin/tasks/{task-id}/assign
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "user_ids": ["employee-uuid"],
  "start_time": "2026-02-19T08:00:00Z",
  "date": "2026-02-19"
}
```

#### 6. Login as Employee
```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "michael@trackingapp.com",
  "password": "password123"
}
```

#### 7. Get My Tasks (as employee)
```http
GET http://localhost:8000/api/my-tasks
Authorization: Bearer EMPLOYEE_TOKEN
```

#### 8. Record Location (as employee)
```http
POST http://localhost:8000/api/locations
Authorization: Bearer EMPLOYEE_TOKEN
Content-Type: application/json

{
  "taken_task_id": "assignment-uuid",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 10.5,
  "address": "123 Main St, New York, NY"
}
```

### Example cURL Requests

```bash
# Test connection
curl http://localhost:8000/api/test

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trackingapp.com","password":"password123"}'

# Get tasks (replace TOKEN)
curl -X GET http://localhost:8000/api/admin/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Accept: application/json"

# Create task (replace TOKEN)
curl -X POST http://localhost:8000/api/admin/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "location": "123 Street, City",
    "status": "pending"
  }'

# Record location (replace TOKEN and UUID)
curl -X POST http://localhost:8000/api/locations \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taken_task_id": "uuid-here",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 10.5
  }'
```

---

## Testing

Use tools like **Postman**, **Insomnia**, or **cURL** to test the API.

### Example cURL Request
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get user with token
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## Support

For issues or questions, please refer to:
- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [Spatie Permission Documentation](https://spatie.be/docs/laravel-permission)

---

## Quick Reference - All Endpoints

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/test` | Test API connection |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Authentication (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/logout` | Logout current device |
| POST | `/api/auth/logout-all` | Logout all devices |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh-token` | Refresh authentication token |
| GET | `/api/user` | Get user with roles/permissions |

### User Management (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/{id}` | Get user details |
| PUT | `/api/profile/{id}` | Update user profile |
| PUT | `/api/admin/users/{id}/status` | Update user status |
| POST | `/api/profile/{id}/avatar` | Upload avatar |
| DELETE | `/api/admin/users/{id}` | Delete user (superadmin) |
| GET | `/api/admin/departments` | Get departments list |

### Roles & Permissions (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/roles` | Get all roles |
| POST | `/api/admin/roles` | Create role |
| POST | `/api/admin/roles/{id}/permissions` | Sync role permissions |
| GET | `/api/admin/permissions` | Get all permissions |
| POST | `/api/admin/permissions` | Create permission |
| POST | `/api/admin/users/{id}/roles` | Assign role to user |
| DELETE | `/api/admin/users/{id}/roles` | Remove role from user |
| POST | `/api/admin/users/{id}/permissions` | Give permission to user |
| DELETE | `/api/admin/users/{id}/permissions` | Revoke permission from user |

### Task Management (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/tasks` | Get all tasks |
| POST | `/api/admin/tasks` | Create task |
| GET | `/api/admin/tasks/{id}` | Get task details |
| PUT | `/api/admin/tasks/{id}` | Update task |
| DELETE | `/api/admin/tasks/{id}` | Delete task |
| POST | `/api/admin/tasks/{id}/assign` | Assign task to users |
| GET | `/api/admin/tasks/statistics` | Get task statistics |
| GET | `/api/admin/tasks/by-location` | Get tasks by location |

### Task Assignments (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/assignments` | Get all assignments |
| POST | `/api/admin/assignments` | Create assignment |
| GET | `/api/admin/assignments/{id}` | Get assignment details |
| PUT | `/api/admin/assignments/{id}` | Update assignment |
| DELETE | `/api/admin/assignments/{id}` | Delete assignment |
| PUT | `/api/admin/assignments/{id}/cancel` | Cancel assignment |
| GET | `/api/admin/users/{id}/statistics` | Get user statistics |

### Employee Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/my-tasks` | Get my assigned tasks |
| PUT | `/api/my-tasks/{id}/start` | Start a task |
| PUT | `/api/my-tasks/{id}/complete` | Complete a task |

### Location Tracking (Employee)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/locations` | Record single location |
| POST | `/api/locations/batch` | Record multiple locations |
| GET | `/api/locations/my` | Get my location history |
| GET | `/api/locations/my/statistics` | Get my location statistics |
| GET | `/api/locations/tasks/{id}` | Get locations for my task |
| GET | `/api/locations/tasks/{id}/route` | Get route for my task |

### Location Management (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/locations/tasks/{id}` | Get task locations |
| GET | `/api/admin/locations/tasks/{id}/current` | Get current locations |
| GET | `/api/admin/locations/tasks/{id}/statistics` | Get task location stats |
| GET | `/api/admin/locations/tasks/{id}/route` | Get task route |
| GET | `/api/admin/locations/users/{id}/statistics` | Get user location stats |
| GET | `/api/admin/locations/nearby` | Find nearby locations |
| DELETE | `/api/admin/locations/{id}` | Delete location record |

### Report Management (Employee)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports` | Create new report |
| GET | `/api/reports/my` | Get my reports |
| GET | `/api/reports/{id}` | View report details |
| PUT | `/api/reports/{id}` | Update own report |
| GET | `/api/reports/statistics/my` | Get my report statistics |

### Report Management (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/reports` | Get all reports |
| GET | `/api/admin/reports/tasks/{id}` | Get reports for specific task |
| GET | `/api/admin/reports/statistics` | Get overall report statistics |
| DELETE | `/api/admin/reports/{id}` | Delete report |

---

## 📝 Report Management Routes

### Create Report (Employee)
```http
POST /api/reports
```

**Body:**
```json
{
  "taken_task_id": "uuid-here",
  "report": "Detailed report description",
  "photos": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...",
    "data:image/png;base64,iVBORw0KGgoAAAANSUh..."
  ]
}
```

**Validation Rules:**
- `taken_task_id`: required, UUID, must exist in taken_tasks
- `report`: required, string (report description/text)
- `photos`: optional, array of base64 encoded images

**Response (201):**
```json
{
  "message": "Report created successfully",
  "report": {
    "report_id": "uuid-here",
    "user_id": "user-uuid",
    "taken_task_id": "task-uuid",
    "report": "Detailed report description",
    "image": "[\"reports/report_abc123_0.jpg\",\"reports/report_abc123_1.png\"]",
    "created_at": "2026-02-19T10:30:00.000000Z",
    "takenTask": {
      "taken_task_id": "task-uuid",
      "task": {
        "task_id": "main-task-uuid",
        "title": "Client Meeting"
      }
    }
  }
}
```

---

### Get My Reports (Employee)
```http
GET /api/reports/my
```

**Query Parameters:**
- `start_date` (optional): Filter by date (Y-m-d)
- `end_date` (optional): Filter by date (Y-m-d)
- `per_page` (optional): Items per page (default: 15)

**Response (200):**
```json
{
  "reports": {
    "current_page": 1,
    "data": [
      {
        "report_id": "uuid",
        "user_id": "user-uuid",
        "report": "Report description",
        "created_at": "2026-02-19T10:30:00.000000Z",
        "takenTask": {
          "taken_task_id": "task-uuid",
          "task": {
            "task_id": "main-task-uuid",
            "title": "Client Meeting",
            "location": "Downtown Office"
          }
        }
      }
    ],
    "total": 25
  }
}
```

---

### Get Report Details
```http
GET /api/reports/{id}
```

**Response (200):**
```json
{
  "report": {
    "report_id": "uuid",
    "user_id": "user-uuid",
    "taken_task_id": "task-uuid",
    "report": "Detailed report text",
    "image": "[\"reports/photo1.jpg\",\"reports/photo2.png\"]",
    "created_at": "2026-02-19T10:30:00.000000Z",
    "user": {
      "id": "user-uuid",
      "name": "Michael Smith",
      "email": "michael@trackingapp.com",
      "department": "Sales",
      "position": "Sales Representative"
    },
    "takenTask": {
      "taken_task_id": "task-uuid",
      "task": {
        "task_id": "main-task-uuid",
        "title": "Client Meeting",
        "description": "Meet with potential client",
        "location": "Downtown Office"
      },
      "users": [
        {
          "id": "user-uuid",
          "name": "Michael Smith"
        }
      ]
    }
  }
}
```

---

### Update Report (Employee)
```http
PUT /api/reports/{id}
```

**Body:**
```json
{
  "report": "Updated report description",
  "photos": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA..."
  ]
}
```

**Note:** Including `photos` will replace all existing photos.

**Response (200):**
```json
{
  "message": "Report updated successfully",
  "report": { /* updated report data */ }
}
```

---

### Get All Reports (Admin)
```http
GET /api/admin/reports
```

**Query Parameters:**
- `user_id` (optional): Filter by user
- `task_id` (optional): Filter by task
- `search` (optional): Search in report description
- `per_page` (optional): Items per page (default: 15)

**Response (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "report_id": "uuid",
      "report": "Report text",
      "created_at": "2026-02-19T10:30:00.000000Z",
      "user": {
        "id": "user-uuid",
        "name": "Michael Smith",
        "email": "michael@trackingapp.com"
      },
      "takenTask": {
        "taken_task_id": "task-uuid",
        "task": {
          "task_id": "main-task-uuid",
          "title": "Client Meeting"
        }
      }
    }
  ],
  "total": 125
}
```

---

### Get Task Reports (Admin)
```http
GET /api/admin/reports/tasks/{taskId}
```

**Response (200):**
```json
{
  "reports": [
    {
      "report_id": "uuid",
      "report": "Report description",
      "created_at": "2026-02-19T10:30:00.000000Z",
      "user": {
        "id": "user-uuid",
        "name": "Michael Smith"
      },
      "takenTask": {
        "taken_task_id": "task-uuid"
      }
    }
  ]
}
```

---

### Get Report Statistics
```http
GET /api/reports/statistics/my
# or (Admin)
GET /api/admin/reports/statistics?user_id={userId}
```

**Response (200):**
```json
{
  "statistics": {
    "total_reports": 45,
    "reports_this_month": 12,
    "reports_this_week": 3
  }
}
```

---

### Delete Report (Admin)
```http
DELETE /api/admin/reports/{id}
```

**Response (200):**
```json
{
  "message": "Report deleted successfully"
}
```

**Note:** This also deletes all associated photo files from storage.

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## Common Query Parameters

- `per_page`: Number of items per page (default: 15)
- `page`: Page number (default: 1)
- `search`: Search term
- `sort_by`: Sort field
- `sort_order`: asc or desc
- `status`: Filter by status
- `start_date`: Date range start (Y-m-d)
- `end_date`: Date range end (Y-m-d)

---

**Last Updated:** February 18, 2026  
**API Version:** 1.0  
**Laravel Version:** 10.x

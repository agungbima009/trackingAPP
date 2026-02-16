# Authentication & Authorization API Documentation

## Overview

This Laravel backend uses **Laravel Sanctum** for API authentication and **Spatie Laravel Permission** for role-based access control (RBAC). It's designed to work with both React.js (web) and React Native (mobile) frontends.

## Base URL

- Local: `http://localhost:8000/api`
- Production: Update in `.env` file

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

// Login example
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Register example
export const register = async (name, email, password, password_confirmation) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
    password_confirmation,
  });
  localStorage.setItem('token', response.data.token);
  return response.data;
};

// Logout example
export const logout = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('token');
};

export default api;
```

---

### React Native (Mobile)

```javascript
// api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
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

// Login example
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('token', response.data.token);
  return response.data;
};

// Register example
export const register = async (name, email, password, password_confirmation) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
    password_confirmation,
  });
  await AsyncStorage.setItem('token', response.data.token);
  return response.data;
};

// Logout example
export const logout = async () => {
  await api.post('/auth/logout');
  await AsyncStorage.removeItem('token');
};

export default api;
```

---

## Permissions & Roles

### Default Roles (After Seeding)

1. **admin** - Full access to everything
2. **moderator** - Can view and edit users, view roles/permissions
3. **user** - Basic access (view dashboard)

### Default Permissions

- User Management: `view users`, `create users`, `edit users`, `delete users`
- Role Management: `view roles`, `create roles`, `edit roles`, `delete roles`
- Permission Management: `view permissions`, `create permissions`, `edit permissions`, `delete permissions`
- Others: `view dashboard`, `manage settings`

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
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

FRONTEND_URL=http://localhost:3000
```

### 3. Run Migrations
```bash
php artisan migrate
```

### 4. Seed Roles & Permissions
```bash
php artisan db:seed --class=RolePermissionSeeder
```

This creates:
- Admin user: `admin@example.com` / `password`
- Test user: `user@example.com` / `password`

### 5. Start Server
```bash
php artisan serve
```

API will be available at `http://localhost:8000/api`

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

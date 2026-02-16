# Laravel Backend - Quick Start Guide

## Authentication & Authorization Setup ✅

This Laravel backend has been configured with:
- **Laravel Sanctum** for API token authentication
- **Spatie Laravel Permission** for role-based access control (RBAC)
- Full REST API for React.js and React Native frontends

## Quick Start

### 1. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Update database credentials in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Set frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
composer install
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. Seed Roles & Permissions

```bash
php artisan db:seed --class=RolePermissionSeeder
```

This creates three default roles:
- **admin** - Full access to all features
- **moderator** - Can view and edit users, view roles/permissions
- **user** - Basic access (view dashboard)

### 6. Start Development Server

```bash
php artisan serve
```

API will be available at `http://localhost:8000/api`

## Testing the API

### Register a New User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `token` from the response.

### Get Current User

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

## Available Endpoints

### Public Routes:
- `GET /api/test` - Test API connection

### Authentication Routes:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (requires auth)
- `POST /api/auth/logout-all` - Logout from all devices (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/refresh-token` - Refresh token (requires auth)

### Admin Routes (require 'admin' role):
- `GET /api/admin/roles` - Get all roles
- `POST /api/admin/roles` - Create new role
- `GET /api/admin/permissions` - Get all permissions
- `POST /api/admin/permissions` - Create new permission
- `POST /api/admin/users/{userId}/roles` - Assign role to user
- `DELETE /api/admin/users/{userId}/roles` - Remove role from user
- `POST /api/admin/users/{userId}/permissions` - Give permission to user
- `DELETE /api/admin/users/{userId}/permissions` - Revoke permission
- `POST /api/admin/roles/{roleId}/permissions` - Sync role permissions

## Documentation

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Frontend Integration

### React.js Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### React Native Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Use your IP for real device
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token interceptor
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

## Default Permissions

After seeding, these permissions are available:

**User Management:**
- view users
- create users
- edit users
- delete users

**Role Management:**
- view roles
- create roles
- edit roles
- delete roles

**Permission Management:**
- view permissions
- create permissions
- edit permissions
- delete permissions

**General:**
- view dashboard
- manage settings

## Checking Permissions in Code

### In Controllers:

```php
// Check permission
if ($request->user()->can('edit users')) {
    // User has permission
}

// Check role
if ($request->user()->hasRole('admin')) {
    // User is admin
}

// Check multiple roles
if ($request->user()->hasAnyRole(['admin', 'moderator'])) {
    // User has one of these roles
}
```

### In Routes:

```php
// Protect by role
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin only routes
});

// Protect by permission
Route::middleware(['auth:sanctum', 'permission:edit users'])->group(function () {
    // Routes requiring 'edit users' permission
});

// Protect by role OR permission
Route::middleware(['auth:sanctum', 'role_or_permission:admin|edit users'])->group(function () {
    // Admin OR users with 'edit users' permission
});
```

## Troubleshooting

### Clear Caches

If you encounter unexpected behavior:

```bash
php artisan optimize:clear
php artisan config:clear
php artisan cache:clear
composer dump-autoload
```

### Permission Denied Errors

Make sure the user has the required role or permission. Check the user's roles and permissions:

```bash
php artisan tinker
>>> $user = App\Models\User::find(1);
>>> $user->roles;
>>> $user->permissions;
```

### CORS Issues

If your frontend can't connect:
1. Update `FRONTEND_URL` in `.env`
2. Add your frontend URL to `config/cors.php` under `allowed_origins`
3. Clear config cache: `php artisan config:clear`

## Production Considerations

1. **Environment Variables:**
   - Set `APP_ENV=production`
   - Set `APP_DEBUG=false`
   - Use strong `APP_KEY`
   - Configure proper database credentials

2. **Security:**
   - Use HTTPS in production
   - Set proper CORS origins (don't use `*`)
   - Enable rate limiting
   - Use secure token storage on frontend

3. **Performance:**
   - Enable caching: `php artisan config:cache`
   - Enable route caching: `php artisan route:cache`
   - Use queue workers for heavy tasks
   - Configure proper database indexes

4. **Token Expiration:**
   - Set `'expiration' => 60 * 24` in `config/sanctum.php` for 24-hour tokens
   - Implement token refresh logic in frontend

## Next Steps

1. Customize permissions for your application needs
2. Implement email verification if needed
3. Add password reset functionality
4. Create additional API endpoints for your app features
5. Set up proper error handling and logging
6. Write tests for your endpoints

## Support

For more information:
- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Spatie Permission](https://spatie.be/docs/laravel-permission)

# Frontend Permission System Implementation

## Overview
This document describes the role-based access control (RBAC) system implemented in the frontend web application. The system integrates with the Laravel backend API to provide secure, role-based access to different features and pages.

## Features Implemented

### 1. **Authentication & Authorization**
- Token-based authentication using Laravel Sanctum
- Role-based access control (RBAC)
- Session management with automatic expiry
- Protected routes with permission checks
- **Web-only access restriction (Employee role blocked from web)**

### 2. **User Roles**
The system supports three user roles, but only Admin and Superadmin can access the web application:

#### **Superadmin**
- Full access to all features
- Can create, edit, and delete all users (except their own account)
- **Can only create Admin and Employee accounts (not another Superadmin)**
- Superadmin should be unique - only one superadmin per system
- Can manage tasks, monitoring, and all system features
- Can change status of any user (except their own)

#### **Admin**
- Can access Dashboard, Monitoring, Tasks, Taken, and User Management
- **Can only create Employee accounts**
- Cannot create Admin or Superadmin accounts
- Can edit employee accounts only
- **Cannot** edit or delete superadmin accounts
- **Cannot** edit or delete other admin accounts
- Can change employee status only

#### **Employee**
- **⚠️ CANNOT access web application**
- **Restricted to mobile app only**
- Login attempts on web will be rejected with error message
- Can only view and manage tasks through mobile app

### 3. **Session Management**
- 8-hour session timeout
- Automatic session refresh on user activity
- Session validity check on every protected route access
- Automatic logout on session expiry
- Session timer display in user menu

### 4. **Page-Level Permissions**
Each page has defined access permissions. **Note: Employee role cannot access web application at all.**

| Page | Superadmin | Admin | Employee |
|------|------------|-------|----------|
| **Web Login** | ✅ | ✅ | ❌ (Mobile Only) |
| Dashboard | ✅ | ✅ | ❌ |
| Monitoring | ✅ | ✅ | ❌ |
| Task | ✅ | ✅ | ❌ |
| Taken | ✅ | ✅ | ❌ |
| User Management | ✅ | ✅ | ❌ |

### 5. **User Management Restrictions**

#### **Create User**
- Superadmin: Can create Admin and Employee (not another Superadmin)
- Admin: Can only create Employee
- Employee: Cannot create anyone
- Role dropdown automatically filters based on current user's permissions

#### **Edit User**
- Superadmin: Can edit anyone except themselves
- Admin: Can only edit employees
- Employee: Cannot edit anyone

#### **Delete User**
- Superadmin: Can delete anyone except themselves
- Admin: Cannot delete anyone
- Employee: Cannot delete anyone

#### **Change User Status**
- Superadmin: Can change anyone's status except their own
- Admin: Can only change employee status
- Employee: Cannot change anyone's status

### 6. **Detailed User Management Permission Matrix**

| Action | Superadmin | Admin | Employee | Notes |
|--------|------------|-------|----------|-------|
| **Create Superadmin** | ❌ | ❌ | ❌ | Only one superadmin allowed |
| **Create Admin** | ✅ | ❌ | ❌ | Superadmin only |
| **Create Employee** | ✅ | ✅ | ❌ | Admin and Superadmin |
| **Edit Superadmin** | ❌ (self) | ❌ | ❌ | Cannot edit own account |
| **Edit Admin** | ✅ | ❌ | ❌ | Superadmin only |
| **Edit Employee** | ✅ | ✅ | ❌ | Admin and Superadmin |
| **Delete Superadmin** | ❌ (self) | ❌ | ❌ | Cannot delete own account |
| **Delete Admin** | ✅ | ❌ | ❌ | Superadmin only |
| **Delete Employee** | ✅ | ❌ | ❌ | Superadmin only |
| **Change Superadmin Status** | ❌ (self) | ❌ | ❌ | Cannot change own status |
| **Change Admin Status** | ✅ | ❌ | ❌ | Superadmin only |
| **Change Employee Status** | ✅ | ✅ | ❌ | Admin and Superadmin |

## File Structure

```
frontend-web/src/
├── utils/
│   └── auth.js                    # Authentication & authorization utilities
├── components/
│   └── ProtectedRoute.jsx         # Protected route wrapper with permission checks
├── pages/
│   ├── Login/
│   │   └── Login.jsx              # Login page with session initialization
│   ├── shared/
│   │   ├── Sidebar.jsx            # Sidebar with role-based menu filtering
│   │   └── Sidebar.css            # Updated sidebar styles
│   └── UserManagement/
│       └── UserManagement.jsx     # User management with permission checks
├── services/
│   └── api.js                     # API client with auth integration
└── App.jsx                        # Main app with protected routes
```

## Key Components

### 1. **auth.js** - Authentication Utilities
Contains all authentication and authorization logic:

**Core Functions:**
- `getCurrentUser()` - Get current user from localStorage
- `getUserRole()` - Get current user's role
- `isAuthenticated()` - Check if user is authenticated
- `hasRole(role)` - Check if user has specific role
- `hasAnyRole(roles)` - Check if user has any of the specified roles
- `canAccessPage(pageName)` - Check if user can access a page
- `canAccessWeb()` - Check if user role is allowed to access web (blocks employees)

**Permission Checks:**
- `canEditUser(targetUser)` - Check if current user can edit target user
- `canDeleteUser(targetUser)` - Check if current user can delete target user
- `canChangeUserStatus(targetUser)` - Check if current user can change target user's status
- `getAllowedRolesToCreate()` - Get roles that current user can create (Superadmin: admin, employee; Admin: employee)

**Session Management:**
- `initSession()` - Initialize session with 8-hour expiry
- `checkSession()` - Check if session is still valid
- `refreshSession()` - Refresh session expiry time
- `setupSessionListener()` - Auto-refresh session on user activity
- `clearAuth()` - Clear all authentication data

### 2. **ProtectedRoute.jsx** - Route Protection
Wrapper component that:
- Checks user authentication
- Validates session
- **Blocks employee role from web access**
- Verifies user has required permissions
- Redirects to login if unauthenticated
- Redirects to dashboard if lacking permissions
- Sets up session activity listener

Usage:
```jsx
<Route path="/users" element={
  <ProtectedRoute permission="USER_MANAGEMENT">
    <UserManagement />
  </ProtectedRoute>
} />
```

### 3. **Updated Login Component**
Now includes:
- Session initialization on successful login
- **Web-only role validation (blocks employees)**
- Clear error message for employee login attempts
- Proper error handling
- Token validation before navigation

### 4. **Updated Sidebar Component**
Features:
- Role-based menu filtering
- User role display
- Session time remaining indicator
- Only shows menu items user has permission to access

### 5. **Enhanced UserManagement Component**
Implements:
- **Dynamic role dropdown based on user permissions**
- Superadmin sees: Admin, Employee options only
- Admin sees: Employee option only
- Visual hint message explaining role restrictions
- Permission checks before edit, delete, and status change actions
- Visual feedback with disabled buttons for restricted actions
- Tooltip messages explaining why actions are restricted
- Toast notifications for permission errors

## Usage Examples

### Checking User Role
```javascript
import { getUserRole, hasRole, ROLES } from '../utils/auth';

// Get current user's role
const role = getUserRole(); // 'superadmin', 'admin', or 'employee'

// Check if user is superadmin
if (hasRole(ROLES.SUPERADMIN)) {
  // Superadmin-only code
}
```

### Checking Page Access
```javascript
import { canAccessPage } from '../utils/auth';

// Check if user can access a page
if (canAccessPage('USER_MANAGEMENT')) {
  // User can access user management
}
```

### Checking User Edit Permission
```javascript
import { canEditUser } from '../utils/auth';

// Check if current user can edit target user
const targetUser = { id: '123', roles: [{ name: 'admin' }] };
if (canEditUser(targetUser)) {
  // Show edit button
}
```

### Session Management
```javascript
import { checkSession, getSessionTimeRemaining } from '../utils/auth';

// Check if session is valid
if (checkSession()) {
  // Session is valid, proceed
}

// Get remaining session time in minutes
const minutes = getSessionTimeRemaining();
console.log(`Session expires in ${minutes} minutes`);
```

## Security Features

### 1. **Multi-Layer Protection**
- Frontend route protection
- Component-level permission checks
- API-level authorization (backend)
- **Role creation restrictions (prevent privilege escalation)**

### 2. **Session Security**
- Automatic session expiry (8 hours)
- Session validation on every route access
- Activity-based session refresh
- Automatic logout on expiry

### 3. **Token Management**
- Secure token storage in localStorage
- Automatic token injection in API requests
- Token removal on logout
- 401 handling with automatic redirect

### 4. **Permission Validation**
- Role-based access control
- Granular permission checks
- Visual feedback for restricted actions
- Clear error messages

## Testing Accounts

Use these accounts to test different permission levels:

| Role | Email | Password | Web Access |
|------|-------|----------|------------|
| Superadmin | superadmin@trackingapp.com | password123 | ✅ Allowed |
| Admin | admin@trackingapp.com | password123 | ✅ Allowed |
| Employee | michael@trackingapp.com | password123 | ❌ Blocked (Mobile Only) |

## Common Scenarios

### 1. **Superadmin Testing**
- Login as superadmin
- Access all pages (Dashboard, Monitoring, Task, Taken, Users)
- **Create new users: Can only select Admin or Employee role (Superadmin option not available)**
- Create/edit/delete employees and admins
- Cannot delete own account
- Verify role dropdown shows: Admin, Employee (not Superadmin)

### 2. **Admin Testing**
- Login as admin
- Access Dashboard, Monitoring, Task, Taken, Users
- **Create new users: Can only select Employee role (no Admin or Superadmin options)**
- Can only edit/delete employees
- Cannot edit/delete superadmin or other admins
- Cannot delete own account
- Verify role dropdown shows: Employee only

### 3. **Employee Testing**
- ❌ **Cannot login to web application**
- Login attempt shows error: "Employee accounts can only access the mobile application. Please use the mobile app to login."
- Employees must use mobile app for all functionality

## API Integration

The frontend permission system works in conjunction with the backend API:

### Authentication Flow
1. User submits credentials
2. API validates and returns token + user data
3. Frontend stores token and user in localStorage
4. Frontend initializes 8-hour session
5. Token included in all subsequent API requests

### Permission Validation
1. Frontend checks permissions before rendering UI
2. Backend validates permissions on API requests
3. Double-layer security ensures consistency

### Session Management
1. Frontend tracks session expiry locally
2. Backend validates token on each request
3. 401 responses trigger automatic logout
4. Session refreshed on user activity

## Troubleshooting

### Issue: Cannot see Superadmin role when creating user
**Solution:** This is expected behavior. Superadmin role cannot be created through the UI to maintain system security. Only one superadmin should exist per system. If you need another superadmin, use database seeder or direct database access.

### Issue: Admin can only create Employee accounts
**Solution:** This is correct and by design. Admins can only create Employee accounts. They cannot create other Admins or Superadmins.

### Issue: Employee cannot login to website
**Solution:** This is expected behavior. Employee accounts are restricted to mobile app only. They must use the mobile application to access the system.

### Issue: "Employee accounts can only access the mobile application" error
**Solution:** This is correct. Employees cannot access the web interface. Direct them to download and use the mobile app.

### Issue: "You do not have permission" errors
**Solution:** Check user role and verify they have the required permissions for the action.

### Issue: Automatic logout after period of inactivity
**Solution:** This is expected behavior. Sessions expire after 8 hours or when backend token is invalidated.

### Issue: Cannot delete user
**Solution:** Check:
- Only superadmins can delete users
- Cannot delete your own account
- Backend API must allow the deletion

### Issue: Menu items missing
**Solution:** Menu items are filtered based on role. Employees only see Dashboard and Taken.

## Future Enhancements

Potential improvements:
1. Configurable session timeout
2. Two-factor authentication (2FA)
3. Password strength requirements
4. Activity logging and audit trail
5. Fine-grained permissions beyond role-based
6. Remember me with extended sessions
7. Session warning before expiry

## Maintenance

### Adding New Roles
1. Add role to `ROLES` constant in `auth.js`
2. Define page permissions in `PERMISSIONS` constant
3. Update permission check functions if needed
4. Test thoroughly with new role

### Adding New Pages
1. Define page permission in `PERMISSIONS` constant
2. Add route with `ProtectedRoute` in `App.jsx`
3. Add menu item to Sidebar with permission check
4. Test access with different roles

### Modifying Permissions
1. Update `PERMISSIONS` constant in `auth.js`
2. Update permission check functions if logic changes
3. Test affected pages and components
4. Verify backend API permissions match

## Support

For issues or questions:
1. Check API documentation: `backend-laravel/API_DOCUMENTATION.md`
2. Review error messages in browser console
3. Verify user role and permissions
4. Check network tab for API responses
5. Ensure backend is running and accessible

---

**Last Updated:** February 20, 2026  
**Version:** 1.0

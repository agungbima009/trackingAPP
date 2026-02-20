/**
 * Authentication and Authorization Utilities
 * Manages user authentication state and role-based permissions
 */

// Role hierarchy and permissions
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

// Page access permissions by role
// Note: Employee role is for mobile app only, not allowed on web
export const PERMISSIONS = {
  DASHBOARD: [ROLES.SUPERADMIN, ROLES.ADMIN],
  MONITORING: [ROLES.SUPERADMIN, ROLES.ADMIN],
  TASK: [ROLES.SUPERADMIN, ROLES.ADMIN],
  TAKEN: [ROLES.SUPERADMIN, ROLES.ADMIN],
  USER_MANAGEMENT: [ROLES.SUPERADMIN, ROLES.ADMIN],
};

// Roles allowed to access the web application
export const WEB_ALLOWED_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN];

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get current user's role
 * @returns {string|null} Role name or null
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  if (!user || !user.roles || user.roles.length === 0) {
    return null;
  }
  // Return first role (users typically have one primary role)
  return user.roles[0].name.toLowerCase();
};

/**
 * Get authentication token from localStorage
 * @returns {string|null} Token or null
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  const user = getCurrentUser();
  return !!(token && user);
};

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role.toLowerCase();
};

/**
 * Check if user has any of the specified roles
 * @param {Array<string>} roles - Array of roles to check
 * @returns {boolean} True if user has any of the roles
 */
export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  if (!userRole) return false;
  return roles.some(role => role.toLowerCase() === userRole);
};

/**
 * Check if user can access a specific page
 * @param {string} pageName - Page name from PERMISSIONS
 * @returns {boolean} True if user can access the page
 */
export const canAccessPage = (pageName) => {
  if (!isAuthenticated()) return false;
  
  const allowedRoles = PERMISSIONS[pageName];
  if (!allowedRoles) return false;
  
  return hasAnyRole(allowedRoles);
};

/**
 * Check if user is superadmin
 * @returns {boolean} True if user is superadmin
 */
export const isSuperAdmin = () => {
  return hasRole(ROLES.SUPERADMIN);
};

/**
 * Check if user is admin (including superadmin)
 * @returns {boolean} True if user is admin or superadmin
 */
export const isAdmin = () => {
  return hasAnyRole([ROLES.SUPERADMIN, ROLES.ADMIN]);
};

/**
 * Check if user is employee
 * @returns {boolean} True if user is employee
 */
export const isEmployee = () => {
  return hasRole(ROLES.EMPLOYEE);
};

/**
 * Check if user role is allowed to access web application
 * Employee role is restricted to mobile app only
 * @returns {boolean} True if user can access web application
 */
export const canAccessWeb = () => {
  const userRole = getUserRole();
  if (!userRole) return false;
  return WEB_ALLOWED_ROLES.includes(userRole);
};

/**
 * Check if current user can edit another user
 * @param {Object} targetUser - User to be edited
 * @returns {boolean} True if current user can edit the target user
 */
export const canEditUser = (targetUser) => {
  const currentUser = getCurrentUser();
  if (!currentUser || !targetUser) return false;
  
  const currentRole = getUserRole();
  const targetRole = targetUser.roles && targetUser.roles.length > 0 
    ? targetUser.roles[0].name.toLowerCase() 
    : null;
  
  // Superadmin can edit anyone except themselves
  if (currentRole === ROLES.SUPERADMIN) {
    return currentUser.id !== targetUser.id;
  }
  
  // Admin cannot edit superadmin
  if (currentRole === ROLES.ADMIN) {
    if (targetRole === ROLES.SUPERADMIN) return false;
    // Admin cannot edit other admins
    if (targetRole === ROLES.ADMIN) return false;
    // Admin can edit employees
    return targetRole === ROLES.EMPLOYEE;
  }
  
  // Employee cannot edit anyone
  return false;
};

/**
 * Check if current user can delete another user
 * @param {Object} targetUser - User to be deleted
 * @returns {boolean} True if current user can delete the target user
 */
export const canDeleteUser = (targetUser) => {
  const currentUser = getCurrentUser();
  if (!currentUser || !targetUser) return false;
  
  const currentRole = getUserRole();
  const targetRole = targetUser.roles && targetUser.roles.length > 0 
    ? targetUser.roles[0].name.toLowerCase() 
    : null;
  
  // Only superadmin can delete users
  if (currentRole !== ROLES.SUPERADMIN) return false;
  
  // Superadmin cannot delete themselves
  if (currentUser.id === targetUser.id) return false;
  
  return true;
};

/**
 * Check if current user can change status of another user
 * @param {Object} targetUser - User whose status will be changed
 * @returns {boolean} True if current user can change the target user's status
 */
export const canChangeUserStatus = (targetUser) => {
  const currentUser = getCurrentUser();
  if (!currentUser || !targetUser) return false;
  
  const currentRole = getUserRole();
  const targetRole = targetUser.roles && targetUser.roles.length > 0 
    ? targetUser.roles[0].name.toLowerCase() 
    : null;
  
  // Superadmin can change anyone's status except their own
  if (currentRole === ROLES.SUPERADMIN) {
    return currentUser.id !== targetUser.id;
  }
  
  // Admin cannot change superadmin's status
  if (currentRole === ROLES.ADMIN) {
    if (targetRole === ROLES.SUPERADMIN) return false;
    // Admin cannot change other admin's status
    if (targetRole === ROLES.ADMIN) return false;
    // Admin can change employee status
    return targetRole === ROLES.EMPLOYEE;
  }
  
  return false;
};

/**
 * Get allowed roles that current user can create
 * Superadmin can only create Admin and Employee (not another Superadmin)
 * Admin can only create Employee
 * @returns {Array<string>} Array of allowed role names
 */
export const getAllowedRolesToCreate = () => {
  const currentRole = getUserRole();
  
  if (currentRole === ROLES.SUPERADMIN) {
    // Superadmin can only create Admin and Employee
    // Cannot create another Superadmin (should be only one)
    return [ROLES.ADMIN, ROLES.EMPLOYEE];
  }
  
  if (currentRole === ROLES.ADMIN) {
    // Admin can only create Employee
    return [ROLES.EMPLOYEE];
  }
  
  // Employee cannot create users
  return [];
};

/**
 * Clear authentication data (logout)
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('rememberMe');
  localStorage.removeItem('sessionExpiry');
};

/**
 * Session Management
 */

// Session timeout: 8 hours (in milliseconds)
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Initialize session with expiry time
 */
export const initSession = () => {
  const expiryTime = Date.now() + SESSION_TIMEOUT;
  localStorage.setItem('sessionExpiry', expiryTime.toString());
};

/**
 * Check if session is valid
 * @returns {boolean} True if session is still valid
 */
export const isSessionValid = () => {
  const expiryTime = localStorage.getItem('sessionExpiry');
  if (!expiryTime) return false;
  
  return Date.now() < parseInt(expiryTime, 10);
};

/**
 * Refresh session expiry time
 */
export const refreshSession = () => {
  if (isAuthenticated()) {
    initSession();
  }
};

/**
 * Check session and return authentication status
 * Clears auth if session expired
 * @returns {boolean} True if authenticated and session valid
 */
export const checkSession = () => {
  if (!isAuthenticated()) return false;
  
  if (!isSessionValid()) {
    clearAuth();
    return false;
  }
  
  return true;
};

/**
 * Get remaining session time in minutes
 * @returns {number} Minutes remaining in session
 */
export const getSessionTimeRemaining = () => {
  const expiryTime = localStorage.getItem('sessionExpiry');
  if (!expiryTime) return 0;
  
  const remaining = parseInt(expiryTime, 10) - Date.now();
  return Math.max(0, Math.floor(remaining / 60000)); // Convert to minutes
};

/**
 * Setup session activity listener
 * Refreshes session on user activity
 */
export const setupSessionListener = () => {
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
  
  const refreshOnActivity = () => {
    if (checkSession()) {
      refreshSession();
    }
  };
  
  events.forEach(event => {
    document.addEventListener(event, refreshOnActivity, { passive: true });
  });
};

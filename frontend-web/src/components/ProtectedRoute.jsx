import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, canAccessPage, canAccessWeb, checkSession, setupSessionListener, clearAuth } from '../utils/auth';
import Sidebar from '../pages/shared/Sidebar';

/**
 * Protected Route Component with Role-Based Access Control
 * Ensures user is authenticated and has proper permissions
 * Employee role is restricted to mobile app only
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {string} props.permission - Required permission (from PERMISSIONS constant)
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 */
function ProtectedRoute({ children, permission, requireAuth = true }) {
  // Setup session activity listener on mount
  useEffect(() => {
    setupSessionListener();
  }, []);

  // Check session validity
  if (!checkSession()) {
    // Session expired or not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check if user is authenticated
  if (requireAuth && !isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed to access web application
  // Employee accounts are restricted to mobile app only
  if (!canAccessWeb()) {
    clearAuth(); // Clear authentication data
    return <Navigate to="/login" replace />;
  }

  // Check if user has required permission for this page
  if (permission && !canAccessPage(permission)) {
    // User doesn't have permission, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has permission, render the page with layout
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        {children}
      </div>
    </div>
  );
}

export default ProtectedRoute;

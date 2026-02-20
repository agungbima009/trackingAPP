import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import Monitoring from './pages/Monitoring/Monitoring'
import Task from './pages/Task/Task'
import Taken from './pages/Taken/Taken'
import UserManagement from './pages/UserManagement/UserManagement'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard - Admin and Superadmin only (Employee role blocked from web) */}
        <Route path="/dashboard" element={
          <ProtectedRoute permission="DASHBOARD">
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* Monitoring - Admin and Superadmin only */}
        <Route path="/monitoring" element={
          <ProtectedRoute permission="MONITORING">
            <Monitoring />
          </ProtectedRoute>
        } />
        
        {/* Task Management - Admin and Superadmin only */}
        <Route path="/task" element={
          <ProtectedRoute permission="TASK">
            <Task />
          </ProtectedRoute>
        } />
        
        {/* Taken Tasks - Admin and Superadmin only */}
        <Route path="/taken" element={
          <ProtectedRoute permission="TAKEN">
            <Taken />
          </ProtectedRoute>
        } />
        
        {/* User Management - Admin and Superadmin only */}
        <Route path="/users" element={
          <ProtectedRoute permission="USER_MANAGEMENT">
            <UserManagement />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App

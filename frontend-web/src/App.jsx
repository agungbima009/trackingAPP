import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Monitoring from './pages/Monitoring'
import Task from './pages/Task'
import Taken from './pages/Taken'
import UserManagement from './pages/UserManagement'
import Sidebar from './pages/Sidebar'
import './App.css'

// Protected Route Component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        {children}
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/monitoring" element={
          <ProtectedRoute>
            <Monitoring />
          </ProtectedRoute>
        } />
        <Route path="/task" element={
          <ProtectedRoute>
            <Task />
          </ProtectedRoute>
        } />
        <Route path="/taken" element={
          <ProtectedRoute>
            <Taken />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App

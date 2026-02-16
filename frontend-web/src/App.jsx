import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Monitoring from './pages/Monitoring'
import Sidebar from './pages/Sidebar'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/monitoring" element={<Monitoring />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App

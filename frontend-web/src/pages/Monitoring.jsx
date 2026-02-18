import React, { useState, useMemo } from 'react';
import './Monitoring.css';
import MapView from './MapView';
import FilterPanel from './FilterPanel';

function Monitoring() {
  const [filters, setFilters] = useState({
    team: 'all',
    status: 'all',
    dateRange: 'today'
  });

  // Sample member data with team associations and locations
  const allMembers = [
    // Team Alpha members
    { id: 1, name: 'John Doe', team: 'alpha', status: 'active', lat: 30, lng: 25 },
    { id: 2, name: 'Jane Smith', team: 'alpha', status: 'active', lat: 35, lng: 30 },
    { id: 3, name: 'Mike Johnson', team: 'alpha', status: 'inactive', lat: 28, lng: 22 },
    { id: 4, name: 'Sarah Williams', team: 'alpha', status: 'active', lat: 32, lng: 28 },
    
    // Team Beta members
    { id: 5, name: 'David Brown', team: 'beta', status: 'active', lat: 45, lng: 60 },
    { id: 6, name: 'Emily Davis', team: 'beta', status: 'active', lat: 48, lng: 58 },
    { id: 7, name: 'Chris Wilson', team: 'beta', status: 'offline', lat: 42, lng: 62 },
    
    // Team Gamma members
    { id: 8, name: 'Lisa Anderson', team: 'gamma', status: 'active', lat: 65, lng: 40 },
    { id: 9, name: 'Tom Martinez', team: 'gamma', status: 'active', lat: 62, lng: 38 },
    { id: 10, name: 'Anna Taylor', team: 'gamma', status: 'inactive', lat: 68, lng: 42 },
    { id: 11, name: 'Robert Thomas', team: 'gamma', status: 'active', lat: 64, lng: 45 },
    { id: 12, name: 'Jessica Moore', team: 'gamma', status: 'offline', lat: 70, lng: 40 },
    
    // Team Delta members
    { id: 13, name: 'Daniel Jackson', team: 'delta', status: 'active', lat: 55, lng: 75 },
    { id: 14, name: 'Olivia White', team: 'delta', status: 'active', lat: 52, lng: 72 },
    { id: 15, name: 'James Harris', team: 'delta', status: 'active', lat: 58, lng: 78 },
    
    // Team Epsilon members
    { id: 16, name: 'Sophia Martin', team: 'epsilon', status: 'active', lat: 40, lng: 50 },
    { id: 17, name: 'William Thompson', team: 'epsilon', status: 'inactive', lat: 38, lng: 48 },
    { id: 18, name: 'Emma Garcia', team: 'epsilon', status: 'active', lat: 42, lng: 52 },
    { id: 19, name: 'Alexander Lee', team: 'epsilon', status: 'active', lat: 45, lng: 55 },
    { id: 20, name: 'Mia Rodriguez', team: 'epsilon', status: 'offline', lat: 36, lng: 46 },
  ];

  // Filter members based on selected team and status
  const filteredMembers = useMemo(() => {
    return allMembers.filter(member => {
      const teamMatch = filters.team === 'all' || member.team === filters.team;
      const statusMatch = filters.status === 'all' || member.status === filters.status;
      return teamMatch && statusMatch;
    });
  }, [filters]);

  // Calculate stats based on filtered data
  const stats = useMemo(() => {
    const total = filteredMembers.length;
    const active = filteredMembers.filter(m => m.status === 'active').length;
    const offline = filteredMembers.filter(m => m.status === 'offline').length;
    return { total, active, offline };
  }, [filteredMembers]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="monitoring-container">
      <div className="monitoring-header">
        <h1>Team Location Monitoring</h1>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Members</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Active Now</span>
            <span className="stat-value">{stats.active}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Offline</span>
            <span className="stat-value">{stats.offline}</span>
          </div>
        </div>
      </div>

      <div className="monitoring-content">
        <FilterPanel 
          filters={filters} 
          onFilterChange={handleFilterChange}
          stats={stats}
        />
        <MapView members={filteredMembers} />
      </div>
    </div>
  );
}

export default Monitoring;

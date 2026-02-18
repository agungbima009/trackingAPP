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

  // Sample member data with team associations and GPS coordinates (Jakarta area)
  const allMembers = [
    // Team Alpha members - North Jakarta area
    { id: 1, name: 'John Doe', team: 'alpha', status: 'active', lat: -6.1380, lng: 106.8650 },
    { id: 2, name: 'Jane Smith', team: 'alpha', status: 'active', lat: -6.1520, lng: 106.8750 },
    { id: 3, name: 'Mike Johnson', team: 'alpha', status: 'inactive', lat: -6.1450, lng: 106.8550 },
    { id: 4, name: 'Sarah Williams', team: 'alpha', status: 'active', lat: -6.1600, lng: 106.8800 },
    
    // Team Beta members - Central Jakarta area
    { id: 5, name: 'David Brown', team: 'beta', status: 'active', lat: -6.2088, lng: 106.8456 },
    { id: 6, name: 'Emily Davis', team: 'beta', status: 'active', lat: -6.2150, lng: 106.8350 },
    { id: 7, name: 'Chris Wilson', team: 'beta', status: 'offline', lat: -6.2000, lng: 106.8500 },
    
    // Team Gamma members - South Jakarta area
    { id: 8, name: 'Lisa Anderson', team: 'gamma', status: 'active', lat: -6.2615, lng: 106.7810 },
    { id: 9, name: 'Tom Martinez', team: 'gamma', status: 'active', lat: -6.2700, lng: 106.7950 },
    { id: 10, name: 'Anna Taylor', team: 'gamma', status: 'inactive', lat: -6.2550, lng: 106.7700 },
    { id: 11, name: 'Robert Thomas', team: 'gamma', status: 'active', lat: -6.2800, lng: 106.8000 },
    { id: 12, name: 'Jessica Moore', team: 'gamma', status: 'offline', lat: -6.2650, lng: 106.7850 },
    
    // Team Delta members - East Jakarta area
    { id: 13, name: 'Daniel Jackson', team: 'delta', status: 'active', lat: -6.2250, lng: 106.9280 },
    { id: 14, name: 'Olivia White', team: 'delta', status: 'active', lat: -6.2350, lng: 106.9150 },
    { id: 15, name: 'James Harris', team: 'delta', status: 'active', lat: -6.2150, lng: 106.9350 },
    
    // Team Epsilon members - West Jakarta area
    { id: 16, name: 'Sophia Martin', team: 'epsilon', status: 'active', lat: -6.1850, lng: 106.7600 },
    { id: 17, name: 'William Thompson', team: 'epsilon', status: 'inactive', lat: -6.1750, lng: 106.7450 },
    { id: 18, name: 'Emma Garcia', team: 'epsilon', status: 'active', lat: -6.1950, lng: 106.7700 },
    { id: 19, name: 'Alexander Lee', team: 'epsilon', status: 'active', lat: -6.2050, lng: 106.7550 },
    { id: 20, name: 'Mia Rodriguez', team: 'epsilon', status: 'offline', lat: -6.1650, lng: 106.7350 },
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

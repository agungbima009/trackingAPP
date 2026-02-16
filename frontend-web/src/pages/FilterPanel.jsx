import React, { useState } from 'react';
import './FilterPanel.css';

function FilterPanel({ filters, onFilterChange, stats }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className={`filter-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="filter-header">
        <h2>Filters</h2>
        <button 
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '◀' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="filter-content">
          {/* Team Filter */}
          <div className="filter-group">
            <label className="filter-label">Team</label>
            <select 
              className="filter-select"
              value={filters.team}
              onChange={(e) => handleChange('team', e.target.value)}
            >
              <option value="all">All Teams</option>
              <option value="alpha">Team Alpha</option>
              <option value="beta">Team Beta</option>
              <option value="gamma">Team Gamma</option>
              <option value="delta">Team Delta</option>
              <option value="epsilon">Team Epsilon</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <div className="filter-options">
              <button 
                className={`filter-option ${filters.status === 'all' ? 'active' : ''}`}
                onClick={() => handleChange('status', 'all')}
              >
                All
              </button>
              <button 
                className={`filter-option ${filters.status === 'active' ? 'active' : ''}`}
                onClick={() => handleChange('status', 'active')}
              >
                Active
              </button>
              <button 
                className={`filter-option ${filters.status === 'inactive' ? 'active' : ''}`}
                onClick={() => handleChange('status', 'inactive')}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="filter-group">
            <label className="filter-label">Date Range</label>
            <select 
              className="filter-select"
              value={filters.dateRange}
              onChange={(e) => handleChange('dateRange', e.target.value)}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Search */}
          <div className="filter-group">
            <label className="filter-label">Search Member</label>
            <input 
              type="text"
              className="filter-input"
              placeholder="Enter name..."
            />
          </div>

          {/* Action Buttons */}
          <div className="filter-actions">
            <button className="action-btn primary">Apply Filters</button>
            <button className="action-btn secondary">Reset</button>
          </div>

          {/* Quick Stats */}
          <div className="filter-stats">
            <div className="stat-box">
              <span className="stat-number">{stats?.total || 0}</span>
              <span className="stat-text">Total</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats?.active || 0}</span>
              <span className="stat-text">Active</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{stats?.offline || 0}</span>
              <span className="stat-text">Offline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;

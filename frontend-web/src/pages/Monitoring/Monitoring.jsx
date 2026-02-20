import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Monitoring.css';
import MapView from './MapView';
import ReportsPanel from './ReportsPanel';
import { getAssignmentDetails, getReportsByTakenTask, getLocationsByTakenTask } from '../../services/api';

function Monitoring() {
  const { takenTaskId } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [reports, setReports] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch assignment details and reports
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setReportsLoading(true);
        setError('');

        // Fetch assignment details
        const assignmentData = await getAssignmentDetails(takenTaskId);
        setAssignment(assignmentData.assignment); // API returns { assignment: {...} }

        // Fetch reports for this taken task
        const reportsData = await getReportsByTakenTask(takenTaskId);
        setReports(reportsData.data || []);

        // Fetch locations for this taken task
        try {
          const locationsData = await getLocationsByTakenTask(takenTaskId);
          setLocations(locationsData.current_locations || []);
        } catch (locErr) {
          console.warn('No location data available:', locErr);
          setLocations([]);
        }

      } catch (err) {
        console.error('Error fetching monitoring data:', err);
        setError(err.response?.data?.message || 'Failed to load monitoring data');
      } finally {
        setLoading(false);
        setReportsLoading(false);
      }
    };

    if (takenTaskId) {
      fetchData();
    }
  }, [takenTaskId]);

  // Calculate member locations from location tracking data
  const memberLocations = assignment?.users?.map((user) => {
    // Find location data for this user from location tracking
    const userLocation = locations.find(loc => loc.user_id === user.id);
    
    // Check if user has submitted a report
    const hasReport = reports.some(r => r.user_id === user.id);
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: hasReport ? 'active' : 'offline',
      // Use actual tracked location from database
      lat: userLocation?.latitude || -6.2088,
      lng: userLocation?.longitude || 106.8456,
      hasReport: hasReport,
      lastUpdate: userLocation?.recorded_at || null,
      accuracy: userLocation?.accuracy || null
    };
  }) || [];

  // Calculate stats
  const stats = {
    total: memberLocations.length,
    active: memberLocations.filter(m => m.status === 'active').length,
    offline: memberLocations.filter(m => m.status === 'offline').length
  };

  if (loading) {
    return (
      <div className="monitoring-container">
        <div className="monitoring-loading">
          <div className="spinner"></div>
          <p>Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="monitoring-container">
        <div className="monitoring-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => navigate('/taken')} className="back-btn">
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="monitoring-container">
        <div className="monitoring-loading">
          <div className="spinner"></div>
          <p>Loading assignment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="monitoring-container">
      <div className="monitoring-header-compact">
        <div className="header-top">
          <button onClick={() => navigate('/taken')} className="back-button">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="header-info">
            <h1>{assignment?.task?.title || 'Task Monitoring'}</h1>
            <span className="assignment-date">
              {assignment?.date ? new Date(assignment.date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : ''}
            </span>
          </div>
        </div>
        
        <div className="header-stats-compact">
          <div className="stat-item-compact">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Team Members</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item-compact active">
            <span className="stat-value">{stats.active}</span>
            <span className="stat-label">Reported</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item-compact offline">
            <span className="stat-value">{stats.offline}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
      </div>

      <div className="monitoring-content">
        <MapView members={memberLocations} />
        <ReportsPanel reports={reports} loading={reportsLoading} />
      </div>
    </div>
  );
}

export default Monitoring;


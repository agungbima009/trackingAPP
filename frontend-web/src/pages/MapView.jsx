import React, { useState } from 'react';
import './MapView.css';

function MapView({ members }) {
  const [hoveredMember, setHoveredMember] = useState(null);

  return (
    <div className="map-view">
      <div className="map-container">
        {/* Map placeholder - will be replaced with actual map library */}
        <div className="map-placeholder">
          <div className="map-grid">
            {/* Grid lines for visual effect */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`h-${i}`} className="grid-line horizontal" style={{ top: `${i * 10}%` }} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`v-${i}`} className="grid-line vertical" style={{ left: `${i * 10}%` }} />
            ))}
          </div>
          
          {/* Member location pins */}
          {members.map((member) => (
            <div 
              key={member.id}
              className="location-pin" 
              style={{ top: `${member.lat}%`, left: `${member.lng}%` }}
              onMouseEnter={() => setHoveredMember(member.id)}
              onMouseLeave={() => setHoveredMember(null)}
            >
              <div className={`pin-marker ${member.status}`}>
                <div className="pin-dot"></div>
                {member.status === 'active' && <div className="pin-pulse"></div>}
              </div>
              <div className={`pin-label ${hoveredMember === member.id ? 'visible' : ''}`}>
                {member.name}
                <span className="member-team">Team {member.team.charAt(0).toUpperCase() + member.team.slice(1)}</span>
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="map-info">
              <p>No Members Found</p>
              <span>Try adjusting your filters</span>
            </div>
          )}

          {members.length > 0 && (
            <div className="map-info-small">
              <span>Showing {members.length} member{members.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Map controls */}
        <div className="map-controls">
          <button className="control-button" title="Zoom In">+</button>
          <button className="control-button" title="Zoom Out">-</button>
          <button className="control-button" title="Center Map">⊙</button>
        </div>

        {/* Map legend */}
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-marker active"></div>
            <span>Active</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker inactive"></div>
            <span>Inactive</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker offline"></div>
            <span>Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapView;

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './MapView.css';

// Fix default marker icon (common issue with Leaflet + bundlers like Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on status
const createCustomIcon = (status) => {
  const colors = {
    active: '#22c55e',
    inactive: '#f59e0b',
    offline: '#ef4444'
  };
  
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="custom-marker-pin" style="background-color: ${colors[status]}">
        <div class="marker-inner"></div>
        ${status === 'active' ? '<div class="marker-pulse"></div>' : ''}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

function MapView({ members }) {
  const [hoveredMember, setHoveredMember] = useState(null);
  const mapRef = useRef(null);

  // Default center (Jakarta, Indonesia)
  const defaultCenter = [-6.2088, 106.8456];
  const defaultZoom = 11;

  // Calculate map center from member locations
  const getMapCenter = () => {
    if (members.length === 0) return defaultCenter;
    
    const avgLat = members.reduce((sum, m) => sum + parseFloat(m.lat), 0) / members.length;
    const avgLng = members.reduce((sum, m) => sum + parseFloat(m.lng), 0) / members.length;
    
    return [avgLat, avgLng];
  };

  // Fit map bounds to show all markers when members change
  useEffect(() => {
    if (mapRef.current && members.length > 0) {
      const bounds = L.latLngBounds(members.map(m => [parseFloat(m.lat), parseFloat(m.lng)]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [members]);

  return (
    <div className="map-view">
      <div className="map-container">
        {members.length === 0 ? (
          <div className="map-placeholder">
            <div className="map-info">
              <p>No Members Found</p>
              <span>Try adjusting your filters</span>
            </div>
          </div>
        ) : (
          <MapContainer 
            center={getMapCenter()} 
            zoom={defaultZoom} 
            className="leaflet-map"
            scrollWheelZoom={true}
            ref={mapRef}
          >
            {/* OpenStreetMap Tiles */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            {/* Render markers from member data */}
            {members.map((member) => (
              <Marker 
                key={member.id} 
                position={[parseFloat(member.lat), parseFloat(member.lng)]}
                icon={createCustomIcon(member.status)}
                eventHandlers={{
                  mouseover: () => setHoveredMember(member.id),
                  mouseout: () => setHoveredMember(null),
                }}
              >
                <Popup>
                  <div className="marker-popup">
                    <h3>{member.name}</h3>
                    <div className="popup-info">
                      <p><strong>Email:</strong> {member.email}</p>
                      <p>
                        <strong>Status:</strong> 
                        <span className={`status-badge ${member.status}`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </p>
                      {member.lastUpdate && (
                        <p className="last-update">
                          <strong>Last Update:</strong><br/>
                          {new Date(member.lastUpdate).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                      <p className="coordinates">
                        <strong>Location:</strong><br/>
                        {parseFloat(member.lat).toFixed(4)}, {parseFloat(member.lng).toFixed(4)}
                      </p>
                      {member.accuracy && (
                        <p className="accuracy">
                          <strong>Accuracy:</strong> ±{member.accuracy}m
                        </p>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Map Legend */}
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

        {/* Member count info */}
        {members.length > 0 && (
          <div className="map-info-small">
            <span>Showing {members.length} member{members.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;

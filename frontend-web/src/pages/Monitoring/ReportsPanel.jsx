import React, { useState } from 'react';
import './ReportsPanel.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

function ReportsPanel({ reports, loading }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (imagePath) => {
    setSelectedImage(imagePath);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className={`reports-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="reports-header">
          <h2>Reports</h2>
          <span className="reports-count">{reports.length}</span>
          <button 
            className="toggle-button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '◀' : '▶'}
          </button>
        </div>

        {isExpanded && (
          <div className="reports-content">
            {loading ? (
              <div className="reports-loading">
                <div className="spinner"></div>
                <p>Loading reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="reports-empty">
                <span className="empty-icon">📋</span>
                <p>No reports yet</p>
                <span className="empty-subtitle">Reports will appear here when team members submit them</span>
              </div>
            ) : (
              <div className="reports-list">
                {reports.map((report) => (
                  <div key={report.report_id} className="report-card">
                    <div className="report-header-info">
                      <div className="report-user">
                        <div className="user-avatar">
                          {report.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                          <span className="user-name">{report.user?.name || 'Unknown'}</span>
                          <span className="user-email">{report.user?.email || ''}</span>
                        </div>
                      </div>
                      <span className="report-time">
                        {new Date(report.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {report.report && (
                      <div className="report-description">
                        <p>{report.report}</p>
                      </div>
                    )}

                    {report.photos && report.photos.length > 0 && (
                      <div className="report-images">
                        {report.photos.map((imagePath, idx) => (
                          <div 
                            key={idx} 
                            className="report-image-container"
                            onClick={() => handleImageClick(imagePath)}
                          >
                            <img 
                              src={`${API_BASE_URL}/storage/${imagePath}`}
                              alt={`Report ${idx + 1}`}
                              className="report-image"
                              onError={(e) => {
                                e.target.src = '/icon/image-placeholder.png';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeImageModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <img 
              src={`${API_BASE_URL}/storage/${selectedImage}`}
              alt="Full size report"
              className="modal-image"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ReportsPanel;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: '/icon/Control-Panel.png', label: 'Dashboard', path: '/dashboard' },
    { icon: '/icon/System-Report.png', label: 'Monitoring', path: '/monitoring' },
    { icon: '📈', label: 'Analytics', path: '/analytics' },
    { icon: '📁', label: 'Projects', path: '/projects' },
    { icon: '👥', label: 'Team', path: '/team' }
  ];

  const documentItems = [
    { icon: '📚', label: 'Data Library', path: '/documents/library' },
    { icon: '📄', label: 'Reports', path: '/documents/reports' },
    { icon: '✍️', label: 'Word Assistant', path: '/documents/assistant' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo-life-media.png" alt="Life media" className="company-logo" />
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon.startsWith('/') ? (
                <img src={item.icon} alt={item.label} className="nav-icon" />
              ) : (
                <span className="nav-icon">{item.icon}</span>
              )}
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </ul>

        <div className="nav-section">
          <h3 className="section-title">Documents</h3>
          <ul className="nav-list">
            {documentItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.icon.startsWith('/') ? (
                  <img src={item.icon} alt={item.label} className="nav-icon" />
                ) : (
                  <span className="nav-icon">{item.icon}</span>
                )}
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </ul>
          <button className="more-button">
            <span>...</span>
            <span>More</span>
          </button>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">S</div>
          <div className="user-info">
            <span className="user-name">shadon</span>
            <span className="user-email">hi@example.com</span>
          </div>
          <button className="user-menu">⋮</button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

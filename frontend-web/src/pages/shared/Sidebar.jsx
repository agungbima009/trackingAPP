import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../services/api';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('rememberMe');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login even if API call fails
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('rememberMe');
      navigate('/login');
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const menuItems = [
    { icon: '/icon/Control-Panel.png', label: 'Dashboard', path: '/dashboard' },
    { icon: '/icon/System-Report.png', label: 'Monitoring', path: '/monitoring' },
    { icon: '/icon/Clipboard.png', label: 'Task', path: '/task' },
    { icon: '/icon/Audit.png', label: 'Taken', path: '/taken' },
    { icon: '👥', label: 'Users', path: '/users' }
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
          <button className="user-menu" onClick={toggleUserMenu}>⋮</button>
          {showUserMenu && (
            <div className="user-menu-dropdown">
              <button className="menu-item" onClick={handleLogout}>
                <img src="/icon/Logout.png" alt="Logout" className="menu-icon" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

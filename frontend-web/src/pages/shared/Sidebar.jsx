import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../services/api';
import { canAccessPage, getSessionTimeRemaining } from '../../utils/auth';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);

  // Get user data from localStorage
  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Update session time every minute
    const updateSessionTime = () => {
      setSessionTime(getSessionTimeRemaining());
    };
    
    updateSessionTime(); // Initial call
    const interval = setInterval(updateSessionTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

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

  // Define all menu items with their required permissions
  const allMenuItems = [
    { 
      icon: '/icon/Control-Panel.png', 
      label: 'Dashboard', 
      path: '/dashboard',
      permission: 'DASHBOARD'
    },
    { 
      icon: '/icon/Clipboard.png', 
      label: 'Task', 
      path: '/task',
      permission: 'TASK'
    },
    { 
      icon: '/icon/Audit.png', 
      label: 'Taken', 
      path: '/taken',
      permission: 'TAKEN'
    },
    { 
      icon: '/icon/Add-User-Male.png', 
      label: 'Users', 
      path: '/users',
      permission: 'USER_MANAGEMENT'
    }
  ];

  // Filter menu items based on user permissions
  const menuItems = allMenuItems.filter(item => canAccessPage(item.permission));

  // Get user role display name
  const getUserRoleDisplay = () => {
    if (!currentUser?.roles || currentUser.roles.length === 0) return 'User';
    const roleName = currentUser.roles[0].name;
    return roleName.charAt(0).toUpperCase() + roleName.slice(1);
  };

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
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</div>
          <div className="user-info">
            <span className="user-name">{currentUser?.name || 'User'}</span>
            <span className="user-role">{getUserRoleDisplay()}</span>
          </div>
          <button className="user-menu" onClick={toggleUserMenu}>⋮</button>
          {showUserMenu && (
            <div className="user-menu-dropdown">
              {sessionTime > 0 && (
                <div className="menu-item session-info">
                  <span className="session-icon">⏱</span>
                  Session: {sessionTime}m
                </div>
              )}
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

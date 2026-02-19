import React, { useState, useEffect } from 'react';
import { getUsers, getUserDetails, updateUserProfile, updateUserStatus, deleteUser, getDepartments } from '../../services/api';
import './UserManagement.css';

function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'delete' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    department: '',
    position: '',
    address: '',
    status: 'active'
  });

  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    role: ''
  });

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Show confirmation modal
  const showConfirmModal = (title, message, onConfirm, type = 'delete') => {
    setConfirmModal({ show: true, title, message, onConfirm, type });
  };

  // Handle confirm action
  const handleConfirm = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'delete' });
  };

  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'delete' });
  };

  // Load users on component mount
  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  // Load users from API
  const loadUsers = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await getUsers(filterParams);
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load departments from API
  const loadDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.departments || []);
    } catch (err) {
      console.error('Error loading departments:', err);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setEditMode(false);
    setCurrentUserId(null);
    setFormData({
      name: '',
      email: '',
      phone_number: '',
      department: '',
      position: '',
      address: '',
      status: 'active'
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentUserId(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    loadUsers(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      department: '',
      status: '',
      role: ''
    });
    loadUsers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editMode && currentUserId) {
        // Update existing user
        await updateUserProfile(currentUserId, formData);
        showToast('User updated successfully!', 'success');
      } else {
        // Note: Create user functionality would require a different endpoint
        // For now, we'll show a message
        showToast('Create user functionality requires admin registration endpoint', 'info');
      }

      setShowModal(false);
      // Reload tanpa filter untuk memastikan data terbaru muncul
      loadUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Failed to save user. Please try again.');
    }
  };

  const handleEdit = async (userId) => {
    try {
      setLoading(true);
      const response = await getUserDetails(userId);
      const user = response.user;

      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        department: user.department || '',
        position: user.position || '',
        address: user.address || '',
        status: user.status || 'active'
      });

      setCurrentUserId(userId);
      setEditMode(true);
      setShowModal(true);
    } catch (err) {
      console.error('Error loading user details:', err);
      showToast('Failed to load user details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    showConfirmModal(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      async () => {
        try {
          await deleteUser(userId);
          showToast('User deleted successfully!', 'success');
          // Reload tanpa filter untuk menghindari data hilang
          loadUsers();
        } catch (err) {
          console.error('Error deleting user:', err);
          showToast(err.response?.data?.message || 'Failed to delete user. You may not have permission.', 'error');
        }
      },
      'delete'
    );
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    showConfirmModal(
      `${newStatus === 'active' ? 'Activate' : 'Deactivate'} User`,
      `Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`,
      async () => {
        try {
          await updateUserStatus(userId, newStatus);
          showToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
          // Reload tanpa filter untuk menghindari data hilang
          loadUsers();
        } catch (err) {
          console.error('Error updating user status:', err);
          showToast('Failed to update user status', 'error');
        }
      },
      newStatus === 'active' ? 'activate' : 'deactivate'
    );
  };

  const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'status-badge status-active' : 'status-badge status-inactive';
  };

  const getRoleBadgeClass = (roleName) => {
    const roleMap = {
      'superadmin': 'role-superadmin',
      'admin': 'role-admin',
      'employee': 'role-employee'
    };
    return roleMap[roleName?.toLowerCase()] || 'role-employee';
  };

  return (
    <div className="user-management-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button 
            className="toast-close" 
            onClick={() => setToast({ show: false, message: '', type: '' })}
          >
            ✕
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="confirm-overlay" onClick={handleCancelConfirm}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              {confirmModal.type === 'delete' && (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="24" fill="#FEE2E2"/>
                  <path d="M16 18H18H32M30 18V32C30 32.5304 29.7893 33.0391 29.4142 33.4142C29.0391 33.7893 28.5304 34 28 34H20C19.4696 34 18.9609 33.7893 18.5858 33.4142C18.2107 33.0391 18 32.5304 18 32V18M21 18V16C21 15.4696 21.2107 14.9609 21.5858 14.5858C21.9609 14.2107 22.4696 14 23 14H25C25.5304 14 26.0391 14.2107 26.4142 14.5858C26.7893 14.9609 27 15.4696 27 16V18" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {(confirmModal.type === 'activate' || confirmModal.type === 'deactivate') && (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="24" fill={confirmModal.type === 'activate' ? '#D1FAE5' : '#FEF3C7'}/>
                  <path d="M24 16V24M24 24V32M24 24H32M24 24H16" stroke={confirmModal.type === 'activate' ? '#34C759' : '#FF9500'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <h3 className="confirm-title">{confirmModal.title}</h3>
            <p className="confirm-message">{confirmModal.message}</p>
            <div className="confirm-actions">
              <button className="btn-confirm-cancel" onClick={handleCancelConfirm}>
                Cancel
              </button>
              <button 
                className={`btn-confirm-ok ${confirmModal.type}`} 
                onClick={handleConfirm}
              >
                {confirmModal.type === 'delete' ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="user-header">
        <div>
          <h1>User Management</h1>
          <p className="user-subtitle">Manage system users and permissions</p>
        </div>
        <button className="btn-tambah" onClick={handleOpenModal}>
          <span className="btn-icon">+</span>
          Add User
        </button>
      </div>

      {/* Filters Section */}
      <div className="user-filters">
        <div className="filter-row">
          <input
            type="text"
            name="search"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={handleFilterChange}
            className="filter-input"
          />

          <select
            name="department"
            value={filters.department}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept.name}>{dept.name}</option>
            ))}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
          </select>

          <button onClick={handleSearch} className="btn-filter">
            Search
          </button>

          <button onClick={handleClearFilters} className="btn-clear">
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="error-alert">
          {error}
        </div>
      )}

      <div className="user-content">
        <div className="user-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Memuat data...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-content">
                <span className="empty-icon">👥</span>
                <p>No users found</p>
                <span>Try adjusting your filters or add a new user</span>
              </div>
            </div>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td className="user-name">{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone_number || '-'}</td>
                    <td>{user.department || '-'}</td>
                    <td>{user.position || '-'}</td>
                    <td>
                      <span className={`role-badge ${getRoleBadgeClass(user.roles && user.roles.length > 0 ? user.roles[0].name : 'employee')}`}>
                        {user.roles && user.roles.length > 0 ? user.roles[0].name : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(user.status)}>
                        {user.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(user.id)}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className="action-btn toggle-btn"
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {user.status === 'active' ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(user.id)}
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit User */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit User' : 'Add New User'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="user@example.com"
                    disabled={editMode}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone_number">Phone Number</label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+62 812-3456-7890"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="position">Position</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g., Field Technician"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter full address"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editMode ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;

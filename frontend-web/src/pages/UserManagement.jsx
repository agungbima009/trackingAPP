import React, { useState, useEffect } from 'react';
import { getUsers, getUserDetails, updateUserProfile, updateUserStatus, deleteUser, getDepartments } from '../services/api';
import './UserManagement.css';

function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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
        alert('User updated successfully!');
      } else {
        // Note: Create user functionality would require a different endpoint
        // For now, we'll show a message
        alert('Create user functionality requires admin registration endpoint');
      }

      setShowModal(false);
      loadUsers(filters);
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
      alert('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        alert('User deleted successfully!');
        loadUsers(filters);
      } catch (err) {
        console.error('Error deleting user:', err);
        alert(err.response?.data?.message || 'Failed to delete user. You may not have permission.');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    if (window.confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'deactivate'} this user?`)) {
      try {
        await updateUserStatus(userId, newStatus);
        alert(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
        loadUsers(filters);
      } catch (err) {
        console.error('Error updating user status:', err);
        alert('Failed to update user status');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'status-badge status-active' : 'status-badge status-inactive';
  };

  return (
    <div className="user-management-page">
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
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>No users found</p>
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
                      <span className="role-badge">
                        {user.roles && user.roles.length > 0 ? user.roles[0].name : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(user.status)}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEdit(user.id)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-action btn-toggle"
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {user.status === 'active' ? '🔒' : '🔓'}
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(user.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
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

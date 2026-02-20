import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, getTasks, getUsers } from '../../services/api';
import './Taken.css';

function Taken() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [takens, setTakens] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'delete' });

  const [formData, setFormData] = useState({
    task_id: '',
    user_ids: [],
    date: '',
    start_time: ''
  });

  const [filters, setFilters] = useState({
    task_id: '',
    user_id: '',
    status: '',
    date: ''
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

  // Load data on component mount
  useEffect(() => {
    loadAssignments();
    loadTasks();
    loadUsers();
  }, []);

  // Load assignments from API
  const loadAssignments = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError('');
      const response = await getAssignments(filterParams);
      setTakens(response.data || []);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks from API
  const loadTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  // Load users from API
  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData({
      task_id: '',
      user_ids: [],
      date: new Date().toISOString().split('T')[0],
      start_time: ''
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (name === 'user_ids') {
      // Handle multiple user selection
      const options = e.target.options;
      const selectedUsers = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedUsers.push(options[i].value);
        }
      }
      setFormData(prev => ({
        ...prev,
        user_ids: selectedUsers
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    loadAssignments(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      task_id: '',
      user_id: '',
      status: '',
      date: ''
    });
    loadAssignments();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Create new assignment with default status 'pending'
      const assignmentData = {
        ...formData,
        status: 'pending'
      };
      await createAssignment(assignmentData);
      showToast('Assignment created successfully!', 'success');
      setShowModal(false);
      // Reload tanpa filter untuk memastikan data terbaru muncul
      loadAssignments();
    } catch (err) {
      console.error('Error saving assignment:', err);
      setError(err.response?.data?.message || 'Failed to save assignment. Please try again.');
    }
  };

  const handleDelete = async (takenId) => {
    showConfirmModal(
      'Delete Assignment',
      'Are you sure you want to delete this assignment? This action cannot be undone.',
      async () => {
        try {
          await deleteAssignment(takenId);
          showToast('Assignment deleted successfully!', 'success');
          // Reload tanpa filter untuk menghindari data hilang
          loadAssignments();
        } catch (err) {
          console.error('Error deleting assignment:', err);
          showToast(err.response?.data?.message || 'Failed to delete assignment.', 'error');
        }
      },
      'delete'
    );
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'in_progress': 'status-in-progress',
      'completed': 'status-completed'
    };
    return statusMap[status] || '';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed'
    };
    return labelMap[status] || status;
  };

  return (
    <div className="taken-page">
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

      <div className="taken-header">
        <div>
          <h1>Task Assignment Management</h1>
          <p className="taken-subtitle">Manage and distribute tasks to team members</p>
        </div>
        <button className="btn-tambah" onClick={handleOpenModal}>
          <span className="btn-icon">+</span>
          Assign Task
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <select
            name="task_id"
            value={filters.task_id}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Tasks</option>
            {tasks.map(task => (
              <option key={task.task_id} value={task.task_id}>
                {task.title}
              </option>
            ))}
          </select>

          <select
            name="user_id"
            value={filters.user_id}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="filter-input"
          />

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

      <div className="taken-content">
        <div className="taken-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Memuat data...</p>
            </div>
          ) : (
            <table className="taken-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Task Name</th>
                  <th>Assigned Users</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="monitor-header">Monitor</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {takens.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-state">
                      <div className="empty-content">
                        <span className="empty-icon">📋</span>
                        <p>No assignments yet</p>
                        <span>Click "Assign Task" button to create new assignment</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  takens.map((taken, index) => (
                    <tr key={taken.taken_task_id}>
                      <td className="row-number">{index + 1}</td>
                      <td className="taken-name">
                        {taken.task?.title || 'N/A'}
                      </td>
                      <td className="team-cell">
                        {taken.users && taken.users.length > 0 ? (
                          <div className="user-badges">
                            {taken.users.map((user, idx) => (
                              <span key={idx} className="team-badge" title={user.email}>
                                {user.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="team-badge">N/A</span>
                        )}
                      </td>
                      <td className="deadline-cell">
                        {taken.date ? new Date(taken.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="date-cell">
                        {taken.start_time ? new Date(taken.start_time).toLocaleString() : '-'}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(taken.status)}`}>
                          {getStatusLabel(taken.status)}
                        </span>
                      </td>
                      <td className="date-cell">
                        {taken.created_at ? new Date(taken.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="monitor-cell">
                        <button
                          className="action-btn monitor-btn"
                          onClick={() => navigate(`/monitoring/${taken.taken_task_id}`)}
                          title="View Monitoring"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 7C12 9.20914 10.2091 11 8 11C5.79086 11 4 9.20914 4 7C4 4.79086 5.79086 3 8 3C10.2091 3 12 4.79086 12 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 9C8.55228 9 9 8.55228 9 8C9 7.44772 8.55228 7 8 7C7.44772 7 7 7.44772 7 8C7 8.55228 7.44772 9 8 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M2 7C2.66667 4.33333 4.66667 2 8 2C11.3333 2 13.3333 4.33333 14 7C13.3333 9.66667 11.3333 12 8 12C4.66667 12 2.66667 9.66667 2 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(taken.taken_task_id)}
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for adding/editing assignment */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Task</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="error-alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="task_id">Task <span className="required">*</span></label>
                <select
                  id="task_id"
                  name="task_id"
                  value={formData.task_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Task</option>
                  {tasks.map(task => (
                    <option key={task.task_id} value={task.task_id}>
                      {task.title} - {task.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="user_ids">Assign to Users <span className="required">*</span></label>
                <select
                  id="user_ids"
                  name="user_ids"
                  multiple
                  value={formData.user_ids}
                  onChange={handleInputChange}
                  required
                  style={{ minHeight: '120px' }}
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.department || 'No Department'}
                    </option>
                  ))}
                </select>
                <small className="form-hint">Hold Ctrl/Cmd to select multiple users</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date <span className="required">*</span></label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="start_time">Start Time</label>
                  <input
                    type="datetime-local"
                    id="start_time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Taken;

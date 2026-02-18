import React, { useState, useEffect } from 'react';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment, getTasks, getUsers } from '../../services/api';
import './Taken.css';

function Taken() {
  const [showModal, setShowModal] = useState(false);
  const [takens, setTakens] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentTakenId, setCurrentTakenId] = useState(null);

  const [formData, setFormData] = useState({
    task_id: '',
    user_ids: [],
    date: '',
    start_time: '',
    status: 'active'
  });

  const [filters, setFilters] = useState({
    task_id: '',
    user_id: '',
    status: '',
    date: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadAssignments();
    loadTasks();
    loadUsers();
  }, []);

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
    setEditMode(false);
    setCurrentTakenId(null);
    setFormData({
      task_id: '',
      user_ids: [],
      date: new Date().toISOString().split('T')[0],
      start_time: '',
      status: 'active'
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentTakenId(null);
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
      if (editMode && currentTakenId) {
        // Update existing assignment
        await updateAssignment(currentTakenId, formData);
        alert('Assignment updated successfully!');
      } else {
        // Create new assignment
        await createAssignment(formData);
        alert('Assignment created successfully!');
      }

      setShowModal(false);
      loadAssignments(filters);
    } catch (err) {
      console.error('Error saving assignment:', err);
      setError(err.response?.data?.message || 'Failed to save assignment. Please try again.');
    }
  };

  const handleEdit = async (takenId) => {
    try {
      setLoading(true);
      const assignment = takens.find(t => t.taken_task_id === takenId);

      if (assignment) {
        setFormData({
          task_id: assignment.task_id || '',
          user_ids: assignment.user_ids || [],
          date: assignment.date?.split('T')[0] || '',
          start_time: assignment.start_time || '',
          status: assignment.status || 'active'
        });

        setCurrentTakenId(takenId);
        setEditMode(true);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Error loading assignment:', err);
      setError('Failed to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (takenId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment(takenId);
        alert('Assignment deleted successfully!');
        loadAssignments(filters);
      } catch (err) {
        console.error('Error deleting assignment:', err);
        setError(err.response?.data?.message || 'Failed to delete assignment.');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'status-badge pending',
      'active': 'status-badge active',
      'completed': 'status-badge completed'
    };
    return statusMap[status] || 'status-badge';
  };

  return (
    <div className="taken-page">
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
            <option value="active">Active</option>
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
              <p>Loading assignments...</p>
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
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {takens.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">
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
                        {taken.assigned_users && taken.assigned_users.length > 0 ? (
                          <div className="user-badges">
                            {taken.assigned_users.map((user, idx) => (
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
                        <span className={getStatusBadgeClass(taken.status)}>
                          {taken.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="date-cell">
                        {taken.created_at ? new Date(taken.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(taken.taken_task_id)}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
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
              <h2>{editMode ? 'Edit Assignment' : 'Assign Task'}</h2>
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

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editMode ? 'Update Assignment' : 'Assign Task'}
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

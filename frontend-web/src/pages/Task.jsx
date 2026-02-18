import React, { useState, useEffect } from 'react';
import './Task.css';
import { getTasks, createTask, updateTask, deleteTask, getTaskDetails } from '../services/api';

function Task() {
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    status: 'pending'
  });

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      console.log('Current token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        console.error('No authentication token found');
        alert('Anda belum login. Silakan login terlebih dahulu.');
        window.location.href = '/login';
        return;
      }
      
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (locationFilter) filters.location = locationFilter;
      if (searchTerm) filters.search = searchTerm;

      console.log('Fetching tasks with filters:', filters);
      const response = await getTasks(filters);
      console.log('Tasks loaded:', response);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      
      if (error.response?.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      } else {
        alert('Gagal memuat data task. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reload tasks when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTasks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, locationFilter]);

  const handleOpenModal = () => {
    setShowModal(true);
    setIsEditMode(false);
    setEditingTaskId(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      status: 'pending'
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingTaskId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode && editingTaskId) {
        // Update existing task
        await updateTask(editingTaskId, formData);
        alert('Task berhasil diperbarui!');
      } else {
        // Create new task
        await createTask(formData);
        alert('Task berhasil dibuat!');
      }
      
      setShowModal(false);
      loadTasks(); // Reload tasks
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Gagal menyimpan task. Silakan coba lagi.');
    }
  };

  const handleEdit = async (taskId) => {
    try {
      const response = await getTaskDetails(taskId);
      const task = response.task;
      
      setIsEditMode(true);
      setEditingTaskId(taskId);
      setFormData({
        title: task.title,
        description: task.description,
        location: task.location,
        status: task.status
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error loading task details:', error);
      alert('Gagal memuat detail task.');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus task ini?')) {
      try {
        await deleteTask(taskId);
        alert('Task berhasil dihapus!');
        loadTasks(); // Reload tasks
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Gagal menghapus task. Silakan coba lagi.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'status-pending',
      'in_progress': 'status-in-progress',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labelMap[status] || status;
  };

  return (
    <div className="task-page">
      <div className="task-header">
        <div>
          <h1>Task Management</h1>
          <p className="task-subtitle">Kelola dan distribusikan task kepada tim</p>
        </div>
        <button className="btn-tambah" onClick={handleOpenModal}>
          <span className="btn-icon">+</span>
          Tambah Task
        </button>
      </div>

      {/* Filter Section */}
      <div className="task-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Cari task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Filter lokasi..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      <div className="task-content">
        <div className="task-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Memuat data...</p>
            </div>
          ) : (
            <table className="task-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <div className="empty-content">
                        <span className="empty-icon">📋</span>
                        <p>Belum ada task</p>
                        <span>Klik tombol "Tambah Task" untuk membuat task baru</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task, index) => (
                    <tr key={task.task_id}>
                      <td className="row-number">{index + 1}</td>
                      <td className="task-name">{task.title}</td>
                      <td className="task-description">{task.description}</td>
                      <td className="location-cell">{task.location}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(task.created_at)}</td>
                      <td className="actions-cell">
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => handleEdit(task.task_id)}
                          title="Edit"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDelete(task.task_id)}
                          title="Delete"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 4H3.33333H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.33301 4.00004V2.66671C5.33301 2.31309 5.47348 1.97395 5.72353 1.7239C5.97358 1.47385 6.31272 1.33337 6.66634 1.33337H9.33301C9.68663 1.33337 10.0258 1.47385 10.2758 1.7239C10.5259 1.97395 10.6663 2.31309 10.6663 2.66671V4.00004M12.6663 4.00004V13.3334C12.6663 13.687 12.5259 14.0261 12.2758 14.2762C12.0258 14.5262 11.6866 14.6667 11.333 14.6667H4.66634C4.31272 14.6667 3.97358 14.5262 3.72353 14.2762C3.47348 14.0261 3.33301 13.687 3.33301 13.3334V4.00004H12.6663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

      {/* Modal for adding/editing task */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Task' : 'Tambah Task Baru'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Title <span className="required">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Masukkan judul task"
                  maxLength="255"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description <span className="required">*</span></label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Deskripsi task"
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location <span className="required">*</span></label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Contoh: 123 Main Street, City Center"
                  maxLength="255"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status <span className="required">*</span></label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className="btn-submit">
                  {isEditMode ? 'Update Task' : 'Simpan Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Task;

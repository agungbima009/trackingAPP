import React, { useState } from 'react';
import './Taken.css';

function Taken() {
  const [showModal, setShowModal] = useState(false);
  const [takens, setTakens] = useState([
    {
      id: 1,
      taskName: 'Survey Lokasi A',
      description: 'Melakukan survey lokasi untuk proyek pembangunan',
      assignedTeam: 'Alpha',
      deadline: '2026-03-01',
      status: 'Active',
      createdAt: '2026-02-10'
    },
    {
      id: 2,
      taskName: 'Pengumpulan Data',
      description: 'Mengumpulkan data pelanggan di area Jakarta Selatan',
      assignedTeam: 'Beta',
      deadline: '2026-02-25',
      status: 'Active',
      createdAt: '2026-02-12'
    },
    {
      id: 3,
      taskName: 'Inspeksi Peralatan',
      description: 'Pemeriksaan rutin peralatan lapangan',
      assignedTeam: 'Gamma',
      deadline: '2026-02-28',
      status: 'Completed',
      createdAt: '2026-02-08'
    }
  ]);

  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    assignedTeam: '',
    deadline: '',
    status: 'Active'
  });

  const handleOpenModal = () => {
    setShowModal(true);
    setFormData({
      taskName: '',
      description: '',
      assignedTeam: '',
      deadline: '',
      status: 'Active'
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create new taken
    const newTaken = {
      id: takens.length + 1,
      ...formData,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTakens(prev => [...prev, newTaken]);
    setShowModal(false);
    
    // Reset form
    setFormData({
      taskName: '',
      description: '',
      assignedTeam: '',
      deadline: '',
      status: 'Active'
    });
  };

  const handleEdit = (takenId) => {
    // TODO: Implement edit functionality
    console.log('Edit taken:', takenId);
  };

  const handleDelete = (takenId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus taken ini?')) {
      setTakens(prev => prev.filter(taken => taken.id !== takenId));
    }
  };

  return (
    <div className="taken-page">
      <div className="taken-header">
        <div>
          <h1>Taken Management</h1>
          <p className="taken-subtitle">Kelola dan distribusikan taken kepada tim</p>
        </div>
        <button className="btn-tambah" onClick={handleOpenModal}>
          <span className="btn-icon">+</span>
          Assign
        </button>
      </div>

      <div className="taken-content">
        <div className="taken-table-container">
          <table className="taken-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Task Name</th>
                <th>Description</th>
                <th>Assigned Team</th>
                <th>Deadline</th>
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
                      <p>Belum ada taken</p>
                      <span>Klik tombol "Assign" untuk membuat taken baru</span>
                    </div>
                  </td>
                </tr>
              ) : (
                takens.map((taken, index) => (
                  <tr key={taken.id}>
                    <td className="row-number">{index + 1}</td>
                    <td className="taken-name">{taken.taskName}</td>
                    <td className="taken-description">{taken.description}</td>
                    <td className="team-cell">
                      <span className="team-badge">{taken.assignedTeam}</span>
                    </td>
                    <td className="deadline-cell">{taken.deadline}</td>
                    <td>
                      <span className={`status-badge ${taken.status.toLowerCase()}`}>
                        {taken.status}
                      </span>
                    </td>
                    <td className="date-cell">{taken.createdAt}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEdit(taken.id)}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDelete(taken.id)}
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
        </div>
      </div>

      {/* Modal for adding taken */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Task Baru</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="taskName">Task Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="taskName"
                  name="taskName"
                  value={formData.taskName}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama task"
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assignedTeam">Assigned Team <span className="required">*</span></label>
                  <select
                    id="assignedTeam"
                    name="assignedTeam"
                    value={formData.assignedTeam}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Pilih Team</option>
                    <option value="Alpha">Team Alpha</option>
                    <option value="Beta">Team Beta</option>
                    <option value="Gamma">Team Gamma</option>
                    <option value="Delta">Team Delta</option>
                    <option value="Epsilon">Team Epsilon</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="deadline">Deadline <span className="required">*</span></label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
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
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Batal
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

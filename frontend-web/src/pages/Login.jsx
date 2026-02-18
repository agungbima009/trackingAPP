import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      // Call real API
      const response = await login(formData.email, formData.password);
      
      // Store authentication status
      localStorage.setItem('isAuthenticated', 'true');
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      console.log('Login successful:', response);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different error types
      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          setError('Invalid email or password');
        } else if (err.response.status === 422) {
          // Validation error
          const errors = err.response.data.errors;
          const firstError = Object.values(errors)[0][0];
          setError(firstError || 'Validation error');
        } else {
          setError(err.response.data.message || 'Login failed. Please try again.');
        }
      } else if (err.request) {
        // Request made but no response
        setError('Cannot connect to server. Please check your connection.');
      } else {
        // Other errors
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-branding">
          <img src="/logo-life-media.png" alt="Life Media" className="login-logo" />
          <h1 className="login-title">Worker Tracking System</h1>
          <p className="login-subtitle">Admin Portal</p>
          <div className="login-features">
            <div className="feature-item">
              <img src="/icon/Control-Panel.png" alt="Location" className="feature-icon" />
              <span className="feature-text">Real-time Location Tracking</span>
            </div>
            <div className="feature-item">
              <img src="/icon/System-Report.png" alt="Monitoring" className="feature-icon" />
              <span className="feature-text">Comprehensive Monitoring</span>
            </div>
            <div className="feature-item">
              <img src="/icon/Clipboard.png" alt="Task" className="feature-icon" />
              <span className="feature-text">Task Management</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <span className="checkbox-label">Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Need help? <a href="#">Contact Support</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

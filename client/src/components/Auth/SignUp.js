import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import './Auth.css';

const SignUp = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, error, setError } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signUp(formData.email, formData.password, formData.displayName);
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form-new">
      <div className="form-group-new">
        <div className="input-wrapper-new">
          <User className="input-icon-new" size={20} />
          <input
            type="text"
            name="displayName"
            placeholder="Name"
            value={formData.displayName}
            onChange={handleChange}
            className="auth-input-new"
            required
          />
        </div>
      </div>

      <div className="form-group-new">
        <div className="input-wrapper-new">
          <Mail className="input-icon-new" size={20} />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="auth-input-new"
            required
          />
        </div>
      </div>

      <div className="form-group-new">
        <div className="input-wrapper-new">
          <Lock className="input-icon-new" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="auth-input-new"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle-new"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="form-group-new">
        <div className="input-wrapper-new">
          <Lock className="input-icon-new" size={20} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="auth-input-new"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="password-toggle-new"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="auth-options">
        <label className="checkbox-wrapper">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="remember-checkbox"
          />
          <span className="checkbox-label">Remember me</span>
        </label>
        <button
          type="button"
          className="forgot-password-link"
        >
          Forgot password?
        </button>
      </div>

      {error && <div className="error-message-new">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="auth-button-new primary"
      >
        {loading ? 'Creating Account...' : 'SIGN UP'}
      </button>

      <div className="auth-footer">
        <span className="auth-footer-text">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="auth-footer-link"
          >
            Login
          </button>
        </span>
      </div>
    </form>
  );
};

export default SignUp;

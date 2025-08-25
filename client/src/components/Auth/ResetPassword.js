import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, ArrowLeft } from 'lucide-react';
import './Auth.css';

const ResetPassword = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword, error, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
                      <div className="auth-logo">
            <img 
              src="/logo.png" 
              alt="Shafra Logo" 
              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
            />
            <span className="auth-app-name">Shafra</span>
          </div>
            <h2>Check Your Email</h2>
            <p>We've sent a password reset link to {email}</p>
            <div className="auth-tagline">Your spiritual journey continues</div>
          </div>

          <div className="success-message">
            <p>Please check your email and click the link to reset your password.</p>
            <p>If you don't see the email, check your spam folder.</p>
          </div>

          <button
            onClick={onSwitchToLogin}
            className="auth-button primary"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img 
              src="/logo.png" 
              alt="Shafra Logo" 
              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
            />
            <span className="auth-app-name">Shafra</span>
          </div>
          <h2>Reset Password</h2>
          <p>Enter your email to receive a reset link</p>
          <div className="auth-tagline">We'll help you get back on track</div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="input-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="auth-button primary"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-links">
          <button
            onClick={onSwitchToLogin}
            className="link-button"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

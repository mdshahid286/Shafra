import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import './Auth.css';

const Login = ({ onSwitchToSignUp, onSwitchToReset }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, error, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signIn(email, password);
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
          <Mail className="input-icon-new" size={20} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          onClick={onSwitchToReset}
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
        {loading ? 'Signing In...' : 'LOGIN'}
      </button>

      <div className="auth-footer">
        <span className="auth-footer-text">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="auth-footer-link"
          >
            Sign Up
          </button>
        </span>
      </div>
    </form>
  );
};

export default Login;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';
import SignUp from './SignUp';
import ResetPassword from './ResetPassword';
import './Auth.css';

const AuthContainer = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'reset'
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to home page if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const switchToLogin = () => setAuthMode('login');
  const switchToSignUp = () => setAuthMode('signup');
  const switchToReset = () => setAuthMode('reset');

  const renderAuthComponent = () => {
    switch (authMode) {
      case 'signup':
        return <SignUp onSwitchToLogin={switchToLogin} />;
      case 'reset':
        return <ResetPassword onSwitchToLogin={switchToLogin} />;
      default:
        return (
          <Login 
            onSwitchToSignUp={switchToSignUp} 
            onSwitchToReset={switchToReset} 
          />
        );
    }
  };

  return (
    <div className="auth-container-new">
      <div className="auth-card-new">
        {/* App Branding Header */}
        <div className="app-branding">
          <div className="app-logo">
            <img 
              src="/logo.png" 
              alt="Shafra Logo" 
              className="flame-icon-brand"
              style={{ width: '80px', height: '80px', objectFit: 'contain' }}
            />
          </div>
          <h1 className="app-name">Shafra</h1>
          <p className="app-tagline">Simple ticks. Stronger faith.</p>
        </div>

        {/* Authentication Component */}
        {renderAuthComponent()}
      </div>
    </div>
  );
};

export default AuthContainer;

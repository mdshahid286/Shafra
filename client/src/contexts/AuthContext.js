import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../firebase/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up
  const signUp = async (email, password, displayName = '') => {
    try {
      setError(null);
      const user = await authService.signUp(email, password, displayName);
      return user;
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  // Sign in
  const signIn = async (email, password) => {
    try {
      setError(null);
      const user = await authService.signIn(email, password);
      return user;
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      await authService.resetPassword(email);
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  };

  // Get error message from Firebase error code
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long.';
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

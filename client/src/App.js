import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HabitProvider } from './contexts/HabitContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AuthContainer from './components/Auth/AuthContainer';
import PrivateRoute from './components/Auth/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <HabitProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/auth" element={<AuthContainer />} />
              <Route path="/" element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <Home />
                    </main>
                  </>
                </PrivateRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <>
                    <Navbar />
                    <main className="main-content">
                      <Dashboard />
                    </main>
                  </>
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </Router>
      </HabitProvider>
    </AuthProvider>
  );
}

export default App;

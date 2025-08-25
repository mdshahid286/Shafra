import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3 } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link 
          to="/" 
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          <Home size={20} />
          <span>Home</span>
        </Link>
        
        <Link 
          to="/dashboard" 
          className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

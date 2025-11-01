import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          SlotSwapper
        </NavLink>
        <ul className="nav-menu">
          {user ? (
            <>
              <li className="nav-item">
                <NavLink to="/dashboard" className={activeClass}>
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/marketplace" className={activeClass}>
                  Marketplace
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/requests" className={activeClass}>
                  Requests
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/terminal" className={activeClass}>
                  Terminal
                </NavLink>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-button">
                  Logout
                </button>
              </li>
              <li className="nav-item">
                <img
                  src={getAvatarUrl(user.name)}
                  alt={user.name}
                  className="nav-avatar"
                  title={user.name}
                />
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <NavLink to="/login" className={activeClass}>
                  Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/signup" className={activeClass}>
                  Sign Up
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
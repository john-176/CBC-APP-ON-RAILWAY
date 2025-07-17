import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "./Navbar.css";
import logo from "../../assets/jsslogo.jpg";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Close menu when clicking outside or navigating
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  if (loading) return null;

  return (
    <nav className="navbar" ref={menuRef} aria-label="Main navigation">
      <div className="navbar-container">
        <div className="navbar-brand">
          <button 
            className={`hamburger ${isOpen ? "open" : ""}`} 
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <Link to="/" className="logo-link">
            <img 
              src={logo} 
              alt="School Logo" 
              className="navbar-logo" 
              width="75" 
              height="75"
            />
          </Link>
        </div>

        <ul className={`navbar-links ${isOpen ? "open" : ""}`}>
          <NavItem to="/" icon="🏠" label="Home" />
          <NavItem to="/gallery" icon="📝" label="Gallery" />
          <NavItem to="/announcements" icon="📢" label="Announcements" />
          <NavItem to="/directions" icon="🗺️" label="Directions" />
          <NavItem to="/About" icon="ℹ️" label="About Us" />
          <NavItem to="timetable" icon="📅" label="Timetable" />
          
          {user ? (
            <NavItem to="/logout" icon="🔐" label="Logout" />
          ) : (
            <>
              <NavItem to="/login" icon="🔓" label="Login" />
              <NavItem to="/signup" icon="👨‍💼" label="Signup" />
            </>
          )}
        </ul>
      </div>
      <hr />
    </nav>
  );
}

// Separate component for nav items
function NavItem({ to, icon, label }) {
  return (
    <li className="nav-item">
      <Link to={to} className="nav-link">
        <span className="nav-icon" aria-hidden="true">{icon}</span>
        <span className="nav-text">{label}</span>
      </Link>
    </li>
  );
}
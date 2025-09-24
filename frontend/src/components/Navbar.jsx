import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar-custom">
      {/* left placeholder (can hold logo or nav items later) */}
      <div className="navbar-left" />

      {/* centered brand */}
      <div className="navbar-center">
        <Link to="/" className="navbar-brand">
          My Blog
        </Link>
      </div>

      {/* right actions */}
      <div className="navbar-right">
        {user ? (
          <>
            <span className="user-chip">Welcome {user.email}</span>
            <Link to="/myposts" className="nav-link">My Posts</Link>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/signup" className="btn-signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

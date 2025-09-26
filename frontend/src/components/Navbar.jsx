import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { PostsContext } from "../context/PostsContext"; 
import "./Navbar.css";

export default function Navbar({ onSearch }) {
  const { user, logout } = useContext(AuthContext);
  const {applyFilters} = useContext(PostsContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    applyFilters({ ...filters, q: query });
    if (onSearch) {
      onSearch({ ...filters, q: query });
    }
  };

  const updateFilter = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <nav className="navbar-custom">
      {/* LEFT COLUMN: back button + search */}
      <div className="navbar-left">
        {location.pathname !== "/" && (
          <button className="btn-back" onClick={() => navigate(-1)}>
            &#8592;
          </button>
        )}

        {user && (
          <form onSubmit={handleSubmit} className="navbar-search">
            <input
              type="text"
              placeholder="Search posts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="button"
              className="btn-filters"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters ⚙️
            </button>
            <button type="submit" className="btn-search">
              Search
            </button>
          </form>
        )}
      </div>

      {/* CENTER COLUMN: brand */}
      <div className="navbar-center">
        <Link to="/" className="navbar-brand">
          My Blog
        </Link>
      </div>

      {/* RIGHT COLUMN: user actions */}
      <div className="navbar-right">
        {user ? (
          <>
            {/* filter dropdown (absolute positioned) */}
            {showFilters && (
              <div className="filter-dropdown">
                <input
                  placeholder="Title contains..."
                  onChange={(e) => updateFilter("title", e.target.value)}
                />
                <input
                  placeholder="Author email..."
                  onChange={(e) => updateFilter("author_name", e.target.value)}
                />

                <label>From:</label>
                <input
                  type="date"
                  onChange={(e) => updateFilter("date_from", e.target.value)}
                />
                <label>To:</label>
                <input
                  type="date"
                  onChange={(e) => updateFilter("date_to", e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Min comments"
                  onChange={(e) =>
                    updateFilter("min_comments", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Max comments"
                  onChange={(e) =>
                    updateFilter("max_comments", e.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="Min likes"
                  onChange={(e) => updateFilter("min_likes", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max likes"
                  onChange={(e) => updateFilter("max_likes", e.target.value)}
                />

                <label>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      updateFilter("has_comments", e.target.checked)
                    }
                  />
                  Has comments
                </label>

                <input
                  placeholder="Liked by (email)"
                  onChange={(e) => updateFilter("liked_by", e.target.value)}
                />
                <input
                  placeholder="Commented by (email)"
                  onChange={(e) =>
                    updateFilter("commented_by", e.target.value)
                  }
                />
              </div>
            )}

            {/* user actions */}
            <span className="user-chip">Welcome {user.email}</span>
            <Link to="/myposts" className="nav-link">
              My Posts
            </Link>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-login">
              Login
            </Link>
            <Link to="/signup" className="btn-signup">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

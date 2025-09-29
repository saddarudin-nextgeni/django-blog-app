import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { PostsContext } from "../context/PostsContext"; 
import { cleanFilters } from "../utils/filters";
import "./Navbar.css";

export default function Navbar({ onSearch }) {
  const { user, logout } = useContext(AuthContext);
  const {applyFilters} = useContext(PostsContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const defaultFilters = {
    title: "",
    author_email: "",
    date_from: "",
    date_to: "",
    min_comments: "",
    max_comments: "",
    min_likes: "",
    max_likes: "",
    liked_by: "",
    commented_by: "",
  };
  const [filters, setFilters] = useState(defaultFilters);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      applyFilters({ q: query });
      if (onSearch) onSearch({ q: query });
    } else {
      const params = cleanFilters(filters);
      applyFilters(params);
      if (onSearch) onSearch(params);
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
                <button
                  type="button"
                  className="btn-clear-filters"
                  onClick={() => {
                    setFilters(defaultFilters);
                    setQuery("");
                    applyFilters({});
                  if (onSearch) onSearch({});
        }}
      >
                  Clear Filters
                </button>
                <input
                  placeholder="Title contains..."
                  value={filters.title}
                  onChange={(e) => updateFilter("title", e.target.value)}
                />
                <input
                  placeholder="Author email..."
                  value={filters.author_email}
                  onChange={(e) => updateFilter("author_email", e.target.value)}
                />

                <label>From:</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => updateFilter("date_from", e.target.value)}
                />
                <label>To:</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => updateFilter("date_to", e.target.value)}
                />

                <input
                  type="number"
                  placeholder="Min comments"
                  value={filters.min_comments}
                  onChange={(e) =>
                    updateFilter("min_comments", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Max comments"
                  value={filters.max_comments}
                  onChange={(e) =>
                    updateFilter("max_comments", e.target.value)
                  }
                />

                <input
                  type="number"
                  placeholder="Min likes"
                  value={filters.min_likes}
                  onChange={(e) => updateFilter("min_likes", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max likes"
                  value={filters.max_likes}
                  onChange={(e) => updateFilter("max_likes", e.target.value)}
                />


                <input
                  placeholder="Liked by (email)"
                  value={filters.liked_by}
                  onChange={(e) => updateFilter("liked_by", e.target.value)}
                />
                <input
                  placeholder="Commented by (email)"
                  value={filters.commented_by}
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

import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import api from "../lib/api";
import debounce from "lodash.debounce";

function MentionInput({ value, onChange, placeholder = "Type here..." }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const textAreaRef = useRef(null);
  const rect = textAreaRef.current?.getBoundingClientRect();

  // Debounced API call
  const fetchUsers = debounce(async (q) => {
    if (!q) return;
    try {
      const res = await api.get(`/users/mention/?q=${q}`);
      setUsers(res.data);
      setShowDropdown(true);
    } catch (err) {
      console.error(err);
    }
  }, 300);

  // Handle typing
  const handleChange = (e) => {
    const text = e.target.value;
    onChange(text);

    const match = text.match(/@(\w*)$/); // look for text after @
    if (match) {
      setQuery(match[1]);
      fetchUsers(match[1]);
    } else {
      setShowDropdown(false);
    }
  };

  // Handle selecting a user
  const handleSelect = (user) => {
    const newText = value.replace(/@(\w*)$/, `${user.email} `);
    onChange(newText);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <textarea
        ref={textAreaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows="3"
        style={{ width: "100%", padding: "8px" }}
      />

      {showDropdown && users.length > 0 && rect &&
  ReactDOM.createPortal(
    <ul
      className="mention-dropdown"
      style={{
        position: "absolute",
        top: rect.bottom + window.scrollY, // put below textarea
        left: rect.left + window.scrollX,
        width: rect.width,
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        zIndex: 99999
      }}
    >
      {users.map(user => (
        <li
          key={user.id}
          onClick={() => handleSelect(user)}
          style={{ padding: "6px", cursor: "pointer" }}
        >
          {user.email}
        </li>
      ))}
    </ul>,
    document.body
  )
}

    </div>
  );
}

export default MentionInput;

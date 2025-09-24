import React, { useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import "./Signup.css";




export default function Signup() {
  const { login} = React.useContext(AuthContext);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    age: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await api.post("/auth/register/", {
        email: form.email,
        password: form.password,
        name: form.name,
        age: form.age,
        bio: form.bio,
      });

      await login({ email: form.email, password: form.password });
      navigate("/"); // Redirect to homepage after signup
    } catch (err) {
      let msg = "Signup failed. Please check your details.";
  if (err.response?.data) {
    const data = err.response.data;
    if (typeof data === "string") {
      msg = data;
    } else if (data.error) {
      msg = data.error;
    } else if (data.detail) {
      msg = data.detail;
    } else {
      // Collect all field errors
      msg = Object.values(data).flat().join(" ");
    }
  }
  setError(msg);
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <input
          name="name"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="age"
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          min="10"
          max="80"
          required
        />
        <textarea
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
        />
        {error && <div className="signup-error">{error}</div>}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
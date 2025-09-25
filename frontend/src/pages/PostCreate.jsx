import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import { PostsContext } from "../context/PostsContext";
import "./PostCreate.css";

export default function PostCreate() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const nav = useNavigate();
  const { addPost } = useContext(PostsContext);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      nav("/login", { state: { next: "/posts/create" } });
    }
  }, [user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required");
      return;
    }
    setLoading(true);
    try {
      const r = await api.post("/posts/create/", { title, content });
      addPost(r.data);
      nav(`/posts/${r.data.id}`);
    } catch {
      alert("Create failed (are you logged in?)");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // prevent rendering until redirect

  return (
    <div className="post-create-container">
      <h2>Create Post</h2>
      <form onSubmit={submit}>
        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title"
            required
          />
        </label>

        <label>
          Content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your content..."
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Post"}
        </button>
      </form>
    </div>
  );
}

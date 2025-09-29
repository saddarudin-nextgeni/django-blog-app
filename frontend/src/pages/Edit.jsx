import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { PostsContext } from "../context/PostsContext";
import { AuthContext } from "../context/AuthContext";
import "./Edit.css";

export default function Edit() {
  const { id } = useParams();
  const { updatePost, fetchSinglePost } = useContext(PostsContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSinglePost(id)
      .then((data) => {
        if (!data) {
          setError("Post not found.");
          return;
        }
        if (data.author_name !== user?.email) {
          setError("You can only edit your own posts.");
          return;
        }
        setTitle(data.title);
        setContent(data.content);
      })
      .finally(() => setLoading(false));
  }, [id, user, fetchSinglePost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await api.put(`/posts/${id}/edit/`, { title, content });
      updatePost(resp.data); // update context immediately
      navigate(`/posts/${id}`);
    } catch {
      setError("Failed to update post.");
    }
  };

  if (loading) return <div className="edit-container">Loading...</div>;
  if (error) return <div className="edit-container error">{error}</div>;

  return (
    <div className="edit-container">
      <h2>Edit Post</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content"
          required
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

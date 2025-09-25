import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import "./Comments.css";

export default function Comments() {
  const { id } = useParams(); // post id
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { next: `/posts/${id}/comments` } });
    }
  }, [user, navigate, id]);

  // Fetch comments
  useEffect(() => {
    if (user) {
      api.get(`/posts/${id}/comments/`)
        .then(r => setComments(r.data))
        .catch(() => setComments([]))
        .finally(() => setLoading(false));
    }
  }, [id, user]);

  // Add new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!content.trim()) {
      setError("Comment cannot be empty.");
      return;
    }
    try {
      // Optimistically update UI
      const newComment = {
        id: Date.now(),
        author_name: user.email,
        content,
        created_at: new Date().toISOString(),
      };
      setComments(prev => [newComment, ...prev]);
      setContent("");
      // Send to backend
      const resp = await api.post(`/posts/${id}/comments/`, { content });
      // Replace temp comment with real one from backend
      setComments(prev => [resp.data, ...prev.filter(c => c.id !== newComment.id)]);
    } catch {
      setError("Failed to add comment.");
    }
  };

  return (
    <div className="comments-container">
      <h2>Comments</h2>
      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit">Post</button>
      </form>
      {error && <div className="comment-error">{error}</div>}
      {loading ? (
        <div>Loading comments...</div>
      ) : (
        <ul className="comments-list">
          {comments.length === 0 ? (
            <li className="no-comments">No comments yet.</li>
          ) : (
            comments.map(comment => (
              <li key={comment.id} className="comment-item">
                <div className="comment-author">{comment.author_name}</div>
                <div className="comment-content">{comment.content}</div>
                <div className="comment-date">{new Date(comment.created_at).toLocaleString()}</div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
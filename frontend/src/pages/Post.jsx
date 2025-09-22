import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import "./Post.css";

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/posts/${id}/`)
      .then(res => setPost(res.data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="post-detail-container">Loading...</div>;
  if (!post) return <div className="post-detail-container">Post not found.</div>;

  return (
    <div className="post-detail-container">
      <div className="post-detail-card">
        <h2 className="post-detail-title">{post.title}</h2>
        <div className="post-detail-meta">
          {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
        </div>
        <div className="post-detail-content">{post.content}</div>
        <div className="post-detail-actions">
          <button
            className="post-detail-btn"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <span>{post.comments_count} comments</span>
          <span>{post.likes_count} likes</span>
        </div>
      </div>
    </div>
  );
}
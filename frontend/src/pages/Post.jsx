import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import LikeCommentBar from "../components/LikeCommentBar";
import "./Post.css";

export default function Post() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/posts/${id}/`)
      .then(res => {
        setPost(res.data);
        setLiked(res.data.liked || false); // Make sure your API returns 'liked'
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login", { state: { next: `/posts/${id}` } });
      return;
    }
    setLiked(prev => !prev);
    setPost(prev =>
      prev
        ? {
            ...prev,
            likes_count: liked
              ? prev.likes_count - 1
              : prev.likes_count + 1
          }
        : prev
    );
    try {
      await api.post(`/posts/${id}/like/`);
    } catch {
      // Optionally revert UI on error
    }
  };

  const handleComment = () => {
    if (!user) {
      navigate("/login", { state: { next: `/posts/${id}/comments` } });
    } else {
      navigate(`/posts/${id}/comments`);
    }
  };

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
        <LikeCommentBar
          liked={liked}
          likesCount={post.likes_count}
          commentsCount={post.comments_count}
          onLike={handleLike}
          onComment={handleComment}
          disabled={!user}
        />
      </div>
    </div>
  );
}
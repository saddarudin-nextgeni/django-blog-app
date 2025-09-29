import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { PostsContext } from "../context/PostsContext";
import LikeCommentBar from "../components/LikeCommentBar";
import "./Post.css";

export default function Post() {
  const { id } = useParams();
  const { posts, likedIds, handleLike, handleComment, handleDelete, handleEdit, fetchSinglePost } =
    useContext(PostsContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);

  // Try to get post from context first
  useEffect(() => {
    const found = posts.find((p) => p.id === parseInt(id));
    if (found) {
      setPost(found);
      setLoading(false);
    } else {
      // fallback: fetch single post if not in context
      fetchSinglePost(id).then((data) => {
        setPost(data);
        setLoading(false);
      });
    }
  }, [id, posts, fetchSinglePost]);

  if (loading) return <div className="post-detail-container">Loading...</div>;
  if (!post) return <div className="post-detail-container">Post not found.</div>;

  const liked = likedIds.includes(Number(id));

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
          onLike={() => handleLike(post.id)}
          onComment={() => handleComment(navigate, post.id, user)}
          disabled={!user}
          onEdit={
            user && user.email === post.author_name
              ? () => handleEdit(navigate, post.id)
              : undefined
          }
          onDelete={
            user && user.email === post.author_name
              ? () => handleDelete(post.id, navigate)
              : undefined
          }
        />
      </div>
    </div>
  );
}

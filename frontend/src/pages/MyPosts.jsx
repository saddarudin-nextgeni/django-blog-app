import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import "./MyPosts.css";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { next: "/myposts" } });
    }
  }, [user, navigate]);

  // Fetch my posts
  useEffect(() => {
    if (user) {
      api
        .get("/posts/mine")
        .then((r) => setPosts(r.data))
        .catch(() => setPosts([]))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="my-posts-container">
      <h2>My Posts</h2>

      {loading ? (
        <div>Loading your posts...</div>
      ) : posts.length === 0 ? (
        <div className="no-posts">You haven't created any posts yet.</div>
      ) : (
        <ul className="my-posts-list">
          {posts.map((post) => (
            <li
              key={post.id}
              className="my-post-title-item"
              onClick={() => navigate(`/posts/${post.id}`)}
            >
              {post.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

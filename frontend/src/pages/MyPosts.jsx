import React, { useEffect, useState, useContext } from "react";
import api from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./MyPosts.css";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/posts/mine")
      .then(r => setPosts(r.data))
      .catch(() => setPosts([]));
  }, []);

  if (!user) {
    navigate("/login", { state: { next: "/myposts" } });
    return null;
  }

  return (
    <div className="my-posts-container">
      <h2>My Posts</h2>
      {posts.length === 0 ? (
        <div className="no-posts">You haven't created any posts yet.</div>
      ) : (
        <ul className="my-posts-list">
          {posts.map(post => (
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
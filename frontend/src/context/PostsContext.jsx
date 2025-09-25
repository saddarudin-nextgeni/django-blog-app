import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";
import { AuthContext } from "./AuthContext";

export const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts/");
      setPosts(res.data);
    } catch {
      setPosts([]);
    }
  };

   const fetchLikedPosts = async () => {
    if (!user) return setLikedIds([]);
    try {
      const res = await api.get(`/posts/?liked_by=${user.email}`);
      setLikedIds(res.data.map(p => p.id));
    } catch {
      setLikedIds([]);
    }
  };

   const fetchSinglePost = async (id) => {
    try {
      const res = await api.get(`/posts/${id}/`);
      return res.data;
    } catch {
      return null;
    }
  };

  const addPost = (post) => {
    setPosts((prev) => [post, ...prev]); 
  };
  // Fetch all posts and liked posts on mount or when user changes
  useEffect(() => {
    fetchPosts();
    fetchLikedPosts();
  }, [user]);

  // Like/Unlike handler
  const handleLike = async (postId) => {
  try {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes_count: likedIds.includes(postId)
                ? p.likes_count - 1
                : p.likes_count + 1,
            }
          : p
      )
    );

    setLikedIds((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );

    // Backend request (adjust URL/method as needed)
    await api.post(`/posts/${postId}/like/`);
  } catch (err) {
    console.error("Like failed", err);
  }
};



   // Centralized comment handler (for navigation)
  const handleComment = (navigate, postId, user) => {
    if (!user) {
      navigate("/login", { state: { next: `/posts/${postId}/comments` } });
    } else {
      navigate(`/posts/${postId}/comments`);
    }
  };

  // Centralized delete handler
  const handleDelete = async (postId, navigate) => {
    if (!window.confirm('Delete Post?')) return;
    try {
      await api.delete(`/posts/${postId}/`);
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (navigate) navigate("/");
    } catch {
      alert('Failed to delete post');
    }
  };

  // Update comment count
  const incrementCommentCount = (postId) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      )
    );
  };

  // Centralized edit handler
  const handleEdit = (navigate, postId) => {
    navigate(`/posts/${postId}/edit`);
  };

  return (
    <PostsContext.Provider value={{
      posts,
      fetchPosts,
      fetchSinglePost,
      fetchLikedPosts,
      addPost,
      setPosts,
      likedIds,
      handleLike,
      handleComment,
      handleDelete,
      handleEdit,
      incrementCommentCount
    }}>
      {children}
    </PostsContext.Provider>
  );
}
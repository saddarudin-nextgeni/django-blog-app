import React from "react";
import { FaThumbsUp, FaCommentAlt } from "react-icons/fa";
import "./LikeCommentBar.css";

export default function LikeCommentBar({
  liked,
  likesCount,
  commentsCount,
  onLike,
  onComment,
  disabled
}) {
  // Helper to format numbers (e.g., 1.2K)
  const formatCount = n => {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
    return n;
  };

  return (
    <div className="like-comment-bar">
      <button
        className={`action-btn action-like${liked ? " liked" : ""}`}
        onClick={onLike}
        disabled={disabled}
        type="button"
      >
        <FaThumbsUp style={{ marginRight: 6 }} />
        {formatCount(likesCount)}
      </button>
      <button
        className="action-btn action-comment"
        onClick={onComment}
        disabled={disabled}
        type="button"
      >
        <FaCommentAlt style={{ marginRight: 6 }} />
        {formatCount(commentsCount)}
      </button>
    </div>
  );
}
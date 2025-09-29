import { FaThumbsUp, FaCommentAlt, FaEdit, FaTrash } from "react-icons/fa";
import "./LikeCommentBar.css";

export default function LikeCommentBar({
  liked,
  likesCount,
  commentsCount,
  onLike,
  onComment,
  disabled,
  onEdit,
  onDelete
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
      {onEdit && (
        <button
          className="action-btn action-edit"
          onClick={onEdit}
          type="button">
          <FaEdit style={{marginRight: 6}}/>
          </button>
        )}
      {onDelete && (
        <button
          className="action-btn action-delete"  onClick={onDelete} type="button">
          <FaTrash style={{marginRight: 6}}/>
          </button>
        )}
    </div>
  );
}
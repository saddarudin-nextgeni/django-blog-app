import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import { PostsContext } from "../context/PostsContext";
import "./Comments.css";
import MentionInput from "../components/MentionInput";

export default function Comments() {
  const { id } = useParams(); // post id
  const { user } = useContext(AuthContext);
  const { incrementCommentCount } = useContext(PostsContext);

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // track which comment you’re replying to
  const navigate = useNavigate();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { next: `/posts/${id}/comments` } });
    }
  }, [user, navigate, id]);

  // Fetch all comments (with replies)
  useEffect(() => {
    if (user) {
      api
        .get(`/posts/${id}/comments/`)
        .then((r) => setComments(r.data))
        .catch(() => setError("Failed to load comments."))
        .finally(() => setLoading(false));
    }
  }, [id, user]);

  // Submit new comment or reply
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    const payload = { content };
    if (replyingTo) payload.parent = replyingTo;

    try {
      // Optimistic UI update
      const tempId = `temp-${Date.now()}`;
      const newComment = {
        id: tempId,
        post: Number(id),
        author_name: user.email,
        content,
        created_at: new Date().toISOString(),
        replies: [],
      };

      if (replyingTo) {
        // Add reply under target comment
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo
              ? { ...c, replies: [newComment, ...c.replies] }
              : c
          )
        );
      } else {
        // Add top-level comment
        setComments((prev) => [newComment, ...prev]);
      }

      setContent("");
      setReplyingTo(null);

      // Send to backend
      const resp = await api.post(`/posts/${id}/comments/`, payload);

      // Replace temp with real
      if (replyingTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo
              ? {
                  ...c,
                  replies: c.replies.map((r) =>
                    r.id === tempId ? resp.data : r
                  ),
                }
              : c
          )
        );
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === tempId ? resp.data : c))
        );
        incrementCommentCount(Number(id));
      }
    } catch {
      setError("Failed to add comment.");
    }
  };

  // Recursive comment component
  const CommentItem = ({ comment }) => {
    const [showReplies, setShowReplies] = useState(false);

    return (
      <li className="comment-item">
        <div className="comment-header">
          <span className="comment-author">{comment.author_name}</span>
          <span className="comment-date">
            {new Date(comment.created_at).toLocaleString()}
          </span>
        </div>

        <div className="comment-content">{comment.content}</div>

        <div className="comment-actions">
          <button onClick={() => setReplyingTo(comment.id)}>Reply</button>

          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies((prev) => !prev)}
              className="view-replies-btn"
            >
              {showReplies
                ? "Hide Replies"
                : `View Replies (${comment.replies.length})`}
            </button>
          )}
        </div>

        {showReplies && comment.replies.length > 0 && (
          <ul className="replies-list">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="comments-container">
      <h2>Comments</h2>

      <form className="comment-form" onSubmit={handleSubmit}>
        {replyingTo && (
          <div className="replying-to">
            Replying to comment #{replyingTo}
            <button
              type="button"
              className="cancel-reply"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </button>
          </div>
        )}

        <MentionInput
          value={content}
          onChange={setContent}
          placeholder={
            replyingTo ? "Write a reply..." : "Write a comment..."
          }
        />
        <button type="submit">{replyingTo ? "Reply" : "Post"}</button>
      </form>

      {error && <div className="comment-error">{error}</div>}

      {loading ? (
        <div>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="no-comments">No comments yet.</div>
      ) : (
        <ul className="comments-list">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </ul>
      )}
    </div>
  );
}

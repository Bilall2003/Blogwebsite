import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");

  function load() {
    api
      .get(`/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch(() => setError("Post not found."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleLike() {
    if (!user) return navigate("/login");
    const res = await api.post(`/posts/${id}/like`);
    setPost((p) => ({
      ...p,
      likedByMe: res.data.liked,
      likeCount: res.data.likeCount,
    }));
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await api.post(`/posts/${id}/comments`, { text: commentText });
    setPost((p) => ({
      ...p,
      comments: [...p.comments, res.data],
      commentCount: p.commentCount + 1,
    }));
    setCommentText("");
  }

  async function handleDeleteComment(commentId) {
    await api.delete(`/posts/${id}/comments/${commentId}`);
    setPost((p) => ({
      ...p,
      comments: p.comments.filter((c) => c.id !== commentId),
      commentCount: p.commentCount - 1,
    }));
  }

  async function handleDeletePost() {
    if (!window.confirm("Delete this post permanently?")) return;
    await api.delete(`/posts/${id}`);
    navigate("/dashboard");
  }

  if (loading) return <div className="container"><p className="muted">Loading…</p></div>;
  if (error) return <div className="container"><p className="error-text">{error}</p></div>;

  const isAuthor = user && user.id === post.authorId;

  return (
    <div className="container narrow">
      <Link to="/" className="back-link">← Back to all posts</Link>

      <article className="post-full">
        <h1>{post.title}</h1>
        <p className="post-card-meta">
          by <strong>{post.authorName}</strong> · {formatDate(post.createdAt)}
        </p>

        {isAuthor && (
          <div className="post-actions">
            <Link to={`/edit/${post.id}`} className="btn btn-ghost btn-sm">
              Edit
            </Link>
            <button className="btn btn-danger btn-sm" onClick={handleDeletePost}>
              Delete
            </button>
          </div>
        )}

        <div className="post-body">
          {post.content.split("\n").map((para, i) =>
            para.trim() ? <p key={i}>{para}</p> : <br key={i} />
          )}
        </div>

        <div className="post-engagement">
          <button
            className={`like-btn ${post.likedByMe ? "liked" : ""}`}
            onClick={handleLike}
          >
            {post.likedByMe ? "❤️" : "🤍"} {post.likeCount}
          </button>
        </div>
      </article>

      <section className="comments">
        <h3>Comments ({post.commentCount})</h3>

        {user ? (
          <form className="comment-form" onSubmit={handleComment}>
            <textarea
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
            />
            <button className="btn btn-primary btn-sm">Post comment</button>
          </form>
        ) : (
          <p className="muted">
            <Link to="/login">Log in</Link> to join the conversation.
          </p>
        )}

        <ul className="comment-list">
          {post.comments.map((c) => (
            <li key={c.id} className="comment">
              <div className="comment-head">
                <strong>{c.username}</strong>
                <span className="muted">{formatDate(c.createdAt)}</span>
              </div>
              <p>{c.text}</p>
              {user && user.id === c.userId && (
                <button
                  className="link-danger"
                  onClick={() => handleDeleteComment(c.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
          {post.comments.length === 0 && (
            <p className="muted">No comments yet.</p>
          )}
        </ul>
      </section>
    </div>
  );
}

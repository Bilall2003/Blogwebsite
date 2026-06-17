import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .get("/posts/mine/list")
      .then((res) => setPosts(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this post permanently?")) return;
    await api.delete(`/posts/${id}`);
    setPosts((p) => p.filter((post) => post.id !== id));
  }

  return (
    <div className="container narrow">
      <div className="dash-head">
        <div>
          <h1>My posts</h1>
          <p className="muted">Welcome back, {user.username}.</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          + New post
        </Link>
      </div>

      {loading && <p className="muted">Loading…</p>}

      {!loading && posts.length === 0 && (
        <div className="empty-state">
          <p>You haven't written anything yet.</p>
          <Link to="/create" className="btn btn-primary">
            Write your first post
          </Link>
        </div>
      )}

      <ul className="dash-list">
        {posts.map((post) => (
          <li key={post.id} className="dash-item">
            <div>
              <Link to={`/posts/${post.id}`} className="dash-title">
                {post.title}
              </Link>
              <p className="post-card-meta">
                {formatDate(post.createdAt)} · ❤️ {post.likeCount} · 💬{" "}
                {post.commentCount}
              </p>
            </div>
            <div className="dash-actions">
              <Link to={`/edit/${post.id}`} className="btn btn-ghost btn-sm">
                Edit
              </Link>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(post.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

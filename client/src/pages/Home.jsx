import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import PostCard from "../components/PostCard.jsx";

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api
      .get("/posts")
      .then((res) => setPosts(res.data))
      .catch(() => setError("Could not load posts. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.authorName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container">
      <section className="hero">
        <h1>Stories worth reading.</h1>
        <p>
          A small community blog. Read what others are thinking, then share
          your own ideas.
        </p>
        {!user && (
          <Link to="/register" className="btn btn-primary">
            Start writing
          </Link>
        )}
      </section>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by title or author…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <p className="muted">Loading posts…</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="muted">No posts yet. Be the first to write one!</p>
      )}

      <div className="post-grid">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

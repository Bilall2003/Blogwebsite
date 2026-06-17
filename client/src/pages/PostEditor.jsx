import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client.js";

// Handles both creating a new post and editing an existing one,
// depending on whether an :id param is present in the route.
export default function PostEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/posts/${id}`)
      .then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content);
      })
      .catch(() => setError("Could not load the post."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/posts/${id}`, { title, content });
        navigate(`/posts/${id}`);
      } else {
        const res = await api.post("/posts", { title, content });
        navigate(`/posts/${res.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="container"><p className="muted">Loading…</p></div>;

  return (
    <div className="container narrow">
      <form className="editor" onSubmit={handleSubmit}>
        <h1>{isEdit ? "Edit post" : "Write a new post"}</h1>

        {error && <div className="alert">{error}</div>}

        <label>
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="An interesting title…"
            required
          />
        </label>
        <label>
          Content
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story…"
            rows={14}
            required
          />
        </label>

        <div className="editor-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting
              ? "Saving…"
              : isEdit
              ? "Save changes"
              : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}

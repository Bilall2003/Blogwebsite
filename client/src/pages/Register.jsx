import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form.username, form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <p className="muted">Join the community and start writing.</p>

        {error && <div className="alert">{error}</div>}

        <label>
          Username
          <input
            value={form.username}
            onChange={update("username")}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={update("password")}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account…" : "Sign up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

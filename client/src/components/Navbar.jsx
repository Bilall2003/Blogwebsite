import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">✒️</span> Inkwell
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">My Posts</NavLink>
              <NavLink to="/create" className="btn btn-primary btn-sm">
                Write
              </NavLink>
              <span className="nav-user">Hi, {user.username}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

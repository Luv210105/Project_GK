import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Navbar({ theme, onToggleTheme }) {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-mark">G</span>
        <div>
          <p>Gallery App</p>
          <small>Personal photo library</small>
        </div>
      </Link>

      <nav className="nav-links">
        <button className="ghost-button theme-toggle" type="button" onClick={onToggleTheme}>
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
        {isAuthenticated ? (
          <>
            <span className="welcome-text">Xin chao, {user.username}</span>
            <button className="ghost-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

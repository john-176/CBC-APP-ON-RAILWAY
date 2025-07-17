import { useState } from "react";
import { login } from "../../api";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import "./Login.css";
import FullPageSpinner from "../spinner/Spinner";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      setUser("authenticated");
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="login-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="login-input"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="eye-toggle-button"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Logging in..." : "Login"}
            {loading && <FullPageSpinner />}
          </button>
        </form>

        {error && <p className="login-error">{error}</p>}

        <div className="login-links">
        <p><Link to="/reset-request">Forgot Password? Reset</Link></p>
        <p>OR</p>
        <p><Link to="/signup">Create a new account</Link></p>
        </div>
      </div>
    </div>
  );
}



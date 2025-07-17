import { useState } from "react";
import { signup } from "../../api";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";
import FullPageSpinner from "../spinner/Spinner";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    password2: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await signup(form.username, form.password, form.password2);

      // ✅ Always show same message
      setMessage("If your email is valid, you'll receive an activation link shortly. Check your email.");

      // ✅ Clear form fields
      setForm({ username: "", password: "", password2: "" });

      // ✅ Redirect either way
      setTimeout(() => navigate("/login"), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="input-wrapper">
            <input
              type="email"
              placeholder="Email"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="signup-input"
              autoComplete="email"
              required
            />
          </div>

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="signup-input"
              autoComplete="new-password"
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

          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter Password"
              value={form.password2}
              onChange={(e) => setForm({ ...form, password2: e.target.value })}
              className="signup-input"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="eye-toggle-button"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="signup-button">
            {loading ? "Creating account..." : "Signup"}
            {loading && <FullPageSpinner />}
          </button>
        </form>

        {message && <p className="signup-message" style={{ color: "green" }}>{message}</p>}
        {error && <p className="signup-error" style={{ color: "red" }}>{error}</p>}

        <p className="signup-link">
          <Link to="/login">Already have an account? Login</Link>
        </p>
      </div>
    </div>
  );
}

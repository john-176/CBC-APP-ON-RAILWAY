import { useState } from "react";
import { confirmPasswordReset } from "../../api";
import { useParams, useNavigate } from "react-router-dom";
import "./ResetPassword.css";

export default function ResetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // 'success' or 'error'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setStatusType("");
    setLoading(true);

    try {
      const res = await confirmPasswordReset(uid, token, password);
      setStatus(res.data?.message || "Password reset successfully.");
      setStatusType("success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorData = err.response?.data;
      let errors = [];

      if (Array.isArray(errorData?.error)) {
        errors = errorData.error;
      } else if (typeof errorData?.error === "string") {
        errors = [errorData.error];
      } else if (typeof errorData === "object") {
        errors = Object.values(errorData).flat();
      }

      const uniqueErrors = [...new Set(errors)];
      const formattedErrors = uniqueErrors.join("\n");

      setStatus(formattedErrors);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="reset-container">
      <h2>Set New Password</h2>
      <form onSubmit={handleSubmit} autoComplete="on">
        <input
          id="new-password"
          name="new-password"
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="reset-input"
          autoComplete="new-password"
          required
        />
        <button type="submit" className="reset-button" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {status && (
        <p className={`reset-status ${statusType}`}>{status}</p>
      )}

    </div>
  );
}

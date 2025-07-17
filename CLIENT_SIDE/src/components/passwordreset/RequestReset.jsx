
import { useState } from "react";
import { requestPasswordReset } from "../../api";
import "./ResetPassword.css";

export default function RequestReset() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // 'success' | 'error'


  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    try {
      setStatus("Sending...");
      setStatusType("");
      await requestPasswordReset(email);
      setStatus("Reset link sent. Check your email.");
      setStatusType("success");
    } catch (err) {
      setStatus("Failed to send reset link. Check your email.");
      setStatusType("error");
    }
  };


  const emailIsValid = isValidEmail(email);
  const emailTouched = email.length > 0;

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>
      <input
        className="reset-input"
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      {!emailIsValid && emailTouched && (
        <p className="reset-error">Please enter a valid email address.</p>
      )}
      <button
        className="reset-button"
        onClick={handleSubmit}
        disabled={!emailIsValid}
      >
        Send Reset Link
      </button>
        {status && <p className={`status-message ${statusType}`}>{status}</p>}


    </div>
  );
}

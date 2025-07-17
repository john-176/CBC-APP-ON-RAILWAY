import { useEffect, useState } from "react";
import { logout } from "../../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

export default function LogOut() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [status, setStatus] = useState("Logging out...");

  useEffect(() => {
    const doLogout = async () => {
      try {
        setStatus("Logging out...");
        await logout();
        setUser(null);
        setStatus("Logged out successfully.");
        setTimeout(() => navigate("/login"), 1000);
      } catch (err) {
        setStatus(err.message || "Logout failed.");
      }
    };

    doLogout();
  }, [navigate, setUser]);

  return <p>{status}</p>;
}



import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://chat-backend-w3yw.onrender.com";

export default function Register({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed. Try a different email.");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! You can now log in.");
      setEmail("");
      setPassword("");
    } catch {
      setError("Unable to connect to the registration server.");
    }

    setLoading(false);
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "420px",
      margin: "0 auto",
      backgroundColor: "var(--bg-card)",
      borderRadius: "var(--radius-xl)",
      padding: "2.25rem 2rem",
      boxShadow: "var(--shadow-lg)",
      border: "1px solid var(--border-light)",
    }} className="animate-fade-in">
      <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          backgroundColor: "#f0fdf4",
          color: "#16a34a",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
        }}>
          <UserPlus size={24} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.35rem" }}>
          Create an account
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          Start chatting with AI agents in seconds
        </p>
      </div>

      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#334155", marginBottom: "0.4rem" }}>
            Email address
          </label>
          <div style={{ position: "relative" }}>
            <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem 0.65rem 2.4rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid #cbd5e1",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => e.target.style.borderColor = "#16a34a"}
              onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#334155", marginBottom: "0.4rem" }}>
            Password
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 2.4rem 0.65rem 2.4rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid #cbd5e1",
                fontSize: "0.875rem",
                outline: "none",
                transition: "border-color 0.15s ease",
              }}
              onFocus={(e) => e.target.style.borderColor = "#16a34a"}
              onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 0.85rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "var(--radius-md)",
            color: "#dc2626",
            fontSize: "0.8125rem",
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 0.85rem",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "var(--radius-md)",
            color: "#16a34a",
            fontSize: "0.8125rem",
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "#16a34a",
            color: "#ffffff",
            fontWeight: "600",
            fontSize: "0.875rem",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: "0 2px 4px rgba(22, 163, 74, 0.2)",
            opacity: loading ? 0.75 : 1,
            transition: "all 0.15s ease",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Sign Up</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {onSwitchToLogin && (
        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: "none",
              border: "none",
              color: "#16a34a",
              fontWeight: "600",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Sign in here
          </button>
        </div>
      )}
    </div>
  );
}
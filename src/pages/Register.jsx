import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    if (!email || !password) {
      setError("All fields are required");
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
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess("Registered successfully. You can now login.");
      setEmail("");
      setPassword("");
    } catch {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div style={box}>
      <h2>Register</h2>

      <input
        style={input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        style={input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      {error && <p style={errorStyle}>{error}</p>}
      {success && <p style={successStyle}>{success}</p>}

      <button style={btn} onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}

const box = {
  maxWidth: 320,
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 12
};

const input = {
  padding: 10,
  borderRadius: 6,
  border: "1px solid #ccc"
};

const btn = {
  padding: 10,
  borderRadius: 6,
  background: "#16a34a",
  color: "white",
  border: "none",
  cursor: "pointer"
};

const errorStyle = {
  color: "red",
  fontSize: 14
};

const successStyle = {
  color: "green",
  fontSize: 14
};

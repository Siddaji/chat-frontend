import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
  const handleLogin = async () => {
  if (!email || !password) {
    setError("All fields are required");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();       
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      setError(data.message || "Login failed");
      setLoading(false);
      return;
    }

    localStorage.setItem("token", data.token);
    window.location.href = "/chat";
  } catch (err) {
    console.error(err);
    setError("Server error");
    setLoading(false);
  }
};

  return (
    <div style={box}>
      <h2>Login</h2>

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

      <button style={btn} onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
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
  background: "#2563eb",
  color: "white",
  border: "none",
  cursor: "pointer"
};

const errorStyle = {
  color: "red",
  fontSize: 14
};

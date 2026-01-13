import { useState, useEffect, useRef } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const updatedMessages = [...messages, { role: "user", text: message }];

    setMessages(updatedMessages);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
        }
      );

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch (err) {
      setError("Failed to connect to AI");
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>AI Chat</h2>

      <div
        style={{
          border: "1px solid #ddd",
          height: "400px",
          padding: "10px",
          overflowY: "auto",
          borderRadius: "8px",
          background: "#fafafa",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent:
                msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <p
              style={{
                background:
                  msg.role === "user" ? "#007bff" : "#e5e5e5",
                color: msg.role === "user" ? "#fff" : "#000",
                padding: "8px 12px",
                borderRadius: "10px",
                maxWidth: "70%",
              }}
            >
              <b>{msg.role === "user" ? "You" : "AI"}:</b> {msg.text}
            </p>
          </div>
        ))}

        {loading && <p>AI is typing...</p>}
        <div ref={bottomRef}></div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="text"
        placeholder="Type your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        style={{
          width: "80%",
          padding: "8px",
          marginRight: "5px",
        }}
      />

      <button onClick={sendMessage} disabled={loading}>
        {loading ? "..." : "Send"}
      </button>
    </div>
  );
}

export default App;
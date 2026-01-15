import { useState, useEffect, useRef } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const updatedMessages = [...messages, { role: "user", text: message }];
    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      }
    );

    if (!response.body) {
      setLoading(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let aiText = "";
    setMessages(prev => [...prev, { role: "ai", text: "" }]);

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      aiText += decoder.decode(value, { stream: true });

      setMessages(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...last, text: aiText }];
      });
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>AI Chat</h2>

      <div
        style={{
          border: "1px solid #ddd",
          height: 400,
          padding: 10,
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{ textAlign: m.role === "user" ? "right" : "left" }}
          >
            <b>{m.role === "user" ? "You" : "AI"}:</b> {m.text}
          </div>
        ))}
        {loading && <p>AI is typing...</p>}
        <div ref={bottomRef} />
      </div>

      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendMessage()}
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage} disabled={loading}>
        Send
      </button>
    </div>
  );
}

export default App;

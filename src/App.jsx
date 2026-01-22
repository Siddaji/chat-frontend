import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ---------------- SEND CHAT MESSAGE ----------------
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

  // ---------------- FILE UPLOAD ----------------
  const uploadFile = async () => {
    if (!file || loading) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    setMessages(prev => [
      ...prev,
      { role: "user", text: `Uploaded file: ${file.name}` },
      { role: "ai", text: data.reply }
    ]);

    setFile(null);
    setLoading(false);
  };

  // ---------------- RESUME ANALYZER ----------------

  const analyzeResume = async () => {
    if (loading) return;

    setLoading(true);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/resume`,
      { method: "POST" }
    );

    const data = await response.json();

    setMessages(prev => [
      ...prev,
      { role: "user", text: "Analyze my resume" },
      { role: "ai", text: data.reply }
    ]);

    setLoading(false);
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>AI Chat Agent</h2>

      {/* CHAT WINDOW */}
      <div
        style={{
          border: "1px solid #ddd",
          height: 450,
          padding: 10,
          overflowY: "auto",
          marginBottom: 10,
          borderRadius: 8,
          background: "#fafafa",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                maxWidth: "85%",
                padding: "12px 14px",
                borderRadius: 12,
                backgroundColor:
                  m.role === "user" ? "#DCF8C6" : "#FFFFFF",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {m.role === "ai" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 style={{ margin: "8px 0", fontSize: "20px" }} {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 style={{ margin: "8px 0", fontSize: "18px" }} {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 style={{ margin: "6px 0", fontSize: "16px" }} {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p style={{ margin: "4px 0" }} {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul style={{ margin: "4px 0", paddingLeft: "18px" }} {...props} />
                    ),
                    li: ({ node, ...props }) => (
                      <li style={{ margin: "2px 0" }} {...props} />
                    )
                  }}
                >
                  {m.text}
                </ReactMarkdown>


              ) : (
                m.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <p style={{ fontStyle: "italic", color: "#666" }}>
            AI is typing...
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>

      {/* FILE + RESUME */}
      <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
        />
        <button onClick={uploadFile} disabled={loading}>
          Upload
        </button>
        <button onClick={analyzeResume} disabled={loading}>
          Analyze Resume
        </button>
      </div>
    </div>
  );
}

export default App;

import { useState } from "react";

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const token = localStorage.getItem("token");
        if (!token) return alert("Login again");

        const userMsg = { role: "user", text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        const response = await fetch(`http://localhost:5000/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const text = await response.text();

        res.json({ reply: text });


        const data = await res.json();
        setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    return (
        <div style={{ maxWidth: 600, margin: "30px auto" }}>
            <h2>AI Chat</h2>
            <button onClick={logout}>Logout</button>

            <div style={{ border: "1px solid #ccc", height: 400, overflowY: "auto" }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ padding: 8 }}>
                        <b>{m.role}:</b> {m.text}
                    </div>
                ))}
            </div>

            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type message"
            />
            <button onClick={sendMessage} disabled={loading}>
                Send
            </button>
        </div>
    );
}

export default Chat;

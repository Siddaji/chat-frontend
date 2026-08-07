import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Bot, 
  User, 
  Send, 
  Paperclip, 
  FileText, 
  BookOpen, 
  MessageSquare, 
  LogOut, 
  Sparkles, 
  Trash2, 
  Menu, 
  X, 
  FileCheck,
  FileUp,
  ChevronRight
} from "lucide-react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

const API_URL = import.meta.env.VITE_API_URL || "https://chat-backend-w3yw.onrender.com";

function App() {
  const token = localStorage.getItem("token");
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [agent, setAgent] = useState("chat"); // 'chat', 'study', 'resume'
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!token) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-app)",
        padding: "1.5rem",
      }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {authMode === "login" ? (
            <Login onSwitchToRegister={() => setAuthMode("register")} />
          ) : (
            <Register onSwitchToLogin={() => setAuthMode("login")} />
          )}
        </div>
      </div>
    );
  }

  // ---------------- SEND CHAT MESSAGE ----------------
  const sendMessage = async (overrideText) => {
    const textToSend = typeof overrideText === "string" ? overrideText : message;
    if (!textToSend.trim() || loading) return;

    const updatedMessages = [...messages, { role: "user", text: textToSend }];
    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ messages: updatedMessages, agent: agent }),
      });

      if (!response.ok || !response.body) {
        let errText = "Failed to fetch response.";
        try {
          const errJson = await response.json();
          errText = errJson.message || errText;
        } catch {
          // fallback
        }
        setMessages(prev => [...prev, { role: "ai", text: `⚠️ Error: ${errText}` }]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let currentChunk = "";
      setMessages(prev => [...prev, { role: "ai", text: "" }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const decoded = decoder.decode(value, { stream: true });
        currentChunk = currentChunk + decoded;

        const newText = currentChunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, text: newText }];
        });
      }
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "⚠️ Network error. Please verify your internet or backend status." }]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FILE UPLOAD ----------------
  const uploadFile = async () => {
    if (!file || loading) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages(prev => [
          ...prev,
          { role: "user", text: `📎 Uploaded file: ${file.name}` },
          { role: "ai", text: `⚠️ Upload error: ${data.message || "Failed to process uploaded file."}` }
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        { role: "user", text: `📎 Uploaded file: ${file.name}` },
        { role: "ai", text: data.reply }
      ]);

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "user", text: `📎 Uploaded file: ${file.name}` },
        { role: "ai", text: "⚠️ Network error while uploading file." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESUME ANALYZER ----------------
  const analyzeResume = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/resume`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages(prev => [
          ...prev,
          { role: "user", text: "Analyze my resume" },
          { role: "ai", text: `⚠️ Resume analysis error: ${data.message || "Failed to analyze resume."}` }
        ]);
        return;
      }

      setMessages(prev => [
        ...prev,
        { role: "user", text: "Analyze my resume" },
        { role: "ai", text: data.reply }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "user", text: "Analyze my resume" },
        { role: "ai", text: "⚠️ Network error while analyzing resume." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const clearChat = () => {
    setMessages([]);
  };

  const agentConfig = {
    chat: {
      name: "General Assistant",
      desc: "Multipurpose AI for questions, writing & coding",
      icon: <MessageSquare size={18} />,
      placeholder: "Type your message here...",
      starters: [
        "How can I optimize my React application performance?",
        "Draft a polite follow-up email after an interview.",
        "Explain the concept of WebSockets simply."
      ]
    },
    study: {
      name: "Study Companion",
      desc: "Deep explanation, study plans & academic help",
      icon: <BookOpen size={18} />,
      placeholder: "Ask your study question or topic...",
      starters: [
        "Explain the Big O notation with easy examples.",
        "Create a 3-day study schedule for Data Structures.",
        "Break down how neural networks learn."
      ]
    },
    resume: {
      name: "Resume Analyzer",
      desc: "CV review, career advice & ATS optimization",
      icon: <FileText size={18} />,
      placeholder: "Ask specific questions about your resume...",
      starters: [
        "How do I highlight leadership experience on my resume?",
        "What bullet points best describe a Full Stack Engineer?",
        "How can I optimize my CV for ATS parsers?"
      ]
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            zIndex: 40,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: "280px",
        backgroundColor: "var(--bg-sidebar)",
        color: "var(--text-sidebar)",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border-dark)",
        position: "relative",
        zIndex: 50,
        transition: "transform 0.25s ease-in-out",
        transform: sidebarOpen ? "translateX(0)" : undefined,
      }} className="sidebar-container">
        
        {/* BRANDING */}
        <div style={{
          padding: "1.25rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              boxShadow: "0 0 12px rgba(37, 99, 235, 0.4)",
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#ffffff", lineHeight: 1.2 }}>
                Nexus AI
              </h1>
              <span style={{ fontSize: "0.725rem", color: "var(--text-sidebar-muted)" }}>
                Smart Chat Platform
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--text-sidebar-muted)",
              cursor: "pointer",
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* AGENT MODES */}
        <div style={{ padding: "1.25rem 1rem", flex: 1, overflowY: "auto" }}>
          <div style={{
            fontSize: "0.725rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-sidebar-muted)",
            marginBottom: "0.75rem",
            paddingLeft: "0.5rem",
          }}>
            AI Modes
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {Object.keys(agentConfig).map((key) => {
              const cfg = agentConfig[key];
              const isSelected = agent === key;

              return (
                <button
                  key={key}
                  onClick={() => {
                    setAgent(key);
                    setSidebarOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "0.85rem",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: isSelected ? "rgba(37, 99, 235, 0.18)" : "transparent",
                    border: isSelected ? "1px solid rgba(37, 99, 235, 0.4)" : "1px solid transparent",
                    color: isSelected ? "#ffffff" : "var(--text-sidebar)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{
                    color: isSelected ? "#60a5fa" : "var(--text-sidebar-muted)",
                    marginTop: "2px",
                  }}>
                    {cfg.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isSelected ? "600" : "500", fontSize: "0.875rem" }}>
                      {cfg.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-sidebar-muted)", marginTop: "2px", lineHeight: 1.3 }}>
                      {cfg.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* QUICK ACTIONS SECTION */}
          <div style={{
            fontSize: "0.725rem",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-sidebar-muted)",
            marginTop: "1.75rem",
            marginBottom: "0.75rem",
            paddingLeft: "0.5rem",
          }}>
            Quick Tools
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button
              onClick={() => {
                analyzeResume();
                setSidebarOpen(false);
              }}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 0.85rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "var(--text-sidebar)",
                fontSize: "0.8125rem",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <FileCheck size={16} style={{ color: "#34d399" }} />
              <span>Quick Resume Review</span>
            </button>

            <button
              onClick={() => {
                clearChat();
                setSidebarOpen(false);
              }}
              disabled={messages.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 0.85rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: messages.length === 0 ? "rgba(255,255,255,0.3)" : "var(--text-sidebar)",
                fontSize: "0.8125rem",
                fontWeight: "500",
                cursor: messages.length === 0 ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Trash2 size={16} style={{ color: "#f87171" }} />
              <span>Clear Chat History</span>
            </button>
          </div>
        </div>

        {/* USER PROFILE & LOGOUT */}
        <div style={{
          padding: "1rem 1.25rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", overflow: "hidden" }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f8fafc",
              fontSize: "0.85rem",
              fontWeight: "600",
            }}>
              <User size={16} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: "600", color: "#ffffff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Active Session
              </div>
              <div style={{ fontSize: "0.7rem", color: "#4ade80", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#4ade80", display: "inline-block" }} />
                Connected
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0.4rem",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
            onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-app)",
        position: "relative",
        height: "100%",
        overflow: "hidden",
      }}>
        {/* HEADER */}
        <header style={{
          height: "60px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid var(--border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          boxShadow: "var(--shadow-sm)",
          zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: "0.25rem",
              }}
              className="mobile-hamburger-btn"
            >
              <Menu size={22} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{
                padding: "0.25rem 0.6rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
                fontSize: "0.75rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}>
                {agentConfig[agent].icon}
                {agentConfig[agent].name}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.8125rem",
                  color: "#64748b",
                  background: "none",
                  border: "1px solid var(--border-light)",
                  padding: "0.35rem 0.65rem",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={14} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </header>

        {/* CHAT MESSAGES CANVAS */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}>
          {messages.length === 0 ? (
            <div style={{
              margin: "auto",
              maxWidth: "540px",
              textAlign: "center",
              padding: "2rem 1rem",
            }} className="animate-fade-in">
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "18px",
                backgroundColor: "#eff6ff",
                color: "var(--primary)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}>
                <Bot size={28} />
              </div>

              <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.5rem" }}>
                How can I help you today?
              </h2>

              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
                You are currently in <strong style={{ color: "#0f172a" }}>{agentConfig[agent].name}</strong> mode. Select a prompt starter below or write your own.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", textAlign: "left" }}>
                {agentConfig[agent].starters.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(starter)}
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: "#ffffff",
                      border: "1px solid var(--border-light)",
                      color: "#334155",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxShadow: "var(--shadow-sm)",
                      transition: "all 0.15s ease",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-light)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span>{starter}</span>
                    <ChevronRight size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {messages.map((m, idx) => {
                const isUser = m.role === "user";

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexDirection: isUser ? "row-reverse" : "row",
                      alignItems: "flex-start",
                    }}
                    className="animate-fade-in"
                  >
                    {/* AVATAR */}
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      backgroundColor: isUser ? "var(--primary)" : "#ffffff",
                      border: isUser ? "none" : "1px solid var(--border-light)",
                      color: isUser ? "#ffffff" : "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "var(--shadow-sm)",
                    }}>
                      {isUser ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    {/* BUBBLE CONTENT */}
                    <div style={{
                      maxWidth: "80%",
                      padding: "0.85rem 1.15rem",
                      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      backgroundColor: isUser ? "var(--bg-user-msg)" : "#ffffff",
                      color: isUser ? "#ffffff" : "var(--text-main)",
                      border: isUser ? "none" : "1px solid var(--border-light)",
                      boxShadow: "var(--shadow-sm)",
                      fontSize: "0.9125rem",
                      wordBreak: "break-word",
                    }}>
                      {!isUser ? (
                        <div className="markdown-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ ...props }) => <h1 style={{ fontSize: "1.15rem", fontWeight: "700", margin: "0.5rem 0" }} {...props} />,
                              h2: ({ ...props }) => <h2 style={{ fontSize: "1.05rem", fontWeight: "600", margin: "0.5rem 0" }} {...props} />,
                              h3: ({ ...props }) => <h3 style={{ fontSize: "0.95rem", fontWeight: "600", margin: "0.4rem 0" }} {...props} />,
                              p: ({ ...props }) => <p style={{ margin: "0.35rem 0", lineHeight: 1.55 }} {...props} />,
                              ul: ({ ...props }) => <ul style={{ margin: "0.4rem 0", paddingLeft: "1.2rem" }} {...props} />,
                              li: ({ ...props }) => <li style={{ margin: "0.2rem 0" }} {...props} />,
                            }}
                          >
                            {m.text || "..."}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                          {m.text}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* TYPING INDICATOR */}
              {loading && (
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--border-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Bot size={16} />
                  </div>
                  <div style={{
                    padding: "0.75rem 1.15rem",
                    borderRadius: "16px 16px 16px 4px",
                    backgroundColor: "#ffffff",
                    border: "1px solid var(--border-light)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}>
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <div style={{
          padding: "1rem 1.5rem",
          backgroundColor: "#ffffff",
          borderTop: "1px solid var(--border-light)",
        }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* FILE ATTACHMENT CHIP */}
            {file && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.75rem",
                backgroundColor: "#f1f5f9",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.8125rem",
                color: "#334155",
                marginBottom: "0.65rem",
                border: "1px solid #cbd5e1",
              }}>
                <FileUp size={14} style={{ color: "var(--primary)" }} />
                <span style={{ fontWeight: "500", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </span>
                <button
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* INPUT FORM CONTAINER */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "var(--radius-lg)",
              padding: "0.4rem 0.6rem 0.4rem 0.85rem",
              boxShadow: "var(--shadow-sm)",
              transition: "border-color 0.15s ease",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#cbd5e1"}
            >
              {/* HIDDEN FILE INPUT */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={e => setFile(e.target.files[0])}
                style={{ display: "none" }}
              />

              {/* ATTACH FILE BUTTON */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
                style={{
                  background: "none",
                  border: "none",
                  color: file ? "var(--primary)" : "#64748b",
                  cursor: "pointer",
                  padding: "0.4rem",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Paperclip size={20} />
              </button>

              {/* TEXT INPUT */}
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder={agentConfig[agent].placeholder}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: "0.9125rem",
                  color: "var(--text-main)",
                }}
              />

              {/* ACTION BUTTON (UPLOAD or SEND) */}
              {file ? (
                <button
                  onClick={uploadFile}
                  disabled={loading}
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#ffffff",
                    border: "none",
                    padding: "0.5rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.8125rem",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <FileUp size={16} />
                  <span>Upload</span>
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={!message.trim() || loading}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: message.trim() && !loading ? "var(--primary)" : "#e2e8f0",
                    color: message.trim() && !loading ? "#ffffff" : "#94a3b8",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: message.trim() && !loading ? "pointer" : "not-allowed",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Send size={18} />
                </button>
              )}
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.4rem",
              padding: "0 0.25rem",
              fontSize: "0.725rem",
              color: "var(--text-muted)",
            }}>
              <span>Markdown supported</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      </main>

      {/* MEDIA QUERY RESPONSIVENESS STYLES */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-container {
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            transform: translateX(-100%);
          }
          .mobile-close-btn {
            display: block !important;
          }
          .mobile-hamburger-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: message.trim(),
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      if (!response.body) {
        throw new Error("Streaming is not supported");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "",
        },
      ]);

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        assistantText += chunk;

        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: assistantText,
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't connect to the AI right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app">

      {/* Sidebar */}
      <aside className="sidebar">

        <div>
          <div className="brand">
            <div className="brand-icon">✦</div>
            <span>Growfinix</span>
          </div>

          <button className="new-chat" onClick={newChat}>
            <span>＋</span>
            <span>New Chat</span>
          </button>

          <div className="history">

            <div className="history-title">
              Today
            </div>

            <button className="history-item">
              React help
            </button>

            <button className="history-item">
              AI project
            </button>

            <div className="history-title yesterday">
              Yesterday
            </div>

            <button className="history-item">
              Python task
            </button>

          </div>
        </div>

        <button className="settings">
          ⚙ <span>Settings</span>
        </button>

      </aside>

      {/* Main */}
      <main className="main">

        <header className="topbar">
          <span>Growfinix AI</span>
        </header>

        <div className="chat-container">

          {messages.length === 0 ? (
            <div className="welcome">

              <div className="welcome-icon">
                ✦
              </div>

              <h1>
                How can I help?
              </h1>

              <p>
                Ask anything, explore ideas, or get help with your work.
              </p>

            </div>
          ) : (
            <div className="messages">

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.role}`}
                >
                  <div className="message-content">

                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>

                    {msg.role === "assistant" &&
                      loading &&
                      index === messages.length - 1 && (
                        <span className="typing-cursor">
                          ▌
                        </span>
                      )}

                  </div>
                </div>
              ))}

            </div>
          )}

        </div>

        {/* Input */}
        <div className="input-area">

          <div className="input-container">

            <button className="add-button">
              +
            </button>

            <input
              type="text"
              value={message}
              placeholder="Message Growfinix AI..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={!message.trim() || loading}
            >
              ↑
            </button>

          </div>

          <p className="disclaimer">
            Growfinix AI can make mistakes. Check important information.
          </p>

        </div>

      </main>

    </div>
  );
}

export default App;
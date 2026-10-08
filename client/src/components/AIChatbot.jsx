import { useState } from "react";
import API from "../services/api";

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I'm your AI assistant. You can ask me about products, orders, or tasks."
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      {
        sender: "user",
        text: trimmedMessage
      }
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await API.post("/ai/chat", {
        message: trimmedMessage
      });

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "ai",
          text: response.data.answer
        }
      ]);
    } catch (error) {
      console.error("AI chatbot error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "ai",
          text: "Sorry, I couldn't process your request right now."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {isOpen && (
        <div className="ai-chatbot-window">
          <div className="ai-chatbot-header">
            <div>
              <strong>AI Assistant</strong>
              <span>Ask about products, orders & tasks</span>
            </div>

            <button
              className="ai-chatbot-close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="ai-chatbot-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`ai-chatbot-message ${
                  item.sender === "user"
                    ? "ai-user-message"
                    : "ai-bot-message"
                }`}
              >
                {item.text}
              </div>
            ))}

            {loading && (
              <div className="ai-chatbot-message ai-bot-message">
                Thinking...
              </div>
            )}
          </div>

          <div className="ai-chatbot-input-area">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              rows="1"
              disabled={loading}
            />

            <button
              onClick={sendMessage}
              disabled={loading || !message.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        className="ai-chatbot-button"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        {isOpen ? "×" : "AI"}
      </button>
    </>
  );
}

export default AIChatbot;
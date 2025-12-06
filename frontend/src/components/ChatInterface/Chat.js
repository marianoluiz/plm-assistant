import { useState, useEffect } from 'react'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import './Chat.css';
import flamed from '../../alab_head.png';
import useChatAnimation from './useChatAnimation'
import { Send } from "lucide-react";

/**
 *
 * Purpose:
 *  - UI for the PLM Assistant chat: renders conversation messages, suggestion
 *    buttons, and an input to send messages to the backend.
 *
 **/

const Chat = () => {
    const threadId = localStorage.getItem("uuid");
    
    const [historyLoaded, setHistoryLoaded] = useState(false); 
    
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your PLM Assistant. How can I help you today?",
            sender: "bot",
        },
    ]);
    const [inputValue, setInputValue] = useState("");

    const chatEndRef = useChatAnimation(messages);
    const FAQ_prompt = `
    Frequently Asked Questions:\n
    1. What are the requirements to maintain my scholarship?\n
    2. When would I get dismissed or disqualified from my program? \n
    3. How do I apply for a Leave of Absence (LOA)?\n
    4. What are the rules for uniforms, dress code, and IDs?”\n
    5. What offenses will get me suspended or expelled?\n
    `
    
    console.log("UUID:", threadId);

    useEffect(() => {
        const fetchHistory = async () => {
            if (historyLoaded) return; 

            try {
                const response = await fetch("/api/history", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ thread_id: threadId }),
                });

                const data = await response.json();

                if (data.status === "success" && Array.isArray(data.history)) {
                    const mappedMessages = data.history.map((msg, index) => ({
                        // Use a unique ID based on a timestamp and index for key stability
                        id: Date.now() + index, 
                        text: msg.content,
                        sender: msg.role === "assistant" ? "bot" : "user",
                    }));

                    if (mappedMessages.length > 0) {
                        setMessages(prev => [...prev, ...mappedMessages]);
                    }
                    setHistoryLoaded(true); 
                }
            } catch (error) {
                console.error("Failed to load chat history:", error);
            }
        };

        if (threadId) {
            fetchHistory();
        } else {
            setHistoryLoaded(true);
        }
    }, [threadId, historyLoaded]);

    // --- HANDLER: Send Message to Backend ---
    const handleSend = async (text = null) => {
        const msgText = (text ?? inputValue).trim();
        if (!msgText) return;

        const newUserMessage = {
            id: Date.now(),
            text: msgText,
            sender: "user",
        };

        setMessages((prev) => [
            ...prev.filter((m) => m.sender !== "typing"), 
            newUserMessage,
            { id: "typing", sender: "typing" },
        ]);
        setInputValue("");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: msgText, thread_id: threadId }),
            });

            const data = await response.json();

            const botMessage = {
                id: Date.now() + 1, 
                text: data.response,
                sender: "bot",
            };

            setMessages((prev) => [
                ...prev.filter((m) => m.sender !== "typing"),
                botMessage,
            ]);
        } catch (error) {
            console.error("Error calling backend:", error);

            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting. Please try again.",
                sender: "bot",
            };

            setMessages((prev) => [
                ...prev.filter((m) => m.sender !== "typing"),
                errorMessage,
            ]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSend(inputValue);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        handleSend(suggestion);
    };

    const navigate = useNavigate();

    return (
      <div className="backgroundch">
        <motion.div
          className="chatting-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="app-container">
            {/* Header */}
            <header className="header">
              <h1 className="header-title">Chat Ailab</h1>
              <button
                className="logo-button"
                onClick={() => navigate("/chat-tts")}
              >
                <div className="icon-logo-container">
                  {/* Using flamed which is defined above */}
                  <img src={flamed} className="icon-md" alt="flamehead" />
                </div>
              </button>
            </header>

            {/* Chat Area */}
            <main className="chat-area">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className={`message-container ${msg.sender}`}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    {msg.sender === "typing" ? (
                      <div className="typing-indicator">
                        <span className="typing-text">Thinking</span>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    ) : (
                      <div className={`message_bubble ${msg.sender}`}>
                        {/* RENDER LOGIC FOR READABILITY */}
                        {msg.sender === "bot" ? (
                          <div className="bot-response-text">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="chat-p-text">{msg.text}</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </main>

            {/* Footer with Suggestions and Input */}
            <footer className="footer">
              {/* Suggestion Buttons */}
              <div className="suggestions-container">
                <button
                  onClick={() => handleSuggestionClick("What is AiLab?")}
                  className="suggestion-button"
                >
                  {/* SVG Icon for What is AiLab? */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon-sm"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  What is AiLab?
                </button>
                <button
                  onClick={() => handleSuggestionClick("Uniform")}
                  className="suggestion-button"
                >
                  {/* SVG Icon for Uniform */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon-sm"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6"
                    />
                  </svg>
                  Uniform
                </button>
                <button
                  onClick={() => handleSuggestionClick(FAQ_prompt)}
                  className="suggestion-button"
                >
                  {/* SVG Icon for FAQs */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon-sm"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  FAQs
                </button>
              </div>

              {/* Message Input */}
              <div className="input-wrapper">
                <div className="input-container">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message here..."
                    className="message-input"
                  />

                  <button
                    onClick={() => handleSend(inputValue)}
                    className="send-button"
                    disabled={!inputValue.trim()}
                  >
                    <Send size={22} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </motion.div>
      </div>
    );
}

export default Chat;
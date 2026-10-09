import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import { Brand, Icon } from '@/App.js';

function RealSidepanel() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput("");
    setStatus("loading");

    try {
      // In a real implementation, we would pass the conversation context.
      // Since it's a hackathon demo and we have limited time, we'll query the local backend chat API directly.
      const response = await fetch("http://127.0.0.1:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: msg, context: "Context missing in demo" })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || data.error || "No response" }]);
      setStatus("ready");
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Local AI backend unreachable." }]);
      setStatus("error");
    }
  };

  return (
    <div className="ext-panel">
      <header className="ext-header ext-header--panel">
        <Brand compact />
        <button onClick={() => chrome.tabs.create({ url: "http://localhost:5173" })} className="icon-btn">
          <Icon name="spark" />
        </button>
      </header>
      
      <div className="ext-panel-scroll">
        <div className="x-status x-status--ok" role="status">
          <Icon name="check" size={16} />
          <div>
            <strong>Ready</strong>
            <span>Local AI connected</span>
          </div>
        </div>
        
        <div className="ext-chat">
          {messages.map((m, i) => (
            <div key={i} className={`ext-bubble ext-bubble--${m.role}`}>
              <p>{m.content}</p>
            </div>
          ))}
          {status === "loading" && (
            <div className="ext-bubble ext-bubble--ai">
              <span className="ext-dot-pulse">...</span>
            </div>
          )}
        </div>
      </div>

      <div className="ext-prompt">
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about the conversation..." 
        />
        <button onClick={handleSend} disabled={!input.trim() || status === "loading"}>
          <Icon name="send" />
        </button>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<RealSidepanel />);

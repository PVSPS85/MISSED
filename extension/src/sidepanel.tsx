import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import { Brand, Icon } from '@/App.js';

function RealSidepanel() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"ready" | "loading" | "error">("ready");
  const [context, setContext] = useState<string>("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, status]);

  const loadContext = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.body.innerText,
        }, (results) => {
          if (results && results[0]) {
            setContext(results[0].result);
          }
        });
      }
    });
  };

  const handleSend = async () => {
    if (!input.trim() || status === "loading") return;
    const msg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput("");
    setStatus("loading");

    try {
      const response = await fetch("http://127.0.0.1:8443/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: msg, context: context || "No context provided." })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || data.error || "No response" }]);
      setStatus("ready");
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Local AI backend unreachable." }]);
      setStatus("error");
    }
  };

  const analyzeContext = async () => {
    setStatus("loading");
    try {
      const res = await fetch("http://127.0.0.1:8443/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: context, sourceType: "paste" })
      });
      const data = await res.json();
      if (data.jobId) {
        chrome.tabs.create({ url: `http://localhost:5173/?jobId=${data.jobId}` });
        setStatus("ready");
      } else {
        setStatus("error");
      }
    } catch (e) {
      setStatus("error");
    }
  };

  return (
    <div className="ext-panel">
      <header className="ext-header ext-header--panel">
        <Brand compact />
        <button onClick={() => chrome.tabs.create({ url: "http://localhost:5173" })} className="icon-btn" title="Open full dashboard">
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
        
        {!context ? (
          <button className="ext-context-btn" onClick={loadContext} style={{alignSelf: 'flex-start'}}>
            + Extract Page Context
          </button>
        ) : (
          <div className="ext-context">
            <div className="ext-context-header">
              <span>Page Context ({context.length} chars)</span>
              <div style={{display: 'flex', gap: '4px'}}>
                <button className="ext-context-btn" onClick={analyzeContext} disabled={status === 'loading'}>Full Analysis</button>
                <button className="ext-context-btn" onClick={() => setContext("")}>Clear</button>
              </div>
            </div>
            {context.slice(0, 200)}...
          </div>
        )}

        <div className="ext-chat">
          {messages.map((m, i) => (
            <div key={i} className={`ext-bubble ext-bubble--${m.role}`}>
              <p style={{margin: 0}}>{m.content}</p>
            </div>
          ))}
          {status === "loading" && (
            <div className="ext-bubble ext-bubble--ai">
              <span className="ext-dot-pulse">...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="ext-prompt">
        <textarea 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about the conversation..." 
          style={{ resize: 'none', height: '40px' }}
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

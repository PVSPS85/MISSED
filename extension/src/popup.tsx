import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css'; // use frontend css
import { Brand, Icon, Button } from '@/App.js'; // reuse components

function RealPopup() {
  const [status, setStatus] = useState<"initial" | "loading" | "error">("initial");

  const openApp = () => {
    chrome.tabs.create({ url: "http://localhost:5173" });
  };

  const openSidePanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.sidePanel.open({ tabId: tab.id });
      }
    });
  };

  const extractAndAnalyze = async () => {
    setStatus("loading");
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => document.body.innerText,
        }, async (results) => {
          if (results && results[0]) {
            const text = results[0].result;
            try {
              const res = await fetch("http://127.0.0.1:3001/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rawText: text, sourceType: "paste" })
              });
              const data = await res.json();
              if (data.jobId) {
                chrome.tabs.create({ url: `http://localhost:5173/?jobId=${data.jobId}` });
              } else {
                setStatus("error");
              }
            } catch (e) {
              setStatus("error");
            }
          } else {
            setStatus("error");
          }
        });
      }
    });
  };

  return (
    <div className="ext-popup">
      <header className="ext-header">
        <Brand compact />
        <span className="ext-badge">EXTENSION</span>
      </header>
      
      <div className="ext-popup-content">
        <p>Your local AI conversation assistant.</p>
        <button onClick={openSidePanel} className="ext-action" disabled={status === 'loading'}>
          <Icon name="message" />
          <span>OPEN CHAT ASSISTANT</span>
        </button>
        <button onClick={extractAndAnalyze} className="ext-action" disabled={status === 'loading'}>
          <Icon name="spark" />
          <span>{status === 'loading' ? 'EXTRACTING...' : 'USE CURRENT PAGE'}</span>
        </button>
        <button onClick={openApp} className="ext-action" disabled={status === 'loading'}>
          <Icon name="file" />
          <span>FULL DASHBOARD</span>
        </button>
        {status === 'error' && <p style={{color:'var(--red)'}}>Failed to extract or submit.</p>}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<RealPopup />);

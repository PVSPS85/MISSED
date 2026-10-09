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

  return (
    <div className="ext-popup">
      <header className="ext-header">
        <Brand compact />
        <span className="ext-badge">EXTENSION</span>
      </header>
      
      <div className="ext-popup-content">
        <p>Your local AI conversation assistant.</p>
        <button onClick={openSidePanel} className="ext-action">
          <Icon name="message" />
          <span>OPEN CHAT ASSISTANT</span>
        </button>
        <button onClick={openApp} className="ext-action">
          <Icon name="spark" />
          <span>FULL DASHBOARD</span>
        </button>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<RealPopup />);

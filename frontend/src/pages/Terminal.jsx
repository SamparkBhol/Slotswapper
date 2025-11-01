import React, { useState } from 'react';
import './Terminal.css';
import AnalyticsDisplay from '../components/AnalyticsDisplay.jsx';
import ChatDisplay from '../components/ChatDisplay.jsx';

const Terminal = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <button
          className={`terminal-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          analytics.sh
        </button>
        <button
          className={`terminal-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          support-chat.exe
        </button>
        <div className="terminal-controls">
          <span>—</span>
          <span>□</span>
          <span className="control-close">✕</span>
        </div>
      </div>
      <div className="terminal-body">
        {activeTab === 'analytics' ? <AnalyticsDisplay /> : <ChatDisplay />}
      </div>
    </div>
  );
};

export default Terminal;
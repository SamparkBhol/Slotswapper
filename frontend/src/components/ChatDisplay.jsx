import React, { useState, useRef, useEffect } from 'react';

const initialMessages = [
  { user: 'SYSTEM', text: 'Connecting to server... OK.' },
  { user: 'SYS_ADMIN', text: 'Welcome, Admin. System is operational.' },
];

const getBotReply = (userInput) => {
  const input = userInput.toLowerCase();

  if (input.includes('hello') || input.includes('hi')) {
    return "Hello, Admin. How can I assist you today? (Try: 'help')";
  }
  if (input.includes('help')) {
    return "Available commands: 'password reset', 'how to swap', 'report bug'.";
  }
  if (input.includes('password') || input.includes('reset')) {
    return "SECURITY: To reset a user's password, please use the admin panel. (Note: This is a demo).";
  }
  if (input.includes('swap') || input.includes('how to')) {
    return "INFO: To request a swap, go to the Marketplace, find a slot, and click 'Request Swap'. You must have a 'SWAPPABLE' slot to offer.";
  }
  if (input.includes('bug') || input.includes('issue') || input.includes('error')) {
    return "ISSUE LOGGED: Your bug report has been received. We will dispatch a team of code-monkeys. (Not really, I'm a demo bot!)";
  }
  
  return "I'm not sure I understand. I've logged your query, and a support agent will be with you... eventually.";
};

const ChatDisplay = () => {
  const [messages, setMessages] =useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input || isTyping) return;

    const userMessage = { user: 'ADMIN', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botReplyText = getBotReply(userMessage.text);
      const botReply = {
        user: 'SYS_ADMIN',
        text: botReplyText,
      };
      setIsTyping(false);
      setMessages(prev => [...prev, botReply]);
    }, 1200);
  };

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index}>
            <span className={`chat-user user-${msg.user.toLowerCase()}`}>
              {msg.user}:
            </span>
            <span className="chat-text">{msg.text}</span>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <span className="chat-user user-sys_admin">SYS_ADMIN:</span>
            <span>is typing...</span>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      <form onSubmit={handleSend} className="chat-form">
        <span className="prompt">[admin@slotswapper ~]$</span>
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
      </form>
    </div>
  );
};

export default ChatDisplay;
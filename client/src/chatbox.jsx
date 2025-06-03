
import React, { useState, useEffect } from 'react';
import { socket } from './socket'; 
import './home.css'

export  function ChatWindow({ toUser }) {
  const t=toUser;
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  
  const sendMessage = () => {
    socket.emit('sendMessage', {
      recv: toUser,
      message,
    });
    setMessages(prev => [...prev, { message, fromMe: true }]);
    setMessage('');
  };

  useEffect(() => {
    socket.on('receiveMessage', ({ message, fromUser }) => {
      if (fromUser === toUser) {
        setMessages(prev => [...prev, { message, fromMe: false }]);
      }
    });

    return () => socket.off('receiveMessage');
  }, [toUser]);

  return (
    <div className="chat-window">
      <h3>Chat with {toUser}</h3>
      <div className="messages">
        {messages.map((m, idx) => (
          <p key={idx} className={m.fromMe ? 'me' : 'them'}>{m.message}</p>
        ))}
      </div>
      <input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

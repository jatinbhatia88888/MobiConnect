
import React, { useState, useEffect } from 'react';
import { socket } from './socket'; 
import './home.css' ;
 <link href="./src/styles.css" rel="stylesheet"></link>
export  function ChatWindow({ toUser }) {
  const t=toUser;
  const [isMember, setIsMember] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  
  const sendMessage = () => {
    socket.emit('sendMessage', {
      recv: toUser.peerInfo,
      type:toUser.type,
      message,
    });
    setMessages(prev => [...prev, { message, fromMe: true }]);
    setMessage('');
  };


  

  useEffect(() => {
    socket.on('receiveMessage', ({ message, fromUser }) => {
      if (fromUser === toUser.peerInfo) {
        setMessages(prev => [...prev, { message, fromMe: false }]);
      }
    });

    return () => socket.off('receiveMessage');
  }, [toUser]);
  
 useEffect(() => {
    if (toUser.type=="user") return;
       
    fetch('http://localhost:8000/checkroommembership',  {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ groupname: toUser.peerInfo }) })
      .then(res => res.json())
      .then(data => setIsMember(data.isMember))
      .catch(() => setIsMember(false));
  }, [toUser.peerInfo]);

const handleJoinGroup = () => {
  fetch(`http://localhost:8000/joinroom`, {
    method: 'POST',
    credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupname: toUser.peerInfo }) ,
  })
    .then(res => {
      if (res.ok) {
        setIsMember(true);
       // socket.emit('join-group', toUser.peerInfo); // join socket room
      } else {
        alert('Failed to join group');
      }
    });
};


  return (
    isMember ? (
      <div className="chat-window">
        <h3>Chat with {toUser.peerInfo}</h3>
        <div className="messages">
          {messages.map((m, idx) => (
            <p key={idx} className={m.fromMe ? 'me' : 'them'}>{m.message}</p>
          ))}
        </div>
        <div className="typebar">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded" onClick={sendMessage}>Send</button>
        </div>
      </div>
    ) : (
      <button onClick={handleJoinGroup}>
        Join Group to Chat
      </button>
    )
  );
}

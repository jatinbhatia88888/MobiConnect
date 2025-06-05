import React, { useState, useEffect ,useRef} from 'react';
import { socket } from './socket'; 
import './home.css' ;
 <link href="./src/styles.css" rel="stylesheet"></link>
export  function ChatWindow({ toUser ,handleGroupAdded,currentUser}) {
  const t=toUser;
  const [isMember, setIsMember] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesRef = useRef(null);
   const handleScroll = (e) => {
  if (e.target.scrollTop === 0 && hasMore) {
    const next = page + 1;
    setPage(next);
    fetchMessages();
  }
};

  const sendMessage = () => {
    socket.emit('sendMessage', {
      recv: toUser.peerInfo,
      type:toUser.type,
      message,
    });
    if (messagesRef.current) {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }
    setMessages(prev => [...prev, { content:message, to:toUser.peerInfo ,from:currentUser}]);
    setMessage('');
  };

  const fetchMessages = async (initial = false) => {
  const res = await fetch(`http://localhost:8000/messages?peer=${toUser.peerInfo}&type=${toUser.type}&page=${page}&limit=20`, {
    credentials: 'include',
  });
  const data = await res.json();
  console.log(data);
  setMessages(prev => initial ? data : [...data, ...prev]);
  setHasMore(data.length === 20);
};


  

  useEffect(() => {
    socket.on('receiveMessage', ({ message, fromUser }) => {
      console.log(message);
      if (fromUser === toUser.peerInfo) {
        setMessages(prev => [...prev, { message, from: toUser.peerInfo ,to:currentUser }]);
      }
    });
    setMessages([]);
    setPage(1);
    fetchMessages(true);


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
  fetch('http://localhost:8000/joinroom', {
    method: 'POST',
    credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupname: toUser.peerInfo }) ,
  })
    .then(res => {
      if (res.ok) {
        setIsMember(true);
        handleGroupAdded()
       socket.emit('join-group', toUser.peerInfo); // join socket room
      } else {
        alert('Failed to join group');
      }
    });                                    
};



  return (
    isMember ? (
      <div className="chat-window">
        <h3>Chat with {toUser.peerInfo}</h3>
        <div className="messages" onScroll={handleScroll} ref={messagesRef} style={{ height: '300px', overflowY: 'auto' }} >

          {messages.map((m, idx) => (
            <p key={idx} className={m.from==currentUser ? 'me' : 'them'}>{m.content}</p>
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
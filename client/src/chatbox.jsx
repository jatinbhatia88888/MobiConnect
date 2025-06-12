import React, { useState, useEffect ,useRef} from 'react';
import { socket } from './socket'; 
import { Attachment } from './Attachment.jsx';
import './home.css' ;
 <link href="./src/styles.css" rel="stylesheet"></link>
export  function ChatWindow({ toUser ,handleGroupAdded,currentUser}) {
  
  const [isMember, setIsMember] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
   

const handleScroll = (e) => {
  if (e.target.scrollTop === 0 && hasMore) {
    const next = page + 1;
    setPage(next);
    fetchMessages();
  }
};


useEffect(() => {
    socket.on('incoming-video-call', ({ room, from }) => {
      setIncomingCall({ room, from });
    });

    return () => {
      socket.off('incoming-video-call');
    };
  }, []);

const acceptCall = () => {
    window.location.href = `/video?room=${incomingCall.room}`;
    setIncomingCall(null);
  };

const rejectCall = () => {
    setIncomingCall(null);
  };

  const sendMessage = () => {
    socket.emit('sendMessage', {
      recv: toUser.peerInfo,
      type:toUser.type,
      contenttype:'text',
      message,
    });
    if (messagesRef.current) {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }
    setMessages(prev => [...prev, { content:message, to:toUser.peerInfo ,from:currentUser,contenttype:'text',timestamp:new Date()}]);
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
    socket.on('receiveMessage', ({ message, fromUser,contenttype,timestamp }) => {
      console.log(message);
      if (fromUser === toUser.peerInfo) {
        setMessages(prev => [...prev, { content: message, from: toUser.peerInfo ,to:currentUser,contenttype:contenttype ,timestamp}]);
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
       socket.emit('join-group', toUser.peerInfo); 
      } else {
        alert('Failed to join group');
      }
    });                                    
};

function getRoomName(type, currentUser, targetName) {
  if (type === "group") return `group-${targetName}`;
  const sorted = [currentUser, targetName].sort();
  return `user-${sorted[0]}-${sorted[1]}`;
}

function handleVideoCall(type, targetName) {
 
  const room = getRoomName(toUser.type, currentUser, toUser.peerInfo);

  socket.emit("start-video-call", { room, to: toUser.peerInfo, type:toUser.type ,});

  
  window.location.href = `/video?room=${room}`;
}


 





  return (
    
    isMember ? (
      <div className="chat-window">
        <h3>Chat with {toUser.peerInfo}</h3>
        <button onClick={() => handleVideoCall(toUser.type, toUser.peerInfo)}>
       Start Video Call
        </button>
          
        <div className="messages" onScroll={handleScroll} ref={messagesRef} style={{ height: '300px', overflowY: 'auto' }} >

          {messages.map((m, idx) => {
    const isMe = m.from === currentUser;
    const localKey = `downloaded-${m.url}`;
    const alreadyDownloaded = localStorage.getItem(localKey) === 'true';
    const timestamp = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleDownload = () => {
      const a = document.createElement('a');
      a.href = m.url;
      a.download = m.content;
      a.click();
      localStorage.setItem(localKey, 'true');
    };

    const handleOpen = () => {
      window.open(m.url, '_blank');
    };

    return (
      <div key={idx} className={`message-bubble ${isMe ? 'me' : 'them'}`}>
        {m.contenttype === 'text' && <p>{m.content}</p>}

        {m.contenttype === 'img' && (
          <div
            className="media-container"
            onClick={alreadyDownloaded ? handleOpen : handleDownload}
          >
            <img src={m.url} alt={m.content} />
            <div className="download-status">
              {alreadyDownloaded ? '✔️ Downloaded' : '📥 Tap to download'}
            </div>
          </div>
        )}

        {m.contenttype === 'file' && (
          <div
            className="file-preview"
            onClick={alreadyDownloaded ? handleOpen : handleDownload}
          >
            <span className="filename">📄 {m.content}</span>
            <span className="status">
              {alreadyDownloaded ? '✔️ Downloaded' : '📥 Tap to download'}
            </span>
          </div>
        )}

        <div className="timestamp">{timestamp}</div>
      </div>
    );
  })}
        </div>
        
        <div className="typebar">
          
           <div className="inner-typebar">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          </div>

          <button className="" onClick={sendMessage}>Send</button>
         {incomingCall && (
        <div className="incoming-call-popup" >
          <p>Incoming call from <b>{incomingCall.from}</b></p>
          <button onClick={acceptCall} >Accept</button>
          <button onClick={rejectCall} >Reject</button>
        </div>
      )}
        </div>
      </div>
    ) : (
      <div className="chatbox">
        <div className="typebar">
      <button onClick={handleJoinGroup}>
        Join Group to Chat
      </button>
      </div>
      
      </div>
      
    )
  );
}
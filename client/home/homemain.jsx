import { Sidebar } from '../src/sidebar.jsx';
import { SearchUser } from '../src/searchbar.jsx';
import { ChatWindow } from '../src/chatbox.jsx';
import { useState,useEffect } from 'react';
import { AddGroupForm } from '../src/addgroup.jsx';
import { Attachment } from '../src/Attachment.jsx';
import './homestyle.css'; // Link to the above CSS
{/* <link href="../src/styles.css" rel="stylesheet"></link> */}
export function Homepage() {
  const [peer,setPeer]=useState({peerInfo:"",type:"user"});
  const [refreshSidebar, setRefreshSidebar] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const handleGroupAdded = () => {
    
    setRefreshSidebar(prev => !prev);
  };
  useEffect(() => {
    fetch("http://localhost:8000/home/me", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {setCurrentUser(data.username),setPeer({peerInfo:data.username,type:peer.type})})
      .catch(err => console.error("Failed to fetch current user:", err));
  }, []);
  

  return (
    <div className="home-container">
      <div className="home-sidebar">
        <Sidebar refreshTrigger={refreshSidebar} onUserSelect={setPeer} />
      </div>
      
      <div className="home-main">
        <div className="home-search">
          
        <SearchUser onUserSelect={setPeer} require="user" handleGroupAdded={handleGroupAdded}/>
       <i class="fa-solid fa-user search-icon"></i>
      
      
        <SearchUser onUserSelect={setPeer} require="group" handleGroupAdded={handleGroupAdded}/>
        <i className="fa-solid fa-user-group search-icon"></i>
       
        <AddGroupForm onGroupCreated={handleGroupAdded} />
        

        </div>
        
        
        <div className="home-chat">
          <ChatWindow toUser={peer} handleGroupAdded={handleGroupAdded} currentUser={currentUser} ></ChatWindow> 
        </div>
      </div>
      </div>
      
    
  );
}

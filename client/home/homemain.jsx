import { Sidebar } from '../src/sidebar.jsx';
import { SearchUser } from '../src/searchbar.jsx';
import { ChatWindow } from '../src/chatbox.jsx';
import { useState } from 'react';
import './homestyle.css'; // Link to the above CSS

export function Homepage() {
  const [peer,setPeer]=useState("");
  return (
    <div className="home-container">
      <div className="home-sidebar">
        <Sidebar />
      </div>
      <div className="home-main">
        <div className="home-search">
        <SearchUser onUserSelect={setPeer} />

        </div>
        <div className="home-chat">
          <ChatWindow toUser={peer}></ChatWindow> 
        </div>
      </div>
    </div>
  );
}

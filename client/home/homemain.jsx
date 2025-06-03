import { Sidebar } from '../src/sidebar.jsx';
import { SearchUser } from '../src/searchbar.jsx';
import { ChatWindow } from '../src/chatbox.jsx';
import { useState } from 'react';
import { AddGroupForm } from '../src/addgroup.jsx';
import './homestyle.css'; // Link to the above CSS

export function Homepage() {
  const [peer,setPeer]=useState("");
  const [refreshSidebar, setRefreshSidebar] = useState(false);
  const handleGroupAdded = () => {
    
    setRefreshSidebar(prev => !prev);
  };
  return (
    <div className="home-container">
      <div className="home-sidebar">
        <Sidebar refreshTrigger={refreshSidebar} />
      </div>
      <div className="home-main">
        <div className="home-search">
        <SearchUser onUserSelect={setPeer} />

        </div>
        <div className="home-chat">
          <ChatWindow toUser={peer}></ChatWindow> 
        </div>
      </div>
      <div>
        <AddGroupForm onGroupCreated={handleGroupAdded} />
      </div>
    </div>
  );
}

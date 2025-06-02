import { Sidebar } from '../src/sidebar.jsx';
import { SearchUser } from '../src/searchbar.jsx';
import { ChatWindow } from '../src/chatbox.jsx';

import './homestyle.css'; // Link to the above CSS

export function Homepage() {
  return (
    <div className="home-container">
      <div className="home-sidebar">
        <Sidebar />
      </div>
      <div className="home-main">
        <div className="home-search">
          <SearchUser />
        </div>
        <div className="home-chat">
          <ChatWindow toUser="jain"></ChatWindow> 
        </div>
      </div>
    </div>
  );
}

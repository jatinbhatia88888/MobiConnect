import React, { useState, useEffect } from "react";
import "./sidebar.css";
import { socket } from './socket'; 
export const Sidebar = ({ refreshTrigger,onUserSelect}) => {
  const [open, setOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  
  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth > 768); 
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
   

  

  useEffect(() => {
    fetch('http://localhost:8000/chatuser', { credentials: 'include' })
      .then(res => res.json())
      .then(setUsers)
      .catch((err)=>{
        console.log("no user ")
      });
      
    fetch('http://localhost:8000/chatgroup', { credentials: 'include' })
  .then(res => res.json())
  .then(groups => {
    setGroups(groups);                    
    socket.emit('join-multiple-rooms', groups); 
  })
  .catch(err => {
    console.log("no group", err);
  });

      
 
  



  }, [refreshTrigger])
  










  
  // const users = [
  //   { id: "u1", name: "Priya" },
  //   { id: "u2", name: "Huma" },
  //   { id: "u3", name: "Ravi" },
  // ];

  // const groups = [
  //   { id: "g1", name: "Project Alpha" },
  //   { id: "g2", name: "Family Group" },
  // ];

  return (
    <div className={`sidebar ${open ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h1 className="app-title">{open ? "MobiConnect" : "MC"}</h1>
        <button className="toggle-btn" onClick={() => setOpen(!open)}>
          {open ? "⮜" : "⮞"}
        </button>
      </div>

      <div className="sidebar-section">
        <h2 className="section-title">{open ? "Chats" : "C"}</h2>
        <ul className="list">
          {users.map((user) => (
            <li key={user}>
              <a href="#"
                // href={`/group/${group.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(event)=>{
                  event.preventDefault();
                  onUserSelect({peerInfo:user,type:"user"})
                }}
                 className="item-link">
                {open ? user : user[0]}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h2 className="section-title">{open ? "Rooms" : "R"}</h2>
        <ul className="list">
          {groups.map((group) => (
            <li key={group}>
              <a
                href="#"
                // href={`/group/${group.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(event)=>{
                  event.preventDefault();
                  onUserSelect({peerInfo:group,type:"group"})
                }}
                className="item-link"
              >
                {open ? group : group[0]}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

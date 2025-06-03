import React, { useState, useEffect } from "react";
import "./sidebar.css";

export const Sidebar = ({ refreshTrigger}) => {
  const [open, setOpen] = useState(true);
  // const [users, setUsers] = useState([]);
  // const [groups, setGroups] = useState([]);
  
  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth > 768); 
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
   

  

  // useEffect(() => {
  //   fetch('http://localhost:8000/users', { credentials: 'include' })
  //     .then(res => res.json())
  //     .then(setUsers);

  //   fetch('http://localhost:8000/groups', { credentials: 'include' })
  //     .then(res => res.json())
  //     .then(setGroups);
  // }, [refreshTrigger])









  
  const users = [
    { id: "u1", name: "Priya" },
    { id: "u2", name: "Huma" },
    { id: "u3", name: "Ravi" },
  ];

  const groups = [
    { id: "g1", name: "Project Alpha" },
    { id: "g2", name: "Family Group" },
  ];

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
            <li key={user.id}>
              <a href={`/chat/${user.name.toLowerCase()}`} className="item-link">
                {open ? user.name : user.name[0]}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h2 className="section-title">{open ? "Rooms" : "R"}</h2>
        <ul className="list">
          {groups.map((group) => (
            <li key={group.id}>
              <a
                href={`/group/${group.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="item-link"
              >
                {open ? group.name : group.name[0]}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;

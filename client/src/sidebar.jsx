import React, { useState, useEffect } from "react";
import {Photo} from "./photo.jsx"
import "./sidebar.css";
import { socket } from './socket'; 
export const Sidebar = ({ refreshTrigger,onUserSelect}) => {
  const [open, setOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [popupImage, setPopupImage] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth > 768); 
    };
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
   

  
  
  useEffect(() => {
    fetch('http://localhost:8000/home/chatuser', { credentials: 'include' })
      .then(res => res.json())
      .then(setUsers)
      .catch((err)=>{
        console.log("no user ")
      });
      
    fetch('http://localhost:8000/home/chatgroup', { credentials: 'include' })
  .then(res => res.json())
  .then(groups => {
    console.log("groups are" ,groups);
    setGroups(groups);                    
    socket.emit('join-multiple-rooms', groups); 
  })
  .catch(err => {
    console.log("no group", err);
  });

      
 
  

  }, [refreshTrigger])
  




  return (
    <>
    <div className={`sidebar ${open ? "open" : "collapsed"}`}>
      <div className="sidebar-header">
        <h1 className="app-title">{open ? "MobiConnect" : "MC"}</h1>
        <button className="toggle-btn" onClick={() => setOpen(!open)}>
          {open ? "⮜" : "⮞"}
        </button>
      </div>
      <div className="sidebar-content">
      <div className="sidebar-section">
        <h2 className="section-title">{open ? "Chats" : "C"}</h2>
        <ul className="list">
          {users.map((user) => (
            <li key={user.name}>
              <Photo
  src={user.imgurl}
  size="2.2em"
  onClick={() => setPopupImage(user.imgurl)}></Photo>
              <a href="#"
               
                onClick={(event)=>{
                  event.preventDefault();
                  onUserSelect({peerInfo:user.name,type:"user"})
                }}
                 className="item-link">
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
            <li key={group.name}>
             <Photo
  src={group.imgurl}
  size="2.2em"
  onClick={() => setPopupImage(group.imgurl)}
/>



              <a
                href="#"
                
                onClick={(event)=>{
                  event.preventDefault();
                  onUserSelect({peerInfo:group.name,type:"group"})
                }}
                className="item-link"
              >
                {open ? group.name : group.name[0]}
              </a>
            </li>
          ))}
        </ul>
      </div>
      </div>
      <div className="logout-container">
  <button className="logout-btn" onClick={() => {
    fetch('http://localhost:8000/logout', {
      method: 'POST',
      credentials: 'include',})
    // }).then(() => {
    //   window.location.href = '/login'; 
    // }).catch((err) => {
      // console.error('Logout failed', err);
    // });
  }}>
   <i className="fa fa-sign-out" aria-hidden="true"></i> {open ? "Logout" : ""}
  </button>
</div>
    </div>
    {popupImage && (
  <div className="photo-popup" onClick={() => setPopupImage(null)}>
    <div className="photo-popup-inner" onClick={e => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setPopupImage(null)}>✕</button>
      <img src={popupImage} alt="Enlarged" />
    </div>
  </div>
)}


</>
  );
};

export default Sidebar;

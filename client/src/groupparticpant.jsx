import React from 'react';
import './groupparticipant.css';

export function GroupParticipant({ members, onClose, setPopupImage }) {
  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button className="close-btn" onClick={onClose}>×</button>
        <h3>Group Participants</h3>
        <div className="participant-list">
          {members.map((user, idx) => (
            <div
              className="participant-item"
              key={idx}
              onClick={() => setPopupImage(user.imgurl)} // 👈 Set popup image here
            >
              <img src={user.imgurl} alt={user.name} className="participant-photo" />
              <span className="participant-name">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

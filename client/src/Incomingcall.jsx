
import React from "react";
import "./incomingCall.css"; 

export  function IncomingCallPopup({ senderPhoto, senderName, onAccept, onDecline }) {
  return (
    <div className="incoming-call-popup">
      <div className="popup-content">
        <img src={senderPhoto} alt="Caller" className="caller-photo" />
        <p className="caller-name">{senderName}</p>
        <p className="incoming-text">Incoming Call...</p>
        <div className="popup-buttons">
          <button className="accept-btn" onClick={onAccept}>Accept</button>
          <button className="decline-btn" onClick={onDecline}>Decline</button>
        </div>
      </div>
    </div>
  );
}

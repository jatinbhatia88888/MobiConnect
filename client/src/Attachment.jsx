import React, { useRef, useState } from "react";
import "./attachment.css";

export const Attachment = ({ sender, recv, onFileReady }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const toggleOptions = () => {
    setShowOptions((prev) => !prev);
  };
const handleSend = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('sender', sender);
    formData.append('recv', recv);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (result.url) {
      onUploadSuccess(result);
      setSelectedFile(null);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
    setShowOptions(false);
  };

  const removeFile = () => setSelectedFile(null);

  
  return (
    <div className="attachment-wrapper">
      <button className="attach-btn" onClick={toggleOptions}>📎</button>

      {showOptions && (
        <div className="attachment-popup">
          <div onClick={() => imageInputRef.current.click()}>🖼️ Image</div>
          <div onClick={() => fileInputRef.current.click()}>📄 File</div>
          <div onClick={toggleOptions}>❌ Close</div>
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {selectedFile && (
        <div className="selected-file">
          <span>{selectedFile.name}</span>
          <button onClick={removeFile}>✖</button>
        </div>
      )}

      {selectedFile && (
        <button className="send-btn" onClick={handleSend}>Send</button>
      )}
    </div>
  );
};



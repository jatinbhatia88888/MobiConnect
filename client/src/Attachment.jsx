import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import './attachment.css';

const Attachment = forwardRef(({ currentUser, toUser }, ref) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const imageInputRef = useRef();
  const fileInputRef = useRef();

  useImperativeHandle(ref, () => ({
    sendSelectedFile: async () => {
      if (!selectedFile) return null;

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('from', currentUser);
      formData.append('to', toUser.peerInfo);
      formData.append('type', toUser.type);

      try {
        const res = await fetch('http://localhost:8000/mobiconnect/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const data = await res.json();
        setSelectedFile(null);
        return data.message;
      } catch (err) {
        console.error('Upload error:', err);
        return null;
      }
    },
    hasSelectedFile: () => !!selectedFile
  }));

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowMenu(false);
    }
  };

  return (
    <div className="attachment-wrapper">
      {selectedFile && (
        <div className="attached-file-strip">
          <span>📎 {selectedFile.name}</span>
          <button className="remove-file" onClick={() => setSelectedFile(null)}>✕</button>
        </div>
      )}

      <button className="attach-button" onClick={() => setShowMenu(prev => !prev)}>📎</button>

      {showMenu && (
        <div className="attach-menu-float">
          <button onClick={() => imageInputRef.current.click()}>🖼 Image</button>
          <input type="file" accept="image/*" ref={imageInputRef} hidden onChange={handleFileSelect} />

          <button onClick={() => fileInputRef.current.click()}>📄 Document</button>
          <input type="file" accept=".pdf,.doc,.docx" ref={fileInputRef} hidden onChange={handleFileSelect} />
        </div>
      )}
    </div>
  );
});

export { Attachment };

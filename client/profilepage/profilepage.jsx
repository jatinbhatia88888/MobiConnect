import { useState, useEffect } from 'react';
import './profilepage.css';

export function ProfileSetup() {
  const [username, setUsername] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Username:', username);
    console.log('Image:', image);
    // Send image + username to backend
  };

  // Generate preview when image changes
  useEffect(() => {
    if (!image) return;
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    // Clean up on unmount
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  return (
    <div className="profile-wrapper">
      <div className="main-content">
        <div className="profile-left">
          <div className="branding">
            <img className="logo-img" src="/logo.png" alt="Logo" />
            <h1>MobiConnect</h1>
            <p>Complete your profile to start messaging</p>
          </div>
        </div>

        <div className="profile-right">
          <h2 className="page-title">Profile Setup</h2>
          <div className="profile-box">
            <form onSubmit={handleSubmit}>
              
              {/* Show preview if available */}
              {preview && (
                <div className="photo-preview">
                  <img src={preview} alt="Preview" className="preview-img" />
                </div>
              )}

              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />

              <button type="submit">Save Profile</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

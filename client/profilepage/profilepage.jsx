import { useState, useEffect } from 'react';
import './profilepage.css';

export function ProfileSetup() {
  const [username, setUsername] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [usernameExists, setUsernameExists] = useState(false);
  useEffect(() => {
    if (!username) return;

    const delayDebounce = setTimeout(async () => {
      const res = await fetch("http://localhost:8000/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
      console.log("data is",data);
      setUsernameExists(data.exists);
    }, 500);

    return () => clearTimeout(delayDebounce); 
  }, [username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Username:', username);
    console.log('Image:', image);
   
  };

  
  useEffect(() => {
    if (!image) return;
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

   
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
              {username && (
                <div className="username-check">
                  {usernameExists ? (
                    <span style={{ color: 'red' }}>Username already taken</span>
                  ) : (
                    <span style={{ color: 'green' }}>Username available</span>
                  )}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />

              <button type="submit" disabled={usernameExists}>Save Profile</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

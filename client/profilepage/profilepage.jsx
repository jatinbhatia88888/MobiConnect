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
      const res = await fetch("http://localhost:8000/profile/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();
     
      setUsernameExists(data.exists);
    }, 250);

    return () => clearTimeout(delayDebounce); 
  }, [username]);

 

  
  useEffect(() => {
    if (!image) return;
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

   
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);
  


  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append('username', username);
  formData.append('image', image);

  try {
    const res = await fetch('http://localhost:8000/profile/setup', {
      method: 'POST',
      credentials: 'include', 
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert('Profile saved successfully');
      window.location.href = '/home'; 
    } else {
      alert(data.error || 'Failed to save profile');
    }
  } catch (err) {
    console.error('Profile setup error:', err);
    alert('Something went wrong.');
  }
};


  return (
    <div className="profile-wrapper">
      <div className="main-content">
        <div className="profile-left">
          <div className="branding">
            <img className="logo-img" src="../src/logo.png" alt="Logo" />
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

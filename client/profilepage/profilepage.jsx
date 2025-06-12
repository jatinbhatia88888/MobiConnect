// ProfileSetup.jsx
import { useState } from 'react';
import './profilepage.css';

export function ProfileSetup() {
  const [username, setUsername] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Username:', username);
    console.log('Image:', image);
    // Handle the data or send it to your backend
  };

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

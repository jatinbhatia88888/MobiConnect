import { useState } from 'react';
import './addgroup.css';

export function AddGroupForm({ onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('groupname', groupName);
    if (groupImage) {
      formData.append('image', groupImage);
    }

    const res = await fetch('http://localhost:8000/home/create-group', {
      method: 'POST',
      credentials: 'include',
      body: formData 
    });

    if (res.ok) {
      onGroupCreated();
      setShowForm(false);
      setGroupName('');
      setGroupImage(null);
    } else {
      alert('Failed to create group');
    }
  };

  return (
    <>
      <div className="relative hover:bg-blue-700">
        <button onClick={() => setShowForm(true)} className="add-room-button">
          ➕ Create Room
        </button>
      </div>

      {showForm && (
        <div className="popup-overlay">
          <div className="popup-form">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <button className="popup-close" onClick={() => setShowForm(false)}>&times;</button>
              
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="Enter group name"
                required
              />

              <input
                type="file"
                accept="image/*"
                onChange={e => setGroupImage(e.target.files[0])}
              />

              <button type="submit" className="popup-button">Create Group</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

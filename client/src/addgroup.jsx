import { useState } from 'react';
import './addgroup.css';

export function AddGroupForm({ onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [nameStatus, setNameStatus] = useState(null); 

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
  const checkGroupName = async (name) => {
  if (!name) return setNameStatus(null);

  try {
    const res = await fetch(`http://localhost:8000/home/check-groupname?name=${encodeURIComponent(name)}`, {
      method: 'GET',
      credentials: 'include'
    });

    const data = await res.json();
    setNameStatus(data.available ? 'available' : 'taken');
  } catch (err) {
    console.error('Error checking group name:', err);
    setNameStatus(null);
  }
};


  return (
    <>
      <div className="relative hover:bg-blue-700">
        <button onClick={() => setShowForm(true)} className="add-room-button">
          <i class="fa-solid fa-plus"></i> Create Room
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
                onChange={e => {setGroupName(e.target.value);checkGroupName(e.target.value);}}
                placeholder="Enter group name"
                required
              />
               {nameStatus === 'available' && (
               <p className="name-status available"> Name available</p>)}
               {nameStatus === 'taken' && (<p className="name-status taken"> Name already taken</p>)}

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

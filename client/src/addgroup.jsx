import {useState} from 'react';
import './addgroup.css'
export function AddGroupForm({ onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/create-group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ groupname: groupName })
    });

    if (res.ok) {
      onGroupCreated(); 
      setShowForm(false);
      setGroupName('');
    } else {
      alert('Failed to create group');
    }
  };

  return (
    <>
    <div className="relative hover:bg-blue-700">
      
    <button
        onClick={() => setShowForm(true)}
        className="add-room-button "
      >
       ➕ Create Room
      </button>
      </div>
      
    {showForm && ( 
      
       <div  className="popup-overlay">
         <div className="popup-form">
         <form onSubmit={handleSubmit}>
        <button className="popup-close" onClick={() => setShowForm(false)}>&times;</button>
      <input
        value={groupName}
        onChange={e => setGroupName(e.target.value)}
        placeholder="Enter group name"
      />
      <button type="submit" className="popup-button">Create Group</button>
    </form>
  </div>
  </div>)}
    </>
  );
}

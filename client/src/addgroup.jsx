import {useState} from 'react';
export function AddGroupForm({ onGroupCreated }) {
  const [groupName, setGroupName] = useState('');

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
      setGroupName('');
    } else {
      alert('Failed to create group');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={groupName}
        onChange={e => setGroupName(e.target.value)}
        placeholder="Enter group name"
      />
      <button type="submit">Create Group</button>
    </form>
  );
}

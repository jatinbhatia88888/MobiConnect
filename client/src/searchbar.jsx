
import React, { useState } from 'react';

import './home.css'
export  function SearchUser({ onUserSelect ,require}) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 1) {
      const res = await fetch(`http://localhost:8000/search/${require}?query=${value}`, {
      credentials: 'include' 
});
      const data = await res.json();
      setUsers(data);
    } else {
      setUsers([]);
    }                          
  };

  return (
    <div className="search-box">
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search user..."
      />
      {users.length > 0 && (
        <ul className="dropdown">
          {users.map(user => (
            <li key={user.name} onClick={() => {onUserSelect({peerInfo:user.name,type:require}),
              setUsers([])
            }}>
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

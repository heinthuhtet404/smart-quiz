import React, { useEffect, useState } from 'react';
import './sidebar.css';

const SideBar = ({ currentUser, onSelectUser }) => {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (!currentUser?._id) return;

    // Fetch current user's friends from backend
    fetch(`/api/users/user/${currentUser._id}`)
      .then(res => res.json())
      .then(data => setFriends(data.friends || []))
      .catch(err => console.error('Error fetching friends:', err));
  }, [currentUser]);

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Friends</h2>
      <ul className="user-list">
        {friends.length === 0 && <li className="no-friends">No friends yet</li>}
        {friends.map(friend => (
          <li
            key={friend._id}
            className={`user-item ${friend.online ? 'online' : 'offline'}`}
            onClick={() => onSelectUser(friend)}
          >
            <span className="status-dot"></span>
            <span className="user-name">{friend.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;

import React from 'react';
import './sidebar.css';

const fakeUsers = [
  { id: 'u1', name: 'Ko Ko', online: true },
  { id: 'u2', name: 'Hla Hla', online: false },
  { id: 'u3', name: 'Ma Ma', online: true },
  { id: 'u4', name: 'Aung Aung', online: false }
];

const SideBar = ({ onSelectUser }) => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Friends</h2>
      <ul className="user-list">
        {fakeUsers.map(user => (
          <li
            key={user.id}
            className={`user-item ${user.online ? 'online' : 'offline'}`}
            onClick={() => onSelectUser(user)}
          >
            <span className="status-dot"></span>
            <span className="user-name">{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;

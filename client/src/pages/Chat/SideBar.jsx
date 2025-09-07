import React, { useState, useEffect } from 'react';
import './sidebar.css';

const SideBar = ({ onSelectUser, externalAddUser }) => {
  const [users, setUsers] = useState([
    { id: 'u1', name: 'Ko Ko', online: true },
    { id: 'u2', name: 'Hla Hla', online: false },
  ]);

  // Add users from outside (chat.html redirection or any external script)
  useEffect(() => {
    if (externalAddUser) {
      window.addUserToSidebar = (user) => {
        if (!user || !user.id) return;
        setUsers((prevUsers) => {
          const exists = prevUsers.find(u => u.id === user.id);
          if (exists) return prevUsers;
          console.log("✅ Adding user to sidebar:", user);
          return [...prevUsers, user];
        });

        // Optionally auto-select the new user
        if (onSelectUser) onSelectUser(user);
      };
    }

    // Cleanup function to remove the global method when component unmounts
    return () => {
      if (window.addUserToSidebar) delete window.addUserToSidebar;
    };
  }, [externalAddUser, onSelectUser]);

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Friends</h2>
      <ul className="user-list">
        {users.map(user => (
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

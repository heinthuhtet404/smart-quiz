import React from 'react';
import './SideBar.css'; // Assuming you have a CSS file for styling

const SideBar = () => {
  const users = ['Ko Ko', 'Hla Hla', 'Ma Ma', 'Aung Aung'];

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Chats</h2>
      <ul className="user-list">
        {users.map((user, idx) => (
          <li key={idx} className="user-item">
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideBar;

import React from 'react';

const fakeUsers = [
  { id: 'u1', name: 'Ko Ko', online: true },
  { id: 'u2', name: 'Hla Hla', online: false },
  { id: 'u3', name: 'Ma Ma', online: true },
  { id: 'u4', name: 'Aung Aung', online: false }
];

const SideBar = ({ onSelectUser }) => (
  <div style={{ width: '200px', padding: '10px', borderRight: '1px solid #ccc' }}>
    <h2>Users</h2>
    <ul>
      {fakeUsers.map(user => (
        <li key={user.id} onClick={() => onSelectUser(user)} style={{ cursor: 'pointer', marginBottom: '8px' }}>
          {user.name} {user.online ? '🟢' : '⚪'}
        </li>
      ))}
    </ul>
  </div>
);

export default SideBar;

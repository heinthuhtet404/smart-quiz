// ChatPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SideBar from './SideBar';
import ChatWindow from './ChatWindow';
import './ChatPage.css';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarUsers, setSidebarUsers] = useState([]);
  const [searchParams] = useSearchParams();

  // Function to add user to sidebar
  const addUserToSidebar = (user) => {
    setSidebarUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (!exists) return [...prev, user];
      return prev;
    });
  };

  // Expose globally to HTML redirect
  window.addUserToSidebar = addUserToSidebar;

  // Load user from query params
  useEffect(() => {
    const userId = searchParams.get('userId');
    const userName = searchParams.get('name');

    if (userId && userName) {
      const user = { id: userId, name: userName };
      setSelectedUser(user);
      addUserToSidebar(user);
    }
  }, [searchParams]);

  return (
    <div className="chat-page">
      <div className="sidebar-wrapper">
        <SideBar users={sidebarUsers} onSelectUser={setSelectedUser} />
      </div>

      <div className="chat-wrapper">
        {selectedUser ? (
          <ChatWindow selectedUser={selectedUser} />
        ) : (
          <div className="chat-placeholder">
            <h2>Select a user to start chatting</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

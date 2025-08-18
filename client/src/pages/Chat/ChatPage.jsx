import { useState } from 'react';
import SideBar from './SideBar';
import ChatWindow from './ChatWindow';
import './ChatPage.css';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="chat-page">
      <div className="sidebar-wrapper">
        <SideBar onSelectUser={setSelectedUser} />
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

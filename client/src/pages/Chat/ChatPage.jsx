import { useState } from 'react';
import SideBar from './SideBar';
import ChatWindow from './ChatWindow';

const ChatPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <SideBar onSelectUser={setSelectedUser} />
      {selectedUser ? (
        <ChatWindow selectedUser={selectedUser} />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Select a user to start chatting</h2>
        </div>
      )}
    </div>
  );
};

export default ChatPage;

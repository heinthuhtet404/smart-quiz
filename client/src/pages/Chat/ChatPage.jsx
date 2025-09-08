import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SideBar from './SideBar';
import ChatWindow from './ChatWindow';
import './ChatPage.css';

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarUsers, setSidebarUsers] = useState([]);
  const [loginUserName, setLoginUserName] = useState("");
  const [loginUserEmail, setLoginUserEmail] = useState("");
  const [searchParams] = useSearchParams();

  // load from localStorage at mount
  useEffect(() => {
    const saved = localStorage.getItem('dynamicSidebarUsers');
    if (saved) setSidebarUsers(JSON.parse(saved));
  }, []);

  // save to localStorage on every change
  useEffect(() => {
    localStorage.setItem('dynamicSidebarUsers', JSON.stringify(sidebarUsers));
  }, [sidebarUsers]);

  // Add user if present in URL
  useEffect(() => {
    const receiverId = searchParams.get('receiverId');
    const receiverName = searchParams.get('receiverName');
    const _loginUserName = searchParams.get('loginUserName');
    const _loginUserEmail = searchParams.get('loginUserEmail');

    setLoginUserName(_loginUserName || "");
    setLoginUserEmail(_loginUserEmail || "");

    if (receiverId && receiverName) {
      const user = {
        id: receiverId,
        name: receiverName
      };
      setSelectedUser(user);

      // sidebar update
      setSidebarUsers(prev =>
        prev.find(u => u.id === receiverId)
          ? prev
          : [...prev, { id: receiverId, name: receiverName }]
      );
    }
  }, [searchParams]);

  return (
    <div className="chat-page">
      <div className="sidebar-wrapper">
        <SideBar 
          users={sidebarUsers} 
          onSelectUser={setSelectedUser} 
          loginUserName={loginUserName} 
          loginUserEmail={loginUserEmail} 
        />
      </div>
      <div className="chat-wrapper">
        {selectedUser ? (
          <ChatWindow 
            selectedUser={selectedUser} 
            loginUserName={loginUserName} 
            loginUserEmail={loginUserEmail} 
          />
        ) : (
          <div className="chat-placeholder">
            <h2>Select a user to start chatting</h2>
          </div>
        )}
      </div>
    </div>
  );
}
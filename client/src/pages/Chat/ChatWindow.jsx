import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import MessageInput from './MessageInput';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ChatWindow = ({ selectedUser }) => {
  const user = JSON.parse(localStorage.getItem('user')); // Must exist in storage
  const userId = user?._id;
  const userName = user?.name;

  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userId || !selectedUser?.id) return;

    fetch(`${API_BASE}/api/chat/${userId}/${selectedUser.id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);
  }, [selectedUser, userId]);

  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(API_BASE);
    setSocket(socketInstance);

    socketInstance.on('newMessage', (msg) => {
      if (
        (msg.senderId === userId && msg.receiverId === selectedUser.id) ||
        (msg.senderId === selectedUser.id && msg.receiverId === userId)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [selectedUser, userId]);

  const handleSend = async (text) => {
    if (!text) return;

    const newMsg = {
      senderId: userId,
      receiverId: selectedUser.id,
      senderName: userName,
      text,
    };

    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg),
    });

    const data = await res.json();
    setMessages(prev => [...prev, data]);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <strong>Chatting with {selectedUser.name}</strong>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.senderId === userId ? 'right' : 'left',
              margin: '5px 0',
              backgroundColor: msg.senderId === userId ? '#aee1f9' : '#eee',
              padding: '8px',
              borderRadius: '10px',
              maxWidth: '60%',
              alignSelf: msg.senderId === userId ? 'flex-end' : 'flex-start'
            }}
          >
            <b>{msg.senderName}</b><br />
            {msg.text}
          </div>
        ))}
      </div>
      <div style={{ padding: '10px', borderTop: '1px solid #ccc' }}>
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatWindow;

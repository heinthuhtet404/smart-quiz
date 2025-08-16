import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import MessageInput from './MessageInput';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ChatWindow = ({ selectedUser }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;
  const userName = user?.name;

  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch chat history
  useEffect(() => {
    if (!userId || !selectedUser?.id) return;

    fetch(`${API_BASE}/api/chat/${userId}/${selectedUser.id}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);
  }, [selectedUser, userId]);

  // Socket.IO setup
  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(API_BASE);
    setSocket(socketInstance);

    socketInstance.on('newMessage', (msg) => {
      // Only add if message belongs to this chat
      if (
        (msg.senderId === userId && msg.receiverId === selectedUser.id) ||
        (msg.senderId === selectedUser.id && msg.receiverId === userId)
      ) {
        setMessages(prev => {
          // Prevent duplicate messages
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [selectedUser, userId]);

  // Handle sending messages
  const handleSend = async ({ text, file }) => {
    if (!text && !file) return;

    const formData = new FormData();
    formData.append('senderId', userId);
    formData.append('receiverId', selectedUser.id);
    formData.append('senderName', userName);
    if (text) formData.append('text', text);
    if (file) formData.append('file', file);

    // Send to backend
    await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      body: formData,
    });

    // Do NOT setMessages here — socket will handle it
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <strong>Chatting with {selectedUser.name}</strong>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {messages.map((msg) => (
          <div
            key={msg._id}
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
            {msg.text && <p>{msg.text}</p>}
            {msg.fileUrl && (
              <>
                {msg.fileType?.startsWith("image/") && (
                  <img
                    src={msg.fileUrl}
                    alt="attachment"
                    style={{
                      maxWidth: "300px",  // limit width
                      maxHeight: "300px", // limit height
                      width: "auto",
                      height: "auto",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                )}

                {msg.fileType?.startsWith("video/") && (
                  <video
                    controls
                    style={{
                      maxWidth: "300px",
                      maxHeight: "300px",
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                    }}
                  >
                    <source src={msg.fileUrl} type={msg.fileType} />
                  </video>
                )}

                {msg.fileType?.startsWith("audio/") && (
                  <audio controls style={{ width: "100%" }}>
                    <source src={msg.fileUrl} type={msg.fileType} />
                  </audio>
                )}

                {!msg.fileType?.startsWith("image/") &&
                  !msg.fileType?.startsWith("video/") &&
                  !msg.fileType?.startsWith("audio/") && (
                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                      📎 Download File
                    </a>
                  )}
              </>
            )}

          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px', borderTop: '1px solid #ccc' }}>
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatWindow;

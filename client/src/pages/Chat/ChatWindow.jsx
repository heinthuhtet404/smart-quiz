import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import MessageInput from './MessageInput';
import './ChatWindow.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ChatWindow = ({ selectedUser }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;
  const userName = user?.name;

  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
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
      if (
        (msg.senderId === userId && msg.receiverId === selectedUser.id) ||
        (msg.senderId === selectedUser.id && msg.receiverId === userId)
      ) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => socketInstance.disconnect();
  }, [selectedUser, userId]);

  const handleSend = async ({ text, file }) => {
    if (!text && !file) return;

    const formData = new FormData();
    formData.append('senderId', userId);
    formData.append('receiverId', selectedUser.id);
    formData.append('senderName', userName);
    if (text) formData.append('text', text);
    if (file) formData.append('file', file);

    await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      body: formData,
    });
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    const options = { month: 'long', day: 'numeric' };
    if (date.getFullYear() !== today.getFullYear()) options.year = 'numeric';
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (iso) => {
    const date = new Date(iso);
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <div className="chat-window">
      <div className="chat-header">
        Chatting with {selectedUser.name}
      </div>

      <div className="message-container">
        {Object.keys(groupedMessages).map(date => (
          <div key={date}>
            <div className="date-separator">{date}</div>
            {groupedMessages[date].map(msg => (
  <div
    key={msg._id}
    className={`message-wrapper ${msg.senderId === userId ? 'my-message-wrapper' : 'other-message-wrapper'}`}
  >
    <div className={`message ${msg.senderId === userId ? 'my-message' : 'other-message'}`}>
      {msg.text && <div className="message-text">{msg.text}</div>}

      {msg.fileUrl && (
        <div className="message-file">
          {msg.fileType?.startsWith('image/') && <img src={msg.fileUrl} alt="attachment" />}
          {msg.fileType?.startsWith('video/') && (
            <video controls>
              <source src={msg.fileUrl} type={msg.fileType} />
            </video>
          )}
          {msg.fileType?.startsWith('audio/') && (
            <audio controls>
              <source src={msg.fileUrl} type={msg.fileType} />
            </audio>
          )}
          {!msg.fileType?.startsWith('image/') &&
           !msg.fileType?.startsWith('video/') &&
           !msg.fileType?.startsWith('audio/') && (
            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">📎 Download File</a>
          )}
        </div>
      )}

      <div className="message-time">{formatTime(msg.createdAt)}</div>
    </div>
  </div>
))}

          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-wrapper">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatWindow;

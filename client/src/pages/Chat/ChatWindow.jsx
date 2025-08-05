import React, { useEffect, useState } from 'react';
import MessageInput from './MessageInput';
import { io } from 'socket.io-client';
import './ChatWindow.css';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);

  // Generate temporary user on first load if no user in localStorage
  useEffect(() => {
    let user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      user = {
        _id: Math.random().toString(36).substr(2, 9),  // random id
        name: 'Guest-' + Math.floor(Math.random() * 1000),
      };
      localStorage.setItem('user', JSON.stringify(user));
      console.log('🆕 Generated guest user:', user);
    }
  }, []);

  // Get user after it is guaranteed to exist
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?._id;
  const userName = user?.name;

  useEffect(() => {
    // Fetch initial messages from server
    fetch('http://192.168.100.8:5000/api/chat')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);

    // Create socket connection
    const socket = io('http://192.168.100.8:5000');

    socket.on('connect', () => {
      console.log('🟢 Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
    });

    socket.on('newMessage', (msg) => {
      console.log('📨 New message received:', msg);
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSend = async (text) => {
    const newMsg = {
      senderId: userId,
      senderName: userName,
      text
    };

    try {
      const res = await fetch('http://192.168.100.8:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      });
      const data = await res.json();
      console.log('📤 Message sent:', data);
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  return (
    <div className="chat-window">
      <div className="message-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.senderId === userId ? 'my-message' : 'other-message'}`}
          >
            <p className={`message-text ${message.senderId === userId ? 'my-message-text' : 'other-message-text'}`}>
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <div className="message-input-container">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatWindow;

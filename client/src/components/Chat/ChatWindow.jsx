import MessageInput from './MessageInput';
import React from 'react';
import './ChatWindow.css'; // Assuming you have a CSS file for styling

const dummyMessages = [
  { sender: 'Ko Ko', text: 'Hi!' },
  { sender: 'You', text: 'Hello, how are you?' },
  { sender: 'Ko Ko', text: 'I’m good, thanks!' },
];

const ChatWindow = () => {
  return (
    <div className="chat-window">
      <div className="message-container">
        {dummyMessages.map((msg, idx) => (
          <div
            key={idx}
            className={msg.sender === 'You' ? 'message own' : 'message'}
          >
            <p className="message-text">{msg.text}</p>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatWindow;

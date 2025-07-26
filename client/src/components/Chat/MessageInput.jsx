import React from 'react';
import './MessageInput.css'; // Assuming you have a CSS file for styling

const MessageInput = () => {
  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="Type a message..."
        className="input-field"
      />
      <button className="send-button">Send</button>
    </div>
  );
};

export default MessageInput;

import React, { useState } from 'react';
import './MessageInput.css'; // Assuming you have a CSS file for styling

const MessageInput = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSendClick = () => {
    if (input.trim() !== '') {
      onSend(input); // Call the onSend function passed from ChatWindow
      setInput(''); // Clear the input field after sending
    }
  }

  const handleKeyDown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault(); // Prevent newline
    handleSendClick(); // Call the send function
  }
};


  return (
    <div className="message-input">
      <textarea
        placeholder="Type a message..."
        className="input-field"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
        }}
        onKeyDown={handleKeyDown}
      />
      <button className="send-button" onClick={handleSendClick}>Send</button>
    </div>
  );
};

export default MessageInput;
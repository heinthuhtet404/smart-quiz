import React, { useState } from 'react';

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && send()}
        placeholder="Type a message"
        style={{ width: '80%', padding: '8px' }}
      />
      <button onClick={send} style={{ padding: '8px 16px' }}>Send</button>
    </div>
  );
};

export default MessageInput;

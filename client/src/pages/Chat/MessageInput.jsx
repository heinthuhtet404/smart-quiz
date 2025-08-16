import { useState } from 'react';

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  const handleSend = () => {
    if (!text && !file) return;

    onSend({ text, file });

    // Clear text and file state
    setText('');
    setFile(null);

    // Clear the actual file input so filename disappears
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
      />

      <input
        type="file"
        id="fileInput"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;

import { useState } from 'react';
import { FiPaperPlane } from 'react-icons/fi'; // make sure react-icons is installed

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  const handleSend = () => {
    if (!text && !file) return;

    onSend({ text, file });
    setText('');
    setFile(null);
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Type a message..."
        className="message-input-field"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <input
        type="file"
        id="fileInput"
        style={{ display: 'none' }}
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button className="send-button" onClick={handleSend}>
        <FiPaperPlane size={20} />
      </button>
    </div>
  );
};

export default MessageInput;

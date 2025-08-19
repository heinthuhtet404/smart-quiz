import { useState } from "react";
import "./MessageInput.css";

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text && !file) return;

    onSend({ text, file });
    setText("");
    setFile(null);

    // reset file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
  };

  return (
    <form className="message-input-wrapper" onSubmit={handleSend}>
      <label htmlFor="fileInput" className="file-label">📎</label>
      <input
        type="file"
        id="fileInput"
        className="file-input"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <input
        type="text"
        placeholder="Type a message..."
        className="message-input-field"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button type="submit" className="send-button">➤</button>
    </form>
  );
};

export default MessageInput;

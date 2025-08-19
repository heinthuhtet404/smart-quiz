import { useState } from "react";
import { useEffect } from "react";
import "./MessageInput.css";

const MessageInput = ({ onSend, replyTo, onCancelReply, editingMessage, cancelEditing }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (editingMessage) setText(editingMessage.text || "");
  }, [editingMessage]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text && !file) return;

    onSend({ text, file, replyTo });
    setText("");
    setFile(null);

    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";

    if (onCancelReply) onCancelReply();
    if (editingMessage && cancelEditing) cancelEditing();
  };

  return (
    <form className="message-input-container" onSubmit={handleSend}>
      {(replyTo || editingMessage) && (
        <div className="reply-preview">
          {editingMessage ? (
            <span>Editing message...</span>
          ) : (
            <span className="reply-text">Replying to: {replyTo.text}</span>
          )}
          <button
            type="button"
            className="cancel-reply"
            onClick={editingMessage ? cancelEditing : onCancelReply}
          >
            ✕
          </button>
        </div>
      )}

      <div className="message-input-wrapper">
        <label htmlFor="fileInput" className="file-label">📎</label>
        <input type="file" id="fileInput" className="file-input" onChange={(e) => setFile(e.target.files[0])} />
        <input
          type="text"
          placeholder="Type a message..."
          className="message-input-field"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="send-button">➤</button>
      </div>
    </form>
  );
};


export default MessageInput;

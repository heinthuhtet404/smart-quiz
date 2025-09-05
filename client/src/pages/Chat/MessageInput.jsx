import { useState, useEffect, useRef } from "react";
import "./MessageInput.css";

const MessageInput = ({ onSend, replyTo, onCancelReply, editingMessage, cancelEditing }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Set text when editing a message
  useEffect(() => {
    if (editingMessage) setText(editingMessage.text || "");
  }, [editingMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text && !file) return;

    onSend({ text, file, replyTo });

    // Reset fields
    setText("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Clear reply or editing state
    if (editingMessage) cancelEditing?.();
    if (replyTo) onCancelReply?.();
  };

  return (
    <div className="message-input-container">
      {(replyTo || editingMessage) && (
        <div className="reply-preview">
          {editingMessage ? "Editing message..." : `Replying to: ${replyTo.text}`}
          <button
            type="button"
            onClick={editingMessage ? cancelEditing : onCancelReply}
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-form">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
          accept="image/*,video/*,audio/*,application/*"
        />

        <button type="submit">
          {editingMessage ? "Update" : "Send"}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

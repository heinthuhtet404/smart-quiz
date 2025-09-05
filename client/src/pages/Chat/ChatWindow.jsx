import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import MessageInput from "./MessageInput";
import "./ChatWindow.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const ChatWindow = ({ selectedUser, currentUser }) => {
  const userId = currentUser?._id;
  const userName = currentUser?.name;

  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null });

  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (!userId || !selectedUser?._id) return;
    fetch(`${API_BASE}/api/chat/${userId}/${selectedUser._id}`)
      .then(res => res.json())
      .then(setMessages)
      .catch(console.error);
  }, [selectedUser, userId]);

  // Socket.IO setup
  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(API_BASE);
    setSocket(socketInstance);

    socketInstance.on("newMessage", (msg) => {
      if ((msg.senderId === userId && msg.receiverId === selectedUser?._id) ||
          (msg.senderId === selectedUser?._id && msg.receiverId === userId)) {
        setMessages(prev => prev.some(m => m._id === msg._id) ? prev : [...prev, msg]);
      }
    });

    socketInstance.on("updateMessage", (msg) => {
      setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));
    });

    socketInstance.on("deleteMessage", (msg) => {
      setMessages(prev => prev.filter(m => m._id !== msg._id));
    });

    return () => socketInstance.disconnect();
  }, [selectedUser, userId]);

  const handleSend = async ({ text, file, replyTo }) => {
    if (!text && !file) return;
    if (!selectedUser?._id) return;

    const formData = new FormData();
    formData.append("senderId", userId);
    formData.append("receiverId", selectedUser._id);
    formData.append("senderName", userName);
    if (text) formData.append("text", text);
    if (file) formData.append("file", file);
    if (replyTo?._id) formData.append("replyTo", replyTo._id);

    let url = `${API_BASE}/api/chat`;
    let method = "POST";

    if (editingMessage) {
      url = `${API_BASE}/api/chat/${editingMessage._id}`;
      method = "PUT";
    }

    try {
      const res = await fetch(url, { method, body: formData });
      const savedMessage = await res.json();

      if (editingMessage) {
        setMessages(prev => prev.map(m => m._id === savedMessage._id ? savedMessage : m));
        setEditingMessage(null);
      }

      setReplyTo(null);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleDelete = async (msgId) => {
    await fetch(`${API_BASE}/api/chat/${msgId}`, { method: "DELETE" });
    setMessages(prev => prev.filter(m => m._id !== msgId));
    setContextMenu({ ...contextMenu, visible: false });
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    const options = { month: "long", day: "numeric" };
    if (date.getFullYear() !== today.getFullYear()) options.year = "numeric";
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });

  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  const handleRightClick = (e, message) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.pageX, y: e.pageY, message });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(prev => ({ ...prev, visible: false }));
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="chat-window">
      <div className="chat-header">Chatting with {selectedUser?.name || "..."}</div>

      <div className="message-container">
        {Object.keys(groupedMessages).map(date => (
          <div key={date}>
            <div className="date-separator">{date}</div>
            {groupedMessages[date].map(msg => (
              <div
                key={msg._id}
                className={`message-wrapper ${msg.senderId === userId ? "my-message-wrapper" : "other-message-wrapper"}`}
              >
                <div
                  className={`message ${msg.senderId === userId ? "my-message" : "other-message"}`}
                  onContextMenu={e => handleRightClick(e, msg)}
                >
                  {msg.replyTo?.text && <div className="message-reply-preview">Reply to: {msg.replyTo.text}</div>}
                  {msg.text && <div className="message-text">{msg.text}</div>}
                  {msg.fileUrl && (
                    <div className="message-file">
                      {msg.fileType?.startsWith("image/") && <img src={msg.fileUrl} alt="attachment" />}
                      {msg.fileType?.startsWith("video/") && <video controls><source src={msg.fileUrl} type={msg.fileType} /></video>}
                      {msg.fileType?.startsWith("audio/") && <audio controls><source src={msg.fileUrl} type={msg.fileType} /></audio>}
                      {!msg.fileType?.startsWith("image/") && !msg.fileType?.startsWith("video/") && !msg.fileType?.startsWith("audio/") && (
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">📎 Download File</a>
                      )}
                    </div>
                  )}
                  <div className="message-time">{formatTime(msg.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {contextMenu.visible && (
        <ul className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <li onClick={() => { setReplyTo(contextMenu.message); setContextMenu(prev => ({ ...prev, visible: false })); }}>Reply</li>
          {contextMenu.message.senderId === userId && <>
            <li onClick={() => { setEditingMessage(contextMenu.message); setContextMenu(prev => ({ ...prev, visible: false })); }}>Edit</li>
            <li onClick={() => handleDelete(contextMenu.message._id)}>Delete</li>
          </>}
        </ul>
      )}

      <MessageInput
        onSend={handleSend}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        editingMessage={editingMessage}
        cancelEditing={() => setEditingMessage(null)}
      />
    </div>
  );
};

export default ChatWindow;

import SideBar from './SideBar';
import ChatWindow from './ChatWindow';
import './ChatPage.css'; // Assuming you have a CSS file for styling

const ChatPage = () => {
  return (
    <div className="chat-page">
      <SideBar />
      <ChatWindow />
    </div>
  );
};

export default ChatPage;

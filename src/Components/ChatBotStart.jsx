import { useState } from "react";
import "../index.css";
import "./ChatBotStart.css";

const ChatBotStart = ({ onStartChat }) => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="start-page">
      <button className="start-page-btn" onClick={onStartChat}>
        {" "}
        Chat AI{" "}
      </button>
    </div>
  );
};

export default ChatBotStart;

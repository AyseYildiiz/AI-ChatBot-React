import React, { useEffect, useState } from 'react'
import './ChatBotStart.css'
import '../index.css'

const ChatBotStart = ({ onStartChat }) => {
    const [darkMode, setDarkMode] = useState(false);
    useEffect( () => {
        if (darkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const handleDarkMode = () => setDarkMode(true);
  const handleLightMode = () => setDarkMode(false);

  return (
    <div className='start-page'>
        <button className="start-page-btn" onClick={ onStartChat }> Chat AI</button>
        <div className="theme">
            <i className="bx bx-sun light" onClick={handleLightMode}></i>
            <i className="bx bx-moon dark" onClick={handleDarkMode}></i>   
        </div>
    </div>
  )
}

export default ChatBotStart
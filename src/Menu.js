import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuOutlined } from '@ant-design/icons';
import './CSS files/Menu.css';

const Menu = ({ userId, code, token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className={`sidebar-menu${isOpen ? ' open' : ''}`}>
      <MenuOutlined className="menu-toggle" onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <div className="menu-items">
          <button
            onClick={() =>
              {navigate('/explore', { state: { userId: userId, code: code, token: token } });
              setIsOpen(false); }
            }
          >
            Explore
          </button>
          <button
            onClick={() =>
              {
              navigate('/library', { state: { userId: userId, code: code, token: token } })
              setIsOpen(false)}
            }
          >
            Library
          </button>
          <button
            onClick={() =>
              {
              navigate('/AddSongs', { state: { userId: userId, code: code, token: token } })
              setIsOpen(false)}
            }
          >
            Add Songs to Library
          </button>
          <button
            onClick={() =>
              {
              navigate('/GuessTheSong', { state: { userId: userId, code: code, token: token } })
              setIsOpen(false)}
            }
          >
            Guess the song
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
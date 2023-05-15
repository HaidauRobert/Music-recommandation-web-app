import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Explore from './Explore';
import Library from './Library';
import Playlist from './Playlist';
import Menu from './Menu';
import './CSS files/App.css';

function App() {
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState(null);

  const handleCode = (code) => {
    setCode(code);
  };

  const handleUserId = (id) => {
    setUserId(id);
  };

  return (
    <Router>
        <div className="app-container">
          <Routes>
            <Route
              exact
              path="/"
              element={<Login/>}
            />
            <Route
              path="/explore"
              element={
                <>
                  <Menu />
                  <Explore code={code} userId={userId} handleCode={handleCode} handleUserId={handleUserId}/>
                </>
              }
            />
            <Route
              path="/library"
              element={
                <>
                  <Menu />
                  <Library code={code} userId={userId} />
                </>
              }
            />
            <Route
              path="/playlist"
              element={
                <>
                  <Menu />
                  <Playlist code={code} userId={userId} />
                </>
              }
              />
          </Routes>
        </div>
    </Router>
  );
}

export default App;

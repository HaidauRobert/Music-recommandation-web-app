import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Explore from './Explore';
import Library from './Library';
import AddSongs from './AddSongs';
import Concerts from './Concerts';
import Menu from './Menu';
import './CSS files/App.css';
import GuessTheSong from './GuessTheSong';

function App() {
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState('');

  const handleCode = (code) => {
    setCode(code);
  };

  const handleUserId = (id) => {
    setUserId(id);
  };
  
  const handleToken = (token) => {
    setToken(token)
  }

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
                  <Explore code={code} userId={userId} token={token} handleCode={handleCode} handleUserId={handleUserId} handleToken={handleToken}/>
                </>
              }
            />
            <Route
              path="/library"
              element={
                <>
                  <Menu />
                  <Library code={code} userId={userId} token={token}/>
                </>
              }
            />
            <Route
              path="/AddSongs"
              element={
                <>
                  <Menu />
                  <AddSongs code={code} userId={userId} token={token}/>
                </>
              }
              />
          <Route
              path="/GuessTheSong"
              element={
                <>
                  <Menu />
                  <GuessTheSong code={code} userId={userId} token={token}/>
                </>
                }
              />
              <Route
              path="/Concerts"
              element={
                <>
                  <Menu />
                  <Concerts code={code} userId={userId} token={token}/>
                </>
                }
              />
          </Routes>
        </div>
    </Router>
  );
}

export default App;

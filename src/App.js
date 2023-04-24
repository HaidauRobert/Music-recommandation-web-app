import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Explore from './Explore';
import './App.css';

function App() {
  const [code, setCode] = useState('');

  const handleCode = (code) => {
    setCode(code);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route exact path="/" element={<Login handleCode={handleCode} />} />
          <Route path="/explore" element={<Explore code={code} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

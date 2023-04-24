import React, { useState } from 'react';
import { Button } from 'antd';
import './Login.css';

function Login(props) {
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignUpClick = () => {
    setShowSignUp(true);
  };

  const handleBackToLoginClick = () => {
    setShowSignUp(false);
  };

  const handleSpotifyLoginOrSignup = () => {
    const clientId = 'cdaada8406de42ad8621f1c716982d2a';
    const redirectUri = 'http://localhost:3000/explore'; // Replace with your actual redirect URI
    const responseType = 'code';
    const scope = encodeURIComponent('user-read-private user-read-email'); // Add required scopes

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}`;

    window.location.href = authUrl;

    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
  
    if (code) {
      props.handleCode(code);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {!showSignUp ? (
          <div className="login-card">
            <div className="login-header-box">
              <h1 className="login-header">Log in</h1>
            </div>
            <div className="button-login">
              <Button onClick={handleSpotifyLoginOrSignup} className="spotify-login-button">
                Log in with Spotify
              </Button>
            </div>
            <div className="button-sign">
              Don't have an account?
              <Button onClick={handleSignUpClick}>
                Sign up here.
              </Button>
            </div>
          </div>
        ) : (
          <div className="signup-card">
            <div className="login-header-box">
              <h1 className="login-header">Sign up</h1>
            </div>
            <div className="button-login">
              <Button onClick={handleSpotifyLoginOrSignup} className="spotify-login-button">
                Sign up with Spotify
              </Button>
            </div>
            <div className="button-sign-in">
              Already have an account?
              <Button onClick={handleBackToLoginClick}>
                Log in here.
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;

import { React } from 'react';
import { Button } from 'antd';
import './CSS files/Login.css';


function Login() {
  const clientId = 'cdaada8406de42ad8621f1c716982d2a';
  const redirectUri = 'http://localhost:3000/explore';
  const responseType = 'code';
  const scope = encodeURIComponent('user-read-private user-read-email');
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&_=${Date.now()}`;

  const handleSpotifyLoginOrSignup = () => {
    window.location.href = authUrl;
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header-box">
            <h1 className="login-header">Log in</h1>
          </div>
          <div className="button-login">
            <Button onClick={handleSpotifyLoginOrSignup} className="spotify-login-button">
              Log in with Spotify
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

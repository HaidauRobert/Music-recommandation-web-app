import { React } from 'react';
import { PlayCircleOutlined  } from '@ant-design/icons';
import './CSS files/Login.css';
import logo from './poze/SwipeTunes.png';


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
      <div class="logo-container">
        <img src={logo} alt="Your Logo" />
      </div>
      <div className='circle'>
      </div>
      <div className="login-container">
      <h1 class="header-big">Find Your New Favorite <br/>Song</h1>
      <h2 class="header-small">Tired Of Listening To The Same Music For Months? Find out The Best Way To Explore New <br/> Artists, New Genres And New Songs</h2>
        <button class="button" onClick={handleSpotifyLoginOrSignup}>
        <PlayCircleOutlined /> CONNECT WITH SPOTIFY
        </button>
      </div>
    </div>
  );
}

export default Login;

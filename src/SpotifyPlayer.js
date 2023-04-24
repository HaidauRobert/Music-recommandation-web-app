// SpotifyPlayer.js
import { useEffect, useState } from 'react';

function SpotifyPlayer({ accessToken, trackUri }) {
  const [player, setPlayer] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.onload = () => {
      console.log('Spotify Web Playback SDK loaded');
    };
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: 'My Spotify Player',
        getOAuthToken: (cb) => {
          cb(accessToken);
        },
      });

      // Error handling
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        console.error(message);
      });
      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        console.error(message);
      });
      spotifyPlayer.addListener('account_error', ({ message }) => {
        console.error(message);
      });
      spotifyPlayer.addListener('playback_error', ({ message }) => {
        console.error(message);
      });

      // Playback status updates
      spotifyPlayer.addListener('player_state_changed', (state) => {
        console.log(state);
      });

      spotifyPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        setIsReady(true);
      });
  
      spotifyPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setIsReady(false);
      });

      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log('Connected to Spotify Web Playback SDK');
          setPlayer(spotifyPlayer);
        }
      });
    };

    return () => {
      if (window.Spotify) {
        window.Spotify.Player = null;
      }
    };
  }, [accessToken]);

  useEffect(() => {
    if (!player || !isReady || !trackUri) return;

    player.play({ uris: [trackUri] }).then(() => {
      console.log('Playing track:', trackUri);
    }).catch((error) => {
      console.error('Error playing track:', error);
    });
  }, [player, isReady, trackUri]);

}

export default SpotifyPlayer;

import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import './Explore.css';
import SpotifyPlayer from './SpotifyPlayer';
import { useLocation } from 'react-router-dom';
import { getTrack, searchTracks, getToken } from './Spotify';

const Explore = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code');

  const [songPlaying, setSongPlaying] = useState(false);
  const [song, setSong] = useState(null);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    if (!code) return;

    async function fetchToken() {
      const token = await getToken(
        code,
        'http://localhost:3000/explore',
        'cdaada8406de42ad8621f1c716982d2a',
        'c221633fb29f404280f0ccc5eb43f0c5'
      );
      setAccessToken(token);
    }

    fetchToken();
  }, [code]);

  useEffect(() => {
    if (!accessToken) return;
  
    async function fetchSong() {
      console.log(getTrack('jador', accesToken))
      const track = await searchTracks('jador', accessToken);
      setSong(track);
    }
  
    fetchSong();
  }, [accessToken]);
  

  const playSong = () => {
    const audio = document.getElementById('song-audio');
    if (!songPlaying) {
      audio.play();
      setSongPlaying(true);
    } else {
      audio.pause();
      setSongPlaying(false);
    }
  };

  const onSwipedLeft = () => {
    console.log('Swiped left - Dislike');
    // Add your logic for disliking a song here
  };

  const onSwipedRight = () => {
    console.log('Swiped right - Like');
    // Add your logic for liking a song here
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      onSwipedLeft();
    } else if (event.key === 'ArrowRight') {
      onSwipedRight();
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft,
    onSwipedRight,
  });

  if (!song) return <div>Loading...</div>;

  return (
    <div className="explore-container">
      <div
        className="song-container"
        onClick={playSong}
        {...swipeHandlers}
      >
         <div className="image-wrapper"
         style={{
          backgroundImage: `url(${song.album.images[0].url})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
        }}>
        </div>
      </div>
      <audio id="song-audio" src={song.preview_url}></audio>
      <br></br>
      <div className="buttons-container">
        <button className="dislike-button" onClick={onSwipedLeft}>
          Dislike
        </button>
        <button className="like-button" onClick={onSwipedRight}>
          Like
        </button>
      </div>
      <SpotifyPlayer accessToken={accessToken} trackUri={song.uri} />
    </div>
  );
};

export default Explore;

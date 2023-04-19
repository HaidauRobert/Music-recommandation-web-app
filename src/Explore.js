import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import './Explore.css';
import SpotifyPlayer from './SpotifyPlayer';
import { useLocation } from 'react-router-dom';
import { getTrack, searchTracks, getToken, getPlaylistsByGenre } from './Spotify';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
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
      const track = await searchTracks('the weeknd', accessToken);
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

  const fetchRandomSong = async () => {
    const randomGenres = ["pop", "rock", "hiphop", "jazz", "rnb"];
    const randomGenre = randomGenres[Math.floor(Math.random() * randomGenres.length)];
    console.log(randomGenre);
    const playlists = await getPlaylistsByGenre(randomGenre, accessToken);
    const randomPlaylist = playlists[Math.floor(Math.random() * playlists.length)];
    
    const playlistTracksResponse = await axios.get(`${SPOTIFY_API_URL}/playlists/${randomPlaylist.id}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  
    const playlistTracks = playlistTracksResponse.data.items;
    let randomTrack = null;
  do {
    randomTrack = playlistTracks[Math.floor(Math.random() * playlistTracks.length)].track;
  } while (!randomTrack.preview_url);
    setSong(randomTrack);
  };
  

  const onSwipedLeft = async () => {
    console.log('Swiped left - Dislike');
    const audio = document.getElementById('song-audio');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    await fetchRandomSong();
    
  };
  
  const onSwipedRight = async () => {
    console.log('Swiped right - Like');
    const audio = document.getElementById('song-audio');
    if (audio) {
      audio.pause();
      audio.currentTime = 0; 
    }
    await fetchRandomSong();
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
  <audio id="song-audio" src={song.preview_url} autoPlay={true}></audio>
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

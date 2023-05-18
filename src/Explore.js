import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS files/Explore.css';
import SpotifyPlayer from './SpotifyPlayer';
import { getToken, getPlaylistsByGenre, getUserProfile } from './Spotify';
import pauseImage from './poze/pause.png';
import Loading from './Loading';
import logo from './poze/SwipeTunes.png'
import play from './poze/play.png'


const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const BACKEND_API_URL = 'http://localhost:5000';
const Explore = (props) => {
  let code = props.code;
  if (!props.code) {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    props.handleCode(code)
  }
  const [swipeDirection, setSwipeDirection] = useState('');
  const [isSwiping, setIsSwiping] = useState(false);
  const [songPlaying, setSongPlaying] = useState(true);
  const [song, setSong] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || '');
  const [hasStarted, setHasStarted] = useState(false);
  const [showPauseImage, setShowPauseImage] = useState(false);
  const [genre, setGenre] = useState('');


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
      localStorage.setItem('accessToken', token);
    }
    fetchToken();
  }, [code]);

  useEffect(() => {
    if (!accessToken || !props.userId) return;
    props.handleToken(accessToken);
    fetchRandomSong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, props.userId]);

  useEffect(() => {
    async function addUserToDatabase() {
      try {
        const response = await axios.post(`${BACKEND_API_URL}/login`, {
          spotifyUserId: await getUserProfile(accessToken),
        });
        props.handleUserId(response.data.userId);
      } catch (error) {
        console.error(error);
      }
    }
    if (accessToken) {
      addUserToDatabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const updateGenrePreference = async (userId, genre, isLiked) => {
    try {
      await axios.post(`${BACKEND_API_URL}/update_genre_preference`, {
        userId: userId,
        genre: genre,
        isLiked: isLiked,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const startExperience = async () => {
    setHasStarted(true);
    const audio = document.getElementById('song-audio');
    audio.play();
    setSongPlaying(true);
  };

  const playSong = () => {
    const audio = document.getElementById('song-audio');
    if (!songPlaying) {
      audio.play();
      setSongPlaying(true);
      setShowPauseImage(false);
    } else {
      audio.pause();
      setSongPlaying(false);
      setShowPauseImage(true);
    }
  };

  const saveLikedSong = async (userId, song) => {
    try {
      await axios.post(`${BACKEND_API_URL}/liked_songs`, {
        songId: song.id,
        songTitle: song.name,
        songArtist: song.artists[0].name,
        songGenre: genre,
        albumImageUrl: song.album.images[0].url,
        previewUrl: song.preview_url,
        userId: userId,
      });
      console.log(genre)
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLikedSongs = async (userId) => {
    try {
      const response = await axios.get(`${BACKEND_API_URL}/liked_songs`, {
        params: { userId },
      });
      return response.data.items;
    } catch (error) {
      console.error(error);
    }
    return [];
  };


  const fetchRandomSong = async () => {
    const response = await axios.get(`${BACKEND_API_URL}/get_genre_preference/${props.userId}`);
    const genrePreferences = response.data;

    let sum = 0;
    
    for (const value of Object.values(genrePreferences)) {
      sum += value;
    }

    let randomGenre = '';
    let randomValue = Math.random() * sum;
    for (const [genre, value] of Object.entries(genrePreferences)) {
      randomValue -= value;
      if (randomValue <= 0) {
        randomGenre = genre;
        break;
      }
    }
    setGenre(randomGenre);
    const playlists = await getPlaylistsByGenre(randomGenre, accessToken);
    const randomPlaylist = playlists[Math.floor(Math.random() * playlists.length)];

    const playlistTracksResponse = await axios.get(`${SPOTIFY_API_URL}/playlists/${randomPlaylist.id}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const playlistTracks = playlistTracksResponse.data.items;
    const likedSongs = await fetchLikedSongs(props.userId);
    const likedSongIds = likedSongs.map((song) => song.song_id);
    let randomTrack = null;
    do {
      randomTrack = playlistTracks[Math.floor(Math.random() * playlistTracks.length)].track;
    } while (!randomTrack.preview_url || likedSongIds.includes(randomTrack.id));
    setSong(randomTrack);
  };


  const onSwipedLeft = async () => {
    setSwipeDirection('left');
    setIsSwiping(true);
    setShowPauseImage(false)
    const audio = document.getElementById('song-audio');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    updateGenrePreference(props.userId, genre, false);
    await fetchRandomSong();

  };
  const onSwipedRight = async () => {
    setSwipeDirection('right');
    setIsSwiping(true);
    setShowPauseImage(false)
    const audio = document.getElementById('song-audio');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    await saveLikedSong(props.userId, song)
    updateGenrePreference(props.userId, genre, true);
    await fetchRandomSong();
  };

  const handleTransitionEnd = () => {
    setIsSwiping(false);
    setSwipeDirection('');
  };  

  return (
    <div className={`explore-container ${isSwiping ? 'swiping' : ''}`} onTransitionEnd={handleTransitionEnd}>
    {song ? (
        <>
          <div className="song-container">
            <div className={`image-wrapper ${isSwiping ? `swipe-${swipeDirection}` : ''}`}
              onClick={hasStarted ? playSong : startExperience}
              style={{
                backgroundImage: `url(${song.album.images[0].url})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
              }}>
              {showPauseImage && (
                <div className="pause-overlay">
                  <img src={pauseImage} alt="Pause" />
                </div>
              )}
              {!hasStarted && (
                <div className="start-overlay">
                  <img src={logo} alt="Logo"></img>
                  <img src={play} alt="Play Button" className='playButton'></img>
                </div>
              )}
            </div>
          </div>
          <audio id="song-audio" src={song.preview_url} autoPlay={hasStarted}></audio>
          <br></br>
          <div className="buttons-container">
            <button className="dislike-button" onClick={onSwipedLeft} disabled={!hasStarted}>
              Dislike
            </button>
            <button className="like-button" onClick={onSwipedRight} disabled={!hasStarted}>
              Like
            </button>
          </div>
          <SpotifyPlayer accessToken={accessToken} trackUri={song.uri} />
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default Explore;


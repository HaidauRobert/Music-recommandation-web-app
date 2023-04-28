import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import './CSS files/Explore.css';
import SpotifyPlayer from './SpotifyPlayer';
import { getToken, getPlaylistsByGenre, getUserProfile } from './Spotify';
import beginImage from './poze/begin.jpg';
import pauseImage from './poze/pause.png';
import Loading from './Loading';


const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const BACKEND_API_URL = 'http://localhost:5000';
const Explore = (props) => {
  let code = props.code;
  if (!props.code) {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    props.handleCode(code)
  }
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
    if (!accessToken) return;
    fetchRandomSong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    async function addUserToDatabase() {
      try {
        const response = await axios.post(`${BACKEND_API_URL}/login`, {
          spotifyUserId: await getUserProfile(accessToken),
        });
        console.log(response.data);
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
      const response = await axios.post(`${BACKEND_API_URL}/update_genre_preference`, {
        userId: userId,
        genre: genre,
        isLiked: isLiked,
      });
      console.log(response.data);
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
      const response = await axios.post(`${BACKEND_API_URL}/liked_songs`, {
        songId: song.id,
        songTitle: song.name,
        songArtist: song.artists[0].name,
        albumImageUrl: song.album.images[0].url,
        userId: userId,
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRandomSong = async () => {
    const randomGenres = ["pop", "rock", "hiphop", "jazz", "rnb"];
    const randomGenre = randomGenres[Math.floor(Math.random() * randomGenres.length)];
    console.log(randomGenre);
    setGenre(randomGenre);
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
    console.log('Swiped right - Like');
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

  const swipeHandlers = useSwipeable({
    onSwipedLeft,
    onSwipedRight,
  });

  return (
    <div className="explore-container">
      {song ? (
        <>
          <div
            className="song-container"
            {...swipeHandlers}
          >
            <div className="image-wrapper"
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
                  <img src={beginImage} alt="Click here to start" />
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


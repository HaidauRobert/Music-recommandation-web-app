import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getTrack, searchTracks } from './Spotify';
import './CSS files/AddSongs.css';
import pauseImage from './poze/pause.png';

const BACKEND_API_URL = 'http://localhost:5000';

function AddSongs(props) {
  const [query, setQuery] = useState('');
  const [trackInfo, setTrackInfo] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPauseImage, setShowPauseImage] = useState(false);
  const [showPopup, setShowPopup] = useState(false); 
  const [showPopupWrong, setShowPopupWrong] = useState(false); 
  const token = props.token;
  const userId = props.userId;

  const handleSearch = async (event) => {
    event.preventDefault();
    const track = await searchTracks(query, token);

    setTrackInfo(track);
    playTrack();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  };

  const playTrack = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      setShowPauseImage(false);
    }
  };

  const getGenre = () => {
    return new Promise((resolve, reject) => {
      getTrack(trackInfo.id, token)
        .then(result => {
          const genres = result.artist_genres;
          let genreName = '';
          for (let genrec in genres) {
          if (genres[genrec].includes("pop")) {
            genreName = "pop";
            break
          } else if (genres[genrec].includes("rock")) {
            genreName = "rock";
            break
          } else if (genres[genrec].includes("hip hop")) {
            genreName = "hiphop";
            break
          } else if (genres[genrec].includes("jazz")) {
            genreName = "jazz";
            break
          } else if (genres[genrec].includes("r&b")) {
            genreName = "rnb";
            break
          }
        }
        console.log(genres);
          saveLikedSong(genreName);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  };
  
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

  const saveLikedSong = async (genreName) => {
    try {
      await axios.post(`${BACKEND_API_URL}/liked_songs`, {
        songId: trackInfo.id,
        songTitle: trackInfo.name,
        songArtist: trackInfo.artists[0].name,
        songGenre: genreName,
        albumImageUrl: trackInfo.album.images[0].url,
        previewUrl: trackInfo.preview_url,
        userId: userId,
      });
      updateGenrePreference(props.userId, genreName, true);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      setShowPopupWrong(true);
      setTimeout(() => setShowPopupWrong(false), 3000);
      console.error(error);
    }
  };
  


  const pauseTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setShowPauseImage(true);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      playTrack();
    } else {
      pauseTrack();
    }
  }, [isPlaying]);

  return (
    <div className="addsongs-page">
      <div className="addsongs-card">
      {showPopup && (
          <div className="popup">
            Song successfully added
          </div>)}
          {showPopupWrong && (
          <div className="popup-wrong">
            Song already exists in the database
          </div>)}
        <h2 className="title">Add Songs to Library</h2>
        {trackInfo && (
          <div className="track-info">
            <h3>Track Information</h3>
            <p>Title: {trackInfo.name}</p>
            <p>Artist: {trackInfo.artists[0].name}</p>
            <p>Album: {trackInfo.album.name}</p>
            <div className='song-img'>
              <img
                src={trackInfo.album.images[0].url}
                alt="Album Cover"
                onClick={togglePlayPause}
              />
              {showPauseImage && (
                <div className="pause" onClick={togglePlayPause}>
                  <img src={pauseImage} alt="Pause" />
                </div>
              )}
            </div>
            <audio ref={audioRef} src={trackInfo.preview_url}></audio>
            <div className='add-library'>
              <button type="submit" onClick={getGenre}>Add to Library</button>
            </div>
          </div>
        )}
        <div className="input-form">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for a track..."
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddSongs;

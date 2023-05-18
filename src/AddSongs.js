import React, { useState, useEffect, useRef } from 'react';
import { searchTracks } from './Spotify';
import './CSS files/AddSongs.css';
import pauseImage from './poze/pause.png';

function AddSongs(props) {
  const [query, setQuery] = useState('');
  const [trackInfo, setTrackInfo] = useState(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPauseImage, setShowPauseImage] = useState(false);
  const token = props.token;

  const handleSearch = async (event) => {
    event.preventDefault();
    const track = await searchTracks(query, token);

    setTrackInfo(track);
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

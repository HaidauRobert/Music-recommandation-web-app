import React, { useState, useEffect } from 'react';
import axios from 'axios';
import questionMarkIcon from './poze/question.png';
import './CSS files/GuessTheSong.css';

const BACKEND_API_URL = 'http://localhost:5000';

function GuessTheSong(props) {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [guess, setGuess] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [tries, setTries] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [imgUrl, setImgUrl] = useState(questionMarkIcon);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [guessMessage, setGuessMessage] = useState('');
  const userId = props.userId;

  useEffect(() => {
    const fetchLikedSongs = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/unliked_songs/${props.userId}`);          
        setSongs(response.data.items);
      } catch (error) {
        console.error(error);
      }
    };

    if (userId) {
      fetchLikedSongs();
    }
  }, [userId]);

  const handleGuess = (event) => {
    setGuess(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!gameOver) {
      if (guess.toLowerCase() === currentSong.song_title.toLowerCase()) {
          setGuessMessage('You guessed!');
          setGameOver(true);
          setImgUrl(currentSong.album_image_url);
          setSongTitle(currentSong.song_title);
          setSongArtist(currentSong.song_artist);
      } else {
          setTries(tries - 1);
          if (tries <= 1) {
            setGuessMessage("You didn't get it!");
            setGameOver(true);
            setImgUrl(currentSong.album_image_url);
            setSongTitle(currentSong.song_title);
            setSongArtist(currentSong.song_artist);
          } else {
            alert('Incorrect guess. Try again.');
          }
        }
        setGuess('');
    } else {
        startGame();
    }
  };

  const startGame = () => {
    if (songs.length > 0) {
      const randomIndex = Math.floor(Math.random() * songs.length);
      setCurrentSong(songs[randomIndex]); 
      setHasStarted(true);
      setGameOver(false); 
      setImgUrl(questionMarkIcon);
      setSongTitle('');
      setSongArtist('');
      setTries(3);
    } else {
      alert('No songs found for this user!');
    }
  };  

  return (
    <div className='guess-page'>
        <div className="image-wrapperguess" style={{
            backgroundImage: `url(${imgUrl})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
        }}>
        </div>
        <div className="input-field">
        {!hasStarted && 
        <div className="start-button">
            <button onClick={startGame}>Begin</button>
        </div>}
        {hasStarted && !gameOver && 
        <div className="form-buttons">
            <form className="guess-form" onSubmit={handleSubmit}>
                <input type="text" value={guess} onChange={handleGuess} placeholder="Enter song name..." />
                <input type="submit" value="Submit Guess" />
            </form>
            <p>Tries left: {tries}</p>
        </div>}
        {gameOver &&
        <div className="next-button">
          <button onClick={startGame}>Next Song</button>
        </div>}
        </div>
        {gameOver && 
        <div className="song-info">
            {gameOver && <h2>{guessMessage}</h2>}
            <h2>Song: {songTitle}</h2>
            <h2>Artist: {songArtist}</h2>
        </div>}
        {currentSong && hasStarted && 
        <audio id="song-audio" src={currentSong.preview_url} autoPlay={true}></audio>}
    </div>
);

}

export default GuessTheSong;

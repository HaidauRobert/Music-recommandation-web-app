import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import questionMarkIcon from './poze/question.png';
import './CSS files/GuessTheSong.css';

const BACKEND_API_URL = 'http://localhost:5000';

function GuessTheSong(props) {
  const audioRef = useRef(null);
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
  const [timer, setTimer] = useState(15);
  const [showPopup, setShowPopup] = useState(false);
  const [showPopupWrong, setShowPopupWrong] = useState(false);

  useEffect(() => {
    if (timer > 0 && hasStarted && !gameOver) {
      const id = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);

      return () => clearInterval(id);
    } else if (timer === 0) {
      gameOverLogic();
    }
  }, [timer, hasStarted, gameOver]);

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

  const calculateMatchPercentage = (guess) => {
    const songTitle = currentSong.song_title.toLowerCase();
    const guessLowerCase = guess.toLowerCase();
    const fuzzyPattern = guessLowerCase.replace(/./g, (char) => `.*${char}`);
    const regex = new RegExp(fuzzyPattern, 'i');
    const match = songTitle.match(regex);
    const matchPercentage = (match ? match[0].length : 0) / songTitle.length * 100;
    return matchPercentage;
  };
  
  

  const gameOverLogic = () => {
    if (!gameOver) {
      if (guess.toLowerCase() === currentSong.song_title.toLowerCase()) {
        setGuessMessage('You guessed!');
      } else {
        setGuessMessage("You didn't get it!");
      }
      setGameOver(true);
      setImgUrl(currentSong.album_image_url);
      setSongTitle(currentSong.song_title);
      setSongArtist(currentSong.song_artist);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!gameOver) {
      const formattedGuess = guess.trim(); 
      const matchPercentage = calculateMatchPercentage(formattedGuess);  
      if (matchPercentage >= 75) {
        setGuessMessage('You guessed!');
        setGameOver(true);
        setImgUrl(currentSong.album_image_url);
        setSongTitle(currentSong.song_title);
        setSongArtist(currentSong.song_artist);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      } else {
        setTries(tries - 1);
        if (tries <= 1) {
          gameOverLogic();
        } else {
          setShowPopupWrong(true);
          setTimeout(() => setShowPopupWrong(false), 3000);
        }
      }
      setGuess('');
    } else {
      startGame();
    }
  };

  const startGame = () => {
    if (songs.length > 0) {
      let randomIndex = Math.floor(Math.random() * songs.length);
      const currentSongIndex = songs.findIndex((song) => song === currentSong);
      while (randomIndex === currentSongIndex) {
        randomIndex = Math.floor(Math.random() * songs.length);
      }
      setCurrentSong(songs[randomIndex]);
      setHasStarted(true);
      setGameOver(false);
      setImgUrl(questionMarkIcon);
      setSongTitle('');
      setSongArtist('');
      setTries(3);
      setTimer(15);
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
      {showPopup && (
        <div className="popup">
          Congratulations, you guessed it!
        </div>)}
      {showPopupWrong && (
        <div className="popup-wrong">
          You didn't guess right!
        </div>)}
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
            <p style={{ color: 'red' }}>Time left: {timer}</p>
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
        <audio ref={audioRef} id="song-audio" src={currentSong.preview_url} autoPlay={true}></audio>
      }
    </div>
  );
}

export default GuessTheSong;

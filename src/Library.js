import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS files/Library.css';

const BACKEND_API_URL = 'http://localhost:5000';

function Library(props) {
    
    const [likedSongs, setLikedSongs] = useState([]);
    const userId = props.userId;

    async function fetchLikedSongs(userId) {
        const response = await axios.get(`${BACKEND_API_URL}/liked_songs`, {
            params: {
                userId: userId,
            },
        });
        
        const songs = response.data.items.map((song) => {
            return {
                song_id: song.song_id,
                song_title: song.song_title,
                song_artist: song.song_artist,
                album_image_url: `${song.album_image_url}`,
            };
        });

        return songs;
    }


    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const songs = await fetchLikedSongs(userId);
                setLikedSongs(songs);
            } catch (error) {
                console.error(error);
            }
        };
        if (userId) {
            fetchSongs();
        }
    }, [userId]);

    return (
        <div className="library-page">
            <div className="library-card">
            <div className="library-container">
                {likedSongs.map((song, index) => (
                    <div key={index} className="song-card">
                        <img src={song.album_image_url} alt="Album Art" />
                        <div className="song-info">
                            <h3>{song.song_title}</h3>
                            <p>{song.song_artist}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
    );
}

export default Library;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Table } from 'antd';
import { Input } from 'antd';
import './CSS files/Library.css';

const BACKEND_API_URL = 'http://localhost:5000';

function Library(props) {

    const [likedSongs, setLikedSongs] = useState([]);
    const userId = props.userId;
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearch = e => {
        setSearchTerm(e.target.value);
    };

    const filteredSongs = likedSongs.filter(song =>
        song.song_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.song_artist.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                song_genre: song.song_genre,
                album_image_url: `${song.album_image_url}`,
            };
        });

        return songs;
    }

    const handleDelete = async (song) => {
        try {
            // Remove the song from the likedSongs state
            setLikedSongs(likedSongs.filter((s) => s.song_id !== song.song_id));

            // Delete the song from the database
            await axios.delete(`${BACKEND_API_URL}/liked_songs`, {
                data: {
                    userId: userId,
                    songId: song.song_id,
                },
            });

            // Update genre preference
            await axios.post(`${BACKEND_API_URL}/update_genre_preference`, {
                userId: userId,
                genre: song.song_genre,
                isLiked: false,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const redirectToSpotify = (songId) => {
        const spotifyUrl = `https://open.spotify.com/track/${songId}`;
        window.open(spotifyUrl, '_blank');
    };


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
        <div className='library-page'>
            <Table
                className='library-container'
                rowKey="song_id"
                scroll={{ y: 500 }}
                columns={[
                    {
                        title: 'Album Art',
                        dataIndex: 'album_image_url',
                        key: 'album_image_url',
                        width: 100,
                        render: (text, record) => (
                            <img
                                src={record.album_image_url}
                                alt="Album Art"
                                className="song-card"
                              
                            />
                        ),
                    },
                    {
                        title: 'Song Title',
                        dataIndex: 'song_title',
                        key: 'song_title',
                        width: 100,
                        sorter: (a, b) => a.song_title.localeCompare(b.song_title),
                        sortDirections: ['descend', 'ascend'],
                    },
                    {
                        title: 'Artist',
                        dataIndex: 'song_artist',
                        key: 'song_artist',
                        width: 100,
                        sorter: (a, b) => a.song_artist.localeCompare(b.song_artist),
                        sortDirections: ['descend', 'ascend'],
                        filters: Array.from(
                            new Set(likedSongs.map((song) => song.song_artist))
                        ).map((artist) => ({
                            text: artist,
                            value: artist,
                        })),
                        filterSearch: true,
                        onFilter: (value, record) => record.song_artist === value,
                    },
                    {
                        title: 'Genre',
                        dataIndex: 'song_genre',
                        key: 'song_genre',
                        width: 100,
                        filters: Array.from(
                            new Set(likedSongs.map((song) => song.song_genre))
                        ).map((genre) => ({
                            text: genre,
                            value: genre,
                        })),
                        filterSearch: true,
                        onFilter: (value, record) => record.song_genre === value,
                    },
                    {
                        title: <Input.Search
                            placeholder="Search by song title or artist"
                            onChange={handleSearch}
                            style={{ width: "100%" }}
                        />,
                        key: 'action',
                        width: 100,
                        render: (text, record) => (
                            <div className="song-info">
                                <button
                                    className="delete-button"
                                    onClick={() => handleDelete(record)}
                                >
                                    <DeleteOutlined />
                                </button>
                                <button
                                    className="spotify-button"
                                    onClick={() => redirectToSpotify(record.song_id)}
                                >
                                    Redirect to Spotify &nbsp;
                                    <PlayCircleOutlined />
                                </button>
                            </div>
                        ),
                    }
                ]}
                dataSource={filteredSongs}
                pagination={false}
            />
        </div>
    );



}

export default Library;

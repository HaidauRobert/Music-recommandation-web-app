import axios from 'axios';
const qs = require('qs');

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

async function getToken(code, redirectUri, clientId, clientSecret) {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
          'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri
        }
      };
      
      const response = await axios.post(authOptions.url, qs.stringify(authOptions.form), {headers: authOptions.headers });

  return response.data.access_token;
}

async function getTrack(trackId, token) {
  const response = await axios.get(`${SPOTIFY_API_URL}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const track = response.data;

  const artistResponse = await axios.get(`${SPOTIFY_API_URL}/artists/${track.artists[0].id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const artist = artistResponse.data;
  track.artist_genres = artist.genres;

  return track;
}

async function getUserProfile(token) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userProfile = response.data;
    const userId = userProfile.id;

    // Save the user's Spotify ID, access token, and refresh token to your database

    return userId;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}


async function searchTracks(query, token) {
  const response = await axios.get(`${SPOTIFY_API_URL}/search`, {
    params: {
      q: query,
      type: 'track',
      limit: 1,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.tracks.items[0];
};

async function getPlaylistsByGenre(genre, token) {
  const response = await axios.get(`${SPOTIFY_API_URL}/browse/categories/${genre}/playlists`, {
    params: {
      limit: 10,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.playlists.items;
};

export { getToken, getTrack, searchTracks, getPlaylistsByGenre, getUserProfile };
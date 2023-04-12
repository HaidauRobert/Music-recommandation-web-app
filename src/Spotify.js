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
  return response.data;
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
}

export { getToken, getTrack, searchTracks };

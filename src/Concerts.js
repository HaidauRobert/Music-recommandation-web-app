import React, { useEffect, useState } from 'react';
import './CSS files/Concerts.css';
import axios from 'axios';

const BACKEND_API_URL = 'http://localhost:5000';

const Concerts = (props) => {
  const [selectedArtist, setSelectedArtist] = useState('');
  const [concertInfo, setConcertInfo] = useState([]);
  const [likedArtists, setLikedArtists] = useState([]);
  const userId = props.userId;
  const apiKey = "u1L0AsAp4gnW8iAszfFrW4yb1kevPLO2";
  const eventsUrl = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${selectedArtist}&apikey=${apiKey}`;

  useEffect(() => {
    axios
      .get(`${BACKEND_API_URL}/liked_artists/${userId}`)
      .then(response => {
        setLikedArtists(response.data.liked_artists);
      })
      .catch(error => {
        console.error("Error occurred while fetching liked artists:", error);
      });
  }, [userId]);

  const handleArtistSelection = (event) => {
    setSelectedArtist(event.target.value);
  };

  const handleSubmit = () => {
    axios
      .get(eventsUrl)
      .then(response => {
        const data = response.data;

        if (data._embedded && data._embedded.events) {
          const events = data._embedded.events;
          console.log(events);
          const concertData = events.map(event => ({
            eventName: event.name,
            eventDate: event.dates.start.localDate,
            eventLocation: event._embedded.venues[0].city.name,
            eventImage: event.images[0].url 
          }));
          setConcertInfo(concertData);
        } else {
          console.log("No upcoming events found for the artist.");
          setConcertInfo([]);
        }
      })
      .catch(error => {
        console.error("Error occurred while fetching events:", error);
      });
  };

  return (
    <div className="concerts-page">
      <div className="concerts-container">
        <div className="artist-selection">
          <label htmlFor="artist-select">Select an artist:</label>
          <select id="artist-select" value={selectedArtist} onChange={handleArtistSelection}>
            <option value="">-- Select Artist --</option>
            {likedArtists.map(artist => (
              <option value={artist} key={artist}>{artist}</option>
            ))}
          </select>
          <button onClick={handleSubmit}>Submit</button>
        </div>
        <div className="concert-info">
          {concertInfo.length > 0 ? (
            <ul>
              {concertInfo.map((concert, index) => (
                <li key={index}>
                  <div className="concert-details">
                  <h3>{concert.eventName}</h3>
                  <div className="concert-image">
                    <img src={concert.eventImage} alt="Concert" />
                  </div>
                    <p>Date: {concert.eventDate}</p>
                    <p>Location: {concert.eventLocation}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming events found for the selected artist.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Concerts;

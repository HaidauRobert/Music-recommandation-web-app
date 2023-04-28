import React from 'react';
import { BeatLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div className="loading-container">
      <BeatLoader color="black" size={100} />
    </div>
  );
};

export default Loading;